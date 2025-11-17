/** @file simple-story.js
 *  A simple, short example story to demonstrate the visual novel engine
 */

import {
    CharacterPosition,
    CharacterPose,
    background,
    showCharacter,
    hideCharacter,
    dialogue,
    narration,
    setVariable,
    jumpTo,
    conditionalJump,
    endStory,
    choice,
} from '../engine/story-format.js';

/** @type {import('../engine/story-format.js').Story} */
export const story = {
    start: 'Start',
    variables: {
        tookUmbrella: false,
        friendlyPoints: 0,
    },

    nodes: {
        Start: [
            background('bedroom'),
            showCharacter('you', CharacterPose.neutral, CharacterPosition.center),
            narration('It\'s Monday morning. You wake up and check your phone.'),
            narration('There\'s a weather alert: "Heavy rain expected this afternoon."'),
            hideCharacter('you'),

            choice(
                'Do you take an umbrella?',
                [
                    'Yes, better safe than sorry',
                    'TakeUmbrella',
                ],
                [
                    'No, it probably won\'t rain',
                    'SkipUmbrella',
                ],
            ),
        ],

        TakeUmbrella: [
            narration('You grab your umbrella before heading out.'),
            setVariable('tookUmbrella', true),
            jumpTo('School'),
        ],

        SkipUmbrella: [
            narration('You decide to risk it and leave the umbrella at home.'),
            setVariable('tookUmbrella', false),
            jumpTo('School'),
        ],

        School: [
            background('park'),
            showCharacter('bob', CharacterPose.happy, CharacterPosition.right),
            dialogue('bob', 'Hey! Ready for the big test today?'),
            showCharacter('you', CharacterPose.neutral, CharacterPosition.left),

            choice(
                'How do you respond?',
                [
                    'Yeah! I studied all weekend.',
                    'Confident',
                ],
                [
                    'Ugh, don\'t remind me...',
                    'Nervous',
                ],
            ),
        ],

        Confident: [
            showCharacter('you', CharacterPose.happy, CharacterPosition.left),
            dialogue('you', 'Yeah! I studied all weekend.'),
            showCharacter('bob', CharacterPose.happy, CharacterPosition.right),
            dialogue('bob', 'That\'s the spirit! Want to study together at lunch?'),
            setVariable('friendlyPoints', state => state.variables.friendlyPoints + 1),
            jumpTo('Lunch'),
        ],

        Nervous: [
            showCharacter('you', CharacterPose.sad, CharacterPosition.left),
            dialogue('you', 'Ugh, don\'t remind me...'),
            showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
            dialogue('bob', 'Don\'t worry! Want to study together at lunch?'),
            jumpTo('Lunch'),
        ],

        Lunch: [
            hideCharacter('you'),
            hideCharacter('bob'),
            narration('Lunch time arrives. You and Bob review your notes together.'),
            narration('Suddenly, you hear thunder outside.'),
            showCharacter('bob', CharacterPose.neutral, CharacterPosition.center),
            dialogue('bob', 'Looks like it\'s starting to rain heavily!'),
            hideCharacter('bob'),
            conditionalJump(
                state => state.variables.tookUmbrella,
                'HasUmbrella',
                'NoUmbrella',
            ),
        ],

        HasUmbrella: [
            showCharacter('you', CharacterPose.happy, CharacterPosition.center),
            narration('Good thing you brought your umbrella!'),
            showCharacter('bob', CharacterPose.sad, CharacterPosition.right),
            dialogue('bob', 'Man, I forgot mine. I\'m going to get soaked...'),
            hideCharacter('you'),

            choice(
                'What do you do?',
                [
                    'Share your umbrella with Bob',
                    'ShareUmbrella',
                ],
                [
                    'Wish him luck and go home',
                    'GoHomeAlone',
                ],
            ),
        ],

        NoUmbrella: [
            showCharacter('you', CharacterPose.sad, CharacterPosition.center),
            showCharacter('bob', CharacterPose.sad, CharacterPosition.right),
            narration('Neither of you has an umbrella.'),
            dialogue('bob', 'We\'re both going to get drenched!'),
            showCharacter('bob', CharacterPose.happy, CharacterPosition.right),
            dialogue('bob', 'Well, at least we\'re in this together!'),
            setVariable('friendlyPoints', state => state.variables.friendlyPoints + 1),
            jumpTo('EndingTogether'),
        ],

        ShareUmbrella: [
            showCharacter('you', CharacterPose.happy, CharacterPosition.left),
            showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
            dialogue('you', 'Don\'t worry! We can share mine.'),
            showCharacter('bob', CharacterPose.happy, CharacterPosition.right),
            dialogue('bob', 'Really? Thanks! You\'re the best!'),
            setVariable('friendlyPoints', state => state.variables.friendlyPoints + 2),
            jumpTo('EndingBest'),
        ],

        GoHomeAlone: [
            showCharacter('you', CharacterPose.neutral, CharacterPosition.center),
            dialogue('you', 'Good luck! See you tomorrow.'),
            hideCharacter('you'),
            showCharacter('bob', CharacterPose.sad, CharacterPosition.center),
            dialogue('bob', 'Yeah... see you.'),
            hideCharacter('bob'),
            jumpTo('EndingAlone'),
        ],

        EndingBest: [
            hideCharacter('you'),
            hideCharacter('bob'),
            narration('You walk home together under the umbrella, laughing and chatting.'),
            narration('The rain doesn\'t seem so bad when you\'re with a friend.'),
            showCharacter('you', CharacterPose.happy, CharacterPosition.left),
            showCharacter('bob', CharacterPose.happy, CharacterPosition.right),
            dialogue('bob', 'Thanks again. I owe you one!'),
            hideCharacter('you'),
            hideCharacter('bob'),
            narration('*** BEST ENDING: True Friendship ***'),
            endStory(),
        ],

        EndingTogether: [
            hideCharacter('you'),
            hideCharacter('bob'),
            narration('You both make a run for it through the rain.'),
            narration('By the time you get home, you\'re both completely soaked but laughing.'),
            narration('Sometimes the best memories come from unexpected moments.'),
            narration('*** GOOD ENDING: Shared Experience ***'),
            endStory(),
        ],

        EndingAlone: [
            narration('You make it home dry under your umbrella.'),
            narration('As you close the door, you can\'t help but feel a little guilty.'),
            narration('Maybe you should have been more generous...'),
            narration('*** ENDING: Dry but Lonely ***'),
            endStory(),
        ],
    },

    characters: {
        you: {
            name: 'You',
            poses: {
                [CharacterPose.neutral.name]: 'assets/characters/alice/neutral.png',
                [CharacterPose.happy.name]: 'assets/characters/alice/happy.png',
                [CharacterPose.sad.name]: 'assets/characters/alice/sad.png',
            },
        },
        bob: {
            name: 'Bob',
            poses: {
                [CharacterPose.neutral.name]: 'assets/characters/bob/neutral.png',
                [CharacterPose.happy.name]: 'assets/characters/bob/happy.png',
                [CharacterPose.sad.name]: 'assets/characters/bob/sad.png',
            },
        },
    },

    places: {
        bedroom: 'assets/backgrounds/room-bedroom.png',
        park: 'assets/backgrounds/outdoor-park.png',
    },
};
