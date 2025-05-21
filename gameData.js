// gameData.ts
// --- Constants ---
export const SAVE_KEY = 'fandomForgeSaveData_v11';
export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';
export const EVENT_REGISTRATION_WINDOW_WEEKS = 2;
export const EVENT_REGISTRATION_FEE_BASE = 100;
export const EVENT_PRINTING_COST_NEW_BASE_FEE = 50;
export const EVENT_PRINTING_COST_RERELEASE = 30;
export const LIVING_EXPENSE_AMOUNT = 150;
export const LIVING_EXPENSE_INTERVAL_WEEKS = 4;
export const PLAYER_CUSTOM_SNS_POST_COOLDOWN_WEEKS = 2;
export const LOW_STAMINA_WRITING_THRESHOLD = 20;
export const BURNOUT_STREAK_THRESHOLD = 3;
export const BURNOUT_CHANCE = 0.20;
export const SOURCE_STAMINA_HEAL_CHANCE = 0.30;
export const SOURCE_STAMINA_HEAL_AMOUNT = 10;
export const SOURCE_SKILL_DROP_CHANCE = 0.08;
export const SOURCE_SKILL_DROP_AMOUNT = 0.5;
export const DEFAULT_EVENT_SALE_PRICE = 1000;
export const OFFICIAL_WARNING_CHANCE_FOR_PAID_CONTENT = 0.02;
export const ALL_GENRES = ["Fluff", "Angst", "Humor", "Action", "Slice of Life", "Hurt/Comfort", "RomCom (로맨틱코미디)", "Horror (공포)", "Mystery (미스터리/추리)", "Omegaverse", "Dark Fantasy", "Sci-Fi", "Thriller", "Experimental Fiction", "Canon Divergence", "Parody", "PWP (Plot What Plot)", "Crackfic", "AU (Alternate Universe)", "Fix-it Fic", "Character Study"];
export const ALL_MATERIALS = ["Enemies to Lovers", "Childhood Friends", "Secret Identity", "Fake Dating", "Slow Burn", "Time Travel", "Office Romance", "Found Family", "Apocalypse AU", "Magic School AU", "Royalty AU", "College AU", "Coffee Shop AU", "Soulmates AU", "Modern AU (for fantasy settings)", "Historical AU", "High School AU", "Canon-Compliant", "Post-Canon", "Pre-Canon", "Mutual Pining", "Forced Proximity", "Road Trip", "Animal Transformation (동물이 되다!)", "First Date (첫 데이트)", "Elderly Couple (노부부)", "Childhood Confession", "Amnesia", "Body Swap", "University Pranks", "Survival Game", "Cyberpunk Setting", "Historical Epic", "Holiday Special", "Cooking/Food Focus", "Sequel to Previous Fic", "Songfic (노래 가사 기반)", "Dream Sequence (꿈 장면)", "Time Loop", "Secret Relationship", "Reincarnation"];
export const ALL_COMMENTS_VARIETY = {
    positive: [
        "작가님 천재만재!! ㅠㅠㅠ 다음편 존버합니다!", "와 미쳤다... 밤새서 읽었어요. 작가님 사랑해요!", "이 커플링 해석 너무 좋아요! 제 안의 공식입니다.",
        "대박... 글 너무 잘 쓰세요! 문장 하나하나가 주옥같아요.", "ㅠㅠㅠㅠㅠ 최고예요 작가님... 제 인생작 등극입니다.", "작가님 글 보고 광명찾았습니다... 압도적 감사!",
        "선생님 어디계십니까 제가 그쪽으로 절하겠습니다ㅠㅠ", "이게 나라다... 이 커플링은 찐입니다 여러분!!", "작가님 덕분에 오늘 하루 행복하게 마무리합니다!", "다음 편 언제 나와요 현기증 난단 말이에요!"
    ],
    neutral: [
        "잘 보고 갑니다.", "흠... 흥미로운 전개네요.", "이런 해석은 처음 봐요. 신선하네요.", "다음편 기대할게요. 수고하셨습니다.", "무난하게 재밌었어요.", "독특한 시점이네요.", "생각할 거리를 던져주는 글입니다."
    ],
    negativeGeneral: [
        "전개가 조금 아쉬워요. 더 파격적일 줄 알았는데.", "캐릭터 감정선이 조금 더 섬세했으면 좋겠어요.", "결말이 좀 급하게 마무리된 느낌?", "소재는 좋은데 필력이 조금만 더 받쳐주면 대박일듯."
    ],
    maliciousSarcasticFemale: [
        "언냐 캐해 이렇게 할 거면 걍 탈덕? 하는 게 좋을 것 같긔 ㅠㅠ", "작가님... 이번 작은 좀... 할많하않이긔... 힘내시긔.", "와... 이 전개 실화긔? 언냐 혹시 내 최애 안티시긔?",
        "필력 무슨일이긔... 눈물나서 스크롤 내렸긔...", "얘 아직 탈덕 안 함? 독하다 독해~", "언냐... 글에서 틀내가... 좀... 나긔윤...",
        "이걸 돈 받고 팔 생각은 아니시긔? 그럼 진짜 양심리스긔", "아묻따 내 기준으론 망작이긔... 언냐 취존은 하는데 이건 좀...", "울희 애긔들로 이런 거 쓰지 말아주시긔 제발 ㅠㅠㅠ",
        "작가님 혹시 국어시간에 주무셨긔? 문장이 왜이러긔??", "차라리 내가 쓰는 게 더 잘 쓰겠긔... 후...", "댓글 알바라도 쓰셨긔? 왜 나만 재미없긔?",
    ],
    maliciousSwear: [
        "작가새끼 뇌절했네. 스토리가 산으로 가냐?", "이딴게 스토리라고? 발로 써도 이것보단 낫겠다.", "원작 파괴 좀 그만해라. 캐릭터 다 죽이네.",
        "이걸 팬픽이라고 올린 거임? 양심 터졌냐?", "솔직히 개노잼. 시간 존나 아깝다.", "필력 실화냐? 초딩도 이것보단 잘 쓰겠다.",
        "이 커플링 이렇게 쓰는거 아닌데... 작가 기본적인 이해도 없냐?", "내 최애 망치지 마라 XXXX야.", "쓰레기 잘 봤습니다 ^^ 다신 보지 맙시다.", "지뢰 오지게 밟았네. 퉤."
    ],
    paidNegative: [
        "이게 왜 유료임? 돈 아깝다 진짜.", "무료로 풀어도 안 볼 퀄리티인데 이걸 돈주고 사다니...", "작가님 돈독 올랐네; 실력도 없으면서 유료라니.", "유료글은 좀 더 신경써야 하는거 아닌가요? 실망입니다."
    ],
    rivalPositive: [
        "와 X작가님 이번 신작도 대박이네요!", "역시 믿고보는 X작가님 글빨!", "이 커플링은 X작가님이 제일 잘 쓰시는듯."
    ]
};
export const PREDEFINED_PLAYER_ANECDOTES = {
    personal_creative_musings: [
        "Writer's block is hitting hard today... 😫 #amwriting",
        "Just had a Eureka moment for a plot twist! Hope I can write it down before I forget. ✨",
        "My back hurts from sitting and writing all day. Worth it? Maybe. Ask me tomorrow. 💀 #authorlife",
        "Is it normal to have more unfinished drafts than finished fics? Asking for a friend... 👀",
        "Coffee is my writing fuel. And snacks. Lots of snacks. ☕🍪",
        "That feeling when you re-read something you wrote yesterday and think 'Did I actually write this genius?!' (Spoiler: it's rare).",
        "Sometimes I think my characters write themselves, I'm just the typist. Anyone else?",
        "The plot bunnies are multiplying again! Not enough hours in the day! 🐰"
    ],
    fandom_specific_musings: [
        "Been thinking about [FavCharacter] from [WorkTitle] again... what if they actually [ScenarioIdea]? 🤔 #headcanon",
        "My current headcanon for [FavPairing] in [WorkTitle] is that they secretly [QuirkyActivity] together. 😂 #주접",
        "Random thought: Imagine an AU where [FavCharacter] from [WorkTitle] meets [AnotherCharacter] from [AnotherWorkTitle]! The chaos! #crossoverdreaming",
        "What if the ending of [WorkTitle] for [FavCharacter] was actually [AlternativeEnding]? My brain won't stop. 🤯",
        "Just re-read [WorkTitle] and I'm convinced [FavCharacter]'s true motivation was [UnconventionalMotivation]. Fight me. 🔥 #fandomdeepdive",
        "Okay, but consider this for [FavPairing] in [WorkTitle]: [MicroFicIdea]. Just a tiny thought! #ficletidea",
        "If [FavCharacter] from [WorkTitle] had a modern job, they'd totally be a [ModernJob]. No, I will not elaborate. 🤫"
    ]
};
export const SCENARIO_IDEAS_FOR_ANECDOTES = ["ran away to join a circus", "discovered a hidden talent for competitive baking", "had to solve a mystery involving a talking cat", "found a map to a legendary meme stash", "accidentally started a cult following their favorite snack"];
export const QUIRKY_ACTIVITIES_FOR_ANECDOTES = ["binge-watch cat videos together", "argue passionately about the best ramen flavor", "try to assemble IKEA furniture without instructions (and fail spectacularly)", "have a secret handshake that's overly complicated", "compete to see who can find the weirdest fanart of themselves"];
export const ANOTHER_WORK_TITLES_SAMPLE_FOR_ANECDOTES = ["Lunar Saga", "Shadow Academy", "MysticNet Diaries", "Cyber City Blues", "The Grand Budapest Hotel"];
export const ANOTHER_CHARACTERS_SAMPLE_FOR_ANECDOTES = ["Captain Eva", "Simon Nightshade", "Agent 7", "Viper", "Zero"];
export const ALTERNATIVE_ENDINGS_SAMPLE_FOR_ANECDOTES = ["they all became best friends and opened a bakery", "it was all an elaborate dream sequence by a minor character", "they found a portal to our world and got very confused by smartphones", "the villain was actually just misunderstood and needed a hug", "they decided to ditch destiny and go on a road trip"];
export const UNCONVENTIONAL_MOTIVATIONS_SAMPLE_FOR_ANECDOTES = ["an undying love for perfectly toasted marshmallows", "a secret desire to collect every rubber duck in existence", "a quest to find the ultimate dad joke to make their rival groan", "an attempt to prove pineapple unequivocally belongs on pizza (or doesn't)", "to find out who keeps stealing their left socks"];
export const MICRO_FIC_IDEAS_FOR_ANECDOTES = ["them sharing a quiet moment under the stars", "an awkward first date scenario", "a misunderstanding leading to hilarity", "them discovering a shared, unexpected hobby", "a brief, intense argument followed by a tender reconciliation"];
export const MODERN_JOBS_FOR_ANECDOTES = ["barista at a themed cafe", "overworked intern at a startup", "slightly cynical librarian", "surprisingly wholesome influencer", "escape room designer"];
export const gameStyles = `
    body { @apply bg-slate-100 text-gray-800 font-sans; }
    #app-container { @apply container mx-auto p-4 max-w-6xl; }
    .input-group { @apply mb-4; }
    .label-primary { @apply block text-sm font-medium text-gray-700 mb-1; }
    .input-primary { @apply mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm; }
    .input-primary[readonly] { @apply bg-gray-100 cursor-not-allowed; }
    .textarea-primary { @apply mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm; min-height: 60px; resize: vertical; }
    .select-primary { @apply mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md; }
    .btn-primary { @apply py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed; }
    .btn-primary-sm { @apply py-1 px-3 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400; }
    .btn-secondary { @apply py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200; }
    .btn-secondary-sm { @apply py-1 px-3 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-200; }
    .btn-danger-sm { @apply py-1 px-3 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400; }
    .btn-success { @apply py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400; }
    .btn-event { @apply py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400; }
    .modal-base { @apply fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-40 p-4; }
    .modal-content-wrapper { @apply bg-white p-5 rounded-lg shadow-xl max-w-lg w-full; }
    .modal-header { @apply flex justify-between items-center pb-3 mb-3 border-b border-gray-200; }
    .modal-header h2, .modal-header h3 { @apply text-xl font-semibold text-purple-700 m-0; }
    .close-modal-button { @apply bg-red-500 text-white hover:bg-red-600 text-xs font-bold py-1 px-2 rounded; }
    .modal-body { @apply space-y-3; }

    .day-schedule { @apply bg-purple-50 p-3 rounded-md border border-purple-200; }
    .day-schedule label.day-label { @apply font-bold text-purple-700 block mb-1 text-sm; }
    .day-schedule select { @apply select-primary text-sm; }
    .project-select-container { @apply mt-2; }
    .project-select-container label { @apply text-xs text-gray-600 block mb-0.5; }

    .hn-post { @apply border border-gray-200 bg-white p-3 mb-3 rounded-md shadow-sm; }
    .hn-post-header { @apply text-xs text-gray-500 mb-1; }
    .hn-post-header strong { @apply text-blue-600 font-semibold; }
    .hn-post-title { @apply text-lg font-semibold text-gray-800 mb-1; }
    .hn-post-content pre { @apply whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-2 rounded; }
    .hn-post-footer { @apply text-xs text-gray-600 flex items-center gap-3 mt-2 pt-2 border-t border-gray-100; }
    .hn-comments-section { @apply mt-2 pl-3 border-l-2 border-gray-200; }
    .hn-comments-section h4 { @apply text-sm font-semibold text-gray-700 mb-1; }
    .hn-comment { @apply mb-2 p-2 bg-gray-50 border border-gray-100 rounded-md text-sm; }
    .hn-comment-header { @apply text-xs text-gray-500 mb-0.5; }
    .hn-comment-header strong { @apply text-blue-500 font-medium; }
    .hn-comment-body { @apply text-gray-700; }

    .my-fic-entry { @apply border-b border-gray-200 pb-3 mb-3; }
    .my-fic-entry strong { @apply text-md font-semibold text-purple-600 block mb-1;}
    .fic-meta { @apply text-xs text-gray-600 block; }
    .fic-inventory { @apply text-green-700 font-medium; }
    .reader-rating { @apply font-bold text-yellow-500; }
    .memo-area { @apply textarea-primary text-xs p-1.5; min-height: 40px; }
    .fic-content-preview { @apply bg-gray-50 p-2 border border-gray-200 rounded-md mt-1 max-h-32 overflow-y-auto text-xs; }
    
    .fandom-set-entry { @apply border border-gray-200 p-3 mb-2 rounded-md bg-white shadow-sm; }
    .fandom-set-entry h4 { @apply text-md font-semibold text-purple-600; }
    .log-entry { @apply p-1.5 border-b border-gray-100 text-xs; }
    .log-entry .log-timestamp { @apply font-semibold text-purple-600 mr-2; }
    .log-type-action { @apply text-blue-600; }
    .log-type-event { @apply text-pink-600; }
    .log-type-system { @apply text-gray-600; }
    .log-type-sns { @apply text-teal-600; }
    .log-type-fic_published { @apply text-orange-600; }
    .log-type-milestone { @apply text-green-600; }
    .log-type-burnout { @apply text-red-700 font-bold; }
    .log-type-skill_change { @apply text-amber-600; }
    .log-type-error { @apply text-red-700 font-bold; }
    .message-log-entry { @apply p-1 border-b border-dotted border-gray-200 text-xs; }
    .message-log-entry .log-time { @apply text-xs text-gray-500 mr-1; }
    .log-msg-info { @apply text-blue-700; }
    .log-msg-success { @apply text-green-700; }
    .log-msg-warning { @apply text-orange-700; }
    .log-msg-error { @apply text-red-700 font-bold; }
    .fanfic-project-entry { @apply border border-gray-200 p-3 mb-2 rounded-md bg-white; }
    .fanfic-project-entry h4 { @apply text-md font-semibold text-purple-600; }
`;
export const actions = [
    {
        id: 'Rest', label: '휴식 (Rest)', staminaCost: 0, staminaGain: 30, timeCost: 1,
        possibleDescriptions: ["Taking a much-needed break.", "Deep slumber restored your energy.", "Zoning out on the couch."],
        image: "https://picsum.photos/80/80?random=1&grayscale"
    },
    {
        id: 'Work', label: '아르바이트 (Part-time Job)', staminaCost: 20, moneyGain: 150, timeCost: 1,
        possibleDescriptions: ["Earning some cash.", "오늘도 사장님의 잔소리를 BGM 삼아 알바비를 벌었다.", "Another day, another dollar."],
        image: "https://picsum.photos/80/80?random=2&grayscale"
    },
    {
        id: 'SNS', label: 'SNS 활동 (SNS Activity)', staminaCost: 8, timeCost: 1,
        possibleDescriptions: ["Engaging with the online community.", "Scrolling through the timeline.", "Found a new fan artist!"],
        image: "https://picsum.photos/80/80?random=3&grayscale"
    },
    {
        id: 'Inspiration', label: '영감 얻기 (Seek Inspiration)', staminaCost: 12, deokryeokGain: 3, timeCost: 1,
        possibleDescriptions: ["Searching for new creative ideas.", "Hoping a plot bunny hops by.", "Re-read an old favorite."],
        image: "https://picsum.photos/80/80?random=4&grayscale"
    },
    {
        id: 'Exercise', label: '운동 (Exercise)', staminaCost: 20, maxStaminaGain: 0.3, staminaGain: 10, timeCost: 1,
        possibleDescriptions: ["Keeping fit!", "A quick jog to clear the mind.", "Stretching out those kinks."],
        image: "https://picsum.photos/80/80?random=5&grayscale"
    },
    {
        id: 'WriteFicProject', label: '팬픽 작업 (Work on Project)', staminaCost: 25, timeCost: 1,
        possibleDescriptions: ["Making progress on the fanfic!", "Words are flowing... or trickling?", "Battling the blank page."],
        image: "https://picsum.photos/80/80?random=6&grayscale"
    },
    {
        id: 'Source', label: '원작 보기 (Consume Source)', staminaCost: 5, deokryeokGain: 10, timeCost: 1,
        possibleDescriptions: ["Revisiting the source material.", "Analyzing character motivations.", "Getting lost in the world."],
        image: "https://picsum.photos/80/80?random=7&grayscale"
    },
    {
        id: 'VisitLibrary', label: '도서관 가기 (Visit Library)', staminaCost: 10, staminaGain: 5, timeCost: 1, writingSkillGain: 0,
        possibleDescriptions: ["Expanding knowledge at the library.", "The quiet hum of the library.", "Studied writing techniques."],
        image: "https://picsum.photos/80/80?random=8&grayscale"
    },
];
export function getDefaultGameState() {
    const initialFandomSetId = "fandomset-1";
    const hardcodedDefaultPopularityTier = "Minor";
    const defaultInitialPopularity = 5;
    return {
        apiKey: '', playerName: 'AnonAuthor',
        fandomSets: [{
                id: initialFandomSetId,
                workTitle: 'Default Fandom Work', workDescription: 'A very popular series.',
                favCharacter: 'Character A', favCharacterDescription: 'A stoic and skilled individual.',
                favPairing: 'Character A/Character B',
                pairingInterpretation: 'Classic Enemies to Lovers', isPrimary: true,
                reversePenaltyTriggers: {}, relationshipType: 'new_work',
                popularityTier: hardcodedDefaultPopularityTier
            }],
        money: 1000, stamina: 100, maxStamina: 100, writingSkill: 5,
        popularity: defaultInitialPopularity,
        deokryeok: 50,
        currentWeek: 1, currentDay: 1, weeklySchedule: {}, dailyProjectSelections: {},
        fanficProjects: [], publishedFics: [], snsPosts: [],
        nextPostId: 1, nextCommentId: 1, nextProjectId: 1, nextFandomSetId: 2,
        npcs: [
            { name: "SupportiveSenpai_1004", type: "Fan", relationship: 75, fandomFocus: "Any", isMotivationalFriend: true },
            { name: "LoyalFan_01", type: "Fan", relationship: 50, fandomFocus: "Default Fandom Work" },
            { name: "RivalWriter_X", type: "Rival", relationship: 10, fandomFocus: "Default Fandom Work" },
            { name: "ProCritic_99", type: "Rival", relationship: 5 },
            { name: "AntiFandom_Voice", type: "Anti", relationship: -20 },
            { name: "JustHater_77", type: "Anti", relationship: -30 },
            { name: "BigNameSensei", type: "BigNameCreator", fandomFocus: "Default Fandom Work" },
            { name: "TrendingArtist_Y", type: "BigNameCreator", fandomFocus: "Another Popular Work" },
            { name: "SourceMaterialPublisher_Bot", type: "PublisherBot", relationship: 0 }
        ],
        currentEvent: null, registeredEventId: null,
        gameInitialized: false, storyModeEnabled: true, prologueShown: false, controversyScore: 0,
        availableGenres: ALL_GENRES,
        unlockedGenres: ["Fluff", "Angst", "Humor", "Slice of Life", "AU (Alternate Universe)"],
        availableMaterials: ALL_MATERIALS,
        unlockedMaterials: ["Enemies to Lovers", "Childhood Friends", "Slow Burn", "High School AU", "Coffee Shop AU", "Sequel to Previous Fic", "Canon-Compliant"],
        genreProficiency: {},
        lastLivingExpenseWeek: 0,
        tutorialFriendEnabled: true,
        dailyLogs: [], notificationLog: [],
        lastPlayerCustomSnsPostWeek: 0,
        playerMilestones: {
            firstFicPublished: false, writingSkillReached30: false, writingSkillReached50: false, writingSkillReached70: false,
            popularityReached50: false, popularityReached100: false, firstEventParticipation: false, publishedFicCount: 0
        },
        lowStaminaWritingStreak: 0,
    };
}
// --- Utility Functions ---
export function timeAgo(isoTimestamp) {
    if (!isoTimestamp)
        return 'some time ago';
    const date = new Date(isoTimestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1)
        return interval + (interval === 1 ? " year ago" : " years ago");
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1)
        return interval + (interval === 1 ? " month ago" : " months ago");
    interval = Math.floor(seconds / 86400);
    if (interval >= 1)
        return interval + (interval === 1 ? " day ago" : " days ago");
    interval = Math.floor(seconds / 3600);
    if (interval >= 1)
        return interval + (interval === 1 ? " hour ago" : " hours ago");
    interval = Math.floor(seconds / 60);
    if (interval >= 1)
        return interval + (interval === 1 ? " minute ago" : " minutes ago");
    return Math.max(0, Math.floor(seconds)) + " seconds ago";
}
export function escapeHTML(str) {
    if (typeof str === 'undefined' || str === null)
        return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
export function eventTypeBonus(type) {
    if (type === "MajorConvention")
        return 0.2;
    if (type === "LocalFanMeet")
        return 0.1;
    return 0.05;
}
