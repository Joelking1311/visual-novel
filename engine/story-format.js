/** @file story-format.js
 *  Enum-like classes and helper functions for building VN story data with plain JS.
 *  All enum values use snake_case.
 */

/**
 * @typedef {Object} Variables
 * @description Arbitrary key/value store for game state.
 */

/**
 * @typedef {Object} State
 * @property {Variables} variables
 */

/**
 * @callback EffectFn
 * @param {State} state
 * @returns {void}
 */

/**
 * @callback ComputeValue
 * @param {State} state
 * @returns {any}
 */

/**
 * @callback TestFn
 * @param {State} state
 * @returns {boolean}
 */

/**
 * @typedef {[label: string, nodeId: string|null, effectFn?: EffectFn]} ChoiceOption
 * @description nodeId can be null to continue in the current node after running the effect
 */

/**
 * @typedef {Object} Step
 * @property {StepType} type
 * @property {string} [id]
 * @property {string} [nodeId]
 * @property {string|null} [who]
 * @property {string} [text]
 * @property {CharacterPose} [pose]
 * @property {CharacterPosition} [position]
 * @property {string} [key]
 * @property {any|ComputeValue} [value]
 * @property {TestFn} [test]
 * @property {string} [thenNodeId]
 * @property {string|null} [elseNodeId]
 * @property {string} [prompt]
 * @property {ChoiceOption[]} [options]
 */

/**
 * @typedef {Record<string, Step[] | Nodes>} Nodes
 * @description Nodes can be nested to organize story branches. Reference with dot notation like 'Branch.NodeName'
 */

/**
 * @typedef {Object} Story
 * @property {string} start
 * @property {Variables} variables
 * @property {Nodes} nodes
 * @property {Object<string, any>} [characters]
 * @property {Object<string, any>} [places]
 */

/** Enum-like: step kinds */
export class StepType {
    static background = new StepType('background');
    static show_character = new StepType('show_character');
    static hide_character = new StepType('hide_character');
    static dialogue = new StepType('dialogue');
    static narration = new StepType('narration');
    static set_variable = new StepType('set_variable');
    static jump_to = new StepType('jump_to');
    static conditional_jump = new StepType('conditional_jump');
    static choice = new StepType('choice');
    static end_story = new StepType('end_story');

    /** @param {string} name */
    constructor(name) {
        this.name = name;
    }

    /** @returns {string} */
    toString() {
        return `StepType.${this.name}`;
    }
}

/** Enum-like: character stage positions */
export class CharacterPosition {
    static left = new CharacterPosition('left');
    static center = new CharacterPosition('center');
    static right = new CharacterPosition('right');

    /** @param {string} name */
    constructor(name) {
        this.name = name;
    }

    /** @returns {string} */
    toString() {
        return `CharacterPosition.${this.name}`;
    }
}

/** Enum-like: common character poses */
export class CharacterPose {
    static neutral = new CharacterPose('neutral');
    static happy = new CharacterPose('happy');
    static sad = new CharacterPose('sad');

    /** @param {string} name */
    constructor(name) {
        this.name = name;
    }

    /** @returns {string} */
    toString() {
        return `CharacterPose.${this.name}`;
    }
}

/**
 * Create a background step.
 * @param {string} id - Place/background identifier.
 * @returns {Step}
 */
export function background(id) {
    return {type: StepType.background, id};
}

/**
 * Show a character with pose and position.
 * @param {string} id - Character identifier.
 * @param {CharacterPose} [pose=CharacterPose.neutral]
 * @param {CharacterPosition} [position=CharacterPosition.center]
 * @returns {Step}
 */
export function showCharacter(
    id,
    pose = CharacterPose.neutral,
    position = CharacterPosition.center,
) {
    return {type: StepType.show_character, id, pose, position};
}

/**
 * Hide a character.
 * @param {string} id - Character identifier.
 * @returns {Step}
 */
export function hideCharacter(id) {
    return {type: StepType.hide_character, id};
}

/**
 * Dialogue line (spoken by a character).
 * @param {string} who - Character identifier.
 * @param {string} text - Spoken text.
 * @returns {Step}
 */
export function dialogue(who, text) {
    return {type: StepType.dialogue, who, text};
}

/**
 * Narration line (no speaker).
 * @param {string} text - Narration text.
 * @returns {Step}
 */
export function narration(text) {
    return {type: StepType.narration, text};
}

/**
 * Set or compute a variable value.
 * @param {string} key - Variable name.
 * @param {any|ComputeValue} value - Constant or function `(state)=>any`.
 * @returns {Step}
 */
export function setVariable(key, value) {
    return {type: StepType.set_variable, key, value};
}

/**
 * Jump to another node immediately.
 * @param {string} nodeId - Target node id.
 * @returns {Step}
 */
export function jumpTo(nodeId) {
    return {type: StepType.jump_to, nodeId};
}

/**
 * Conditional jump based on a predicate.
 * @param {TestFn} test - `(state)=>boolean`.
 * @param {string} thenNodeId - Target if test is true.
 * @param {string|null} [elseNodeId=null] - Target if test is false; if null, continue.
 * @returns {Step}
 */
export function conditionalJump(test, thenNodeId, elseNodeId = null) {
    return {type: StepType.conditional_jump, test, thenNodeId, elseNodeId};
}

/**
 * Present a set of choices.
 * @param {string} prompt - Prompt shown above options.
 * @param {...ChoiceOption} options - Options of shape `[label, nodeId, effectFn?]`.
 * @returns {Step}
 */
export function choice(prompt, ...options) {
    return {type: StepType.choice, prompt, options};
}

/**
 * Mark the story as ended.
 * @returns {Step}
 */
export function endStory() {
    return {type: StepType.end_story};
}
