# Visual Novel Engine

A JavaScript-based visual novel engine with a simple, declarative story format.

## Table of Contents

- [Quick Start](#quick-start)
- [Story Structure](#story-structure)
- [Step Types Reference](#step-types-reference)
  - [Background](#background)
  - [Characters](#characters)
  - [Dialogue](#dialogue)
  - [Variables](#variables)
  - [Flow Control](#flow-control)
- [Enums Reference](#enums-reference)
- [Story Organization](#story-organization)
- [Debug Features](#debug-features)
- [Examples](#examples)

---

## Quick Start

```javascript
import {
    CharacterPosition,
    CharacterPose,
    background,
    showCharacter,
    dialogue,
    narration,
    choice,
    endStory,
} from './engine/story-format.js';

export const story = {
    start: 'Start',
    variables: { score: 0 },
    
    nodes: {
        Start: [
            background('bedroom'),
            showCharacter('alice', CharacterPose.happy, CharacterPosition.center),
            dialogue('alice', 'Hello! Welcome to my story.'),
            choice(
                'What do you say?',
                ['Hello!', 'NextNode'],
                ['Goodbye.', 'EndNode'],
            ),
        ],
    },
    
    characters: {
        alice: {
            name: 'Alice',
            poses: {
                neutral: 'assets/characters/alice/neutral.png',
                happy: 'assets/characters/alice/happy.png',
                sad: 'assets/characters/alice/sad.png',
            },
        },
    },
    
    places: {
        bedroom: 'assets/backgrounds/room-bedroom.png',
    },
};
```

---

## Story Structure

A story object must have these properties:

```javascript
{
    start: 'NodeName',           // Starting node ID
    variables: { ... },           // Initial game state variables
    nodes: { ... },               // Story nodes (scenes)
    characters: { ... },          // Character definitions
    places: { ... },              // Background/place definitions
}
```

### Nodes

Nodes are arrays of steps that define what happens in a scene:

```javascript
nodes: {
    NodeName: [
        // Array of steps
        narration('Something happens...'),
        dialogue('character', 'They say something...'),
        // ...
    ],
    
    // Nested organization (optional)
    Chapter1: {
        Scene1: [ /* steps */ ],
        Scene2: [ /* steps */ ],
    }
}
```

---

## Step Types Reference

### Background

**`background(placeId)`**

Changes the background image.

```javascript
background('bedroom')
background('park')
background('school_hallway')
```

**Parameters:**
- `placeId` (string): ID of the place defined in `story.places`

---

### Characters

#### Show Character

**`showCharacter(characterId, pose, position)`**

Displays a character on screen with a specific pose and position.

```javascript
showCharacter('alice', CharacterPose.happy, CharacterPosition.center)
showCharacter('bob', CharacterPose.neutral, CharacterPosition.left)
```

**Parameters:**
- `characterId` (string): Character ID from `story.characters`
- `pose` (CharacterPose): Character expression/pose
- `position` (CharacterPosition): Screen position (left/center/right)

**Behavior:**
- If showing the same character at the same position with a different pose, the image changes instantly
- If showing a new character or different position, character slides up from bottom

#### Hide Character

**`hideCharacter(characterId)`**

Removes a character from the screen.

```javascript
hideCharacter('alice')
hideCharacter('bob')
```

**Parameters:**
- `characterId` (string): Character to hide

**Behavior:**
- Character slides down and fades out

---

### Dialogue

#### Character Dialogue

**`dialogue(characterId, text)`**

Displays dialogue spoken by a character. Requires player to click to continue.

```javascript
dialogue('alice', 'Hello! How are you today?')
dialogue('you', 'I\'m doing great, thanks!')
```

**Parameters:**
- `characterId` (string): Character ID from `story.characters`
- `text` (string): The dialogue text

**Behavior:**
- Shows character name above text
- Displays "continue" indicator
- Waits for player click

#### Narration

**`narration(text)`**

Displays narrator text (no character speaking). Requires player to click to continue.

```javascript
narration('You walk down the hallway.')
narration('The sun is setting outside.')
```

**Parameters:**
- `text` (string): The narration text

**Behavior:**
- No character name shown
- Text displayed in italics
- Waits for player click

---

### Variables

#### Set Variable

**`setVariable(key, value)`**

Sets or updates a story variable.

```javascript
// Set to a constant value
setVariable('score', 10)
setVariable('metAlice', true)

// Set using a function (compute from current state)
setVariable('score', state => state.variables.score + 5)
setVariable('affection', state => state.variables.affection - 1)
```

**Parameters:**
- `key` (string): Variable name
- `value` (any | function): Either a constant value or a function `(state) => newValue`

**Function Parameter:**
- `state.variables`: Object containing all current variables

---

### Flow Control

#### Jump To

**`jumpTo(nodeId)`**

Immediately jumps to another node.

```javascript
jumpTo('Chapter1.Scene2')
jumpTo('GameOver')
```

**Parameters:**
- `nodeId` (string): Target node ID (supports dot notation for nested nodes)

**Behavior:**
- Stops executing current node
- Starts executing target node

#### Conditional Jump

**`conditionalJump(testFn, thenNodeId, elseNodeId?)`**

Jumps to different nodes based on a condition.

```javascript
// Jump to different endings based on score
conditionalJump(
    state => state.variables.score >= 10,
    'GoodEnding',
    'BadEnding'
)

// Continue if condition is false (elseNodeId is optional)
conditionalJump(
    state => state.variables.hasKey,
    'UnlockDoor',
    null  // or omit - continues to next step
)
```

**Parameters:**
- `testFn` (function): Test function `(state) => boolean`
- `thenNodeId` (string): Node to jump to if test returns true
- `elseNodeId` (string | null, optional): Node to jump to if test returns false. If null or omitted, continues to next step.

**Test Function Parameter:**
- `state.variables`: Object containing all current variables

#### Choice

**`choice(prompt, ...options)`**

Presents the player with multiple choices.

```javascript
// Basic choices
choice(
    'What do you do?',
    ['Go left', 'LeftPath'],
    ['Go right', 'RightPath'],
)

// Choices with effects
choice(
    'How do you respond?',
    [
        'Be friendly',
        'FriendlyResponse',
        state => { state.variables.affection += 1; }
    ],
    [
        'Be rude',
        'RudeResponse',
        state => { state.variables.affection -= 1; }
    ],
)

// Choice with null nodeId (continue in current node)
choice(
    'Pick a color:',
    [
        'Red',
        null,  // No jump, continues to next step
        state => { state.variables.color = 'red'; }
    ],
    [
        'Blue',
        null,
        state => { state.variables.color = 'blue'; }
    ],
)
```

**Parameters:**
- `prompt` (string): Question or prompt shown above choices
- `options` (array of arrays): Each option is `[label, nodeId, effectFn?]`
  - `label` (string): Text shown on button
  - `nodeId` (string | null): Node to jump to (null to continue in current node)
  - `effectFn` (function, optional): Function to execute when chosen `(state) => void`

**Behavior:**
- Shows choice menu overlay
- Executes effect function (if provided) when clicked
- Jumps to target node (if provided) or continues

#### End Story

**`endStory()`**

Ends the story/game.

```javascript
narration('And they lived happily ever after.')
narration('*** THE END ***')
endStory()
```

**Behavior:**
- Shows "THE END" message
- Stops story execution

---

## Enums Reference

### CharacterPose

Available character expressions/poses:

```javascript
CharacterPose.neutral
CharacterPose.happy
CharacterPose.sad
```

### CharacterPosition

Available screen positions for characters:

```javascript
CharacterPosition.left    // Left side of screen
CharacterPosition.center  // Center of screen
CharacterPosition.right   // Right side of screen
```

---

## Story Organization

### Flat Structure

Simple stories can use flat node IDs:

```javascript
nodes: {
    Start: [ /* steps */ ],
    Scene2: [ /* steps */ ],
    Ending: [ /* steps */ ],
}
```

### Nested Structure

Organize complex stories into groups:

```javascript
nodes: {
    Start: [ /* steps */ ],
    
    Chapter1: {
        Scene1: [ /* steps */ ],
        Scene2: [ /* steps */ ],
    },
    
    Chapter2: {
        Opening: [ /* steps */ ],
        Conflict: [ /* steps */ ],
    },
    
    Endings: {
        Good: [ /* steps */ ],
        Bad: [ /* steps */ ],
    },
}
```

Reference nested nodes with dot notation:

```javascript
jumpTo('Chapter1.Scene2')
jumpTo('Endings.Good')
```

---

## Debug Features

### Press 'D' for Debug Panel

While playing, press the **D** key to toggle a debug panel showing:
- All current variable values
- Real-time updates as variables change

### Console Validation

On story load, the engine validates your story and reports:
- ✗ **Errors**: Critical issues that will break the game
- ⚠ **Warnings**: Potential issues or unreachable content

Example output:
```
=== Story Validation ===
✓ Story validation passed!
```

Or with issues:
```
=== Story Validation ===
⚠ Story validation found 2 error(s) and 1 warning(s):
✗ Referenced node "Park.Missing" does not exist at jump to "Park.Missing"
✗ Character "charlie" not defined in story.characters
⚠ Node "Debug.Test" is defined but never referenced (unreachable)
```

### Runtime Error Messages

The engine provides helpful error messages when something goes wrong:

```
❌ Character "alice" not found in story.characters
   Available characters: ["you", "bob", "charlie"]

❌ Node not found: "Chapter2.Scene5"
   Failed at: "Chapter2.Scene5"
   Available at this level: ["Scene1", "Scene2", "Scene3", "Scene4"]
```

---

## Examples

### Complete Minimal Example

```javascript
import {
    CharacterPosition,
    CharacterPose,
    background,
    showCharacter,
    hideCharacter,
    dialogue,
    narration,
    choice,
    endStory,
} from './engine/story-format.js';

export const story = {
    start: 'Start',
    variables: { points: 0 },
    
    nodes: {
        Start: [
            background('park'),
            showCharacter('friend', CharacterPose.happy, CharacterPosition.center),
            dialogue('friend', 'Hey! Want to hang out?'),
            
            choice(
                'What do you say?',
                ['Sure!', 'Accept'],
                ['Maybe later.', 'Decline'],
            ),
        ],
        
        Accept: [
            dialogue('friend', 'Awesome! Let\'s go!'),
            narration('You spend a fun afternoon together.'),
            endStory(),
        ],
        
        Decline: [
            showCharacter('friend', CharacterPose.sad, CharacterPosition.center),
            dialogue('friend', 'Oh, okay...'),
            hideCharacter('friend'),
            narration('Your friend walks away sadly.'),
            endStory(),
        ],
    },
    
    characters: {
        friend: {
            name: 'Alex',
            poses: {
                neutral: 'assets/characters/alex/neutral.png',
                happy: 'assets/characters/alex/happy.png',
                sad: 'assets/characters/alex/sad.png',
            },
        },
    },
    
    places: {
        park: 'assets/backgrounds/outdoor-park.png',
    },
};
```

### Variable Tracking Example

```javascript
nodes: {
    Start: [
        setVariable('score', 0),
        setVariable('hasKey', false),
        // ...
    ],
    
    FindKey: [
        narration('You found a key!'),
        setVariable('hasKey', true),
        setVariable('score', state => state.variables.score + 10),
        // ...
    ],
    
    LockedDoor: [
        narration('You approach a locked door.'),
        conditionalJump(
            state => state.variables.hasKey,
            'OpenDoor',
            'CannotOpen'
        ),
    ],
}
```

### Complex Branching Example

```javascript
nodes: {
    Finale: [
        narration('The story reaches its conclusion...'),
        conditionalJump(
            state => state.variables.score >= 50,
            'PerfectEnding',
            'CheckGoodEnding'
        ),
    ],
    
    CheckGoodEnding: [
        conditionalJump(
            state => state.variables.score >= 25,
            'GoodEnding',
            'BadEnding'
        ),
    ],
}
```

### Multiple Characters Example

```javascript
nodes: {
    Conversation: [
        background('classroom'),
        showCharacter('alice', CharacterPose.happy, CharacterPosition.left),
        showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
        
        dialogue('alice', 'Did you finish the homework?'),
        dialogue('bob', 'Not yet...'),
        
        showCharacter('alice', CharacterPose.sad, CharacterPosition.left),
        dialogue('alice', 'We should study together.'),
        
        hideCharacter('alice'),
        hideCharacter('bob'),
        narration('They head to the library.'),
    ],
}
```

---

## Best Practices

1. **Always end nodes properly**: Each node should end with `jumpTo()`, `choice()`, `conditionalJump()`, or `endStory()`

2. **Organize with nested nodes**: Use groups like `Chapter1`, `Endings`, `Tutorial` for better organization

3. **Test variable names**: Use the debug panel (press D) to verify variables are being set correctly

4. **Check console on load**: Look for validation errors and warnings before playing

5. **Use meaningful node IDs**: `Chapter1.FirstMeeting` is better than `Node27`

6. **Hide characters when done**: Call `hideCharacter()` before changing scenes for cleaner transitions

7. **Validate jumps**: Make sure all `jumpTo()` and `choice()` targets exist

---

## Getting Help

- Check the browser console for validation errors and warnings
- Press **D** during gameplay to see current variable values
- Look at `stories/example-story.js` for a larger working example
- Look at `stories/simple-story.js` for a minimal example

---

## File Structure

```
basic-visual-novel/
├── engine/
│   ├── engine.js           # Visual novel runtime
│   ├── story-format.js     # Story format definitions & helpers
│   └── validator.js        # Story validation system
├── stories/
│   ├── example-story.js    # Full example story
│   └── simple-story.js     # Minimal example
├── assets/
│   ├── backgrounds/        # Background images
│   └── characters/         # Character sprite images
├── index.html              # Main HTML file
└── style.css              # Styling
```
