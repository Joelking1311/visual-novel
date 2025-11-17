/** @file example-story.js
 *  Example story using the helpers and enums from story-format.js
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
        abigailAffection: 0,
        bobAffection: 0,
        visitedPark: false,
        visitedLivingRoom: false,
        helpedAbigail: false,
    },

    nodes: {
        Start: [
            background('bedroom'),
            showCharacter('you', CharacterPose.neutral, CharacterPosition.center),
            narration('OMG, DU SOV OVER DIG. Der frokost pause!'),
            narration('Du kan høre folk ud fra klassen, det lyder som dit barn Ellen'),

            choice(
                'Hvad vil du helst?',
                [
                    'Gå til Ellen',
                    'LivingRoom.Main',
                ],
                [
                    'Være i klassen længer',
                    'Bedroom.StayInBed',
                ],
            ),
        ],

        Bedroom: {
            StayInBed: [
                showCharacter('you', CharacterPose.neutral, CharacterPosition.center),
                narration('You pull the covers over your head and doze for a while longer.'),
                narration('Eventually, you hear a knock on your door.'),
                hideCharacter('you'),
                showCharacter('abigail', CharacterPose.neutral, CharacterPosition.center),
                dialogue('abigail', 'Hey, sleepyhead! Are you going to stay in there all day?'),

                choice(
                    'How do you respond?',
                    [
                        'Sorry! I\'ll be right out.',
                        'Bedroom.RespondApologetic',
                    ],
                    [
                        'Just five more minutes...',
                        'Bedroom.FiveMoreMinutes',
                    ],
                ),
            ],

            RespondApologetic: [
                showCharacter('you', CharacterPose.happy, CharacterPosition.left),
                hideCharacter('abigail'),
                showCharacter('abigail', CharacterPose.neutral, CharacterPosition.right),
                dialogue('you', 'Sorry! I\'ll be right out.'),
                showCharacter('abigail', CharacterPose.happy, CharacterPosition.right),
                dialogue('abigail', 'No worries! Take your time.'),
                hideCharacter('abigail'),
                hideCharacter('you'),
                setVariable('abigailAffection', state => state.variables.abigailAffection + 1),
                jumpTo('LivingRoom.Main'),
            ],

            FiveMoreMinutes: [
                showCharacter('you', CharacterPose.neutral, CharacterPosition.left),
                showCharacter('abigail', CharacterPose.neutral, CharacterPosition.right),
                dialogue('you', 'Just five more minutes...'),
                showCharacter('abigail', CharacterPose.sad, CharacterPosition.right),
                dialogue('abigail', 'Fine... but Bob wanted to show us something at the park.'),
                hideCharacter('abigail'),
                hideCharacter('you'),
                narration('Abigail walks away. You hear the front door close.'),
                setVariable('abigailAffection', state => state.variables.abigailAffection - 1),
                narration('You feel a bit guilty and decide to get up.'),
                jumpTo('LivingRoom.Alone'),
            ],
        },

        LivingRoom: {
            Main: [
                background('living'),
                setVariable('visitedLivingRoom', true),
                showCharacter('you', CharacterPose.neutral, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.happy, CharacterPosition.left),
                showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
                dialogue('Ellen', 'hEj MoOr! sUlTeN eR jEg!'),
                dialogue('Joel manden', 'Hey skatter! Perfect timing. Maden er stadig varm ;).'),
                showCharacter('abigail', CharacterPose.neutral, CharacterPosition.left),
                dialogue('Ellen', 'mOr JeG sKaL i BøRnHaVe! Du KoM mEd!?'),
                hideCharacter('you'),

                choice(
                    'Hvad vil du?',
                    [
                        'I\'ll help you, Abigail!',
                        'LivingRoom.HelpAbigail',
                    ],
                    [
                        'I\'d rather go to the park with Bob.',
                        'LivingRoom.GoWithBob',
                    ],
                ),
            ],

            Alone: [
                background('living'),
                narration('The living room is empty. You notice a note on the table.'),
                narration('"We went to the park. Join us if you want! - Abigail & Bob"'),

                choice(
                    'What do you do?',
                    [
                        'Head to the park',
                        'Park.Late',
                    ],
                    [
                        'Stay home and relax',
                        'LivingRoom.StayHome',
                    ],
                ),
            ],

            HelpAbigail: [
                setVariable('helpedAbigail', true),
                setVariable('abigailAffection', state => state.variables.abigailAffection + 2),
                showCharacter('you', CharacterPose.happy, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.neutral, CharacterPosition.left),
                showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
                dialogue('you', 'I\'ll help you, Abigail!'),
                hideCharacter('bob'),
                showCharacter('abigail', CharacterPose.happy, CharacterPosition.left),
                dialogue('abigail', 'Thanks! I really appreciate it.'),
                dialogue('bob', 'Alright, I\'ll head to the park. Meet you guys there later!'),
                hideCharacter('you'),
                hideCharacter('abigail'),
                narration('Bob leaves. You spend the next hour helping Abigail with her errands.'),
                narration('After finishing, you both head to the park.'),
                jumpTo('Park.WithAbigail'),
            ],

            GoWithBob: [
                setVariable('bobAffection', state => state.variables.bobAffection + 2),
                showCharacter('you', CharacterPose.neutral, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.neutral, CharacterPosition.left),
                showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
                dialogue('you', 'I\'d rather go to the park with Bob.'),
                hideCharacter('you'),
                showCharacter('abigail', CharacterPose.sad, CharacterPosition.left),
                dialogue('abigail', 'Oh... okay. I guess I\'ll catch up with you later.'),
                hideCharacter('abigail'),
                showCharacter('you', CharacterPose.neutral, CharacterPosition.left),
                showCharacter('bob', CharacterPose.happy, CharacterPosition.right),
                dialogue('bob', 'Cool! Let\'s go!'),
                hideCharacter('you'),
                hideCharacter('bob'),
                narration('You leave with Bob, but you can\'t help feeling a bit guilty about Abigail.'),
                jumpTo('Park.WithBob'),
            ],

            StayHome: [
                narration('You decide to stay home and enjoy a quiet day by yourself.'),
                narration('You read a book, watch some shows, and relax completely.'),
                narration('Later that evening, you hear your roommates return.'),
                background('living'),
                showCharacter('abigail', CharacterPose.sad, CharacterPosition.left),
                showCharacter('bob', CharacterPose.sad, CharacterPosition.right),
                dialogue('bob', 'We missed you at the park today.'),
                dialogue('abigail', 'Yeah... it would have been more fun with you there.'),
                narration('You feel a bit lonely, realizing you missed out on a great day with friends.'),
                jumpTo('Endings.Lonely'),
            ],
        },

        Park: {
            WithAbigail: [
                background('park'),
                setVariable('visitedPark', true),
                showCharacter('you', CharacterPose.happy, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.happy, CharacterPosition.left),
                narration('You arrive at the park together. The weather is beautiful.'),
                dialogue('abigail', 'Thanks again for helping me. I couldn\'t have done it without you.'),

                choice(
                    'How do you respond?',
                    [
                        'Happy to help!',
                        'Park.RespondHappy',
                    ],
                    [
                        'It was no trouble at all.',
                        'Park.RespondCasual',
                    ],
                ),
            ],

            RespondHappy: [
                showCharacter('you', CharacterPose.happy, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.happy, CharacterPosition.left),
                dialogue('you', 'Happy to help!'),
                hideCharacter('you'),
                showCharacter('bob', CharacterPose.happy, CharacterPosition.right),
                dialogue('bob', 'Hey, you made it! Check out what I found!'),
                narration('Bob shows you both a hidden path he discovered.'),
                dialogue('abigail', 'Wow, this is amazing!'),
                showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
                dialogue('bob', 'Right? I thought we could explore it together.'),
                jumpTo('Park.Ending'),
            ],

            RespondCasual: [
                showCharacter('you', CharacterPose.neutral, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.happy, CharacterPosition.left),
                dialogue('you', 'It was no trouble at all.'),
                hideCharacter('you'),
                showCharacter('bob', CharacterPose.happy, CharacterPosition.right),
                dialogue('bob', 'Hey, you made it! Check out what I found!'),
                narration('Bob shows you both a hidden path he discovered.'),
                dialogue('abigail', 'Wow, this is amazing!'),
                showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
                dialogue('bob', 'Right? I thought we could explore it together.'),
                jumpTo('Park.Ending'),
            ],

            WithBob: [
                background('park'),
                setVariable('visitedPark', true),
                showCharacter('you', CharacterPose.neutral, CharacterPosition.center),
                showCharacter('bob', CharacterPose.happy, CharacterPosition.right),
                narration('You and Bob arrive at the park. The sun is shining brightly.'),
                dialogue('bob', 'I found this really cool hidden path! Want to check it out?'),
                hideCharacter('you'),
                hideCharacter('bob'),
                narration('You explore together, finding a quiet scenic spot.'),
                showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
                showCharacter('abigail', CharacterPose.sad, CharacterPosition.left),
                dialogue('abigail', 'Oh, you\'re both here...'),
                dialogue('bob', 'Abigail! You finished your errands? Come join us!'),

                choice(
                    'What do you say to Abigail?',
                    [
                        'Sorry we didn\'t wait for you.',
                        'Park.ApologizeToAbigail',
                    ],
                    [
                        'Come on, Bob found something cool!',
                        'Park.InviteAbigailEnthusiastic',
                    ],
                ),
            ],

            ApologizeToAbigail: [
                showCharacter('you', CharacterPose.sad, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.sad, CharacterPosition.left),
                showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
                dialogue('you', 'Sorry we didn\'t wait for you.'),
                setVariable('abigailAffection', state => state.variables.abigailAffection + 1),
                showCharacter('abigail', CharacterPose.neutral, CharacterPosition.left),
                dialogue('abigail', 'It\'s okay. I understand.'),
                hideCharacter('you'),
                dialogue('abigail', 'So what did you find, Bob?'),
                jumpTo('Park.Ending'),
            ],

            InviteAbigailEnthusiastic: [
                showCharacter('you', CharacterPose.happy, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.sad, CharacterPosition.left),
                showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
                dialogue('you', 'Come on, Bob found something cool!'),
                showCharacter('abigail', CharacterPose.neutral, CharacterPosition.left),
                dialogue('abigail', 'Yeah... I did. Looks like you found something interesting.'),
                hideCharacter('you'),
                jumpTo('Park.Ending'),
            ],

            Late: [
                background('park'),
                setVariable('visitedPark', true),
                showCharacter('you', CharacterPose.neutral, CharacterPosition.center),
                showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
                showCharacter('abigail', CharacterPose.neutral, CharacterPosition.left),
                narration('You arrive at the park and find Abigail and Bob sitting on a bench.'),
                dialogue('bob', 'Hey! You made it after all.'),
                dialogue('abigail', 'We were wondering if you\'d show up.'),
                narration('The atmosphere feels a bit awkward.'),
                hideCharacter('you'),

                choice(
                    'What do you say?',
                    [
                        'Sorry I\'m late. What did I miss?',
                        'Park.ApologizeLate',
                    ],
                    [
                        'Better late than never, right?',
                        'Park.JokeLate',
                    ],
                ),
            ],

            ApologizeLate: [
                showCharacter('you', CharacterPose.sad, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.neutral, CharacterPosition.left),
                showCharacter('bob', CharacterPose.neutral, CharacterPosition.right),
                dialogue('you', 'Sorry I\'m late. What did I miss?'),
                showCharacter('abigail', CharacterPose.happy, CharacterPosition.left),
                dialogue('abigail', 'Not much yet. We were waiting for you!'),
                hideCharacter('you'),
                dialogue('abigail', 'Want to walk around with us?'),
                jumpTo('Park.Ending'),
            ],

            JokeLate: [
                showCharacter('you', CharacterPose.happy, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.neutral, CharacterPosition.left),
                showCharacter('bob', CharacterPose.happy, CharacterPosition.right),
                dialogue('you', 'Better late than never, right?'),
                dialogue('bob', 'Ha! That\'s the spirit!'),
                showCharacter('abigail', CharacterPose.happy, CharacterPosition.left),
                dialogue('abigail', 'Well, you\'re here now. Want to walk around with us?'),
                hideCharacter('you'),
                jumpTo('Park.Ending'),
            ],

            Ending: [
                narration('The three of you spend the rest of the afternoon at the park.'),
                conditionalJump(
                    state => state.variables.helpedAbigail,
                    'Endings.Best',
                    'Endings.Good',
                ),
            ],
        },

        Endings: {
            Best: [
                showCharacter('you', CharacterPose.happy, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.happy, CharacterPosition.left),
                showCharacter('bob', CharacterPose.happy, CharacterPosition.right),
                narration('As the sun begins to set, you all sit together on the grass.'),
                dialogue('abigail', 'This was a perfect day. I\'m glad we\'re all friends.'),
                dialogue('bob', 'Agreed! We should do this more often.'),
                hideCharacter('you'),
                narration('You smile, feeling grateful for the wonderful friendships you\'ve built.'),
                narration('*** BEST ENDING: True Friendship ***'),
                endStory(),
            ],

            Good: [
                showCharacter('you', CharacterPose.neutral, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.neutral, CharacterPosition.left),
                showCharacter('bob', CharacterPose.happy, CharacterPosition.right),
                narration('As the day winds down, you all head home together.'),
                dialogue('bob', 'That was fun! Same time next week?'),
                hideCharacter('you'),
                conditionalJump(
                    state => state.variables.abigailAffection < 0,
                    'Endings.AbigailUpset',
                    'Endings.NormalGood',
                ),
            ],

            AbigailUpset: [
                showCharacter('you', CharacterPose.neutral, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.sad, CharacterPosition.left),
                dialogue('abigail', 'Sure... I guess.'),
                hideCharacter('you'),
                narration('Abigail seems distant. You wonder if you could have been a better friend today.'),
                narration('*** ENDING: Room for Improvement ***'),
                endStory(),
            ],

            NormalGood: [
                showCharacter('you', CharacterPose.happy, CharacterPosition.center),
                showCharacter('abigail', CharacterPose.happy, CharacterPosition.left),
                dialogue('abigail', 'Sounds good to me!'),
                hideCharacter('you'),
                narration('You all head home, looking forward to more adventures together.'),
                narration('*** GOOD ENDING: Friends Together ***'),
                endStory(),
            ],

            Lonely: [
                hideCharacter('abigail'),
                hideCharacter('bob'),
                narration('You spend the evening alone in your room, thinking about the day.'),
                narration('Sometimes it\'s important to spend time with the people who care about you.'),
                narration('*** ENDING: Solitude ***'),
                endStory(),
            ],
        },
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
        abigail: {
            name: 'Abigail',
            poses: {
                [CharacterPose.neutral.name]: 'assets/characters/abigail/neutral.png',
                [CharacterPose.happy.name]: 'assets/characters/abigail/happy.png',
                [CharacterPose.sad.name]: 'assets/characters/abigail/sad.png',
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
        living: 'assets/backgrounds/room-living.png',
        park: 'assets/backgrounds/outdoor-park.png',
    },
};
