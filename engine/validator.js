/** @file validator.js
 *  Story validation utilities to catch errors during development
 */

import { StepType, CharacterPose, CharacterPosition } from './story-format.js';

/**
 * Validates a story structure and returns any errors found
 * @param {import('./story-format.js').Story} story
 * @returns {Array<{type: string, message: string, location?: string}>}
 */
export function validateStory(story) {
    const errors = [];

    // Check required fields
    if (!story.start) {
        errors.push({ type: 'error', message: 'Story missing required "start" property' });
    }

    if (!story.nodes) {
        errors.push({ type: 'error', message: 'Story missing required "nodes" property' });
        return errors; // Can't continue without nodes
    }

    if (!story.variables) {
        errors.push({ type: 'warning', message: 'Story missing "variables" property' });
    }

    // Validate starting node exists
    if (story.start && !resolveNode(story.nodes, story.start)) {
        errors.push({
            type: 'error',
            message: `Start node "${story.start}" does not exist`,
            location: 'story.start'
        });
    }

    // Collect all node IDs for validation
    const allNodeIds = collectNodeIds(story.nodes);
    const referencedNodeIds = new Set();
    const definedCharacters = new Set(Object.keys(story.characters || {}));
    const definedPlaces = new Set(Object.keys(story.places || {}));

    // Validate each node
    validateNodes(story.nodes, '', errors, referencedNodeIds, definedCharacters, definedPlaces, story);

    // Check for referenced but undefined nodes
    for (const nodeId of referencedNodeIds) {
        if (!allNodeIds.has(nodeId)) {
            errors.push({
                type: 'error',
                message: `Referenced node "${nodeId}" does not exist`,
                location: `jump to "${nodeId}"`
            });
        }
    }

    // Check for defined but unreachable nodes
    for (const nodeId of allNodeIds) {
        if (nodeId !== story.start && !referencedNodeIds.has(nodeId)) {
            errors.push({
                type: 'warning',
                message: `Node "${nodeId}" is defined but never referenced (unreachable)`,
                location: nodeId
            });
        }
    }

    return errors;
}

/**
 * Resolve a node path like 'Park.WithAbigail' to the actual steps array
 */
function resolveNode(nodes, nodeId) {
    const parts = nodeId.split('.');
    let current = nodes;

    for (const part of parts) {
        if (!current || !current[part]) {
            return null;
        }
        current = current[part];
    }

    return Array.isArray(current) ? current : null;
}

/**
 * Collect all node IDs (including nested ones)
 */
function collectNodeIds(nodes, prefix = '') {
    const ids = new Set();

    for (const [key, value] of Object.entries(nodes)) {
        const fullId = prefix ? `${prefix}.${key}` : key;

        if (Array.isArray(value)) {
            ids.add(fullId);
        } else if (typeof value === 'object') {
            // Nested nodes
            const nestedIds = collectNodeIds(value, fullId);
            for (const id of nestedIds) {
                ids.add(id);
            }
        }
    }

    return ids;
}

/**
 * Validate all nodes recursively
 */
function validateNodes(nodes, prefix, errors, referencedNodeIds, definedCharacters, definedPlaces, story) {
    for (const [key, value] of Object.entries(nodes)) {
        const fullId = prefix ? `${prefix}.${key}` : key;

        if (Array.isArray(value)) {
            // This is a node with steps
            validateSteps(value, fullId, errors, referencedNodeIds, definedCharacters, definedPlaces, story);
        } else if (typeof value === 'object') {
            // Nested node group
            validateNodes(value, fullId, errors, referencedNodeIds, definedCharacters, definedPlaces, story);
        } else {
            errors.push({
                type: 'error',
                message: `Node "${fullId}" has invalid value (must be array or object)`,
                location: fullId
            });
        }
    }
}

/**
 * Validate steps in a node
 */
