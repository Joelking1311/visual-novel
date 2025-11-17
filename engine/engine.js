/** @file engine.js
 *  Visual Novel Engine - Processes and renders the story
 */

import { StepType } from './story-format.js';
import { validateStory, printValidationErrors } from './validator.js';

class VisualNovelEngine {
    constructor(storyData) {
        this.story = storyData;

        // Validate story on load
        console.log('%c=== Story Validation ===', 'color: #00aaff; font-weight: bold; font-size: 16px;');
        const validationErrors = validateStory(storyData);
        printValidationErrors(validationErrors);

        // Count critical errors
        const criticalErrors = validationErrors.filter(e => e.type === 'error').length;
        if (criticalErrors > 0) {
            console.error(`❌ Story has ${criticalErrors} critical error(s). Game may not work correctly.`);
        }

        this.state = {
            variables: { ...storyData.variables }
        };
        this.currentNode = null;
        this.currentStepIndex = 0;
        this.currentSteps = [];
        this.waitingForInput = false;

        // DOM elements
        this.background = document.getElementById('background');
        this.charLeft = document.getElementById('char-left');
        this.charCenter = document.getElementById('char-center');
        this.charRight = document.getElementById('char-right');
        this.speakerName = document.getElementById('speaker-name');
        this.dialogueText = document.getElementById('dialogue-text');
        this.textbox = document.getElementById('textbox');
        this.choiceMenu = document.getElementById('choice-menu');
        this.choicePrompt = document.getElementById('choice-prompt');
        this.choiceButtons = document.getElementById('choice-buttons');
        this.continueIndicator = document.getElementById('continue-indicator');
        this.debugPanel = document.getElementById('debug-panel');
        this.debugContent = document.getElementById('debug-content');

        // Character tracking
        this.visibleCharacters = {
            left: null,
            center: null,
            right: null
        };

        this.init();
    }