function validateSteps(steps, nodeId, errors, referencedNodeIds, definedCharacters, definedPlaces, story) {
    if (!Array.isArray(steps)) {
        errors.push({
            type: 'error',
            message: `Node "${nodeId}" steps is not an array`,
            location: nodeId
        });
        return;
    }

    if (steps.length === 0) {
        errors.push({
            type: 'warning',
            message: `Node "${nodeId}" has no steps (empty)`,
            location: nodeId
        });
        return;
    }

    let hasEnding = false;
    const visibleCharactersInNode = new Set();

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepLocation = `${nodeId}[${i}]`;

        if (!step || !step.type) {
            errors.push({
                type: 'error',
                message: 'Step missing required "type" property',
                location: stepLocation
            });
            continue;
        }

        // Validate based on step type
        switch (step.type) {
            case StepType.background:
                if (!step.id) {
                    errors.push({
                        type: 'error',
                        message: 'background step missing "id" property',
                        location: stepLocation
                    });
                } else if (!definedPlaces.has(step.id)) {
                    errors.push({
                        type: 'error',
                        message: `Background "${step.id}" not defined in story.places`,
                        location: stepLocation
                    });
                }
                break;

            case StepType.show_character:
                if (!step.id) {
                    errors.push({
                        type: 'error',
                        message: 'show_character step missing "id" property',
                        location: stepLocation
                    });
                } else {
                    if (!definedCharacters.has(step.id)) {
                        errors.push({
                            type: 'error',
                            message: `Character "${step.id}" not defined in story.characters`,
                            location: stepLocation
                        });
                    } else {
                        visibleCharactersInNode.add(step.id);

                        // Validate pose exists for this character
                        const character = story.characters[step.id];
                        if (step.pose && character) {
                            const poseName = step.pose.name;
                            if (!character.poses[poseName]) {
                                errors.push({
                                    type: 'error',
                                    message: `Pose "${poseName}" not defined for character "${step.id}"`,
                                    location: stepLocation
                                });
                            }
                        }
                    }
                }
                if (!step.pose) {
                    errors.push({
                        type: 'warning',
                        message: 'show_character step missing "pose" property',
                        location: stepLocation
                    });
                }
                if (!step.position) {
                    errors.push({
                        type: 'warning',
                        message: 'show_character step missing "position" property',
                        location: stepLocation
                    });
                }
                break;

            case StepType.hide_character:
                if (!step.id) {
                    errors.push({
                        type: 'error',
                        message: 'hide_character step missing "id" property',
                        location: stepLocation
                    });
                } else {
                    visibleCharactersInNode.delete(step.id);
                }
                break;

            case StepType.dialogue:
                if (!step.who) {
                    errors.push({
                        type: 'error',
                        message: 'dialogue step missing "who" property',
                        location: stepLocation
                    });
                } else if (!definedCharacters.has(step.who)) {
                    errors.push({
                        type: 'error',
                        message: `Character "${step.who}" in dialogue not defined in story.characters`,
                        location: stepLocation
                    });
                }
                if (!step.text) {
                    errors.push({
                        type: 'error',
                        message: 'dialogue step missing "text" property',
                        location: stepLocation
                    });
                }
                break;

            case StepType.narration:
                if (!step.text) {
                    errors.push({
                        type: 'error',
                        message: 'narration step missing "text" property',
                        location: stepLocation
                    });
                }
                break;

            case StepType.set_variable:
                if (!step.key) {
                    errors.push({
                        type: 'error',
                        message: 'set_variable step missing "key" property',
                        location: stepLocation
                    });
                }
                if (step.value === undefined) {
                    errors.push({
                        type: 'error',
                        message: 'set_variable step missing "value" property',
                        location: stepLocation
                    });
                }
                break;

            case StepType.jump_to:
                if (!step.nodeId) {
                    errors.push({
                        type: 'error',
                        message: 'jump_to step missing "nodeId" property',
                        location: stepLocation
                    });
                } else {
                    referencedNodeIds.add(step.nodeId);
                }
                hasEnding = true;
                break;

            case StepType.conditional_jump:
                if (!step.test) {
                    errors.push({
                        type: 'error',
                        message: 'conditional_jump step missing "test" function',
                        location: stepLocation
                    });
                }
                if (!step.thenNodeId) {
                    errors.push({
                        type: 'error',
                        message: 'conditional_jump step missing "thenNodeId" property',
                        location: stepLocation
                    });
                } else {
                    referencedNodeIds.add(step.thenNodeId);
                }
                if (step.elseNodeId) {
                    referencedNodeIds.add(step.elseNodeId);
                }
                hasEnding = true;
                break;

            case StepType.choice:
                if (!step.prompt) {
                    errors.push({
                        type: 'warning',
                        message: 'choice step missing "prompt" property',
                        location: stepLocation
                    });
                }
                if (!step.options || !Array.isArray(step.options)) {
                    errors.push({
                        type: 'error',
                        message: 'choice step missing or invalid "options" array',
                        location: stepLocation
                    });
                } else {
                    if (step.options.length === 0) {
                        errors.push({
                            type: 'error',
                            message: 'choice step has no options',
                            location: stepLocation
                        });
                    }
                    step.options.forEach((option, optIdx) => {
                        if (!Array.isArray(option)) {
                            errors.push({
                                type: 'error',
                                message: `choice option ${optIdx} is not an array`,
                                location: `${stepLocation}.options[${optIdx}]`
                            });
                        } else {
                            const [label, targetNodeId, effectFn] = option;
                            if (!label) {
                                errors.push({
                                    type: 'error',
                                    message: `choice option ${optIdx} missing label`,
                                    location: `${stepLocation}.options[${optIdx}]`
                                });
                            }
                            if (targetNodeId) {
                                referencedNodeIds.add(targetNodeId);
                            }
                        }
                    });
                }
                hasEnding = true;
                break;

            case StepType.end_story:
                hasEnding = true;
                break;

            default:
                errors.push({
                    type: 'error',
                    message: `Unknown step type: ${step.type}`,
                    location: stepLocation
                });
        }
    }

    // Warn if node doesn't end properly
    if (!hasEnding) {
        errors.push({
            type: 'warning',
            message: `Node "${nodeId}" doesn't end with a jump, choice, or end_story (will stop abruptly)`,
            location: nodeId
        });
    }
}

/**
 * Print validation errors to console with formatting
 */
export function printValidationErrors(errors) {
    if (errors.length === 0) {
        console.log('%c✓ Story validation passed!', 'color: #00ff00; font-weight: bold;');
        return;
    }

    const errorCount = errors.filter(e => e.type === 'error').length;
    const warningCount = errors.filter(e => e.type === 'warning').length;

    console.log(`%c⚠ Story validation found ${errorCount} error(s) and ${warningCount} warning(s):`,
        'color: #ff6600; font-weight: bold; font-size: 14px;');

    errors.forEach(error => {
        const color = error.type === 'error' ? '#ff0000' : '#ffaa00';
        const prefix = error.type === 'error' ? '✗' : '⚠';
        const location = error.location ? ` at ${error.location}` : '';

        console.log(`%c${prefix} ${error.message}${location}`, `color: ${color};`);
    });
}