    init() {
        // Set up click handler for advancing dialogue
        document.addEventListener('click', (e) => {
            if (!e.target.classList.contains('choice-button')) {
                this.advance();
            }
        });

        // Set up keyboard handler for debug panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                this.toggleDebugPanel();
            }
        });

        // Start the story
        this.jumpToNode(this.story.start);
    }

    /**
     * Resolve nested node path like 'Park.WithAbigail'
     */
    resolveNode(nodeId) {
        const parts = nodeId.split('.');
        let current = this.story.nodes;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!current || !current[part]) {
                const pathSoFar = parts.slice(0, i + 1).join('.');
                console.error(`❌ Node not found: "${nodeId}"`);
                console.error(`   Failed at: "${pathSoFar}"`);
                console.error(`   Available at this level:`, Object.keys(current || {}));
                return null;
            }
            current = current[part];
        }

        // If current is an array, it's a node with steps
        if (Array.isArray(current)) {
            return current;
        }

        console.error(`❌ Node "${nodeId}" exists but is not a step array (it's a nested group)`);
        console.error(`   Available nodes in this group:`, Object.keys(current || {}));
        return null;
    }

    jumpToNode(nodeId) {
        const steps = this.resolveNode(nodeId);
        if (!steps) {
            console.error(`Cannot jump to node: ${nodeId}`);
            return;
        }

        this.currentNode = nodeId;
        this.currentSteps = steps;
        this.currentStepIndex = 0;
        this.executeSteps();
    }

    advance() {
        if (this.waitingForInput) {
            this.waitingForInput = false;
            this.continueIndicator.classList.remove('visible');
            this.currentStepIndex++;
            this.executeSteps();
        }
    }

    executeSteps() {
        while (this.currentStepIndex < this.currentSteps.length) {
            const step = this.currentSteps[this.currentStepIndex];
            const shouldPause = this.executeStep(step);

            if (shouldPause) {
                return; // Wait for user input
            }

            this.currentStepIndex++;
        }

        // No more steps in this node
        console.log('Node complete:', this.currentNode);
    }

    executeStep(step) {
        try {
            switch (step.type) {
                case StepType.background:
                    this.setBackground(step.id);
                    return false;

                case StepType.show_character:
                    this.showCharacter(step.id, step.pose, step.position);
                    return false;

                case StepType.hide_character:
                    this.hideCharacter(step.id);
                    return false;

                case StepType.dialogue:
                    this.showDialogue(step.who, step.text);
                    return true; // Wait for click

                case StepType.narration:
                    this.showNarration(step.text);
                    return true; // Wait for click

                case StepType.set_variable:
                    this.setVariable(step.key, step.value);
                    return false;

                case StepType.jump_to:
                    this.jumpToNode(step.nodeId);
                    return true; // Stop executing current node

                case StepType.conditional_jump:
                    const testResult = step.test(this.state);
                    if (testResult && step.thenNodeId) {
                        this.jumpToNode(step.thenNodeId);
                    } else if (!testResult && step.elseNodeId) {
                        this.jumpToNode(step.elseNodeId);
                    } else {
                        // Continue to next step
                        return false;
                    }
                    return true; // Stop executing current node

                case StepType.choice:
                    this.showChoices(step.prompt, step.options);
                    return true; // Wait for choice

                case StepType.end_story:
                    this.endStory();
                    return true;

                default:
                    console.error(`❌ Unknown step type: ${step.type}`);
                    console.error('   Step:', step);
                    return false;
            }
        } catch (error) {
            console.error(`❌ Error executing step in node "${this.currentNode}":`, error);
            console.error('   Step:', step);
            console.error('   State:', this.state);
            throw error;
        }
    }

    setBackground(placeId) {
        const placePath = this.story.places[placeId];
        if (!placePath) {
            console.error(`❌ Background "${placeId}" not found in story.places`);
            console.error('   Available backgrounds:', Object.keys(this.story.places || {}));
            return;
        }
        this.background.style.backgroundImage = `url('${placePath}')`;
    }

    showCharacter(charId, pose, position) {
        const character = this.story.characters[charId];
        if (!character) {
            console.error(`❌ Character "${charId}" not found in story.characters`);
            console.error('   Available characters:', Object.keys(this.story.characters || {}));
            return;
        }

        if (!pose || !pose.name) {
            console.error(`❌ Invalid pose for character "${charId}":`, pose);
            return;
        }

        const poseName = pose.name;
        const imagePath = character.poses[poseName];

        if (!imagePath) {
            console.error(`❌ Pose "${poseName}" not found for character "${charId}"`);
            console.error('   Available poses:', Object.keys(character.poses || {}));
            return;
        }

        if (!position || !position.name) {
            console.error(`❌ Invalid position for character "${charId}":`, position);
            return;
        }

        const positionName = position.name;
        let element;

        switch (positionName) {
            case 'left':
                element = this.charLeft;
                break;
            case 'center':
                element = this.charCenter;
                break;
            case 'right':
                element = this.charRight;
                break;
            default:
                console.error(`❌ Unknown position "${positionName}" for character "${charId}"`);
                console.error('   Valid positions: left, center, right');
                return;
        }

        const currentCharAtPosition = this.visibleCharacters[positionName];
        const isSameCharacter = currentCharAtPosition === charId;
        const isVisible = element.classList.contains('visible');

        if (isSameCharacter && isVisible) {
            // Same character, just changing pose/expression - instant change, no animation
            element.style.backgroundImage = `url('${imagePath}')`;
        } else {
            // Different character or first time showing - animate
            element.classList.remove('visible', 'hiding');

            // Force reflow to restart animation
            void element.offsetWidth;

            element.style.backgroundImage = `url('${imagePath}')`;

            // Use requestAnimationFrame to ensure the DOM has updated before adding visible class
            requestAnimationFrame(() => {
                element.classList.add('visible');
            });
        }

        this.visibleCharacters[positionName] = charId;
    }

    hideCharacter(charId) {
        // Find and hide the character from all positions
        for (const [position, visibleCharId] of Object.entries(this.visibleCharacters)) {
            if (visibleCharId === charId) {
                let element;
                switch (position) {
                    case 'left':
                        element = this.charLeft;
                        break;
                    case 'center':
                        element = this.charCenter;
                        break;
                    case 'right':
                        element = this.charRight;
                        break;
                }

                if (element) {
                    // Add hiding class for slide-down animation
                    element.classList.add('hiding');
                    element.classList.remove('visible');

                    // After animation completes, clear the image and reset
                    setTimeout(() => {
                        element.style.backgroundImage = '';
                        element.classList.remove('hiding');
                    }, 500); // Match the CSS transition duration
                }
                this.visibleCharacters[position] = null;
            }
        }
    }

    showDialogue(who, text) {
        if (!who) {
            console.error('❌ Dialogue step missing "who" property');
            return;
        }

        if (!text) {
            console.error(`❌ Dialogue for "${who}" missing text`);
            return;
        }

        const character = this.story.characters[who];
        if (!character) {
            console.warn(`⚠ Character "${who}" not found in story.characters, using ID as name`);
        }
        const characterName = character ? character.name : who;

        this.speakerName.textContent = characterName;
        this.dialogueText.textContent = text;
        this.dialogueText.classList.remove('narration');

        this.waitingForInput = true;
        this.continueIndicator.classList.add('visible');
    }

    showNarration(text) {
        if (!text) {
            console.error('❌ Narration step missing text');
            return;
        }

        this.speakerName.textContent = '';
        this.dialogueText.textContent = text;
        this.dialogueText.classList.add('narration');

        this.waitingForInput = true;
        this.continueIndicator.classList.add('visible');
    }

    setVariable(key, value) {
        if (!key) {
            console.error('❌ set_variable step missing key');
            return;
        }

        try {
            if (typeof value === 'function') {
                this.state.variables[key] = value(this.state);
            } else {
                this.state.variables[key] = value;
            }
            console.log('Variable set:', key, '=', this.state.variables[key]);

            // Update debug panel if it's visible
            if (!this.debugPanel.classList.contains('hidden')) {
                this.updateDebugPanel();
            }
        } catch (error) {
            console.error(`❌ Error setting variable "${key}":`, error);
            console.error('   Value function:', value);
            throw error;
        }
    }

    showChoices(prompt, options) {
        if (!options || !Array.isArray(options) || options.length === 0) {
            console.error('❌ Choice step has no valid options array');
            console.error('   Options:', options);
            return;
        }

        // Hide textbox and show choice menu
        this.choiceMenu.classList.remove('hidden');
        this.choicePrompt.textContent = prompt || 'Choose:';

        // Clear previous choices
        this.choiceButtons.innerHTML = '';

        // Create choice buttons
        options.forEach((option, index) => {
            if (!Array.isArray(option)) {
                console.error(`❌ Choice option ${index} is not an array:`, option);
                return;
            }

            const [label, nodeId, effectFn] = option;

            if (!label) {
                console.error(`❌ Choice option ${index} missing label`);
                return;
            }

            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = label;

            button.addEventListener('click', () => {
                try {
                    // Execute effect if provided
                    if (effectFn) {
                        effectFn(this.state);
                    }

                    // Hide choice menu
                    this.choiceMenu.classList.add('hidden');

                    // Jump to target node if provided
                    if (nodeId) {
                        this.jumpToNode(nodeId);
                    } else {
                        // Continue in current node
                        this.currentStepIndex++;
                        this.executeSteps();
                    }
                } catch (error) {
                    console.error(`❌ Error executing choice "${label}":`, error);
                    throw error;
                }
            });

            this.choiceButtons.appendChild(button);
        });

        this.waitingForInput = true;
    }

    endStory() {
        console.log('Story ended');
        this.speakerName.textContent = '';
        this.dialogueText.textContent = 'THE END';
        this.dialogueText.classList.add('narration');
        this.continueIndicator.classList.remove('visible');

        // Show restart option after a delay
        setTimeout(() => {
            this.dialogueText.textContent = 'THE END\n\n(Refresh to play again)';
        }, 2000);
    }

    toggleDebugPanel() {
        this.debugPanel.classList.toggle('hidden');
        if (!this.debugPanel.classList.contains('hidden')) {
            this.updateDebugPanel();
        }
    }

    updateDebugPanel() {
        this.debugContent.innerHTML = '';

        // Display all variables
        for (const [key, value] of Object.entries(this.state.variables)) {
            const varElement = document.createElement('div');
            varElement.className = 'debug-variable';

            const nameElement = document.createElement('span');
            nameElement.className = 'debug-var-name';
            nameElement.textContent = key;

            const valueElement = document.createElement('span');
            valueElement.className = 'debug-var-value';
            valueElement.textContent = JSON.stringify(value);

            varElement.appendChild(nameElement);
            varElement.appendChild(valueElement);
            this.debugContent.appendChild(varElement);
        }
    }
}

// Export the engine class
export { VisualNovelEngine };
