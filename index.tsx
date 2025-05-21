
// index.tsx
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// --- Type Definitions ---
interface ScheduleAction {
    id: string;
    label: string;
    staminaCost: number;
    staminaGain?: number;
    moneyGain?: number;
    popularityGain?: number; // Usually 0, handled by events
    deokryeokGain?: number;
    writingSkillGain?: number;
    maxStaminaGain?: number;
    timeCost: number;
    possibleDescriptions: string[]; // MODIFIED: Now an array of possible descriptions
    image: string;
}

interface FandomSet {
    id: string;
    workTitle: string;
    workDescription: string;
    favCharacter: string;
    favCharacterDescription: string;
    favPairing: string;
    pairingInterpretation: string;
    isPrimary: boolean;
    reversePenaltyTriggers?: { [originalPairingString: string]: boolean };
    baseFandomSetId?: string; 
    relationshipType?: 'new_work' | 'existing_work_new_chars_pairing' | 'existing_work_alt_interp';
}

interface NPC {
    name: string;
    type: "Fan" | "Rival" | "Anti" | "BigNameCreator";
    relationship?: number;
    fandomFocus?: string; 
}

interface PublishedFic {
    id: string;
    fandomSetId: string;
    title: string;
    content: string;
    genres: string[];
    materials: string[];
    scenarioPlan: string;
    timestamp: string; 
    author: string;
    isPaid: boolean;
    targetProgress: number;
    readerRating?: number;
    memo?: string;
    previousFicIdForSequel?: string;
}

interface HNComment {
    id: string;
    postId: string;
    type: "comment" | "reply";
    parentCommentId?: string;
    author: string;
    text: string;
    timestamp: string;
    replies: HNComment[];
}

interface HNPost {
    id: string;
    type: "post" | "player_custom_post"; 
    author: string;
    title: string;
    content: string;
    timestamp: string;
    likes: number;
    retweets: number;
    comments: HNComment[];
    commentCount: number;
    isPaid: boolean;
}

interface ActiveFanficProject {
    id: string;
    fandomSetId: string;
    title: string;
    genres: string[];
    materials: string[];
    scenarioPlan: string;
    progress: number;
    targetProgress: number;
    generatedContent: string | null;
    previousFicIdForSequel?: string;
}

interface GameEvent {
    id: string;
    fandomSetId: string;
    fandomWorkTitle: string;
    name: string;
    description: string;
    announcementWeek: number;
    registrationDeadlineWeek: number;
    eventWeek: number;
    registrationCost: number;
    type: "OnlineContest" | "LocalFanMeet" | "MajorConvention";
    submittedFicId: string | null;
    isNewSubmission: boolean | null;
}

interface LogEntry {
    week: number;
    day: number;
    message: string;
    type: 'action' | 'event' | 'system' | 'sns' | 'fic_published' | 'milestone' | 'burnout' | 'skill_change';
}

interface GameState {
    apiKey: string;
    playerName: string;
    fandomSets: FandomSet[];
    money: number;
    stamina: number;
    maxStamina: number;
    writingSkill: number;
    popularity: number;
    deokryeok: number;
    currentWeek: number;
    currentDay: number;
    weeklySchedule: { [key: number]: string };
    publishedFics: PublishedFic[];
    snsPosts: HNPost[];
    nextPostId: number;
    nextCommentId: number;
    nextProjectId: number;
    nextFandomSetId: number;
    npcs: NPC[];
    currentEvent: GameEvent | null;
    registeredEventId: string | null;
    gameInitialized: boolean;
    controversyScore: number;
    activeFanficProject: ActiveFanficProject | null;
    availableGenres: string[];
    unlockedGenres: string[];
    availableMaterials: string[];
    unlockedMaterials: string[];
    genreProficiency: { [genreName: string]: number };
    lastLivingExpenseWeek: number;
    tutorialFriendEnabled: boolean; 
    dailyLogs: LogEntry[]; 
    lastPlayerSnsPostWeek: number; 
    playerMilestones: { 
        firstFicPublished: boolean;
        writingSkillReached30: boolean;
        writingSkillReached50: boolean;
        popularityReached50: boolean;
    };
    lowStaminaWritingStreak: number; // NEW: For Burnout System
}

interface UIElements {
    [key: string]: HTMLElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement | HTMLImageElement | null;
}

// --- Constants ---
const SAVE_KEY = 'fandomForgeSaveData_v8'; // Incremented version for new features
const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';
const EVENT_REGISTRATION_WINDOW_WEEKS = 2;
const EVENT_REGISTRATION_FEE_BASE = 100;
const EVENT_PRINTING_COST_NEW = 100;
const EVENT_PRINTING_COST_RERELEASE = 50;
const LIVING_EXPENSE_AMOUNT = 200;
const LIVING_EXPENSE_INTERVAL_WEEKS = 4;
const PLAYER_SNS_POST_COOLDOWN_WEEKS = 4; 
const LOW_STAMINA_WRITING_THRESHOLD = 30; // Stamina below this (before cost) is risky for writing
const BURNOUT_STREAK_THRESHOLD = 3; // Number of consecutive low stamina writes for burnout risk
const BURNOUT_CHANCE = 0.25; // 25% chance of burnout if threshold met
const SOURCE_STAMINA_HEAL_CHANCE = 0.30; // 30% chance to heal stamina from "Source"
const SOURCE_STAMINA_HEAL_AMOUNT = 10;
const SOURCE_SKILL_DROP_CHANCE = 0.10; // 10% chance of skill drop from "Source"
const SOURCE_SKILL_DROP_AMOUNT = 0.5;


const ALL_GENRES = ["Fluff", "Angst", "Humor", "Action", "Slice of Life", "Hurt/Comfort", "RomCom (로맨틱코미디)", "Horror (공포)", "Mystery (미스터리/추리)", "Omegaverse", "Dark Fantasy", "Sci-Fi", "Thriller", "Experimental Fiction", "Canon Divergence", "Parody", "PWP (Plot What Plot)", "Crackfic"];
const ALL_MATERIALS = ["Enemies to Lovers", "Childhood Friends", "Secret Identity", "Fake Dating", "Slow Burn", "Time Travel", "Office Romance", "Found Family", "Apocalypse AU", "Magic School AU", "Royalty AU", "College AU", "Coffee Shop AU", "Soulmates AU", "Modern AU (for fantasy settings)", "Historical AU", "High School AU", "Canon-Compliant", "Post-Canon", "Pre-Canon", "Fix-it Fic", "Character Study", "Mutual Pining", "Forced Proximity", "Road Trip", "Animal Transformation (동물이 되다!)", "First Date (첫 데이트)", "Elderly Couple (노부부)", "Childhood Confession", "Amnesia", "Body Swap", "University Pranks", "Survival Game", "Cyberpunk Setting", "Historical Epic", "Holiday Special", "Cooking/Food Focus", "Sequel to Previous Fic", "Songfic (노래 가사 기반)", "Dream Sequence (꿈 장면)"];


// --- Game Styles (CSS) ---
const gameStyles = `
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; background-color: #f0f2f5; color: #333; display: flex; justify-content: center; align-items: flex-start; padding-top: 20px; min-height: 100vh;}
    #app-container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 90%; max-width: 1000px; }
    h1, h2, h3, h4 { color: #5a3a7e; margin-top:0; }
    .input-group { margin-bottom: 18px; }
    .input-group label { display: block; margin-bottom: 6px; font-weight: 600; color: #444; }
    .input-group input[type="text"], .input-group input[type="password"], .input-group textarea, .input-group select { width: calc(100% - 18px); padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-size: 1em; }
    .input-group input[readonly], .input-group textarea[readonly] { background-color: #e9ecef; opacity: 0.7; cursor: not-allowed; }
    .input-group textarea { min-height: 60px; resize: vertical; }
    .input-group select[multiple] { min-height: 100px; }
    .checkbox-group label { display: inline-block; margin-right: 15px; font-weight:normal; }
    .checkbox-group input[type="checkbox"] { margin-right: 5px; }
    .input-group small { font-size: 0.85em; color: #666; display: block; margin-top: 4px; }
    button { background-color: #7e57c2; color: white; padding: 10px 18px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; transition: background-color 0.2s ease; margin-top: 10px; margin-right: 8px; }
    button:hover { background-color: #673ab7; }
    button:disabled { background-color: #ccc; cursor: not-allowed; }
    button.danger-button { background-color: #e53935; }
    button.danger-button:hover { background-color: #c62828; }
    button.small-button { padding: 5px 10px; font-size: 0.85em; margin-left: 5px;}
    #stats-bar { background-color: #e8eaf6; padding: 12px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #c5cae9; font-size: 0.9em; display: flex; flex-wrap: wrap; gap: 15px; }
    #event-bar { background-color: #fff8e1; padding: 10px; margin-bottom: 15px; border: 1px solid #ffe57f; border-radius: 4px; font-size: 0.9em; color: #5d4037; }
    #game-controls { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
    #main-content { padding-top: 15px; }
    #scheduler { margin-bottom: 20px; padding: 15px; border: 1px dashed #b0bec5; border-radius: 5px; background-color: #fafafa; }
    #scheduler-active-project-warning { color: #c62828; font-weight: bold; margin-top: 8px; padding: 8px; background-color: #ffebee; border: 1px solid #c62828; border-radius: 4px;}
    #schedule-days { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 10px; }
    .day-schedule { border: 1px solid #e0e0e0; padding: 12px; border-radius: 4px; background-color: #f5f5f5; }
    .day-schedule label { font-weight: bold; display: block; margin-bottom: 6px; font-size: 0.95em; }
    .day-schedule select { width: 100%; }
    #action-buttons { margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; display: flex; flex-wrap: wrap; gap: 10px;}
    #daily-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0,0,0,0.75); color: white; padding: 25px; border-radius: 10px; text-align: center; z-index: 1000; border: 2px solid white; box-shadow: 0 0 15px rgba(0,0,0,0.5); min-width: 250px;}
    #daily-popup img { display: block; margin: 0 auto 12px auto; background-color: #fff; border: 1px solid #ccc; width: 80px; height: 80px; object-fit: cover; border-radius: 4px;}
    .modal-like-area { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); margin-top: 20px; border: 1px solid #ddd; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
    .modal-header h2, .modal-header h3 { margin: 0; font-size: 1.4em; }
    button.close-modal-button { background-color: #f44336; font-size: 0.8em; padding: 5px 10px; margin-top: 0; }
    button.close-modal-button:hover { background-color: #d32f2f; }
    #posts-container, #my-fics-list, #analytics-content, #upcoming-events-list, #fandom-sets-management-area, #daily-log-container { max-height: 450px; overflow-y: auto; border: 1px solid #eee; padding: 15px; background-color: #f9f9f9; border-radius: 4px; }
    #generated-fic-output { width: calc(100% - 18px); margin-top: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; background-color: #fdfdfd; min-height: 200px; font-family: 'Courier New', Courier, monospace; font-size: 0.95em; }
    pre { white-space: pre-wrap; background-color: #f9f9f9; padding: 10px; border: 1px solid #eee; border-radius: 4px; }
    .hn-post { border: 1px solid #d1d9e0; background-color: #ffffff; padding: 12px; margin-bottom: 15px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .hn-post-header { font-size: 0.9em; color: #555; margin-bottom: 5px; }
    .hn-post-header strong { color: #0d47a1; }
    .hn-post-title { font-size: 1.25em; font-weight: 600; margin-bottom: 8px; color: #333; }
    .hn-post-content { margin-bottom: 10px; white-space: pre-wrap; font-size: 0.95em; line-height: 1.5; }
    .hn-post-footer { font-size: 0.9em; color: #777; display: flex; align-items: center; gap: 15px; }
    .hn-comments-section { margin-top: 12px; padding-left: 15px; border-left: 3px solid #e0e0e0; }
    .hn-comment { margin-bottom: 12px; padding: 10px; background-color: #f7f9fc; border: 1px solid #e3e8ef; border-radius: 4px; }
    .hn-comment-header { font-size: 0.85em; color: #666; margin-bottom: 4px; }
    .hn-comment-header strong { color: #1565c0; }
    .hn-comment-body { font-size: 0.9em; margin-bottom: 6px; }
    .hn-comment-footer { font-size: 0.8em; color: #888; }
    .hn-comment-footer button { padding: 3px 6px; font-size: 0.85em; margin-left: 5px; background-color: #e0e0e0; color: #333; border: 1px solid #ccc; }
    .hn-comment-footer button:hover { background-color: #d5d5d5; }
    .hn-replies { margin-left: 20px; margin-top: 10px; border-left: 2px solid #e0e0e0; padding-left: 10px; }
    .my-fic-entry { border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 10px; }
    .my-fic-entry strong { font-size: 1.1em; display: block; margin-bottom: 5px;}
    .fic-meta { font-size: 0.85em; color: #666; display: block; margin-bottom: 3px; }
    .reader-rating { font-weight: bold; color: #ffc107; }
    .memo-area { width: 95%; font-size:0.9em; padding:5px; margin-top:5px; min-height:40px; border:1px dashed #ccc; border-radius:3px;}
    pre.fic-content-preview { white-space: pre-wrap; background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-top: 5px; max-height: 200px; overflow-y: auto; font-family: 'Courier New', Courier, monospace; }
    #analytics-content p { margin-bottom: 8px; } #analytics-content strong {color: #5a3a7e;}
    .event-entry { padding: 10px; border-bottom: 1px solid #ddd; } .event-entry:last-child { border-bottom: none; } .event-entry h4 { margin: 0 0 5px 0; }
    .fandom-set-entry { border: 1px solid #e0e0e0; padding: 10px; margin-bottom: 10px; border-radius: 4px; background-color: #f9f9f9; }
    .log-entry { padding: 5px; border-bottom: 1px solid #eee; font-size: 0.9em; }
    .log-entry:last-child { border-bottom: none; }
    .log-entry .log-timestamp { font-weight: bold; color: #5a3a7e; margin-right: 10px; }
    .log-entry .log-type-action { color: #1e88e5; } /* Blue */
    .log-entry .log-type-event { color: #d81b60; } /* Pink */
    .log-entry .log-type-system { color: #546e7a; } /* Blue Grey */
    .log-entry .log-type-sns { color: #00897b; } /* Teal */
    .log-entry .log-type-fic_published { color: #fb8c00; } /* Orange */
    .log-entry .log-type-milestone { color: #43a047; } /* Green */
    .log-entry .log-type-burnout { color: #bf360c; font-weight: bold; } /* Deep Orange - for burnout */
    .log-entry .log-type-skill_change { color: #f57c00; } /* Orange - for skill changes like stagnation */
`;

// --- Game State ---
let gameState: GameState;

// --- Available Actions (Schedule) ---
const actions: ScheduleAction[] = [
    { 
        id: 'Rest', label: '휴식 (Rest)', staminaCost: 0, staminaGain: 25, timeCost: 1, 
        possibleDescriptions: [
            "Taking a much-needed break. Ah, sweet relief.",
            "Deep slumber restores your energy. Feels good!",
            "Zoning out on the couch. Surprisingly effective.",
            "You stare at a wall for an hour. Is this rest? Apparently.",
            "Briefly considered being productive, then took a nap. Wise choice.",
            "A moment of peace in a chaotic creator life. Cherish it."
        ], 
        image: "placeholder_rest.png" 
    },
    { 
        id: 'Work', label: '아르바이트 (Part-time Job)', staminaCost: 30, moneyGain: 150, timeCost: 1, 
        possibleDescriptions: [
            "Earning some cash. The doujinshi won't fund themselves!",
            "오늘도 사장님의 부당한 잔소리를 BGM 삼아 알바비를 벌었다. (+150G)",
            "진상 손님은 없었지만, 내 허리도 없어졌다. 그래도 돈은 벌었으니... (+150G)",
            "최저시급이 인생의 유일한 낙...은 아니겠지? (+150G)",
            "아르바이트는 힘들지만... 통장에 찍히는 숫자를 보면 잠시 행복해진다. (+150G)",
            "Serving lattes and existential dread. At least it pays. (+150G)"
        ], 
        image: "placeholder_work.png" 
    },
    { 
        id: 'SNS', label: 'SNS 활동 (SNS Activity)', staminaCost: 10, timeCost: 1, 
        possibleDescriptions: [
            "Engaging with the online community. What's new today?",
            "Scrolling through the timeline. So many opinions, so little time.",
            "You got into a mild debate about canon. It was... invigorating?",
            "Found a new fan artist to follow! Inspiration +1.",
            "Doomscrolling again. Oops. At least you saw some memes."
        ], 
        image: "placeholder_sns.png" 
    },
    { 
        id: 'Inspiration', label: '영감 얻기 (Seek Inspiration)', staminaCost: 15, deokryeokGain: 3, writingSkillGain: 0.1, timeCost: 1, 
        possibleDescriptions: [
            "Searching for new creative ideas in the wild.",
            "Staring out the window, hoping a plot bunny hops by.",
            "Re-read an old favorite. Some sparks are flying!",
            "Listened to music and let your mind wander. Interesting thoughts...",
            "Took a walk and observed people. Everyone has a story."
        ], 
        image: "placeholder_inspiration.png" 
    },
    { 
        id: 'Exercise', label: '운동 (Exercise)', staminaCost: 25, maxStaminaGain: 0.5, staminaGain: 10, timeCost: 1, 
        possibleDescriptions: [
            "Keeping fit and healthy! Your back will thank you later.",
            "A quick jog to clear the mind and boost energy.",
            "Stretching out those writing-induced kinks. Oof.",
            "Attempted a new workout. Mostly just flailed.",
            "Felt the burn! Or maybe that's just muscle soreness tomorrow."
        ], 
        image: "placeholder_exercise.png" 
    },
    { 
        id: 'WriteFicProject', label: '팬픽 작업 (Work on Project)', staminaCost: 35, timeCost: 1, 
        possibleDescriptions: [ // These will often be overridden by specific project progress messages
            "Making progress on the current fanfic project!",
            "Words are flowing... or are they trickling? Either way, progress!",
            "Battling the blank page. You will prevail!",
            "Deep in the writing zone. Don't disturb.",
            "Another chapter closer to 'The End'."
        ], 
        image: "placeholder_write.png" 
    },
    { 
        id: 'Source', label: '원작 보기 (Consume Source)', staminaCost: 5, deokryeokGain: 10, timeCost: 1, 
        possibleDescriptions: [
            "Revisiting the source material. Ah, the good old days.",
            "Analyzing character motivations in the original work. Deeper understanding!",
            "Getting lost in the world that started it all.",
            "Remembering why you fell in love with this fandom.",
            "Wait, was that plot point always there? Mind blown."
        ], 
        image: "placeholder_source.png" 
    },
    { 
        id: 'Library', label: '도서관 가기 (Visit Library)', staminaCost: 20, deokryeokGain: 2, writingSkillGain: 0.3, timeCost: 1, 
        possibleDescriptions: [
            "Expanding knowledge and finding inspiration at the library.",
            "The quiet hum of the library is surprisingly conducive to thought.",
            "Discovered an old tome that sparked an unexpected idea.",
            "Surrounded by books, you feel a little smarter.",
            "Shhh! Geniuses at work (or just browsing)."
        ], 
        image: "placeholder_library.png" 
    },
];

function getDefaultGameState(): GameState {
    const initialFandomSetId = `fandomset-${1}`;
    return {
        apiKey: '', playerName: 'AnonAuthor',
        fandomSets: [{
            id: initialFandomSetId,
            workTitle: 'Default Fandom Work', workDescription: 'A very popular series.',
            favCharacter: 'Character A', favCharacterDescription: 'A stoic and skilled individual with a hidden soft spot.',
            favPairing: 'Character A/Character B',
            pairingInterpretation: 'Classic Enemies to Lovers', isPrimary: true,
            reversePenaltyTriggers: {}, relationshipType: 'new_work'
        }],
        money: 1000, stamina: 100, maxStamina: 100, writingSkill: 10, popularity: 5, deokryeok: 50,
        currentWeek: 1, currentDay: 1, weeklySchedule: {},
        publishedFics: [], snsPosts: [],
        nextPostId: 1, nextCommentId: 1, nextProjectId: 1, nextFandomSetId: 2,
        npcs: [
            { name: "LoyalFan_01", type: "Fan", relationship: 50, fandomFocus: "Default Fandom Work" },
            { name: "SupportiveDeokhuFriend", type: "Fan", relationship: 70, fandomFocus: "Any" }, 
            { name: "RivalWriter_X", type: "Rival", relationship: 10, fandomFocus: "Default Fandom Work" }, 
            { name: "ProCritic_99", type: "Rival", relationship: 5 },
            { name: "AntiFandom_Voice", type: "Anti", relationship: -20 }, 
            { name: "JustHater_77", type: "Anti", relationship: -30 },
            { name: "BigNameSensei", type: "BigNameCreator", fandomFocus: "Default Fandom Work" },
            { name: "TrendingArtist_Y", type: "BigNameCreator", fandomFocus: "Another Popular Work"}
        ],
        currentEvent: null, registeredEventId: null,
        gameInitialized: false, controversyScore: 0,
        activeFanficProject: null,
        availableGenres: ALL_GENRES,
        unlockedGenres: ["Fluff", "Angst", "Humor", "Slice of Life"],
        availableMaterials: ALL_MATERIALS,
        unlockedMaterials: ["Enemies to Lovers", "Childhood Friends", "Slow Burn", "High School AU", "Coffee Shop AU", "Sequel to Previous Fic"],
        genreProficiency: {},
        lastLivingExpenseWeek: 0,
        tutorialFriendEnabled: true, 
        dailyLogs: [],
        lastPlayerSnsPostWeek: 0,
        playerMilestones: { firstFicPublished: false, writingSkillReached30: false, writingSkillReached50: false, popularityReached50: false },
        lowStaminaWritingStreak: 0 // NEW
    };
}

let uiElements: UIElements = {};

function cacheUIElements() {
    const ids = [
        'setup-screen', 'main-game-screen', 'start-game-button', 'api-key', 'player-name', 'initial-tutorial-friend-toggle-setup',
        'fandom-work-title', 'fandom-work-desc', 'fandom-fav-char', 'fandom-fav-char-desc', 'fandom-fav-pairing', 'fandom-pairing-interp',
        'stat-money', 'stat-stamina', 'stat-writing', 'stat-popularity', 'stat-deokryeok',
        'stat-week', 'stat-day', 'schedule-days', 'start-week-button', 'scheduler-validation-msg', 'scheduler-active-project-warning',
        'daily-popup', 'daily-popup-image', 'daily-popup-text', 'daily-project-progress-text',
        'manage-fanfic-project-button', 'view-fics-button', 'view-sns-button', 'player-custom-sns-post-button',
        'sns-feed', 'posts-container',
        'fanfic-planning-modal', 'plan-fic-fandom-set', 'plan-fic-title', 'plan-fic-genre-checkboxes', 'plan-fic-materials', 'plan-fic-scenario', 'plan-fic-target-progress', 'start-new-project-button', 'plan-fic-sequel-group', 'plan-fic-previous-fic-for-sequel',
        'active-project-modal', 'modal-project-fandom-set-name', 'modal-project-title', 'modal-project-genre', 'modal-project-materials', 'modal-project-scenario', 'modal-project-progress', 'modal-project-target', 'modal-project-sequel-info', 'modal-project-previous-fic-title',
        'finalize-fic-button', 'fic-loading-indicator', 'generated-fic-output', 'fic-paid-checkbox', 'post-fic-button', 'clear-fic-button', 'submit-to-event-button',
        'view-fics-area', 'my-fics-list',
        'event-bar', 'event-name-display', 'event-fandom-display', 'event-deadline-display', 'view-upcoming-events-button',
        'upcoming-events-modal', 'upcoming-events-list', 'event-printing-options',
        'manual-save-button', 'new-game-button', 'edit-profile-button', 'analytics-button', 'view-daily-log-button', 'tutorial-friend-toggle-main',
        'analytics-area', 'analytics-content', 'profile-edit-area', 'profile-general-settings',
        'edit-player-name', 'edit-api-key', 'save-general-settings-button',
        'fandom-sets-management-area', 'add-new-fandom-set-button', 'edit-fandom-set-form', 'edit-fandom-set-form-title',
        'edit-fandom-set-id-input', 'edit-fandom-relationship-type', 'edit-fandom-base-work-group', 'edit-fandom-base-work-select',
        'edit-fandom-work-title-input', 'edit-fandom-work-desc-input', 'edit-fandom-fav-char-input', 'edit-fandom-fav-char-desc-input',
        'edit-fandom-fav-pairing-input', 'edit-fandom-pairing-interp-input', 'edit-fandom-is-primary-checkbox',
        'save-fandom-set-button', 'cancel-edit-fandom-set-button',
        'active-project-info-bar', 'active-project-title-display', 'active-project-fandom-display', 'active-project-progress-display', 'active-project-genre-display', 'active-project-materials-display',
        'view-active-project-button', 'notification-popup', 'notification-text',
        'player-sns-post-modal', 'player-sns-post-title', 'player-sns-post-content', 'player-sns-post-char-count', 'submit-player-sns-post-button', 'player-sns-post-cooldown-message',
        'daily-log-modal', 'daily-log-filter-controls', 'log-week-filter', 'daily-log-container'
    ];
    ids.forEach(id => {
        const element = document.getElementById(id);
        if (element) uiElements[id] = element;
        else console.warn(`UI Element with id '${id}' not found.`);
    });

    document.querySelectorAll('.close-modal-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetId = (event.currentTarget as HTMLElement).getAttribute('data-target');
            if (targetId && uiElements[targetId] && uiElements[targetId] instanceof HTMLElement) {
                (uiElements[targetId] as HTMLElement).style.display = 'none';
            }
        });
    });
}

// --- Game Logic: Save/Load, Init, Updates ---
function saveGameState() {
    try {
        const stateToSave = JSON.stringify(gameState);
        localStorage.setItem(SAVE_KEY, stateToSave);
        console.log("Game state saved.");
    } catch (error) {
        console.error("Error saving game state:", error);
        showNotification("Error: Failed to save game progress. LocalStorage might be full or disabled.", 5000);
    }
}
function loadGameState(): boolean {
    const savedState = localStorage.getItem(SAVE_KEY);
    if (savedState) {
        try {
            const loaded = JSON.parse(savedState) as Partial<GameState>;
            const defaultState = getDefaultGameState();
            gameState = { ...defaultState, ...loaded };
            // Ensure nested objects/arrays are properly initialized if missing from save
            gameState.fandomSets = loaded.fandomSets && loaded.fandomSets.length > 0 ? loaded.fandomSets : defaultState.fandomSets;
            gameState.npcs = loaded.npcs && loaded.npcs.length > 0 ? loaded.npcs : defaultState.npcs;
            gameState.unlockedGenres = loaded.unlockedGenres || defaultState.unlockedGenres;
            gameState.availableGenres = defaultState.availableGenres; 
            gameState.unlockedMaterials = loaded.unlockedMaterials || defaultState.unlockedMaterials;
            gameState.availableMaterials = defaultState.availableMaterials; 
            gameState.weeklySchedule = loaded.weeklySchedule || {};
            gameState.genreProficiency = loaded.genreProficiency || {};
            gameState.publishedFics = loaded.publishedFics?.map(fic => ({...fic, genres: Array.isArray(fic.genres) ? fic.genres : [fic.genres].filter(Boolean) as string[]})) || [];
            gameState.snsPosts = loaded.snsPosts || [];
            gameState.dailyLogs = loaded.dailyLogs || [];
            gameState.tutorialFriendEnabled = typeof loaded.tutorialFriendEnabled === 'boolean' ? loaded.tutorialFriendEnabled : defaultState.tutorialFriendEnabled;
            gameState.lastPlayerSnsPostWeek = loaded.lastPlayerSnsPostWeek || 0;
            gameState.playerMilestones = loaded.playerMilestones || defaultState.playerMilestones;
            gameState.lowStaminaWritingStreak = loaded.lowStaminaWritingStreak || 0;

            console.log("Game state loaded.");
            return true;
        } catch (error) {
            console.error("Error loading game state:", error);
            localStorage.removeItem(SAVE_KEY); 
            return false;
        }
    }
    return false;
}
function resetGame() {
    if (confirm("Are you sure you want to reset all progress and start a new game? This cannot be undone.")) {
        localStorage.removeItem(SAVE_KEY);
        gameState = getDefaultGameState();
        // Reset setup screen fields
        (uiElements['api-key'] as HTMLInputElement).value = '';
        (uiElements['player-name'] as HTMLInputElement).value = '';
        (uiElements['fandom-work-title'] as HTMLInputElement).value = '';
        (uiElements['fandom-work-desc'] as HTMLTextAreaElement).value = '';
        (uiElements['fandom-fav-char'] as HTMLInputElement).value = '';
        (uiElements['fandom-fav-char-desc'] as HTMLTextAreaElement).value = '';
        (uiElements['fandom-fav-pairing'] as HTMLInputElement).value = '';
        (uiElements['fandom-pairing-interp'] as HTMLTextAreaElement).value = '';
        (uiElements['initial-tutorial-friend-toggle-setup'] as HTMLInputElement).checked = true;

        if (uiElements['setup-screen']) (uiElements['setup-screen'] as HTMLElement).style.display = 'block';
        if (uiElements['main-game-screen']) (uiElements['main-game-screen'] as HTMLElement).style.display = 'none';
        updateActiveProjectInfoBar();
        addLogEntry("Game reset. Welcome to a new journey!", "system");
        console.log("Game reset.");
        updateAllDisplays(); 
    }
}
function initializeGame() {
    gameState = getDefaultGameState();
    if (loadGameState() && gameState.gameInitialized) {
        console.log("Resuming saved game.");
        if (uiElements['setup-screen']) (uiElements['setup-screen'] as HTMLElement).style.display = 'none';
        if (uiElements['main-game-screen']) (uiElements['main-game-screen'] as HTMLElement).style.display = 'block';
        if (gameState.dailyLogs.length === 0) { 
            addLogEntry("Game session started. Welcome back!", "system");
        }
    } else {
        console.log("No valid save or game not initialized. Starting setup.");
        if (uiElements['setup-screen']) (uiElements['setup-screen'] as HTMLElement).style.display = 'block';
        if (uiElements['main-game-screen']) (uiElements['main-game-screen'] as HTMLElement).style.display = 'none';
        gameState.gameInitialized = false; 
        addLogEntry("New game setup started.", "system");
    }
    (uiElements['tutorial-friend-toggle-main'] as HTMLInputElement).checked = gameState.tutorialFriendEnabled;
    updateAllDisplays();
    setupScheduler();
}

function addLogEntry(message: string, type: LogEntry['type']) {
    if (!message || message.trim() === "") return;
    const newEntry: LogEntry = {
        week: gameState.currentWeek,
        day: gameState.currentDay,
        message: message.trim(),
        type
    };
    gameState.dailyLogs.push(newEntry);
    if (gameState.dailyLogs.length > 200) { 
        gameState.dailyLogs.shift();
    }
    if ((uiElements['daily-log-modal'] as HTMLElement)?.style.display === 'block') {
        renderDailyEventLog(); 
    }
}

function updateAllDisplays() {
    updateStatsDisplay();
    updateEventDisplay();
    renderSNSFeed();
    renderMyFicsList();
    updateActiveProjectInfoBar();
    populateGenreCheckboxes();
    populateMaterialsSelect();
    populateFandomSetSelect((uiElements['plan-fic-fandom-set'] as HTMLSelectElement));
    updateSchedulerActiveProjectWarning();
    (uiElements['tutorial-friend-toggle-main'] as HTMLInputElement).checked = gameState.tutorialFriendEnabled;
}
function updateStatsDisplay() {
    if (uiElements['stat-money']) uiElements['stat-money'].textContent = String(gameState.money);
    if (uiElements['stat-stamina']) uiElements['stat-stamina'].textContent = `${Math.round(gameState.stamina)} / ${Math.round(gameState.maxStamina)}`;
    if (uiElements['stat-writing']) uiElements['stat-writing'].textContent = String(Math.round(gameState.writingSkill));
    if (uiElements['stat-popularity']) uiElements['stat-popularity'].textContent = String(gameState.popularity);
    if (uiElements['stat-deokryeok']) uiElements['stat-deokryeok'].textContent = String(Math.round(gameState.deokryeok));
    if (uiElements['stat-week']) uiElements['stat-week'].textContent = String(gameState.currentWeek);
    if (uiElements['stat-day']) uiElements['stat-day'].textContent = String(gameState.currentDay);
}
function updateEventDisplay() {
    const eventBar = uiElements['event-bar'] as HTMLElement;
    const eventNameDisplay = uiElements['event-name-display'] as HTMLElement;
    const eventFandomDisplay = uiElements['event-fandom-display'] as HTMLElement;
    const eventDeadlineDisplay = uiElements['event-deadline-display'] as HTMLElement;

    if (eventBar && eventNameDisplay && eventFandomDisplay && eventDeadlineDisplay) {
        if (gameState.currentEvent && gameState.currentEvent.eventWeek >= gameState.currentWeek) {
            eventNameDisplay.textContent = gameState.currentEvent.name;
            eventFandomDisplay.textContent = gameState.currentEvent.fandomWorkTitle;
            let deadlineText = `Event Week: ${gameState.currentEvent.eventWeek}`;
            if (gameState.currentWeek <= gameState.currentEvent.registrationDeadlineWeek && gameState.registeredEventId !== gameState.currentEvent.id) {
                deadlineText += ` (Reg. by Wk ${gameState.currentEvent.registrationDeadlineWeek})`;
            } else if (gameState.registeredEventId === gameState.currentEvent.id) {
                const submittedFic = gameState.currentEvent.submittedFicId ? gameState.publishedFics.find(f => f.id === gameState.currentEvent!.submittedFicId) : null;
                if (submittedFic) {
                     deadlineText += ` (Registered! "${escapeHTML(submittedFic.title.substring(0,15))}..." Submitted!)`;
                } else {
                     deadlineText += ` (Registered! Submit Fic by Wk ${gameState.currentEvent.eventWeek})`;
                }
            }
            eventDeadlineDisplay.textContent = deadlineText;
            eventBar.style.display = 'block';
        } else {
            eventBar.style.display = 'none';
        }
    }
}

function generateNewGameEvent(): GameEvent | null {
    if (Math.random() < 0.2 && gameState.fandomSets.length > 0) { 
        const targetFandomSet = gameState.fandomSets[Math.floor(Math.random() * gameState.fandomSets.length)];
        const eventTypes: GameEvent['type'][] = ["OnlineContest", "LocalFanMeet", "MajorConvention"];
        const eventNames = {
            "OnlineContest": ["SpeedWrite Challenge", "Themed Flash Fic Contest", "Pairing Popularity Poll"],
            "LocalFanMeet": ["Indie Doujin Market", "Local Fan Circle Meetup", "Fandom Cafe Day"],
            "MajorConvention": ["AniCon", "Comic Fiesta", "WonderFest"]
        };
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const name = `${targetFandomSet.workTitle} ${eventNames[type][Math.floor(Math.random() * eventNames[type].length)]}`;
        const announcementWeek = gameState.currentWeek;
        const registrationDeadlineWeek = announcementWeek + EVENT_REGISTRATION_WINDOW_WEEKS;
        const eventWeek = registrationDeadlineWeek + 3 + Math.floor(Math.random() * 3); 

        return {
            id: `event-${gameState.currentWeek}-${Math.random().toString(36).substring(2,7)}`,
            fandomSetId: targetFandomSet.id,
            fandomWorkTitle: targetFandomSet.workTitle,
            name: name,
            description: `A ${type} event focused on ${targetFandomSet.workTitle}. Showcase your work!`,
            announcementWeek,
            registrationDeadlineWeek,
            eventWeek,
            registrationCost: EVENT_REGISTRATION_FEE_BASE + (type === "MajorConvention" ? 150 : (type === "LocalFanMeet" ? 50 : 0)),
            type,
            submittedFicId: null,
            isNewSubmission: null
        };
    }
    return null;
}
function checkAndSetNewEvent() {
    if (!gameState.currentEvent || gameState.currentEvent.eventWeek < gameState.currentWeek) { 
        const newEvent = generateNewGameEvent();
        if (newEvent) {
            gameState.currentEvent = newEvent;
            gameState.registeredEventId = null; 
            const eventMessage = `New Event for "${newEvent.fandomWorkTitle}": ${newEvent.name} (Register by Week ${newEvent.registrationDeadlineWeek}, Event in Week ${newEvent.eventWeek})`;
            const eventPost = createHNPost(
                "EventBot", `${newEvent.name} Announced!`,
                `Get ready for ${newEvent.name} (focused on ${newEvent.fandomWorkTitle})! Registration opens now (Cost: ${newEvent.registrationCost}G) and closes at the end of Week ${newEvent.registrationDeadlineWeek}. Event takes place in Week ${newEvent.eventWeek}. Check 'View Events' to register!`,
                30 + Math.floor(Math.random() * 20), false
            );
            gameState.snsPosts.unshift(eventPost);
            showNotification(eventMessage);
            addLogEntry(eventMessage, "event");
        }
    }
    updateEventDisplay();
    renderUpcomingEventsList(); 
}
function renderUpcomingEventsList() {
    const listContainer = uiElements['upcoming-events-list'] as HTMLElement;
    const printingOptionsDiv = uiElements['event-printing-options'] as HTMLElement;
    if (!listContainer || !printingOptionsDiv) return;
    listContainer.innerHTML = '';

    const printingText = `
        <h4>Printing & Submission Details</h4>
        <p>Submitting a <strong>new</strong> fic to an event typically costs around ${EVENT_PRINTING_COST_NEW}G for basic printing/booth fees.</p>
        <p>Submitting a <strong>re-release</strong> (previously published fic) is cheaper, around ${EVENT_PRINTING_COST_RERELEASE}G.</p>
        <p>(Future features might include options for cover art, special editions, etc., affecting cost and sales!)</p>
    `;
    printingOptionsDiv.innerHTML = printingText;


    if (gameState.currentEvent && gameState.currentEvent.eventWeek >= gameState.currentWeek) {
        const event = gameState.currentEvent;
        const entry = document.createElement('div');
        entry.classList.add('event-entry');
        let registrationStatusHTML = '';
        if (gameState.registeredEventId === event.id) {
            registrationStatusHTML = '<span style="color: green;">(Registered!)</span>';
            printingOptionsDiv.style.display = 'block'; 
        } else if (gameState.currentWeek <= event.registrationDeadlineWeek) {
            registrationStatusHTML = `<button class="register-event-btn small-button" data-event-id="${event.id}">Register (${event.registrationCost}G)</button>`;
            printingOptionsDiv.style.display = 'none';
        } else {
            registrationStatusHTML = '<span style="color: red;">(Registration Closed)</span>';
            printingOptionsDiv.style.display = 'none';
        }
        entry.innerHTML = `
            <h4>${escapeHTML(event.name)} for ${escapeHTML(event.fandomWorkTitle)} ${registrationStatusHTML}</h4>
            <p>${escapeHTML(event.description)}</p>
            <p><strong>Type:</strong> ${event.type}</p>
            <p><strong>Registration Closes:</strong> Week ${event.registrationDeadlineWeek}</p>
            <p><strong>Event Date:</strong> Week ${event.eventWeek}</p>
        `;
        listContainer.appendChild(entry);
        const regButton = entry.querySelector('.register-event-btn') as HTMLButtonElement;
        if (regButton) {
            regButton.addEventListener('click', () => handleRegisterForEvent(event.id));
        }
    } else {
        listContainer.innerHTML = '<p>No major events currently announced. Keep an eye on SNS!</p>';
        printingOptionsDiv.style.display = 'none';
    }
}
function handleRegisterForEvent(eventId: string) {
    const eventToRegister = gameState.currentEvent;
    if (!eventToRegister || eventToRegister.id !== eventId) { alert("Event not found or no longer active."); return; }
    if (gameState.registeredEventId === eventId) { alert("You are already registered for this event!"); return; }
    if (gameState.currentWeek > eventToRegister.registrationDeadlineWeek) { alert("Registration deadline has passed for this event."); return; }
    if (gameState.money < eventToRegister.registrationCost) { alert(`Not enough money to register! Need ${eventToRegister.registrationCost}G.`); return; }
    gameState.money -= eventToRegister.registrationCost;
    gameState.registeredEventId = eventId;
    const message = `Successfully registered for ${eventToRegister.name}! Prepare your fic!`;
    showNotification(message);
    addLogEntry(message, "event");
    updateAllDisplays();
    saveGameState();
}
function handleSubmitToEvent(ficId: string, isReRelease: boolean) {
    if (!gameState.currentEvent || gameState.registeredEventId !== gameState.currentEvent.id) {
        alert("You are not registered for the current active event, or no event is active."); return;
    }
    if (gameState.currentEvent.submittedFicId) {
        alert("You have already submitted a fic for this event."); return;
    }
     const ficToSubmit = gameState.publishedFics.find(f => f.id === ficId);
    if (!ficToSubmit) {
        alert("Fanfic not found."); return;
    }
    if (ficToSubmit.fandomSetId !== gameState.currentEvent.fandomSetId) {
        alert(`This fic is for "${findFandomSetById(ficToSubmit.fandomSetId)?.workTitle || 'a different fandom'}", but the event is for "${gameState.currentEvent.fandomWorkTitle}". You can only submit fics from the event's fandom.`);
        return;
    }
    const printingCost = isReRelease ? EVENT_PRINTING_COST_RERELEASE : EVENT_PRINTING_COST_NEW;
    if (gameState.money < printingCost) {
        alert(`Not enough money for printing costs! Need ${printingCost}G.`); return;
    }
    if (!confirm(`Submit "${escapeHTML(ficToSubmit.title)}" to ${escapeHTML(gameState.currentEvent.name)}? Printing cost: ${printingCost}G. This is final.`)) {
        return;
    }
    gameState.money -= printingCost;
    gameState.currentEvent.submittedFicId = ficId;
    gameState.currentEvent.isNewSubmission = !isReRelease;
    const message = `"${escapeHTML(ficToSubmit.title)}" submitted to ${escapeHTML(gameState.currentEvent.name)}! Good luck!`;
    showNotification(message);
    addLogEntry(message, "event");
    if (!isReRelease) gameState.popularity += 8; 
    else gameState.popularity += 2; 

    updateAllDisplays();
    saveGameState();
}

function setupScheduler() {
    const scheduleDaysContainer = uiElements['schedule-days'] as HTMLElement;
    if (!scheduleDaysContainer) return;
    scheduleDaysContainer.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day-schedule');
        const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i - 1];
        dayDiv.innerHTML = `<label for="day-${i}">${dayName}</label>
                            <select id="day-${i}" data-day="${i}" aria-label="Action for ${dayName}">
                                <option value="">-- Select --</option>
                                ${actions.map(action => `<option value="${action.id}">${action.label}</option>`).join('')}
                            </select>`;
        scheduleDaysContainer.appendChild(dayDiv);
        const selectElement = dayDiv.querySelector('select') as HTMLSelectElement;
        if (selectElement) {
            selectElement.value = gameState.weeklySchedule[i] || "";
            selectElement.addEventListener('change', (event) => {
                gameState.weeklySchedule[i] = (event.target as HTMLSelectElement).value;
                validateScheduler();
                updateSchedulerActiveProjectWarning();
            });
        }
    }
    validateScheduler();
    updateSchedulerActiveProjectWarning();
}

function updateSchedulerActiveProjectWarning() {
    const warningDiv = uiElements['scheduler-active-project-warning'] as HTMLElement;
    if (!warningDiv) return;

    const isWriteFicScheduled = Object.values(gameState.weeklySchedule).includes('WriteFicProject');
    if (isWriteFicScheduled && !gameState.activeFanficProject) {
        warningDiv.textContent = "WARNING: 'Write Fanfic Project' is scheduled, but NO project is active. Days scheduled for writing will have minimal effect. Plan a new project or change your schedule!";
        warningDiv.style.display = 'block';
        warningDiv.style.color = '#c62828';
        warningDiv.style.backgroundColor = '#ffebee';
        warningDiv.style.borderColor = '#c62828';
    } else if (isWriteFicScheduled && gameState.activeFanficProject) {
        const project = gameState.activeFanficProject;
        const progressPercent = Math.round((project.progress / project.targetProgress) * 100);
        warningDiv.textContent = `INFO: Scheduled to work on "${escapeHTML(project.title)}" (${progressPercent}% complete).`;
        warningDiv.style.display = 'block';
        warningDiv.style.color = '#155724'; 
        warningDiv.style.backgroundColor = '#d4edda';
        warningDiv.style.borderColor = '#c3e6cb';
    }
    else {
        warningDiv.style.display = 'none';
    }
}


function validateScheduler() {
    const startWeekButton = uiElements['start-week-button'] as HTMLButtonElement;
    const schedulerValidationMsg = uiElements['scheduler-validation-msg'] as HTMLElement;
    if (!startWeekButton || !schedulerValidationMsg) return;
    let allSelected = true;
    for (let i = 1; i <= 7; i++) {
        if (!gameState.weeklySchedule[i] || gameState.weeklySchedule[i] === "") {
            allSelected = false;
            break;
        }
    }
    startWeekButton.disabled = !allSelected;
    schedulerValidationMsg.style.display = allSelected ? 'none' : 'block';
}
function showArea(areaId: string | null) {
    ['sns-feed', 'fanfic-planning-modal', 'active-project-modal', 'view-fics-area', 'analytics-area', 'profile-edit-area', 'upcoming-events-modal', 'player-sns-post-modal', 'daily-log-modal'].forEach(id => {
        const element = uiElements[id] as HTMLElement;
        if (element) element.style.display = 'none';
    });
    if (areaId) {
        const elementToShow = uiElements[areaId] as HTMLElement;
        if (elementToShow) elementToShow.style.display = 'block';
    }
}
function showNotification(message: string, duration: number = 3500) {
    const popup = uiElements['notification-popup'] as HTMLElement;
    const textElement = uiElements['notification-text'] as HTMLElement;
    if (popup && textElement) {
        textElement.textContent = message;
        popup.style.display = 'block';
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes("error") || lowerMessage.includes("penalty") || lowerMessage.includes("decrease") || lowerMessage.includes("warning") || lowerMessage.includes("couldn't afford") || lowerMessage.includes("burnout") || lowerMessage.includes("drop")) {
            popup.style.backgroundColor = '#e53935'; // Red
        } else if (lowerMessage.includes("success") || lowerMessage.includes("unlocked") || lowerMessage.includes("gain") || lowerMessage.includes("bonus") || lowerMessage.includes("heal")) {
            popup.style.backgroundColor = '#4CAF50'; // Green
        } else {
            popup.style.backgroundColor = '#2196F3'; // Blue for neutral info
        }
        setTimeout(() => {
            popup.style.display = 'none';
        }, duration);
    }
}

async function processDayAction(day: number): Promise<void> {
    return new Promise(resolve => {
        gameState.currentDay = day;
        updateStatsDisplay();
        const selectedActionId = gameState.weeklySchedule[day];
        const action = actions.find(a => a.id === selectedActionId);
        const dailyPopup = uiElements['daily-popup'] as HTMLElement;
        const dailyPopupImage = uiElements['daily-popup-image'] as HTMLImageElement;
        const dailyPopupText = uiElements['daily-popup-text'] as HTMLElement;
        const dailyProjectProgressText = uiElements['daily-project-progress-text'] as HTMLElement;
        if(dailyProjectProgressText) dailyProjectProgressText.textContent = '';
        let effectiveStaminaCost = action ? action.staminaCost : 0;
        // Select a random description for the popup
        let actionDescriptionForPopup = action ? action.possibleDescriptions[Math.floor(Math.random() * action.possibleDescriptions.length)] : "Day skipped...";
        let logMessage = `Day ${day} (${action?.label || 'Skipped'}): `;

        if (action) {
            if (gameState.stamina < effectiveStaminaCost && action.id !== 'Rest') {
                actionDescriptionForPopup = `Not enough stamina for ${action.label}! You ended up resting instead.`;
                logMessage += `Attempted ${action.label}, but too tired. Rested.`;
                gameState.stamina += Math.min(10, gameState.maxStamina - gameState.stamina); 
                effectiveStaminaCost = 0; 
                gameState.lowStaminaWritingStreak = 0; // Reset streak on forced rest
            } else if (action.id === 'WriteFicProject') {
                if (!gameState.activeFanficProject) {
                    actionDescriptionForPopup = "Attempted to work on a fic, but no project is active. Spent some time daydreaming... (Plan a project!)";
                    effectiveStaminaCost = 5;
                    logMessage += "Attempted to write, no active project. Stamina -5.";
                    gameState.lowStaminaWritingStreak = 0; // Reset streak
                } else if (gameState.activeFanficProject.progress >= gameState.activeFanficProject.targetProgress) {
                    actionDescriptionForPopup = `"${gameState.activeFanficProject.title}" manuscript is complete. Time to finalize or start a new project.`;
                    effectiveStaminaCost = 5;
                    logMessage += `Reviewed completed manuscript for "${gameState.activeFanficProject.title}". Stamina -5.`;
                    gameState.lowStaminaWritingStreak = 0; // Reset streak
                } else {
                    // Burnout Check (before deducting stamina for current action)
                    if (gameState.stamina < LOW_STAMINA_WRITING_THRESHOLD) {
                        gameState.lowStaminaWritingStreak++;
                    } else {
                        gameState.lowStaminaWritingStreak = 0;
                    }

                    if (gameState.lowStaminaWritingStreak >= BURNOUT_STREAK_THRESHOLD && Math.random() < BURNOUT_CHANCE) {
                        const deokPenalty = Math.max(5, Math.floor(gameState.deokryeok * 0.2));
                        const skillPenalty = Math.max(3, Math.floor(gameState.writingSkill * 0.15));
                        gameState.deokryeok = Math.max(0, gameState.deokryeok - deokPenalty);
                        gameState.writingSkill = Math.max(0, gameState.writingSkill - skillPenalty);
                        gameState.stamina = Math.max(0, gameState.stamina - 15); // Extra stamina hit from burnout
                        actionDescriptionForPopup = `결국 번아웃이 와버렸습니다... 모든 것에 대한 열의가 식어버린 것 같아요. (덕력 -${deokPenalty}, 글쓰기 스킬 -${skillPenalty}, 스태미나 추가 감소)`;
                        logMessage += `Burnout! Deokryeok -${deokPenalty}, Writing Skill -${skillPenalty}. Stamina -${effectiveStaminaCost + 15}.`;
                        addLogEntry(actionDescriptionForPopup, "burnout");
                        showNotification(actionDescriptionForPopup, 6000);
                        gameState.lowStaminaWritingStreak = 0; // Reset streak after burnout
                    } else {
                        // Normal writing progress
                        let progressRoll = Math.random(); 
                        let progressMade = 0;
                        let dayQuality = "an okay day";
                        const skillFactor = gameState.writingSkill / 100; 

                        if (progressRoll < 0.15 - (skillFactor * 0.10) ) { 
                            progressMade = 5 + Math.floor(gameState.writingSkill / 20);
                            dayQuality = "a tough writing day";
                        } else if (progressRoll > 0.85 + (skillFactor * 0.10) ) { 
                            progressMade = 20 + Math.floor(gameState.writingSkill / 5);
                            dayQuality = "a fantastic writing day";
                        } else {
                            progressMade = 10 + Math.floor(gameState.writingSkill / 10);
                        }
                        progressMade = Math.max(3, progressMade); 
                        gameState.activeFanficProject.progress += progressMade;
                        gameState.activeFanficProject.progress = Math.min(gameState.activeFanficProject.progress, gameState.activeFanficProject.targetProgress);

                        const skillGainFromWriting = 0.2 + (gameState.genreProficiency[gameState.activeFanficProject.genres.join('/')] || 0) * 0.05 + (progressMade / 50);
                        gameState.writingSkill = Math.min(100, gameState.writingSkill + skillGainFromWriting);

                        const progressPercent = Math.round((gameState.activeFanficProject.progress / gameState.activeFanficProject.targetProgress) * 100);
                        if (dailyProjectProgressText) dailyProjectProgressText.textContent = `Project: ${gameState.activeFanficProject.title.substring(0,15)}... Progress: +${progressMade} (Total: ${progressPercent}%) - It was ${dayQuality}!`;
                        actionDescriptionForPopup = `Working hard on "${gameState.activeFanficProject.title}"! It was ${dayQuality}.`; // More specific popup
                        logMessage += `Wrote for "${gameState.activeFanficProject.title}". Progress +${progressMade} (Total: ${progressPercent}%). Writing skill +${skillGainFromWriting.toFixed(2)}. Stamina -${effectiveStaminaCost}.`;

                        if (gameState.activeFanficProject.progress >= gameState.activeFanficProject.targetProgress && !gameState.activeFanficProject.generatedContent) {
                            showNotification(`Manuscript for "${gameState.activeFanficProject.title}" is complete! Finalize it with AI.`);
                            addLogEntry(`Manuscript for "${gameState.activeFanficProject.title}" complete. Ready to finalize.`, "milestone");
                        }
                        updateActiveProjectInfoBar();
                    }
                }
            } else { // Other actions
                 // Reset low stamina writing streak if not writing
                gameState.lowStaminaWritingStreak = 0;
                let statChangesLog = "";
                if (action.staminaGain) { gameState.stamina += action.staminaGain; statChangesLog += `Stamina +${action.staminaGain}. `; }
                if (action.moneyGain) { gameState.money += action.moneyGain; statChangesLog += `Money +${action.moneyGain}G. `; }
                if (action.deokryeokGain) { gameState.deokryeok += action.deokryeokGain; statChangesLog += `Deokryeok +${action.deokryeokGain}. `; }
                if (action.maxStaminaGain) { gameState.maxStamina = Math.min(200, gameState.maxStamina + action.maxStaminaGain); statChangesLog += `Max Stamina +${action.maxStaminaGain}. `; }
                if (action.writingSkillGain) { gameState.writingSkill = Math.min(100, gameState.writingSkill + (action.writingSkillGain || 0)); statChangesLog += `Writing Skill +${action.writingSkillGain}. `; }

                if (action.id === 'SNS') {
                    handleSnsActivityEvents(logMessage); 
                    logMessage = ""; 
                } else if (action.id === 'Inspiration' || action.id === 'Library') {
                    const inspirationLog = handleInspirationUnlocks(action.id);
                    logMessage += inspirationLog;
                } else if (action.id === 'Source') {
                    let sourceEventLog = "";
                    // Chance to heal stamina
                    if (Math.random() < SOURCE_STAMINA_HEAL_CHANCE) {
                        const healedStamina = Math.min(SOURCE_STAMINA_HEAL_AMOUNT, gameState.maxStamina - gameState.stamina);
                        gameState.stamina += healedStamina;
                        sourceEventLog += ` 원작의 재미에 푹 빠져 치유받았습니다! (스태미나 +${healedStamina}) `;
                        showNotification(`Revisiting the source material was surprisingly refreshing! Stamina +${healedStamina}`, 3000);
                    }
                    // Chance for writing skill drop
                    if (Math.random() < SOURCE_SKILL_DROP_CHANCE) {
                        const skillDrop = Math.min(gameState.writingSkill, SOURCE_SKILL_DROP_AMOUNT); // Don't go below 0
                        gameState.writingSkill = Math.max(0, gameState.writingSkill - skillDrop);
                        const skillDropMsg = `원작만 너무 많이 봤더니 창작 의욕이 떨어지는 것 같아요... (글쓰기 스킬 -${skillDrop.toFixed(1)})`;
                        actionDescriptionForPopup = skillDropMsg; // Override popup for this special event
                        sourceEventLog += ` ${skillDropMsg} `;
                        addLogEntry(skillDropMsg, "skill_change");
                        showNotification(skillDropMsg, 4000);
                    }
                    logMessage += sourceEventLog;
                }
                logMessage += `Stamina -${effectiveStaminaCost}. ${statChangesLog}`;
            }
            gameState.stamina -= effectiveStaminaCost;
            gameState.stamina = Math.max(0, Math.min(gameState.stamina, gameState.maxStamina));
            gameState.deokryeok = Math.max(0, gameState.deokryeok); 

            if (dailyPopupImage) { dailyPopupImage.src = `images/${action.image || 'placeholder_default.png'}`; dailyPopupImage.alt = action.label; }
            if (dailyPopupText) dailyPopupText.textContent = actionDescriptionForPopup;
            if (dailyPopup) dailyPopup.style.display = 'block';

            if (logMessage.trim() !== "" && !logMessage.startsWith(`Day ${day}`)) { 
                 addLogEntry(logMessage.replace(`Day ${day} (${action?.label || 'Skipped'}): `, ""), "action");
            } else if (logMessage.trim() !== "") {
                 addLogEntry(logMessage, "action");
            }


            setTimeout(() => { if (dailyPopup) dailyPopup.style.display = 'none'; resolve(); }, 900);
        } else { // No action selected
            gameState.lowStaminaWritingStreak = 0; // Reset streak if day is skipped
            if (dailyPopupImage) { dailyPopupImage.src = `images/placeholder_skip.png`; dailyPopupImage.alt = "Skipped"; }
            if (dailyPopupText) dailyPopupText.textContent = "Day skipped...";
            if (dailyPopup) dailyPopup.style.display = 'block';
            addLogEntry(`Day ${day}: Skipped.`, "action");
            setTimeout(() => { if (dailyPopup) dailyPopup.style.display = 'none'; resolve(); }, 600);
        }
    });
}
async function handleStartWeek() {
    const startWeekButton = uiElements['start-week-button'] as HTMLButtonElement;
    if (startWeekButton && startWeekButton.disabled) return;
    if (startWeekButton) { startWeekButton.disabled = true; startWeekButton.textContent = 'Week in Progress...'; }
    addLogEntry(`Starting Week ${gameState.currentWeek}.`, "system");
    for (let i = 1; i <= 7; i++) { await processDayAction(i); }
    gameState.currentWeek++;
    gameState.currentDay = 1;
    const decayAmount = 1 + Math.floor(gameState.currentWeek / 10); 
    gameState.deokryeok = Math.max(0, gameState.deokryeok - decayAmount);
    addLogEntry(`Deok-ryeok naturally decayed by ${decayAmount}. Current: ${Math.round(gameState.deokryeok)}.`, "system");
    
    if (gameState.currentWeek > gameState.lastLivingExpenseWeek && (gameState.currentWeek - gameState.lastLivingExpenseWeek) >= LIVING_EXPENSE_INTERVAL_WEEKS) {
        gameState.lastLivingExpenseWeek = gameState.currentWeek;
        if (gameState.money >= LIVING_EXPENSE_AMOUNT) {
            gameState.money -= LIVING_EXPENSE_AMOUNT;
            const msg = `Living expenses of ${LIVING_EXPENSE_AMOUNT}G paid.`;
            showNotification(msg); addLogEntry(msg, "system");
        } else {
            const msg = "Oh no! You couldn't afford living expenses... Your parents helped out, but they seem worried. 'Maybe it's time to focus on a real career, dear?' they said. This is stressful.";
            showNotification(msg, 6000); addLogEntry(msg + " Stamina -10, Deok-ryeok -10. Parents gave 50G.", "system");
            gameState.deokryeok = Math.max(0, gameState.deokryeok - 10);
            gameState.stamina = Math.max(0, gameState.stamina - 10);
            gameState.money = 50; 
        }
    }
    
    if (gameState.currentEvent && gameState.currentWeek > gameState.currentEvent.eventWeek) {
        let eventOutcomeMessage = `The event "${gameState.currentEvent.name}" has now concluded!`;
        if (gameState.currentEvent.submittedFicId) {
            const submittedFic = gameState.publishedFics.find(f => f.id === gameState.currentEvent!.submittedFicId);
            if (submittedFic) {
                const rating = submittedFic.readerRating || 3; 
                const popularityGain = (rating * 2) + (gameState.currentEvent.isNewSubmission ? 5 : 2) + (gameState.currentEvent.type === "MajorConvention" ? 5 : 0);
                gameState.popularity += popularityGain;
                const moneyEarned = Math.floor(popularityGain * rating * (Math.random() * 5 + 5) * (gameState.deokryeok / 50)); 
                gameState.money += moneyEarned;
                eventOutcomeMessage += ` Your fic "${submittedFic.title}" was received well! (+${popularityGain} Popularity, +${moneyEarned}G from sales).`;
            }
        } else if (gameState.registeredEventId === gameState.currentEvent.id) { 
            eventOutcomeMessage += ` You were registered but didn't submit a fic. A missed opportunity!`;
            gameState.popularity = Math.max(0, gameState.popularity - 2); 
        }
        alert(eventOutcomeMessage);
        addLogEntry(eventOutcomeMessage, "event");
        const resultPost = createHNPost("EventBot", `${gameState.currentEvent.name} Concluded!`, eventOutcomeMessage, 20 + Math.floor(Math.random()*20), false);
        gameState.snsPosts.unshift(resultPost);
        gameState.currentEvent = null;
        gameState.registeredEventId = null;
    }

    checkSupportiveFriendMilestones(); 
    checkAndSetNewEvent(); 
    updateAllDisplays();
    setupScheduler(); 
    if (startWeekButton) { startWeekButton.textContent = 'Start Week'; }
    addLogEntry(`Week ${gameState.currentWeek-1} ended.`, "system");
    saveGameState();
}

// --- Fanfic Project System ---
function updateActiveProjectInfoBar() {
    const bar = uiElements['active-project-info-bar'] as HTMLElement;
    if (!bar) return;
    if (gameState.activeFanficProject) {
        const project = gameState.activeFanficProject;
        const projectFandomSet = findFandomSetById(project.fandomSetId);
        (uiElements['active-project-title-display'] as HTMLElement).textContent = escapeHTML(project.title);
        (uiElements['active-project-fandom-display'] as HTMLElement).textContent = escapeHTML(projectFandomSet?.workTitle || 'Unknown Fandom');
        const progressPercent = project.targetProgress > 0 ? Math.round((project.progress / project.targetProgress) * 100) : 0;
        (uiElements['active-project-progress-display'] as HTMLElement).textContent = String(progressPercent);
        (uiElements['active-project-genre-display'] as HTMLElement).textContent = escapeHTML(project.genres.join(', '));
        (uiElements['active-project-materials-display'] as HTMLElement).textContent = escapeHTML(project.materials.join(', ').substring(0,30) + '...');
        bar.style.display = 'flex'; 
    } else {
        bar.style.display = 'none';
    }
}
function populateGenreCheckboxes() {
    const container = uiElements['plan-fic-genre-checkboxes'] as HTMLElement;
    if (!container) return;
    container.innerHTML = '';
    gameState.unlockedGenres.forEach(genre => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'fic-genre';
        checkbox.value = genre;
        checkbox.id = `genre-cb-${genre.replace(/\s/g, '-')}`;
        checkbox.setAttribute('aria-label', genre);
        checkbox.addEventListener('change', () => {
            const checkedGenres = Array.from(container.querySelectorAll<HTMLInputElement>('input[name="fic-genre"]:checked'));
            if (checkedGenres.length > 2) {
                showNotification("You can select up to 2 genres.", 2000);
                checkbox.checked = false;
            }
        });
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + genre));
        container.appendChild(label);
    });
}
function populateMaterialsSelect() {
    const materialsSelect = uiElements['plan-fic-materials'] as HTMLSelectElement;
    if (materialsSelect) {
        materialsSelect.innerHTML = '<option value="">-- None --</option>'; 
        gameState.unlockedMaterials.forEach(m => materialsSelect.add(new Option(m,m)));
        
        materialsSelect.addEventListener('change', () => {
            const selectedValues = Array.from(materialsSelect.selectedOptions).map(opt => opt.value);
            const sequelGroup = uiElements['plan-fic-sequel-group'] as HTMLElement;
            if (selectedValues.includes("Sequel to Previous Fic")) {
                populatePreviousFicsForSequelDropdown();
                if(sequelGroup) sequelGroup.style.display = 'block';
            } else {
                if(sequelGroup) sequelGroup.style.display = 'none';
            }
        });
    }
}
function populatePreviousFicsForSequelDropdown() {
    const dropdown = uiElements['plan-fic-previous-fic-for-sequel'] as HTMLSelectElement;
    const selectedFandomSetId = (uiElements['plan-fic-fandom-set'] as HTMLSelectElement)?.value;
    if (!dropdown || !selectedFandomSetId) return;

    dropdown.innerHTML = '<option value="">-- Select Previous Fic --</option>';
    const eligibleFics = gameState.publishedFics.filter(fic => fic.fandomSetId === selectedFandomSetId && fic.author === gameState.playerName);
    if (eligibleFics.length === 0) {
        dropdown.add(new Option("No published fics in this fandom set yet.", ""));
        dropdown.disabled = true;
    } else {
        eligibleFics.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).forEach(fic => { 
            dropdown.add(new Option(fic.title, fic.id));
        });
        dropdown.disabled = false;
    }
}
function populateFandomSetSelect(selectElement: HTMLSelectElement | null) {
    if (!selectElement) return;
    const currentValue = selectElement.value; 
    selectElement.innerHTML = '';
    if (gameState.fandomSets.length === 0) {
        selectElement.add(new Option("No Fandom Sets! Configure in Profile.", ""));
        selectElement.disabled = true;
        return;
    }
    selectElement.disabled = false;
    gameState.fandomSets.forEach(fs => {
        selectElement.add(new Option(`${fs.workTitle} (${fs.favPairing}) ${fs.isPrimary ? "[Primary]" : ""}`, fs.id));
    });
    if (currentValue && Array.from(selectElement.options).some(opt => opt.value === currentValue)) {
        selectElement.value = currentValue;
    } else if (gameState.fandomSets.length > 0) {
         const primaryFandomSet = gameState.fandomSets.find(fs => fs.isPrimary) || gameState.fandomSets[0];
         selectElement.value = primaryFandomSet.id;
    }
    
    const materialsSelect = uiElements['plan-fic-materials'] as HTMLSelectElement;
    if (materialsSelect && Array.from(materialsSelect.selectedOptions).some(opt => opt.value === "Sequel to Previous Fic")){
        populatePreviousFicsForSequelDropdown();
    }
}

function openFanficPlanningModal() {
    if (gameState.fandomSets.length === 0) {
        showNotification("You need to set up at least one Fandom Set in your profile before planning a fic!", 4000);
        openProfileEditModal();
        return;
    }
    populateGenreCheckboxes();
    populateMaterialsSelect();
    populateFandomSetSelect(uiElements['plan-fic-fandom-set'] as HTMLSelectElement);
    (uiElements['plan-fic-fandom-set'] as HTMLSelectElement).removeEventListener('change', populatePreviousFicsForSequelDropdown); 
    (uiElements['plan-fic-fandom-set'] as HTMLSelectElement).addEventListener('change', populatePreviousFicsForSequelDropdown);


    (uiElements['plan-fic-title'] as HTMLInputElement).value = '';
    (uiElements['plan-fic-scenario'] as HTMLTextAreaElement).value = '';
    (uiElements['plan-fic-target-progress'] as HTMLSelectElement).value = '100';
    if (uiElements['plan-fic-sequel-group']) (uiElements['plan-fic-sequel-group'] as HTMLElement).style.display = 'none'; 
    showArea('fanfic-planning-modal');
}
function handleStartNewProject() {
    const fandomSetId = (uiElements['plan-fic-fandom-set'] as HTMLSelectElement).value;
    const title = (uiElements['plan-fic-title'] as HTMLInputElement).value.trim();
    const selectedGenreCheckboxes = Array.from(document.querySelectorAll<HTMLInputElement>('#plan-fic-genre-checkboxes input[name="fic-genre"]:checked'));
    const genres = selectedGenreCheckboxes.map(cb => cb.value);
    const scenarioPlan = (uiElements['plan-fic-scenario'] as HTMLTextAreaElement).value.trim();
    let targetProgress = parseInt((uiElements['plan-fic-target-progress'] as HTMLSelectElement).value, 10);
    const selectedMaterialsElements = Array.from((uiElements['plan-fic-materials'] as HTMLSelectElement).selectedOptions);
    const materials = selectedMaterialsElements.map(opt => opt.value).filter(val => val !== ""); 

    let previousFicIdForSequel: string | undefined = undefined;
    const sequelDropdown = uiElements['plan-fic-previous-fic-for-sequel'] as HTMLSelectElement;
    if (materials.includes("Sequel to Previous Fic")) {
        if (sequelDropdown && sequelDropdown.value) {
            previousFicIdForSequel = sequelDropdown.value;
        } else {
            alert("If 'Sequel to Previous Fic' is selected, you must choose a previous fic to continue."); return;
        }
    }

    if (!fandomSetId) { alert("Please select a Fandom Set for this project."); return; }
    if (!title) { alert("Please enter a Title for your project."); return; }
    if (genres.length === 0) { alert("Please select at least one Genre."); return; }
    if (genres.length > 2) { alert("Please select no more than two Genres."); return; }
    if (!scenarioPlan) { alert("Please provide a Scenario Plan."); return; }

    let proficiencyWarning = "";
    genres.forEach(genre => {
        const currentProficiency = gameState.genreProficiency[genre] || 0;
        if (currentProficiency < 3) { 
            targetProgress = Math.round(targetProgress * 1.15); 
            proficiencyWarning += `The genre "${genre}" is relatively new to you. `;
        }
    });
    if (proficiencyWarning) {
        showNotification(`${proficiencyWarning}This project might require more effort (Target: ${targetProgress} WU).`, 5000);
    }
    gameState.activeFanficProject = {
        id: `project-${gameState.nextProjectId++}`, fandomSetId, title, genres, scenarioPlan, materials,
        progress: 0, targetProgress, generatedContent: null, previousFicIdForSequel
    };
    const projectMessage = `New Project Started: "${title}" for fandom "${findFandomSetById(fandomSetId)?.workTitle}". (Target: ${targetProgress} Work Units)`;
    showNotification(projectMessage);
    addLogEntry(projectMessage, "system");
    updateActiveProjectInfoBar();
    updateSchedulerActiveProjectWarning();
    showArea(null);
    saveGameState();
}
function openActiveProjectModal() {
    if (!gameState.activeFanficProject) {
        showNotification("No active project. Plan one first or check schedule!");
        if (uiElements['manage-fanfic-project-button'] && (uiElements['manage-fanfic-project-button'] as HTMLElement).style.display !== 'none') {
            openFanficPlanningModal();
        }
        return;
    }
    const project = gameState.activeFanficProject;
    const projectFandomSet = findFandomSetById(project.fandomSetId);
    (uiElements['modal-project-title'] as HTMLElement).textContent = escapeHTML(project.title);
    (uiElements['modal-project-fandom-set-name'] as HTMLElement).textContent = escapeHTML(projectFandomSet?.workTitle || "Unknown Fandom");
    (uiElements['modal-project-genre'] as HTMLElement).textContent = escapeHTML(project.genres.join(', '));
    (uiElements['modal-project-materials'] as HTMLElement).textContent = escapeHTML(project.materials.join(', '));
    (uiElements['modal-project-scenario'] as HTMLElement).textContent = escapeHTML(project.scenarioPlan);
    (uiElements['modal-project-progress'] as HTMLElement).textContent = String(project.progress);
    (uiElements['modal-project-target'] as HTMLElement).textContent = String(project.targetProgress);

    const sequelInfoDiv = uiElements['modal-project-sequel-info'] as HTMLElement;
    const prevFicTitleSpan = uiElements['modal-project-previous-fic-title'] as HTMLElement;
    if (project.previousFicIdForSequel && sequelInfoDiv && prevFicTitleSpan) {
        const prevFic = gameState.publishedFics.find(f => f.id === project.previousFicIdForSequel);
        prevFicTitleSpan.textContent = escapeHTML(prevFic?.title || "Unknown Previous Fic");
        sequelInfoDiv.style.display = 'block';
    } else if (sequelInfoDiv) {
        sequelInfoDiv.style.display = 'none';
    }


    const finalizeButton = uiElements['finalize-fic-button'] as HTMLButtonElement;
    const postButton = uiElements['post-fic-button'] as HTMLButtonElement;
    const submitToEventButton = uiElements['submit-to-event-button'] as HTMLButtonElement;
    const outputArea = uiElements['generated-fic-output'] as HTMLTextAreaElement;
    if (project.progress >= project.targetProgress && !project.generatedContent) {
        finalizeButton.disabled = false;
        outputArea.value = "Manuscript complete! Ready to finalize with AI.";
    } else {
        finalizeButton.disabled = true;
        outputArea.value = project.generatedContent || "Manuscript in progress...";
    }
    postButton.disabled = !project.generatedContent;
    finalizeButton.disabled = !(project.progress >= project.targetProgress && !project.generatedContent);

    if (gameState.currentEvent && gameState.registeredEventId === gameState.currentEvent.id && project.generatedContent && project.fandomSetId === gameState.currentEvent.fandomSetId && !gameState.currentEvent.submittedFicId) {
        submitToEventButton.disabled = false;
        submitToEventButton.textContent = `Submit "${project.title.substring(0,10)}..." to ${gameState.currentEvent.name.substring(0,10)}...`;
        submitToEventButton.title = `Submit this finalized fic to the current event: ${gameState.currentEvent.name}`;
    } else {
        submitToEventButton.disabled = true;
        submitToEventButton.textContent = 'Submit to Current Event';
         if(project.generatedContent && gameState.currentEvent && gameState.registeredEventId === gameState.currentEvent.id && project.fandomSetId !== gameState.currentEvent.fandomSetId){
            submitToEventButton.title = `This fic's fandom (${projectFandomSet?.workTitle}) doesn't match the event's fandom (${gameState.currentEvent.fandomWorkTitle}).`;
        } else if (project.generatedContent && gameState.currentEvent && gameState.currentEvent.submittedFicId) {
            submitToEventButton.title = `A fic has already been submitted to this event.`;
        } else if (!project.generatedContent) {
            submitToEventButton.title = `Finalize the fic manuscript first.`;
        } else if (!gameState.currentEvent || gameState.registeredEventId !== gameState.currentEvent.id) {
            submitToEventButton.title = `Not registered for an active event, or no event currently allows submissions.`;
        }
    }
    (uiElements['fic-loading-indicator'] as HTMLElement).style.display = 'none';
    showArea('active-project-modal');
}

// --- Gemini API Integration ---
async function callGeminiAPI_Actual(
    apiKey: string,
    ficPlan: { title: string; genres: string[]; scenarioPlan: string; materials: string[]; fandomSet: FandomSet; previousFicFullText?: string; isSequel: boolean; partNumber?: number; }
): Promise<{ success: boolean; text?: string; error?: string }> {
    if (!apiKey) return { success: false, error: "[Config Error] API Key is missing." };
    const ai = new GoogleGenAI({ apiKey });

    let skillDescription = "";
    const skill = Math.round(gameState.writingSkill);
    if (skill <= 25) skillDescription = "The author's writing skill is currently at a novice level (0-25/100). The story should reflect this by being amateurish, possibly with noticeable plot holes, inconsistent characterization, awkward dialogue, or overly simplistic prose. The narrative might feel disjointed or unconvincing. Aim for a 'garbage' to 'below average' quality output.";
    else if (skill <= 50) skillDescription = "The author's writing skill is at an intermediate level (26-50/100). The story should be average or decent. It should be generally coherent and readable, but may lack significant depth, originality, or polish. Some parts might be stronger than others, and standard tropes might be used without much unique flair. Aim for an 'average' quality output.";
    else if (skill <= 75) skillDescription = "The author's writing skill is at a proficient level (51-75/100). The story should be well-written and engaging. It should demonstrate good control of plot, character development, and thematic elements. The prose should be competent, enjoyable, and show some creative use of language or ideas. Aim for a 'good' to 'outstanding' quality output.";
    else skillDescription = "The author's writing skill is at an expert level (76-100/100). The story should be a masterpiece. It needs to be exceptionally well-crafted, emotionally resonant, and memorable. The writing should be polished, sophisticated, and demonstrate a strong, unique authorial voice. Aim for a 'clear masterpiece' quality output.";

    let systemInstructionText = `당신은 다양한 팬덤 문화와 2차 창작에 매우 능숙한 AI 스토리텔러입니다. 플레이어가 제공한 상세 설정을 바탕으로, 높은 품질의 완결된 팬픽션을 생성해야 합니다. 캐릭터의 감정, 관계, 그리고 선택한 장르 및 소재의 특징을 깊이 있게 탐구하여 독창적이고 매력적인 이야기를 만드세요. 선정적이거나 폭력적인 내용은 피하고, 한국어로 자연스럽게 작성해주세요. 제목은 생성하지 말고 본문만 작성합니다.

중요: 생성되는 팬픽의 전반적인 글쓰기 품질, 문체, 서사 구조의 완성도는 반드시 작가의 현재 글쓰기 스킬 레벨을 반영해야 합니다. 다음 설명을 참고하세요:
${skillDescription}
분량은 약 500-1000 단어 사이로, 이야기의 완결성을 갖추어야 합니다.
`;
    if(ficPlan.isSequel && ficPlan.partNumber) {
        systemInstructionText += ` 이 팬픽은 시리즈의 ${ficPlan.partNumber}번째 파트입니다. 이전 파트의 내용을 자연스럽게 이어가면서도, 이번 파트만의 독립적인 재미와 완결성을 갖도록 구성해주세요.`;
    }

    let userPromptCore = `
## 작가 및 주력 작품 설정:
- 작가명: "${gameState.playerName}"
- 현재 작가 능력치: 글쓰기 스킬 ${skill}/100, 인기도 ${gameState.popularity}, 팬심(Deok-ryeok) ${Math.round(gameState.deokryeok)}/100
- 이 팬픽의 대상 작품: "${ficPlan.fandomSet.workTitle}" (설명: ${ficPlan.fandomSet.workDescription || '특이사항 없음'})
- 이 팬픽의 최애 캐릭터: "${ficPlan.fandomSet.favCharacter}" (캐릭터 설명: ${ficPlan.fandomSet.favCharacterDescription || '상세 설명 없음'})
- 이 팬픽의 최애 커플링: "${ficPlan.fandomSet.favPairing}" (작가의 해석: ${ficPlan.fandomSet.pairingInterpretation})

## 창작 요청 상세:
이번에 작성할 팬픽의 계획은 다음과 같습니다.
- **제목 (참고용, 본문에 포함하지 말 것):** "${ficPlan.title}"
- **장르:** "${ficPlan.genres.join(', ')}" (해당 장르들에 대한 작가 숙련도 평균: ${ficPlan.genres.reduce((acc, g) => acc + (gameState.genreProficiency[g] || 0), 0) / (ficPlan.genres.length || 1) } / 10)
- **주요 소재/트로프:** ${ficPlan.materials.join(', ') || '특별히 지정된 소재 없음'}
- **전체 시나리오 플랜:**
  """
  ${ficPlan.scenarioPlan}
  """
`;
    if (ficPlan.isSequel && ficPlan.previousFicFullText && ficPlan.partNumber) {
        userPromptCore += `
## 이전 파트 내용 (참고하여 이어지는 이야기 작성):
이 팬픽은 시리즈의 ${ficPlan.partNumber}번째 이야기입니다. 이전 파트(${ficPlan.partNumber-1})의 내용은 다음과 같습니다:
"""
${ficPlan.previousFicFullText}
"""
`;
    }
userPromptCore += `
**지시사항:**
위의 모든 설정을 충실히 반영하여, 팬픽 본문을 완성도 높게 작성해주십시오.
캐릭터 "${ficPlan.fandomSet.favCharacter}" 와 커플링 "${ficPlan.fandomSet.favPairing}"의 관계성과 감정 변화를 중심으로, 독자들이 깊이 몰입할 수 있도록 생생하게 묘사해주세요.
${ficPlan.genres.join(', ')} 장르들의 특징을 잘 살려주시고, ${ficPlan.materials.join(', ')} 등의 소재가 있다면 자연스럽게 녹여내주세요.
반드시 한국어로 작성해주십시오. 다시 한번 강조하지만, 작가의 글쓰기 스킬 레벨(${skill}/100)에 따른 품질 차이를 명확히 보여주어야 합니다.
`;
    console.log("Sending to Gemini API (Fic Gen). System Instruction (first 100):", systemInstructionText.substring(0,100));
    console.log("User Prompt Core (first 200 chars):", userPromptCore.substring(0, 200) + "...");

    try {
        const genAIResponse = await ai.models.generateContent({ 
            model: GEMINI_MODEL_TEXT, contents: userPromptCore,
            config: { systemInstruction: systemInstructionText, temperature: 0.75, topK: 40, topP: 0.95, }
        });
        const generatedText = genAIResponse.text;
        if (typeof generatedText === 'string') {
            return { success: true, text: generatedText.trim() };
        } else {
            let errorMessage = "[API Error] No text content received.";
            if (genAIResponse.candidates && genAIResponse.candidates.length > 0) {
                const candidate = genAIResponse.candidates[0];
                
                if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'FINISH_REASON_UNSPECIFIED') {
                    errorMessage = `[API Safety Stop] Content generation stopped. Reason: ${candidate.finishReason}.`;
                    if (candidate.finishReason === 'MAX_TOKENS') errorMessage += " The story context or request might be too long.";
                    if (candidate.safetyRatings && candidate.safetyRatings.length > 0) errorMessage += ` Safety issues: ${candidate.safetyRatings.map(r => `${r.category} (${r.probability})`).join(', ')}`;
                } else if (!generatedText && candidate.finishReason === 'STOP') errorMessage = "[API Error] Generation finished but no text content was returned.";
            }
            console.error("Gemini API Error/Block (Fic Gen):", errorMessage, genAIResponse);
            return { success: false, error: errorMessage };
        }
    } catch (error: any) {
        console.error("Error calling Gemini API (Fic Gen):", error);
        let detail = error.message || String(error);
        if (error.message && error.message.includes("token")) detail += " (The story context or request might be too long for the AI.)";
        return { success: false, error: `[SDK/Network Error] ${detail}` };
    }
}
async function handleFinalizeFic() {
    if (!gameState.activeFanficProject || gameState.activeFanficProject.progress < gameState.activeFanficProject.targetProgress) { alert("Manuscript is not yet complete!"); return; }
    if (gameState.activeFanficProject.generatedContent) { alert("Fic already finalized!"); return; }
    if (!gameState.apiKey) { alert("API Key is not set. Please set it up in Profile."); return; }
    const projectFandomSet = findFandomSetById(gameState.activeFanficProject.fandomSetId);
    if (!projectFandomSet) { alert("Fandom set for this project not found. Please check profile settings."); return; }

    let previousFicFullText: string | undefined = undefined;
    let partNumber: number = 1;
    if (gameState.activeFanficProject.previousFicIdForSequel) {
        const prevFic = gameState.publishedFics.find(f => f.id === gameState.activeFanficProject!.previousFicIdForSequel);
        if (prevFic) {
            previousFicFullText = prevFic.content;
            const seriesTitlePrefix = prevFic.title.split(" Pt.")[0];
            partNumber = gameState.publishedFics.filter(f => f.title.startsWith(seriesTitlePrefix) && new Date(f.timestamp).getTime() <= new Date(prevFic.timestamp).getTime()).length + 1;
        } else { alert("Error: Could not find the previous fic selected for this sequel."); return; }
    }

    (uiElements['fic-loading-indicator'] as HTMLElement).style.display = 'inline';
    (uiElements['finalize-fic-button'] as HTMLButtonElement).disabled = true;
    (uiElements['post-fic-button'] as HTMLButtonElement).disabled = true;
    (uiElements['generated-fic-output'] as HTMLTextAreaElement).value = 'AI가 최종 원고를 작성 중입니다... Gemini API를 호출합니다...';
    const ficPlan = {
        title: gameState.activeFanficProject.title, genres: gameState.activeFanficProject.genres,
        scenarioPlan: gameState.activeFanficProject.scenarioPlan, materials: gameState.activeFanficProject.materials,
        fandomSet: projectFandomSet, previousFicFullText, isSequel: !!previousFicFullText, partNumber
    };
    const result = await callGeminiAPI_Actual(gameState.apiKey, ficPlan);
    (uiElements['fic-loading-indicator'] as HTMLElement).style.display = 'none';
    if (result.success && result.text) {
        gameState.activeFanficProject.generatedContent = result.text;
        (uiElements['generated-fic-output'] as HTMLTextAreaElement).value = result.text;
        (uiElements['post-fic-button'] as HTMLButtonElement).disabled = false;
        const finalizeMsg = `"${gameState.activeFanficProject.title}" finalized! Ready to post or submit to event.`;
        showNotification(finalizeMsg);
        addLogEntry(finalizeMsg, "system");
    } else {
        (uiElements['generated-fic-output'] as HTMLTextAreaElement).value = `팬픽 생성 오류: ${result.error}\n\nAPI 키, 프롬프트 안전 문제, 또는 Gemini API 서비스 상태를 확인하세요. 요청이 너무 길거나 복잡할 수도 있습니다.`;
        (uiElements['finalize-fic-button'] as HTMLButtonElement).disabled = false; 
        addLogEntry(`Error finalizing fic "${gameState.activeFanficProject.title}": ${result.error}`, "system");
    }
    openActiveProjectModal(); 
    saveGameState();
}

// --- SNS & Posting ---
function createHNPost(author: string, title: string, content: string, initialLikes: number, isPaid: boolean = false, type: HNPost['type'] = 'post'): HNPost {
    const postId = `post-${gameState.nextPostId++}`;
    return {
        id: postId, type, author, title, content,
        timestamp: new Date().toISOString(),
        likes: initialLikes || 0,
        retweets: Math.floor((initialLikes || 0) / (isPaid ? 5 : 3)),
        comments: [], commentCount: 0, isPaid
    };
}
function createHNComment(postId: string, author: string, text: string): HNComment {
    const commentId = `comment-${gameState.nextCommentId++}`;
    return { id: commentId, postId, type: 'comment', author, text, timestamp: new Date().toISOString(), replies: [] };
}
function generateInitialSNSPosts() {
    if (gameState.snsPosts.length > 0 && gameState.gameInitialized && !gameState.dailyLogs.some(log => log.message.includes("Initial SNS posts generated"))) return; 

    const primaryFandom = gameState.fandomSets.find(fs => fs.isPrimary) || gameState.fandomSets[0];
    if (!primaryFandom) return;

    const fanNPC = gameState.npcs.find(n => n.type === 'Fan' && n.name !== "SupportiveDeokhuFriend" && n.fandomFocus === primaryFandom.workTitle);
    const rivalNPC = gameState.npcs.find(n => n.type === 'Rival' && n.fandomFocus === primaryFandom.workTitle);
    const antiNPC = gameState.npcs.find(n => n.type === 'Anti');
    const bigNameNPC = gameState.npcs.find(n => n.type === 'BigNameCreator' && n.fandomFocus === primaryFandom.workTitle);
    const deokhuFriend = gameState.npcs.find(n => n.name === "SupportiveDeokhuFriend");

    gameState.snsPosts = [
        createHNPost("FandomNewsBot", "Welcome to the Feed!", "This is where you'll see posts from yourself and others in the community.", 5),
    ];

    if (deokhuFriend && gameState.tutorialFriendEnabled) {
        const welcomeTitle = `🎉 ${gameState.playerName} 작가님, 창작의 세계에 오신 것을 환영해요! 🎉`;
        const welcomeContent = `
안녕하세요, ${gameState.playerName} 작가님! 덕후친구예요! 💖
드디어 작가님의 빛나는 덕질 라이프가 시작되네요! ✨ 팬픽을 쓰고, 이벤트를 열고, 온라인에서 팬들과 소통하는 이 모든 여정, 정말 멋지지 않나요?
가끔은 체력이 바닥나기도 하고 (꾸준한 휴식 중요! 🛌), 악플에 마음이 아플 때도 있겠지만 (맴찢... 하지만 꿋꿋하게! 💪), 그 모든 걸 이겨내고 오직 '좋다'는 마음 하나로 작품을 만들어내는 건 정말 위대한 일이에요!
앞으로 작가님의 멋진 작품들, 기대하고 있을게요! 막히는 거 있으면 언제든 SNS 확인해보세요, 소소한 팁들이 올라올지도? 😉
#덕질은세상을구한다 #신입작가응원 #FandomForge화이팅
        `.trim();
        gameState.snsPosts.push(createHNPost(deokhuFriend.name, welcomeTitle, welcomeContent, 25));
        addLogEntry(`${deokhuFriend.name} posted a welcome message for ${gameState.playerName}.`, "sns");
    }

    if (fanNPC) {
        gameState.snsPosts.push(createHNPost(fanNPC.name, `So excited for more ${primaryFandom.workTitle}!`, `Just rewatched the latest episode! It was amazing! Can't wait for fan content for ${primaryFandom.favPairing}!`, 10));
    }
    if (rivalNPC) {
        gameState.snsPosts.push(createHNPost(rivalNPC.name, `Working on my own ${primaryFandom.favPairing} fic...`, `Trying a different take on the ${primaryFandom.pairingInterpretation} trope. It's going to be epic. My skill level (${Math.floor(Math.random()*30+50)}) is probably way higher than any newbie's.`, 8));
    }
    if (antiNPC) {
        gameState.snsPosts.push(createHNPost(antiNPC.name, `Is anyone else tired of ${primaryFandom.workTitle}?`, `The writing quality has really dropped off lately imo. And don't get me started on the shipping wars for ${primaryFandom.favPairing}. Some authors clearly don't get the characters.`, 2));
    }
    if (bigNameNPC) {
        gameState.snsPosts.push(createHNPost(bigNameNPC.name, `New ${primaryFandom.workTitle} Thoughts`, `Just finished pondering the latest arc of ${primaryFandom.workTitle}, especially ${primaryFandom.favCharacter}'s role (they are so ${primaryFandom.favCharacterDescription.split(" ")[0]}!). Some interesting developments! Looking forward to quality fan works. #${primaryFandom.workTitle.replace(/\s/g, '')}`, 50));
    }
    addLogEntry("Initial SNS posts generated.", "system");
}

function generateSimulatedComments(post: HNPost, targetCount: number, ficRating?: number) {
    const comments: HNComment[] = [];
    const genericUsernames = ["FanGirl_xoxo", "CoolDude12", "ArtLover99", "StorySeeker", "MemeLord", "KpopStan7", "AnimeWeebPro", "BLFanatic", "OtakuQueen"];
    const positiveComments = ["작가님 천재만재!! ㅠㅠㅠ 다음편 존버합니다!", "와 미쳤다... 밤새서 읽었어요. 작가님 사랑해요!", "이 커플링 해석 너무 좋아요! 제 안의 공식입니다.", "대박... 글 너무 잘 쓰세요! 문장 하나하나가 주옥같아요.", "ㅠㅠㅠㅠㅠ 최고예요 작가님... 제 인생작 등극입니다.", "작가님 글 보고 광명찾았습니다... 압도적 감사!", "선생님 어디계십니까 제가 그쪽으로 절하겠습니다ㅠㅠ", "이게 나라다... 이 커플링은 찐입니다 여러분!!"];
    const neutralComments = ["잘 보고 갑니다.", "흠... 흥미로운 전개네요.", "이런 해석은 처음 봐요. 신선하네요.", "다음편 기대할게요. 수고하셨습니다.", "무난하게 재밌었어요."];
    const negativeCommentsBase = ["캐붕인데요? 원작 캐릭터랑 너무 다른데요?", "전개가 너무 뻔해요. 다음 내용 다 예상됨;", "글 너무 못쓴다... 문장도 어색하고 맞춤법도...", "원작 파괴 좀 그만하세요. 이건 팬픽이 아니라 날조 수준.", "이걸 돈 받고 판다고? 양심 어디감?", "솔직히 별로였어요. 시간 아깝네요.", "작가님 필력 좀 키우셔야 할 듯...", "이 커플링 이렇게 쓰는거 아닌데... 완전 지뢰밟음;"];
    const paidNegativeComments = ["이게 왜 유료임? 돈 아깝다 진짜.", "무료로 풀어도 안 볼 퀄리티인데 이걸 돈주고 사다니...", "작가님 돈독 올랐네; 실력도 없으면서 유료라니.", "유료글은 좀 더 신경써야 하는거 아닌가요? 실망입니다."];

    let potentialAuthors = [...genericUsernames, ...gameState.npcs.map(n => n.name)];
    potentialAuthors = potentialAuthors.filter(name => name !== post.author && name !== gameState.playerName); 

    for (let i = 0; i < Math.min(targetCount, 10); i++) {
        let commentText = "";
        const author = potentialAuthors[Math.floor(Math.random() * potentialAuthors.length)] || "RandomReader";
        const npcData = gameState.npcs.find(n => n.name === author);
        const authorType = npcData ? npcData.type : 'Generic'; 

        let effectiveRating = ficRating;
        
        if (typeof effectiveRating === 'undefined') {
            effectiveRating = 3 + Math.floor(Math.random() * 3) -1; 
        }

        let negativeCommentsPool = [...negativeCommentsBase];
        if (post.isPaid) negativeCommentsPool.push(...paidNegativeComments);

        
        if (effectiveRating === 1) { 
            commentText = negativeCommentsPool[Math.floor(Math.random() * negativeCommentsPool.length)];
        } else if (effectiveRating === 2) { 
            commentText = (i < Math.floor(targetCount * 0.67)) ? negativeCommentsPool[Math.floor(Math.random() * negativeCommentsPool.length)] : neutralComments[Math.floor(Math.random() * neutralComments.length)];
        } else if (effectiveRating === 3) { 
            commentText = (i === 0) ? negativeCommentsPool[Math.floor(Math.random() * negativeCommentsPool.length)] : (Math.random() < 0.6 ? positiveComments[Math.floor(Math.random() * positiveComments.length)] : neutralComments[Math.floor(Math.random() * neutralComments.length)]);
        } else { 
             commentText = (Math.random() < 0.15 && authorType !== 'Fan') ? neutralComments[Math.floor(Math.random() * neutralComments.length)] : positiveComments[Math.floor(Math.random() * positiveComments.length)];
        }

        
        if (authorType === 'Anti' && effectiveRating < 5) {
            if (Math.random() < (effectiveRating <= 2 ? 0.9 : 0.6)) { 
                 commentText = negativeCommentsPool[Math.floor(Math.random() * negativeCommentsPool.length)];
            }
        }
        
        if (authorType === 'Rival' && effectiveRating >=4) {
            if (Math.random() < 0.4) commentText = neutralComments[Math.floor(Math.random() * neutralComments.length)] + " (나쁘진 않네. 내 다음 작품에 비하면 아직 멀었지만.)";
        }


        const postedFic = gameState.publishedFics.find(f => f.id === post.id || f.title === post.title.replace(' (유료)', '').replace(/\s*\(Pt\.\s*\d+\)/, ''));
        const ficDeokryeok = postedFic?.author === gameState.playerName ? gameState.deokryeok : 50;
        if (ficDeokryeok < 25 && Math.random() < 0.4 && effectiveRating < 4) { 
             const ficFandom = postedFic ? findFandomSetById(postedFic.fandomSetId) : null;
             commentText += ` (솔직히 캐릭터(${ficFandom?.favCharacter || '이름모를애'}) 해석이 좀... 원작이랑 다른데요? ${ficDeokryeok < 15 ? "팬심이 부족하신듯;" : "좀 더 파셔야할듯."})`;
        }
        comments.push(createHNComment(post.id, author, commentText));
    }
    post.comments = comments;
    post.commentCount = comments.length;
}
async function callGeminiAPI_GenerateComments(apiKey: string, playerPostContent: string, playerPostTitle?: string): Promise<{ success: boolean; comments?: string[]; error?: string }> {
    if (!apiKey) return { success: false, error: "[Config Error] API Key for comments is missing." };
    const ai = new GoogleGenAI({ apiKey });

    const fandomHistory = gameState.fandomSets.map(fs => `${fs.workTitle} (주로 ${fs.favPairing})`).join(', ') || "아직 특별한 주력 팬덤 없음";
    const recentFics = gameState.publishedFics.filter(f => f.author === gameState.playerName).slice(-2).map(f => `"${f.title}" (장르: ${f.genres.join('/')})`).join('; ') || "최근 작품 없음";

    const systemInstruction = `
당신은 10대에서 20대 초반의 한국 인터넷 오타쿠 커뮤니티 사용자들의 말투와 행동 양식을 완벽하게 시뮬레이션하는 AI입니다.
플레이어의 SNS 게시물에 대해 1~3개의 자연스러운 댓글을 생성해야 합니다.
댓글은 매우 짧고, 구어체이며, 인터넷 밈이나 유행어를 적절히 사용할 수 있습니다.
다양한 반응을 보여주세요: 열광적인 응원, 유머러스한 동의, 냉소적인 지적, 가벼운 불평 등.
플레이어의 현재 상태 (닉네임, 인기도, 주력 팬덤, 최근 작품 등)를 참고하여 댓글에 자연스럽게 녹여낼 수 있다면 좋습니다.
폭력적이거나 과도하게 선정적인 내용은 피해주세요. 모든 댓글은 한국어로 작성되어야 합니다.
댓글 각각은 독립적이어야 하며, 한 사람이 여러 개 단 것처럼 보이지 않도록 합니다.
각 댓글은 2-3문장 이내로 짧게 유지해주세요.
`.trim();

    const userPrompt = `
## 플레이어 정보:
- 닉네임: ${gameState.playerName}
- 인기도: ${gameState.popularity}
- 현재 논란 지수: ${gameState.controversyScore}
- 주력 팬덤 및 커플링: ${fandomHistory}
- 최근 작품: ${recentFics}
- 현재 총 보유 금액: ${gameState.money}G (참고용)

## 플레이어의 SNS 게시물:
${playerPostTitle ? `### 제목: ${playerPostTitle}\n` : ''}
"""
${playerPostContent}
"""

## 지시사항:
위 플레이어의 게시물에 대해 10대~20대 한국 인터넷 오타쿠 말투로 1~3개의 댓글을 생성해주세요.
각 댓글은 서로 다른 사용자가 작성한 것처럼 보여야 합니다.
예시 말투: "헐 대박ㅋㅋ", "작가님 천재만재ㅠㅠ", "이건 좀 아니지 않냐?", "ㅇㄱㄹㅇ ㅂㅂㅂㄱ", "ㅋㅋㅋㅋㅋ미쳤나봐", "아니 그래서 내 최애는 언제 나오냐고ㅡㅡ", "가보자고~"
JSON 배열 형식으로 각 댓글 텍스트만 반환해주세요. 예: ["댓글1 내용", "댓글2 내용"]
`.trim();

    console.log("Sending to Gemini API (Comment Gen). Sys Instruction:", systemInstruction.substring(0,100));
    console.log("User Prompt (Comment Gen, first 100):", userPrompt.substring(0, 100) + "...");

    
    let rawApiResponseText: string | undefined;

    try {
        
        const geminiApiResponse = await ai.models.generateContent({
            model: GEMINI_MODEL_TEXT,
            contents: userPrompt,
            config: {
                systemInstruction,
                temperature: 0.8, 
                topK: 40,
                topP: 0.95,
                responseMimeType: "application/json",
            }
        });

        rawApiResponseText = geminiApiResponse.text; 

        let jsonStr = rawApiResponseText.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        const parsedData = JSON.parse(jsonStr); 

        if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
            return { success: true, comments: parsedData.slice(0,3) }; 
        } else {
            console.error("Gemini API (Comment Gen) - Unexpected JSON structure:", parsedData);
            
            return { success: false, error: `[API Error] AI returned comments in an unexpected format. Raw response (first 100 chars): ${rawApiResponseText ? rawApiResponseText.substring(0,100) : "N/A"}...` };
        }
    } catch (error: any) {
        console.error("Error calling Gemini API (Comment Gen):", error);
        let detail = error.message || String(error);
         if (error.response && error.response.data && error.response.data.error) { 
            detail = error.response.data.error.message || detail;
        }
        
        
        
        if (error instanceof SyntaxError && rawApiResponseText) {
            
            detail = `Failed to parse JSON response from AI. Error: ${error.message}. Received text (first 200 chars): "${rawApiResponseText.substring(0, 200)}..."`;
        } else if (rawApiResponseText && !(error instanceof SyntaxError) && !detail.includes(rawApiResponseText.substring(0,50))) {
            
            detail += ` (Additional context: Received text from API (first 100 chars): "${rawApiResponseText.substring(0,100)}...")`;
        }
        
        
        return { success: false, error: `[API/SDK Error] ${detail}` };
    }
}


function renderHNComment(comment: HNComment, isReply: boolean = false): HTMLElement {
    const commentDiv = document.createElement('div');
    commentDiv.classList.add('hn-comment');
    if (isReply) { commentDiv.style.marginLeft = '20px'; } 
    commentDiv.innerHTML = `
        <div class="hn-comment-header"><strong>${escapeHTML(comment.author)}</strong> - ${timeAgo(comment.timestamp)}</div>
        <div class="hn-comment-body">${escapeHTML(comment.text)}</div>
        <div class="hn-comment-footer"><button class="reply-comment-btn small-button" data-comment-id="${comment.id}" data-post-id="${comment.postId}" title="Reply functionality not implemented yet." disabled>Reply</button></div>
        ${comment.replies && comment.replies.length > 0 ? `<div class="hn-replies"></div>` : ''}
    `;
    if (comment.replies && comment.replies.length > 0) {
        const repliesContainer = commentDiv.querySelector('.hn-replies') as HTMLElement;
        comment.replies.forEach(reply => { repliesContainer.appendChild(renderHNComment(reply, true)); });
    }
    return commentDiv;
}
function renderSNSFeed() {
    const postsContainer = uiElements['posts-container'] as HTMLElement;
    if (!postsContainer) return;
    postsContainer.innerHTML = ''; 
    if (gameState.snsPosts.length === 0) { postsContainer.innerHTML = '<p>No posts on the feed yet.</p>'; return; }

    const sortedPosts = [...gameState.snsPosts].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    sortedPosts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('hn-post'); postDiv.id = `post-${post.id}`;
        let deleteButtonHTML = post.author === gameState.playerName ? `<button class="delete-post-btn small-button danger-button" data-post-id="${post.id}" style="float: right;">Delete</button>` : '';
        postDiv.innerHTML = `
            <div class="hn-post-header"><strong>${escapeHTML(post.author)}</strong> - ${timeAgo(post.timestamp)}${deleteButtonHTML}</div>
            <h3 class="hn-post-title">${escapeHTML(post.title)} ${post.isPaid ? '<span style="color:green; font-size:0.8em;">[유료💰]</span>': ''}</h3>
            <div class="hn-post-content"><pre>${escapeHTML(post.content)}</pre></div>
            <div class="hn-post-footer"><span>Likes: ${post.likes}</span><span>Retweets: ${post.retweets}</span><span>Comments: ${post.commentCount}</span></div>
            <div class="hn-comments-section" id="comments-for-${post.id}"><h4>Comments</h4>${post.comments.length === 0 ? '<p style="font-size:0.9em; color:#777;">No comments yet.</p>' : ''}</div>
        `;
        const commentsSection = postDiv.querySelector(`#comments-for-${post.id}`) as HTMLElement;
        if (commentsSection && post.comments.length > 0) {
            const sortedComments = [...post.comments].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); 
            sortedComments.forEach(comment => { commentsSection.appendChild(renderHNComment(comment)); });
        }
        postsContainer.appendChild(postDiv);
    });
}

async function handlePlayerSnsPost() {
    const titleInput = uiElements['player-sns-post-title'] as HTMLInputElement;
    const contentInput = uiElements['player-sns-post-content'] as HTMLTextAreaElement;
    const submitButton = uiElements['submit-player-sns-post-button'] as HTMLButtonElement;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!content) {
        alert("SNS post content cannot be empty.");
        return;
    }
    if (content.length > 280) {
        alert("SNS post content cannot exceed 280 characters.");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Posting...';

    const newPlayerPost = createHNPost(gameState.playerName, title || "Musings", content, Math.floor(Math.random() * 5), false, "player_custom_post");
    
    
    const commentResult = await callGeminiAPI_GenerateComments(gameState.apiKey, content, title);
    if (commentResult.success && commentResult.comments) {
        commentResult.comments.forEach(commentText => {
            
            const potentialCommenters = [...gameState.npcs.map(n => n.name), "RandomUser1", "NetizenCool", "FandomVoice_Active"];
            const commenter = potentialCommenters[Math.floor(Math.random() * potentialCommenters.length)];
            newPlayerPost.comments.push(createHNComment(newPlayerPost.id, commenter, commentText));
        });
        newPlayerPost.commentCount = newPlayerPost.comments.length;
    } else {
        showNotification(`Error generating AI comments: ${commentResult.error || "Unknown error"}. Post will appear without AI comments.`, 4000);
        addLogEntry(`Error generating AI comments for player SNS post: ${commentResult.error || "Unknown error"}.`, "system");
    }

    gameState.snsPosts.unshift(newPlayerPost);
    gameState.lastPlayerSnsPostWeek = gameState.currentWeek;
    
    const postMessage = `You posted to SNS: "${title || content.substring(0, 20) + "..."}"`;
    showNotification(postMessage);
    addLogEntry(postMessage, "sns");

    titleInput.value = '';
    contentInput.value = '';
    if (uiElements['player-sns-post-char-count']) (uiElements['player-sns-post-char-count'] as HTMLElement).textContent = '280 characters remaining';
    
    showArea(null); 
    renderSNSFeed(); 
    updatePlayerSnsPostCooldownMessage(); 
    saveGameState();
    
    submitButton.disabled = false;
    submitButton.textContent = 'Post to SNS';
}
function updatePlayerSnsPostCooldownMessage() {
    const cooldownMessageEl = uiElements['player-sns-post-cooldown-message'] as HTMLElement;
    const postButton = uiElements['player-custom-sns-post-button'] as HTMLButtonElement;
    const submitModalButton = uiElements['submit-player-sns-post-button'] as HTMLButtonElement;

    const weeksSinceLastPost = gameState.currentWeek - gameState.lastPlayerSnsPostWeek;
    const canPost = weeksSinceLastPost >= PLAYER_SNS_POST_COOLDOWN_WEEKS || gameState.lastPlayerSnsPostWeek === 0;

    if (postButton) postButton.disabled = !canPost;
    if (submitModalButton) submitModalButton.disabled = !canPost;

    if (cooldownMessageEl) {
        if (canPost) {
            cooldownMessageEl.textContent = "You can make a custom post now!";
            cooldownMessageEl.style.color = "green";
        } else {
            const weeksRemaining = PLAYER_SNS_POST_COOLDOWN_WEEKS - weeksSinceLastPost;
            cooldownMessageEl.textContent = `You can post again in ${weeksRemaining} week(s). (Once every ${PLAYER_SNS_POST_COOLDOWN_WEEKS} weeks)`;
            cooldownMessageEl.style.color = "#777";
        }
    }
}


function handlePostFic() {
    if (!gameState.activeFanficProject || !gameState.activeFanficProject.generatedContent) { alert("Please finalize the active fanfic project with AI first."); return; }
    const project = gameState.activeFanficProject;
    const ficText = project.generatedContent;
    const isPaid = (uiElements['fic-paid-checkbox'] as HTMLInputElement).checked;
    const ficTitleBase = project.title;
    const partNumberSuffix = project.previousFicIdForSequel ? ` (Pt. ${gameState.publishedFics.filter(f => f.title.startsWith(ficTitleBase.split(" Pt.")[0])).length + 1})` : "";
    const paidSuffix = isPaid ? ' (유료)' : '';
    const ficDisplayTitle = `${ficTitleBase}${partNumberSuffix}${paidSuffix}`;

    
    let readerRating = 2 + Math.floor(gameState.writingSkill / 25) + Math.floor(gameState.deokryeok / 25); 
    readerRating = Math.round(readerRating / 2); 
    if (isPaid) readerRating -= 1;
    readerRating = Math.max(1, Math.min(5, readerRating + (Math.floor(Math.random() * 3) -1) )); 

    const baseLikes = Math.floor(gameState.popularity / 3 + gameState.writingSkill / 4 + gameState.deokryeok / 5 + readerRating * 3);
    const initialLikes = isPaid ? Math.floor(baseLikes * 0.6) : baseLikes;
    const newPost = createHNPost(gameState.playerName, ficDisplayTitle, ficText, initialLikes, isPaid, "post"); 
    const targetCommentCount = Math.max(1, Math.floor(gameState.popularity / 15 + gameState.writingSkill / 20 + gameState.deokryeok / 30 + readerRating) + (isPaid ? 1 : 0) );
    generateSimulatedComments(newPost, targetCommentCount, readerRating); 
    gameState.snsPosts.unshift(newPost);
    const newPublishedFic: PublishedFic = {
         id: project.id, fandomSetId: project.fandomSetId, title: ficTitleBase, 
         content: ficText, genres: project.genres, materials: project.materials, scenarioPlan: project.scenarioPlan,
         timestamp: new Date().toISOString(), author: gameState.playerName, isPaid,
         targetProgress: project.targetProgress, readerRating: readerRating, memo: "",
         previousFicIdForSequel: project.previousFicIdForSequel
     };
    gameState.publishedFics.push(newPublishedFic);

    
    const currentFandomSet = findFandomSetById(project.fandomSetId);
    if (currentFandomSet && currentFandomSet.isPrimary) { 
        const [charA, charB] = currentFandomSet.favPairing.split('/');
        if (charA && charB && currentFandomSet.favPairing.includes('/')) { 
            const originalPairing = `${charA}/${charB}`;
            const reversedPairingAttempt = `${charB}/${charA}`;
            
            
            if (currentFandomSet.favPairing === reversedPairingAttempt && !(currentFandomSet.reversePenaltyTriggers || {})[originalPairing]) {
                 const penalty = Math.round(gameState.popularity * 0.70);
                 gameState.popularity = Math.max(0, gameState.popularity - penalty);
                 const reverseMsg = `REVERSE PAIRING ALERT! You published a fic for "${reversedPairingAttempt}" which is a reverse of a known primary pairing (${originalPairing}) for these characters. Some fans are upset! Popularity -${penalty} (70%). This penalty is one-time per original pairing.`;
                 showNotification(reverseMsg, 8000);
                 addLogEntry(reverseMsg, "sns");
                 if (!currentFandomSet.reversePenaltyTriggers) currentFandomSet.reversePenaltyTriggers = {};
                 currentFandomSet.reversePenaltyTriggers[originalPairing] = true;
            }
        }
    }

    project.genres.forEach(genre => { gameState.genreProficiency[genre] = (gameState.genreProficiency[genre] || 0) + 1; });
    const popularityGain = 1 + Math.floor(gameState.writingSkill / 25) + Math.floor(gameState.deokryeok / 30) - (isPaid ? 2 : 0) + (readerRating - 3); 
    gameState.popularity = Math.max(0, gameState.popularity + popularityGain);
    if (isPaid) gameState.controversyScore += 10;
    updateAllDisplays();
    const postSuccessMsg = `Fanfic "${ficDisplayTitle}" posted to SNS! (Rating: ${readerRating}⭐)`;
    alert(postSuccessMsg);
    addLogEntry(postSuccessMsg, "fic_published");
    (uiElements['generated-fic-output'] as HTMLTextAreaElement).value = '';
    (uiElements['post-fic-button'] as HTMLButtonElement).disabled = true;
    (uiElements['fic-paid-checkbox'] as HTMLInputElement).checked = false;
    gameState.activeFanficProject = null;
    updateActiveProjectInfoBar();
    updateSchedulerActiveProjectWarning();

    
    if (!gameState.playerMilestones.firstFicPublished && gameState.tutorialFriendEnabled) {
        const friend = gameState.npcs.find(n => n.name === "SupportiveDeokhuFriend");
        if (friend) {
            const friendPostTitle = `💖 ${gameState.playerName} 작가님 첫 작품 축하드려요!! 💖`;
            const friendPostContent = `세상에 여러분!! 드디어 ${gameState.playerName} 작가님의 첫 팬픽 "${escapeHTML(ficDisplayTitle)}"이 올라왔어요! 😭✨ 방금 읽고 왔는데 (스포금지!) 정말... (작가님만의 느낌)이 살아있다구요! 다들 꼭 한번 읽어보세요! 작가님 앞으로도 멋진 작품 많이많이 써주세요! 제가 항상 응원할게요! #첫작품 #신인작가_탄생 #감동의눈물 #FandomForge`;
            gameState.snsPosts.unshift(createHNPost(friend.name, friendPostTitle, friendPostContent, 15 + Math.floor(Math.random() * 10)));
            addLogEntry(`${friend.name} posted to celebrate ${gameState.playerName}'s first fic.`, "sns");
            renderSNSFeed();
        }
        gameState.playerMilestones.firstFicPublished = true;
    }
    checkSupportiveFriendMilestones(); 

    showArea(null);
    saveGameState();
}
function renderMyFicsList() {
    const myFicsListContainer = uiElements['my-fics-list'] as HTMLElement;
    if (!myFicsListContainer) return;
    myFicsListContainer.innerHTML = '';
    if (gameState.publishedFics.length === 0) { myFicsListContainer.innerHTML = '<p>You haven\'t published any fanfics yet.</p>'; return; }
    const sortedFics = [...gameState.publishedFics].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    sortedFics.forEach(fic => {
        const ficDiv = document.createElement('div');
        ficDiv.classList.add('my-fic-entry');
        const fandomSet = findFandomSetById(fic.fandomSetId);
        let paidIndicator = fic.isPaid ? '<span style="color:green; font-weight:bold;">[유료💰]</span> ' : '';
        let ratingStars = fic.readerRating ? '⭐'.repeat(fic.readerRating) + '☆'.repeat(5 - fic.readerRating) : 'Not Rated Yet';
        let sequelIndicator = fic.previousFicIdForSequel ? `(Sequel to: ${escapeHTML(gameState.publishedFics.find(pf => pf.id === fic.previousFicIdForSequel)?.title || 'Unknown')})` : '';
        
        const partNumberSuffix = fic.previousFicIdForSequel ? ` (Pt. ${gameState.publishedFics.filter(f => f.title.startsWith(fic.title.split(" Pt.")[0]) && new Date(f.timestamp).getTime() <= new Date(fic.timestamp).getTime() ).length})` : "";
        const displayTitleWithPart = `${escapeHTML(fic.title)}${partNumberSuffix}`;

        let eventSubmissionButtonHTML = '';
        if (gameState.currentEvent && gameState.registeredEventId === gameState.currentEvent.id && fic.fandomSetId === gameState.currentEvent.fandomSetId && !gameState.currentEvent.submittedFicId) {
            eventSubmissionButtonHTML = `<button class="submit-rerelease-to-event-btn small-button" data-fic-id="${fic.id}">Submit Re-release to "${escapeHTML(gameState.currentEvent.name.substring(0,10))}..."</button>`;
        }
        ficDiv.innerHTML = `
            <strong>${paidIndicator}${displayTitleWithPart} ${escapeHTML(sequelIndicator)}</strong>
            <span class="fic-meta">For Fandom: ${escapeHTML(fandomSet?.workTitle || "Unknown")}</span>
            <span class="fic-meta">Genres: ${escapeHTML(fic.genres.join(', ') || 'N/A')}, Materials: ${escapeHTML(fic.materials?.join(', ') || 'N/A')}</span>
            <span class="fic-meta">Published: ${timeAgo(fic.timestamp)}</span>
            <span class="fic-meta">Reader Rating: <span class="reader-rating">${ratingStars}</span> (${fic.readerRating || 'N/A'}/5)</span>
            ${eventSubmissionButtonHTML}
            <details><summary>View Content (AI Generated)</summary><pre class="fic-content-preview">${escapeHTML(fic.content)}</pre></details>
            <details><summary>View Original Plan</summary><pre class="fic-content-preview">Scenario: ${escapeHTML(fic.scenarioPlan || 'N/A')}</pre></details>
            <div class="input-group"><label for="memo-${fic.id}" style="font-size:0.9em; margin-bottom:2px;">Personal Memo:</label><textarea id="memo-${fic.id}" class="memo-area" rows="2" placeholder="Add notes...">${escapeHTML(fic.memo || '')}</textarea></div>
        `;
        myFicsListContainer.appendChild(ficDiv);
        const memoTextarea = ficDiv.querySelector(`#memo-${fic.id}`) as HTMLTextAreaElement;
        if(memoTextarea) { memoTextarea.addEventListener('change', (e) => { const updatedMemo = (e.target as HTMLTextAreaElement).value; const ficToUpdate = gameState.publishedFics.find(f => f.id === fic.id); if (ficToUpdate) { ficToUpdate.memo = updatedMemo; saveGameState(); } }); }
        const submitButton = ficDiv.querySelector('.submit-rerelease-to-event-btn') as HTMLButtonElement;
        if(submitButton) { submitButton.addEventListener('click', () => handleSubmitToEvent(fic.id, true)); }
    });
}

// --- Profile Edit Logic ---
function findFandomSetById(id: string): FandomSet | undefined {
    return gameState.fandomSets.find(fs => fs.id === id);
}
function openProfileEditModal() {
    (uiElements['edit-player-name'] as HTMLInputElement).value = gameState.playerName;
    (uiElements['edit-api-key'] as HTMLInputElement).value = gameState.apiKey;
    renderFandomSetsManagement();
    showArea('profile-edit-area');
}
function renderFandomSetsManagement() {
    const container = uiElements['fandom-sets-management-area'] as HTMLElement;
    if (!container) return;
    container.innerHTML = '';
    gameState.fandomSets.forEach(fs => {
        const div = document.createElement('div');
        div.classList.add('fandom-set-entry');
        let baseWorkInfo = '';
        if (fs.baseFandomSetId && fs.relationshipType !== 'new_work') {
            const baseFandom = findFandomSetById(fs.baseFandomSetId);
            baseWorkInfo = `<small style="display:block; color:#555;">(Extends: ${escapeHTML(baseFandom?.workTitle || 'Unknown Base Work')})</small>`;
        }
        div.innerHTML = `
            <h4>${escapeHTML(fs.workTitle)} ${fs.isPrimary ? '<span style="color:green; font-size:0.8em;">[Primary]</span>' : ''}</h4>
            ${baseWorkInfo}
            <p><strong>Character:</strong> ${escapeHTML(fs.favCharacter)} | <strong>Pairing:</strong> ${escapeHTML(fs.favPairing)}</p>
            <p><em>Char Desc: ${escapeHTML(fs.favCharacterDescription.substring(0,50))}...</em></p>
            <p><em>Pairing Interp: ${escapeHTML(fs.pairingInterpretation.substring(0,50))}...</em></p>
            <button class="edit-fandom-btn small-button" data-id="${fs.id}">Edit</button>
            <button class="delete-fandom-btn small-button danger-button" data-id="${fs.id}">Delete (탈덕)</button>
        `;
        container.appendChild(div);
    });
     
    const editForm = uiElements['edit-fandom-set-form'] as HTMLElement;
    if (editForm && editForm.style.display !== 'none' && !(uiElements['edit-fandom-set-id-input'] as HTMLInputElement).value) {
        editForm.style.display = 'none';
    }
}
function handleEditFandomSetForm(fandomSetId?: string) {
    const form = uiElements['edit-fandom-set-form'] as HTMLElement;
    const formTitle = uiElements['edit-fandom-set-form-title'] as HTMLElement;
    const idInput = uiElements['edit-fandom-set-id-input'] as HTMLInputElement;
    const workTitleInput = uiElements['edit-fandom-work-title-input'] as HTMLInputElement;
    const workDescInput = uiElements['edit-fandom-work-desc-input'] as HTMLTextAreaElement;
    const favCharInput = uiElements['edit-fandom-fav-char-input'] as HTMLInputElement;
    const favCharDescInput = uiElements['edit-fandom-fav-char-desc-input'] as HTMLTextAreaElement;
    const favPairingInput = uiElements['edit-fandom-fav-pairing-input'] as HTMLInputElement;
    const pairingInterpInput = uiElements['edit-fandom-pairing-interp-input'] as HTMLTextAreaElement;
    const isPrimaryCheckbox = uiElements['edit-fandom-is-primary-checkbox'] as HTMLInputElement;
    const relationshipTypeSelect = uiElements['edit-fandom-relationship-type'] as HTMLSelectElement;
    const baseWorkGroup = uiElements['edit-fandom-base-work-group'] as HTMLElement;
    const baseWorkSelect = uiElements['edit-fandom-base-work-select'] as HTMLSelectElement;

    if (!form || !formTitle || !idInput || !workTitleInput || !workDescInput || !favCharInput || !favCharDescInput || !favPairingInput || !pairingInterpInput || !isPrimaryCheckbox || !relationshipTypeSelect || !baseWorkGroup || !baseWorkSelect) return;

    const resetWorkFieldsForExtension = (isExtending: boolean) => {
        workTitleInput.readOnly = isExtending;
        workDescInput.readOnly = isExtending;
        workTitleInput.classList.toggle('readonly', isExtending);
        workDescInput.classList.toggle('readonly', isExtending);
        baseWorkGroup.style.display = isExtending ? 'block' : 'none';
    };
    
    const populateBaseWorkSelect = (currentEditingId?: string) => {
        baseWorkSelect.innerHTML = '<option value="">-- Select Base Work --</option>';
        gameState.fandomSets.forEach(fs => {
            if (fs.id !== currentEditingId) { 
                 baseWorkSelect.add(new Option(`${fs.workTitle} (${fs.favPairing})`, fs.id));
            }
        });
        baseWorkSelect.value = "";
    };

    if (fandomSetId) { 
        const fs = findFandomSetById(fandomSetId);
        if (!fs) { alert("Fandom Set not found!"); return; }
        formTitle.textContent = "Edit Fandom Set"; idInput.value = fs.id;
        workTitleInput.value = fs.workTitle; workDescInput.value = fs.workDescription;
        favCharInput.value = fs.favCharacter; favCharDescInput.value = fs.favCharacterDescription;
        favPairingInput.value = fs.favPairing; pairingInterpInput.value = fs.pairingInterpretation;
        isPrimaryCheckbox.checked = fs.isPrimary; isPrimaryCheckbox.disabled = fs.isPrimary && gameState.fandomSets.length === 1;
        
        relationshipTypeSelect.value = fs.relationshipType || "new_work";
        const isExtending = relationshipTypeSelect.value !== 'new_work';
        resetWorkFieldsForExtension(isExtending);
        if (isExtending) {
            populateBaseWorkSelect(fs.id);
            baseWorkSelect.value = fs.baseFandomSetId || "";
        }
        relationshipTypeSelect.disabled = false; 
    } else { 
        formTitle.textContent = "Add New Fandom Set"; idInput.value = "";
        [workTitleInput, workDescInput, favCharInput, favCharDescInput, favPairingInput, pairingInterpInput].forEach(el => (el as HTMLInputElement|HTMLTextAreaElement).value = "");
        isPrimaryCheckbox.checked = gameState.fandomSets.length === 0; isPrimaryCheckbox.disabled = gameState.fandomSets.length === 0;
        relationshipTypeSelect.value = "new_work";
        relationshipTypeSelect.disabled = false;
        resetWorkFieldsForExtension(false);
        populateBaseWorkSelect();
    }
    form.style.display = 'block';
}
function handleSaveFandomSet() {
    const id = (uiElements['edit-fandom-set-id-input'] as HTMLInputElement).value;
    let workTitle = (uiElements['edit-fandom-work-title-input'] as HTMLInputElement).value.trim();
    let workDescription = (uiElements['edit-fandom-work-desc-input'] as HTMLTextAreaElement).value.trim();
    const favCharacter = (uiElements['edit-fandom-fav-char-input'] as HTMLInputElement).value.trim();
    const favCharacterDescription = (uiElements['edit-fandom-fav-char-desc-input'] as HTMLTextAreaElement).value.trim();
    const favPairing = (uiElements['edit-fandom-fav-pairing-input'] as HTMLInputElement).value.trim();
    const pairingInterpretation = (uiElements['edit-fandom-pairing-interp-input'] as HTMLTextAreaElement).value.trim();
    const isPrimary = (uiElements['edit-fandom-is-primary-checkbox'] as HTMLInputElement).checked;
    const relationshipType = (uiElements['edit-fandom-relationship-type'] as HTMLSelectElement).value as FandomSet['relationshipType'];
    const baseWorkId = (uiElements['edit-fandom-base-work-select'] as HTMLSelectElement).value;
    let baseFandomSetIdToStore: string | undefined = undefined;

    if (relationshipType !== 'new_work') {
        if (!baseWorkId) { alert("Please select a Base Work to extend from, or choose 'New Work & Fandom'."); return; }
        const baseFandomSet = findFandomSetById(baseWorkId);
        if (baseFandomSet) {
            workTitle = baseFandomSet.workTitle; 
            workDescription = baseFandomSet.workDescription;
            baseFandomSetIdToStore = baseFandomSet.id;
        } else { alert("Error: Base Fandom Set not found."); return; }
    }

    if (!workTitle || !favCharacter || !favPairing) { alert("Work Title, Favorite Character, and Favorite Pairing are required."); return; }
    if (!favPairing.includes('/')) {alert("Pairing format should be 'CharacterA/CharacterB'."); return;}

    let popularityPenaltyFactor = 0;
    let penaltyMessage = "";
    let logMessage = "";

    if (id) { 
        const existingSetIndex = gameState.fandomSets.findIndex(fs => fs.id === id);
        if (existingSetIndex === -1) { alert("Error: Fandom Set not found for update."); return; }
        const oldSet = { ...gameState.fandomSets[existingSetIndex] };
        if (oldSet.isPrimary) { 
            if (oldSet.favPairing !== favPairing) { popularityPenaltyFactor += 0.10; penaltyMessage += "Primary pairing changed. ";}
            if (oldSet.favCharacter !== favCharacter) { popularityPenaltyFactor += 0.20; penaltyMessage += "Primary character changed. ";}
            if (oldSet.workTitle !== workTitle && relationshipType === 'new_work') { popularityPenaltyFactor += 0.30; penaltyMessage += "Primary work title changed. ";} 
        }
        gameState.fandomSets[existingSetIndex] = { ...oldSet, workTitle, workDescription, favCharacter, favCharacterDescription, favPairing, pairingInterpretation, isPrimary, relationshipType, baseFandomSetId: baseFandomSetIdToStore, reversePenaltyTriggers: oldSet.reversePenaltyTriggers || {} };
        logMessage = `Fandom Set "${workTitle}" updated.`;
    } else { 
        const newId = `fandomset-${gameState.nextFandomSetId++}`;
        gameState.fandomSets.push({ id: newId, workTitle, workDescription, favCharacter, favCharacterDescription, favPairing, pairingInterpretation, isPrimary, relationshipType, baseFandomSetId: baseFandomSetIdToStore, reversePenaltyTriggers: {} });
        logMessage = `New Fandom Set "${workTitle}" added.`;
        showNotification(logMessage);
    }
    if (isPrimary) {
        let oldPrimarySetId: string | null = null;
        const currentPrimaryCandidateId = id || gameState.fandomSets[gameState.fandomSets.length -1].id;
        gameState.fandomSets.forEach(fs => {
            if (fs.isPrimary && fs.id !== currentPrimaryCandidateId) { oldPrimarySetId = fs.id; } 
            fs.isPrimary = fs.id === currentPrimaryCandidateId; 
        });
        if (oldPrimarySetId && oldPrimarySetId !== currentPrimaryCandidateId) { 
            popularityPenaltyFactor += 0.35; 
            penaltyMessage += "Primary Fandom Work changed entirely. ";
            logMessage += ` Primary fandom focus shifted to "${workTitle}".`;
        }
    }
    
    if (!gameState.fandomSets.some(fs => fs.isPrimary) && gameState.fandomSets.length > 0) {
        gameState.fandomSets[0].isPrimary = true;
        logMessage += ` Defaulted "${gameState.fandomSets[0].workTitle}" to primary.`;
    }
    if (popularityPenaltyFactor > 0) {
        const actualPenalty = Math.round(gameState.popularity * popularityPenaltyFactor);
        gameState.popularity = Math.max(0, gameState.popularity - actualPenalty);
        const finalPenaltyMsg = `Fandom Shift! ${penaltyMessage} Popularity decreased by ${actualPenalty}.`;
        showNotification(finalPenaltyMsg, 6000);
        logMessage += ` ${finalPenaltyMsg}`;
    }
    addLogEntry(logMessage, "system");
    (uiElements['edit-fandom-set-form'] as HTMLElement).style.display = 'none';
    renderFandomSetsManagement();
    updateAllDisplays(); 
    saveGameState();
}
function handleDeleteFandomSet(fandomSetId: string) {
    const setToDelete = findFandomSetById(fandomSetId);
    if (!setToDelete) return;
    if (setToDelete.isPrimary && gameState.fandomSets.length === 1) { alert("Cannot delete the only Fandom Set. Add another one first, or edit this one."); return; }
    if (!confirm(`Are you sure you want to '탈덕' (delete) the Fandom Set: "${escapeHTML(setToDelete.workTitle)}"? This will impact your popularity and may affect ongoing projects or event registrations for this fandom.`)) return;
    
    const deletedFandomTitle = setToDelete.workTitle; // Store for NPC reaction
    let popularityPenalty = 0;
    let penaltyMessage = `Fandom Set "${escapeHTML(setToDelete.workTitle)}" deleted. `;
    if (setToDelete.isPrimary) {
        popularityPenalty = Math.round(gameState.popularity * 0.70);
        penaltyMessage += `This was your primary fandom! Significant impact.`;
    } else {
        popularityPenalty = Math.round(gameState.popularity * 0.20);
    }
    gameState.popularity = Math.max(0, gameState.popularity - popularityPenalty);
    showNotification(`${penaltyMessage} Popularity -${popularityPenalty}.`, 6000);
    addLogEntry(`${penaltyMessage} Popularity -${popularityPenalty}.`, "system");
    gameState.fandomSets = gameState.fandomSets.filter(fs => fs.id !== fandomSetId);
    if (setToDelete.isPrimary && gameState.fandomSets.length > 0 && !gameState.fandomSets.some(fs => fs.isPrimary)) {
        gameState.fandomSets[0].isPrimary = true; 
        const newPrimaryMsg = `"${escapeHTML(gameState.fandomSets[0].workTitle)}" is now your primary Fandom Set.`;
        showNotification(newPrimaryMsg);
        addLogEntry(newPrimaryMsg, "system");
    }
    
    if (gameState.activeFanficProject && gameState.activeFanficProject.fandomSetId === fandomSetId) {
        gameState.activeFanficProject = null; updateActiveProjectInfoBar(); updateSchedulerActiveProjectWarning();
        addLogEntry(`Active project for deleted fandom "${setToDelete.workTitle}" was cancelled.`, "system");
    }
    if (gameState.currentEvent && gameState.currentEvent.fandomSetId === fandomSetId) {
        gameState.currentEvent = null; gameState.registeredEventId = null; updateEventDisplay();
        addLogEntry(`Current event for deleted fandom "${setToDelete.workTitle}" was cancelled.`, "system");
    }
    
    // NPC Reactions to 탈덕
    const relevantNpcs = gameState.npcs.filter(npc => 
        npc.fandomFocus === deletedFandomTitle || 
        (npc.type === "Fan" && Math.random() < 0.3) || // General fans might comment
        (npc.type === "Rival" && Math.random() < 0.4) || // Rivals might notice
        (npc.type === "Anti" && Math.random() < 0.5) // Antis love drama
    ).slice(0, 2); // Max 2 NPC reactions for now

    relevantNpcs.forEach(npc => {
        let npcPostTitle = "";
        let npcPostContent = "";
        switch(npc.type) {
            case "Fan":
                npcPostTitle = `엥? ${gameState.playerName} 작가님 탈덕?`;
                npcPostContent = `${gameState.playerName} 작가님, ${deletedFandomTitle} 이제 안 파시는 거예요? ㅠㅠ 제가 정말 좋아하던 작품인데... 너무 아쉽네요... 혹시 다시 돌아오실 생각은 없으신지... #맴찢 #돌아와요작가님`;
                break;
            case "Rival":
                npcPostTitle = `흥, ${gameState.playerName} 도망갔군.`;
                npcPostContent = `${gameState.playerName} 그 녀석, 결국 ${deletedFandomTitle}에서 꼬리 내리고 도망갔구만. 쯧쯧, 역시 그 정도 실력으로는 어림도 없었지. 이 바닥은 냉정하니까. 이제 ${deletedFandomTitle}은 내 차지다!`;
                break;
            case "Anti":
                npcPostTitle = `ㅋㅋㅋ ${gameState.playerName} 드디어 꺼졌네`;
                npcPostContent = `속이 다 시원하다! ${gameState.playerName} 그 인간 드디어 ${deletedFandomTitle}에서 꺼지셨네 ㅋㅋㅋ 원래부터 재능도 없었고 눈꼴시렸는데 잘됐다. 다신 기웃거리지 마라. #정의구현 #사이다`;
                break;
            case "BigNameCreator": // Less likely to comment directly on player leaving, unless it was a major fandom
                 if (npc.fandomFocus === deletedFandomTitle && Math.random() < 0.2) {
                    npcPostTitle = `${deletedFandomTitle} Fandom Thoughts`;
                    npcPostContent = `Noticed some shifts in the ${deletedFandomTitle} creator scene. Interesting times. Always sad to see authors move on, but new talent emerges too. #fandomdynamics`;
                 } else return; // Don't post if not relevant or passes random check
                break;
            default:
                return; // No post for this NPC type
        }
        if(npcPostContent){
            gameState.snsPosts.unshift(createHNPost(npc.name, npcPostTitle, npcPostContent, Math.floor(Math.random() * 10) + 5));
            addLogEntry(`${npc.name} posted about ${gameState.playerName} leaving the ${deletedFandomTitle} fandom.`, "sns");
        }
    });


    renderFandomSetsManagement();
    updateAllDisplays();
    saveGameState();
}
function handleSaveGeneralProfileSettings() {
    const newPlayerName = (uiElements['edit-player-name'] as HTMLInputElement).value.trim();
    const newApiKey = (uiElements['edit-api-key'] as HTMLInputElement).value.trim();
    if (!newPlayerName) { alert("Player Name cannot be empty."); return; }
    if (!newApiKey) { alert("API Key cannot be empty."); return; }
    gameState.playerName = newPlayerName;
    gameState.apiKey = newApiKey;
    const msg = "General profile settings saved!";
    showNotification(msg);
    addLogEntry(msg, "system");
    updateAllDisplays();
    saveGameState();
}
function displayAnalytics() {
    const analyticsContent = uiElements['analytics-content'] as HTMLElement;
    if (!analyticsContent) return;
    const totalPlayerFics = gameState.publishedFics.filter(f => f.author === gameState.playerName).length;
    const totalLikesOnPlayerFics = gameState.snsPosts.filter(post => post.author === gameState.playerName && gameState.publishedFics.some(fic => fic.id === post.id || fic.title.startsWith(post.title.split(" (")[0]))).reduce((sum, post) => sum + post.likes, 0);
    const playerFicsWithRatings = gameState.publishedFics.filter(fic => fic.author === gameState.playerName && typeof fic.readerRating === 'number');
    const averageRating = playerFicsWithRatings.length > 0 ? (playerFicsWithRatings.reduce((sum, fic) => sum + (fic.readerRating!), 0) / playerFicsWithRatings.length).toFixed(1) : 'N/A';
    let genresUsed: { [genre: string]: number } = {};
    gameState.publishedFics.filter(f => f.author === gameState.playerName).forEach(fic => { fic.genres.forEach(genre => { genresUsed[genre] = (genresUsed[genre] || 0) + 1; }); });
    const mostUsedGenres = Object.entries(genresUsed).sort((a,b) => b[1] - a[1]).slice(0,3).map(entry => `${entry[0]} (${entry[1]})`).join(', ') || 'None';
    analyticsContent.innerHTML = `
        <h3>Game Analytics</h3>
        <p><strong>Player Name:</strong> ${escapeHTML(gameState.playerName)}</p>
        <p><strong>Current Week:</strong> ${gameState.currentWeek}</p>
        <p><strong>Money:</strong> ${gameState.money}G</p>
        <p><strong>Popularity:</strong> ${gameState.popularity}</p>
        <p><strong>Total Fanfics Published by You:</strong> ${totalPlayerFics}</p>
        <p><strong>Total Likes on Your Fic Posts:</strong> ${totalLikesOnPlayerFics}</p>
        <p><strong>Average Reader Rating (Your Fics):</strong> ${averageRating} / 5</p>
        <p><strong>Your Most Used Genres:</strong> ${mostUsedGenres}</p>
        <p><strong>Unlocked Genres:</strong> ${gameState.unlockedGenres.length} / ${gameState.availableGenres.length}</p>
        <p><strong>Unlocked Materials:</strong> ${gameState.unlockedMaterials.length} / ${gameState.availableMaterials.length}</p>
        <p><strong>Controversy Score:</strong> ${gameState.controversyScore}</p>
        <p><strong>Deok-ryeok Level:</strong> ${Math.round(gameState.deokryeok)}</p>
        <p><strong>Writing Skill:</strong> ${Math.round(gameState.writingSkill)}</p>
        <p><strong>Low Stamina Writing Streak:</strong> ${gameState.lowStaminaWritingStreak}</p>
    `;
    showArea('analytics-area');
}

// --- SNS Activity Events ---
function handleSnsActivityEvents(logPrefix: string = "") {
    const rand = Math.random();
    let snsEventHappened = false;
    let eventMessage = "You browsed SNS, catching up on the latest fandom chatter.";
    gameState.popularity = Math.max(0, gameState.popularity + 0.2); 

    const primaryFandom = gameState.fandomSets.find(fs => fs.isPrimary) || gameState.fandomSets[0];
    const randomPlayerFandom = gameState.fandomSets.length > 0 ? gameState.fandomSets[Math.floor(Math.random() * gameState.fandomSets.length)] : null;

    if (rand < 0.15) { 
        const unlockType = Math.random() < 0.5 ? 'genre' : 'material';
        let unlockedItem = '';
        if (unlockType === 'genre' && gameState.unlockedGenres.length < gameState.availableGenres.length) {
            const availableToUnlock = gameState.availableGenres.filter(g => !gameState.unlockedGenres.includes(g));
            if (availableToUnlock.length > 0) {
                unlockedItem = availableToUnlock[Math.floor(Math.random() * availableToUnlock.length)];
                gameState.unlockedGenres.push(unlockedItem);
                eventMessage = `While browsing SNS, you saw discussions about "${unlockedItem}"! New Genre Unlocked!`;
                populateGenreCheckboxes(); snsEventHappened = true;
            }
        } else if (unlockType === 'material' && gameState.unlockedMaterials.length < gameState.availableMaterials.length) {
            const availableToUnlock = gameState.availableMaterials.filter(m => !gameState.unlockedMaterials.includes(m));
            if (availableToUnlock.length > 0) {
                unlockedItem = availableToUnlock[Math.floor(Math.random() * availableToUnlock.length)];
                gameState.unlockedMaterials.push(unlockedItem);
                eventMessage = `An interesting post gave you an idea for "${unlockedItem}"! New Material Unlocked!`;
                populateMaterialsSelect(); snsEventHappened = true;
            }
        }
    } else if (rand < 0.35) { 
        const statChangeType = Math.random();
        if (statChangeType < 0.4 && randomPlayerFandom) { gameState.deokryeok += 3; eventMessage = `You read an insightful meta on SNS about ${randomPlayerFandom.workTitle}! Deok-ryeok +3.`; snsEventHappened = true; }
        else if (statChangeType < 0.7) { gameState.stamina = Math.max(0, gameState.stamina - 5); gameState.controversyScore += 2; eventMessage = "You got into a pointless argument on SNS... Stamina -5, Controversy +2."; snsEventHappened = true; }
        else { gameState.popularity = Math.max(0, gameState.popularity + 0.5); eventMessage = "One of your old takes resurfaced and got positive attention! Popularity +0.5."; snsEventHappened = true;}
    } else if (rand < 0.5 && randomPlayerFandom) { 
        const bigName = gameState.npcs.find(n => n.type === 'BigNameCreator' && (n.fandomFocus === randomPlayerFandom.workTitle || n.fandomFocus === "Any" || !n.fandomFocus));
        if (bigName) {
            const bigNamePostContent = [
                `Deep dive into ${randomPlayerFandom.favCharacter}'s motivations in ${randomPlayerFandom.workTitle}. Thoughts? They are so ${randomPlayerFandom.favCharacterDescription.split(/[.,]/)[0]}.`,
                `Just finished the latest chapter of ${randomPlayerFandom.workTitle}. That ending for ${randomPlayerFandom.favPairing} was something else!`,
                `Analyzing the use of ${randomPlayerFandom.pairingInterpretation} in ${randomPlayerFandom.workTitle}. #FandomAnalysis #${randomPlayerFandom.workTitle.replace(/\s/g,'')}`
            ];
            const bigNamePost = createHNPost(bigName.name, `Musings on ${randomPlayerFandom.workTitle}`, bigNamePostContent[Math.floor(Math.random()*bigNamePostContent.length)], 50 + Math.floor(Math.random() * 50));
            gameState.snsPosts.unshift(bigNamePost);
            eventMessage = `Whoa! ${bigName.name} posted about ${randomPlayerFandom.workTitle}! You feel inspired. Deok-ryeok +2.`;
            gameState.deokryeok += 2; snsEventHappened = true;
        }
    } else if (rand < 0.65 && randomPlayerFandom) { 
         const npc = gameState.npcs[Math.floor(Math.random() * gameState.npcs.length)];
         if (npc.type !== 'BigNameCreator' && npc.name !== "SupportiveDeokhuFriend") { 
            const npcPostContent = [
                `Anyone else shipping ${randomPlayerFandom.favPairing} in ${randomPlayerFandom.workTitle}? So good! #OTP`,
                `I can't stop thinking about ${randomPlayerFandom.favCharacter}. Their ${randomPlayerFandom.favCharacterDescription.split(" ")[0]} nature is just *chef's kiss*.`,
                `Hot take: ${randomPlayerFandom.pairingInterpretation} is the ONLY way to write ${randomPlayerFandom.favPairing}. Fight me. #${randomPlayerFandom.favPairing.replace('/','')}Shipper`
            ];
            const npcPost = createHNPost(npc.name, `Random ${randomPlayerFandom.workTitle} Thoughts`, npcPostContent[Math.floor(Math.random()*npcPostContent.length)], 5 + Math.floor(Math.random() * 15));
            gameState.snsPosts.unshift(npcPost);
            eventMessage = `You saw ${npc.name} posting about ${randomPlayerFandom.workTitle}. The fandom is active!`;
            snsEventHappened = true;
         }
    }

    
    if (!snsEventHappened || Math.random() < 0.7) {
        const currentFandom = primaryFandom || randomPlayerFandom;
        const snsPlayerPosts = [
            `Just scrolling through the ${currentFandom?.workTitle || 'fandom'} timeline. #sns`,
            `Thinking about ${currentFandom?.favPairing || 'my OTP'}. Maybe I should write something about their ${currentFandom?.pairingInterpretation || 'dynamic'}... #ficideas`,
            `Ugh, so much drama on the timeline today. Need a break. #fandomlife`,
            `Found an interesting discussion about ${currentFandom?.favCharacter || 'my fave char'} and their ${currentFandom?.favCharacterDescription ? currentFandom.favCharacterDescription.split(/[.,]/)[0] : 'role'}. Some good points!`,
            `Writer's block is real today... Send inspiration! 🙏 #amwriting`
        ];
        const playerPostContent = snsPlayerPosts[Math.floor(Math.random() * snsPlayerPosts.length)];
        const playerPost = createHNPost(gameState.playerName, "Daily Musings", playerPostContent, Math.floor(Math.random()*5), false);
        gameState.snsPosts.unshift(playerPost);
        eventMessage = snsEventHappened ? eventMessage + " You also posted some thoughts." : playerPostContent; 
    }
    addLogEntry(`${logPrefix}${eventMessage}`, "sns");
    if(uiElements['sns-feed'] && (uiElements['sns-feed'] as HTMLElement).style.display === 'block') { renderSNSFeed(); } 
    showNotification(eventMessage, snsEventHappened ? 4000 : 2500);
}
function handleInspirationUnlocks(sourceAction: 'Inspiration' | 'Library' = 'Inspiration'): string {
    let message = sourceAction === 'Library' ? "At the library, you dove into various works, sparking new thoughts." : "You sought inspiration, reflecting on stories and tropes.";
    let unlockedSomething = false;
    const randAction = Math.random();
    const genreUnlockChance = sourceAction === 'Library' ? 0.30 : 0.25;
    const materialUnlockChance = sourceAction === 'Library' ? 0.55 : 0.60;

    if (randAction < genreUnlockChance && gameState.unlockedGenres.length < gameState.availableGenres.length) {
        const availableToUnlock = gameState.availableGenres.filter(g => !gameState.unlockedGenres.includes(g));
        if (availableToUnlock.length > 0) {
            const unlockedItem = availableToUnlock[Math.floor(Math.random() * availableToUnlock.length)];
            gameState.unlockedGenres.push(unlockedItem);
            message = `A flash of insight! You've figured out how to write "${unlockedItem}"! New Genre Unlocked!`;
            populateGenreCheckboxes(); unlockedSomething = true;
        }
    } else if (randAction < materialUnlockChance && gameState.unlockedMaterials.length < gameState.availableMaterials.length) {
        const availableToUnlock = gameState.availableMaterials.filter(m => !gameState.unlockedMaterials.includes(m) && m !== "Sequel to Previous Fic");
         if (availableToUnlock.length > 0) {
            const unlockedItem = availableToUnlock[Math.floor(Math.random() * availableToUnlock.length)];
            gameState.unlockedMaterials.push(unlockedItem);
            message = `An interesting observation sparks an idea for "${unlockedItem}"! New Material Unlocked!`;
            populateMaterialsSelect(); unlockedSomething = true;
        }
    }
    if (gameState.publishedFics.filter(f => f.author === gameState.playerName).length > 0 && !gameState.unlockedMaterials.includes("Sequel to Previous Fic")) {
        gameState.unlockedMaterials.push("Sequel to Previous Fic");
        message = (unlockedSomething ? message + " Also, " : "") + "You feel confident enough to write sequels now! 'Sequel to Previous Fic' Material Unlocked!";
        populateMaterialsSelect(); unlockedSomething = true;
    }
    showNotification(message, unlockedSomething ? 4000 : 2500);
    return message; 
}
function checkSupportiveFriendMilestones() {
    if (!gameState.tutorialFriendEnabled) return;
    const friend = gameState.npcs.find(n => n.name === "SupportiveDeokhuFriend");
    if (!friend) return;

    let milestoneReached = false;
    let friendPostTitle = "";
    let friendPostContent = "";

    if (gameState.writingSkill >= 30 && !gameState.playerMilestones.writingSkillReached30) {
        friendPostTitle = `✨ ${gameState.playerName} 작가님, 글솜씨가 일취월장! ✨`;
        friendPostContent = `대박! ${gameState.playerName} 작가님 글쓰기 스킬이 벌써 30을 넘으셨다니! 😮 역시 될성부른 떡잎은 다르다더니... 앞으로 얼마나 더 멋진 글을 쓰실지 기대돼요! 꾸준함이 비결! #글쓰기장인 #노력은배신하지않는다`;
        gameState.playerMilestones.writingSkillReached30 = true;
        milestoneReached = true;
    } else if (gameState.writingSkill >= 50 && !gameState.playerMilestones.writingSkillReached50) {
        friendPostTitle = `🌟 ${gameState.playerName} 작가님, 프로의 향기가?! 🌟`;
        friendPostContent = `${gameState.playerName} 작가님, 글쓰기 스킬 50 달성 축하드려요! 🥳 이제 정말 프로 작가님이라고 불러도 되겠는데요? 작가님의 다음 대작이 벌써부터 기다려집니다! #존잘님의_길 #문장력폭발`;
        gameState.playerMilestones.writingSkillReached50 = true;
        milestoneReached = true;
    } else if (gameState.popularity >= 50 && !gameState.playerMilestones.popularityReached50) {
        friendPostTitle = `🔥 ${gameState.playerName} 작가님, 인기가 장난 아니에요! 🔥`;
        friendPostContent = `여러분 그거 아세요? ${gameState.playerName} 작가님 인기도가 벌써 50을 돌파했대요! 🤩 역시 좋은 글은 모두가 알아보는 법! 작가님 슈스길만 걸으세요! #대세작가 #인기폭발`;
        gameState.playerMilestones.popularityReached50 = true;
        milestoneReached = true;
    }

    if (milestoneReached) {
        gameState.snsPosts.unshift(createHNPost(friend.name, friendPostTitle, friendPostContent, 10 + Math.floor(Math.random() * 10)));
        addLogEntry(`${friend.name} posted a milestone celebration for ${gameState.playerName}: ${friendPostTitle}`, "milestone");
        if((uiElements['sns-feed'] as HTMLElement)?.style.display === 'block') renderSNSFeed(); 
    }
}

// --- Daily Log Display ---
function renderDailyEventLog() {
    const container = uiElements['daily-log-container'] as HTMLElement;
    const weekFilter = uiElements['log-week-filter'] as HTMLSelectElement;
    if (!container || !weekFilter) return;

    const selectedWeek = weekFilter.value;
    container.innerHTML = ''; 

    const filteredLogs = gameState.dailyLogs.filter(log => {
        return selectedWeek === 'all' || log.week === parseInt(selectedWeek, 10);
    }).sort((a,b) => { 
        if (a.week !== b.week) return b.week - a.week; 
        return b.day - a.day; 
    });


    if (filteredLogs.length === 0) {
        container.innerHTML = '<p>No log entries for the selected period.</p>';
        return;
    }

    filteredLogs.forEach(log => {
        const logDiv = document.createElement('div');
        logDiv.classList.add('log-entry', `log-type-${log.type}`);
        logDiv.innerHTML = `<span class="log-timestamp">[W${log.week}D${log.day}]</span> ${escapeHTML(log.message)}`;
        container.appendChild(logDiv);
    });
}
function populateLogWeekFilter() {
    const weekFilter = uiElements['log-week-filter'] as HTMLSelectElement;
    if (!weekFilter) return;

    const currentSelection = weekFilter.value;
    weekFilter.innerHTML = '<option value="all">Show All Weeks</option>';
    const weeksWithLogs = [...new Set(gameState.dailyLogs.map(log => log.week))].sort((a,b) => b-a); 

    weeksWithLogs.forEach(weekNum => {
        weekFilter.add(new Option(`Week ${weekNum}`, String(weekNum)));
    });
    
    if (weeksWithLogs.includes(parseInt(currentSelection))) {
        weekFilter.value = currentSelection;
    } else {
        weekFilter.value = 'all';
    }
}


// --- Utility Functions ---
function timeAgo(isoTimestamp: string): string {
    if (!isoTimestamp) return 'some time ago';
    const date = new Date(isoTimestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000); if (interval >= 1) return interval + (interval === 1 ? " year ago" : " years ago");
    interval = Math.floor(seconds / 2592000); if (interval >= 1) return interval + (interval === 1 ? " month ago" : " months ago");
    interval = Math.floor(seconds / 86400); if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
    interval = Math.floor(seconds / 3600); if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
    interval = Math.floor(seconds / 60); if (interval >= 1) return interval + (interval === 1 ? " minute ago" : " minutes ago");
    return Math.max(0, Math.floor(seconds)) + " seconds ago";
}
function escapeHTML(str: string | undefined): string {
    if (typeof str === 'undefined' || str === null) return ''; 
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    (uiElements['start-game-button'] as HTMLButtonElement)?.addEventListener('click', () => {
        const apiKey = (uiElements['api-key'] as HTMLInputElement).value.trim();
        const playerName = (uiElements['player-name'] as HTMLInputElement).value.trim();
        const workTitle = (uiElements['fandom-work-title'] as HTMLInputElement).value.trim();
        const favChar = (uiElements['fandom-fav-char'] as HTMLInputElement).value.trim();
        const favCharDesc = (uiElements['fandom-fav-char-desc'] as HTMLTextAreaElement).value.trim();
        const favPairing = (uiElements['fandom-fav-pairing'] as HTMLInputElement).value.trim();
        const tutorialEnabledSetup = (uiElements['initial-tutorial-friend-toggle-setup'] as HTMLInputElement).checked;

        if (!apiKey) { alert('API Key is required!'); return; }
        if (!playerName) { alert('Player Name is required!'); return; }
        if (!workTitle || !favChar || !favPairing) { alert('Primary Fandom (Work Title, Fav Character, Fav Pairing) are required!'); return; }
        if (!favPairing.includes('/')) {alert("Pairing format should be 'CharacterA/CharacterB'."); return;}
        
        if (!gameState.gameInitialized) { 
            gameState.apiKey = apiKey; gameState.playerName = playerName;
            gameState.tutorialFriendEnabled = tutorialEnabledSetup;
            const initialFandomSetId = `fandomset-${gameState.nextFandomSetId++}`;
            gameState.fandomSets = [{
                id: initialFandomSetId, workTitle,
                workDescription: (uiElements['fandom-work-desc'] as HTMLTextAreaElement).value.trim(),
                favCharacter: favChar, favCharacterDescription: favCharDesc,
                favPairing, pairingInterpretation: (uiElements['fandom-pairing-interp'] as HTMLTextAreaElement).value.trim(),
                isPrimary: true, reversePenaltyTriggers: {}, relationshipType: 'new_work'
            }];
            gameState.gameInitialized = true;
            addLogEntry(`Game started by ${playerName}. Tutorial Friend: ${tutorialEnabledSetup ? 'Enabled' : 'Disabled'}.`, "system");
            generateInitialSNSPosts(); 
        }
        (uiElements['tutorial-friend-toggle-main'] as HTMLInputElement).checked = gameState.tutorialFriendEnabled;
        (uiElements['setup-screen'] as HTMLElement).style.display = 'none';
        (uiElements['main-game-screen'] as HTMLElement).style.display = 'block';
        updateAllDisplays(); saveGameState();
    });
    (uiElements['start-week-button'] as HTMLButtonElement)?.addEventListener('click', handleStartWeek);
    (uiElements['manual-save-button'] as HTMLButtonElement)?.addEventListener('click', () => {saveGameState(); showNotification("Game Saved!", 2000);});
    (uiElements['new-game-button'] as HTMLButtonElement)?.addEventListener('click', resetGame);
    (uiElements['manage-fanfic-project-button'] as HTMLButtonElement)?.addEventListener('click', () => {
        if (gameState.activeFanficProject) { openActiveProjectModal(); }
        else { if (gameState.fandomSets.length === 0) { showNotification("Configure Fandom Sets in Profile first!", 4000); openProfileEditModal(); } else { openFanficPlanningModal(); }}
    });
    (uiElements['start-new-project-button'] as HTMLButtonElement)?.addEventListener('click', handleStartNewProject);
    (uiElements['view-active-project-button'] as HTMLButtonElement)?.addEventListener('click', openActiveProjectModal);
    (uiElements['view-fics-button'] as HTMLButtonElement)?.addEventListener('click', () => { renderMyFicsList(); showArea('view-fics-area'); });
    (uiElements['view-sns-button'] as HTMLButtonElement)?.addEventListener('click', () => { renderSNSFeed(); showArea('sns-feed'); });
    (uiElements['analytics-button'] as HTMLButtonElement)?.addEventListener('click', () => {displayAnalytics(); showArea('analytics-area'); });
    (uiElements['edit-profile-button'] as HTMLButtonElement)?.addEventListener('click', openProfileEditModal);
    (uiElements['view-upcoming-events-button'] as HTMLButtonElement)?.addEventListener('click', () => { renderUpcomingEventsList(); showArea('upcoming-events-modal'); });
    (uiElements['finalize-fic-button'] as HTMLButtonElement)?.addEventListener('click', handleFinalizeFic);
    (uiElements['post-fic-button'] as HTMLButtonElement)?.addEventListener('click', handlePostFic);
    (uiElements['submit-to-event-button'] as HTMLButtonElement)?.addEventListener('click', () => {
        if (gameState.activeFanficProject && gameState.activeFanficProject.generatedContent) { handleSubmitToEvent(gameState.activeFanficProject.id, false); } 
        else { alert("Finalize the active fanfic project first!"); }
    });
    (uiElements['clear-fic-button'] as HTMLButtonElement)?.addEventListener('click', () => {
        if(uiElements['generated-fic-output']) (uiElements['generated-fic-output'] as HTMLTextAreaElement).value = '';
        if(uiElements['post-fic-button']) (uiElements['post-fic-button'] as HTMLButtonElement).disabled = true;
        if(uiElements['submit-to-event-button']) (uiElements['submit-to-event-button'] as HTMLButtonElement).disabled = true;
         if(gameState.activeFanficProject) {
             gameState.activeFanficProject.generatedContent = null;
             if(uiElements['finalize-fic-button'] && gameState.activeFanficProject.progress >= gameState.activeFanficProject.targetProgress) {
                 (uiElements['finalize-fic-button'] as HTMLButtonElement).disabled = false;
             }
         }
         saveGameState();
    });
    (uiElements['posts-container'] as HTMLElement)?.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('delete-post-btn')) {
            const postId = target.getAttribute('data-post-id');
            if (postId && confirm('Delete this post? This cannot be undone.')) {
                gameState.snsPosts = gameState.snsPosts.filter(p => p.id !== postId);
                addLogEntry(`Player deleted their SNS post (ID: ${postId}).`, "sns");
                renderSNSFeed(); saveGameState();
            }
        }
    });
    (uiElements['save-general-settings-button'] as HTMLButtonElement)?.addEventListener('click', handleSaveGeneralProfileSettings);
    (uiElements['add-new-fandom-set-button'] as HTMLButtonElement)?.addEventListener('click', () => handleEditFandomSetForm());
    (uiElements['save-fandom-set-button'] as HTMLButtonElement)?.addEventListener('click', handleSaveFandomSet);
    (uiElements['cancel-edit-fandom-set-button'] as HTMLButtonElement)?.addEventListener('click', () => { (uiElements['edit-fandom-set-form'] as HTMLElement).style.display = 'none'; });
    (uiElements['fandom-sets-management-area'] as HTMLElement)?.addEventListener('click', (event) => {
        const target = event.target as HTMLButtonElement;
        const id = target.getAttribute('data-id');
        if (id) {
            if (target.classList.contains('edit-fandom-btn')) handleEditFandomSetForm(id);
            else if (target.classList.contains('delete-fandom-btn')) handleDeleteFandomSet(id);
        }
    });

    
    (uiElements['tutorial-friend-toggle-main'] as HTMLInputElement)?.addEventListener('change', (event) => {
        gameState.tutorialFriendEnabled = (event.target as HTMLInputElement).checked;
        const msg = `Supportive Deokhu Friend ${gameState.tutorialFriendEnabled ? 'enabled' : 'disabled'}.`;
        showNotification(msg);
        addLogEntry(msg, "system");
        if (gameState.tutorialFriendEnabled && !gameState.snsPosts.find(p => p.author === "SupportiveDeokhuFriend" && p.content.includes("환영해요"))) {
            generateInitialSNSPosts(); 
            renderSNSFeed();
        }
        saveGameState();
    });

    
    (uiElements['player-custom-sns-post-button'] as HTMLButtonElement)?.addEventListener('click', () => {
        updatePlayerSnsPostCooldownMessage(); 
        showArea('player-sns-post-modal');
    });
    (uiElements['submit-player-sns-post-button'] as HTMLButtonElement)?.addEventListener('click', handlePlayerSnsPost);
    (uiElements['player-sns-post-content'] as HTMLTextAreaElement)?.addEventListener('input', (event) => {
        const target = event.target as HTMLTextAreaElement;
        const maxLength = parseInt(target.getAttribute('maxlength') || '280', 10);
        const currentLength = target.value.length;
        const remaining = maxLength - currentLength;
        (uiElements['player-sns-post-char-count'] as HTMLElement).textContent = `${remaining} characters remaining`;
    });
    
    
    (uiElements['view-daily-log-button'] as HTMLButtonElement)?.addEventListener('click', () => {
        populateLogWeekFilter();
        renderDailyEventLog();
        showArea('daily-log-modal');
    });
    (uiElements['log-week-filter'] as HTMLSelectElement)?.addEventListener('change', renderDailyEventLog);


    
    const relationshipTypeSelect = uiElements['edit-fandom-relationship-type'] as HTMLSelectElement;
    const baseWorkSelect = uiElements['edit-fandom-base-work-select'] as HTMLSelectElement;
    const workTitleInput = uiElements['edit-fandom-work-title-input'] as HTMLInputElement;
    const workDescInput = uiElements['edit-fandom-work-desc-input'] as HTMLTextAreaElement;
    const baseWorkGroup = uiElements['edit-fandom-base-work-group'] as HTMLElement;

    relationshipTypeSelect?.addEventListener('change', () => {
        const isExtending = relationshipTypeSelect.value !== 'new_work';
        if (baseWorkGroup) baseWorkGroup.style.display = isExtending ? 'block' : 'none';
        if (workTitleInput) workTitleInput.readOnly = isExtending;
        if (workDescInput) workDescInput.readOnly = isExtending;
        
        if (workTitleInput) workTitleInput.classList.toggle('readonly', isExtending);
        if (workDescInput) workDescInput.classList.toggle('readonly', isExtending);
        
        if (isExtending) {
            const currentEditingFandomSetId = (uiElements['edit-fandom-set-id-input'] as HTMLInputElement).value;
            if (baseWorkSelect && (baseWorkSelect.options.length <= 1 || !baseWorkSelect.getAttribute('data-populated'))) { 
                baseWorkSelect.innerHTML = '<option value="">-- Select Base Work --</option>';
                gameState.fandomSets.forEach(fs => {
                     if(fs.id !== currentEditingFandomSetId) baseWorkSelect.add(new Option(`${fs.workTitle} (${fs.favPairing})`, fs.id));
                });
                baseWorkSelect.setAttribute('data-populated', 'true');
            }
            if(baseWorkSelect) baseWorkSelect.value = ""; 
            if(workTitleInput) workTitleInput.value = ""; 
            if(workDescInput) workDescInput.value = "";
        } else { 
            if(workTitleInput) workTitleInput.value = ""; 
            if(workDescInput) workDescInput.value = ""; 
            if (baseWorkSelect) baseWorkSelect.removeAttribute('data-populated');
        }
    });

    baseWorkSelect?.addEventListener('change', () => {
        const selectedBaseId = baseWorkSelect.value;
        if (selectedBaseId && relationshipTypeSelect.value !== 'new_work') { 
            const baseFandom = findFandomSetById(selectedBaseId);
            if (baseFandom && workTitleInput && workDescInput) {
                workTitleInput.value = baseFandom.workTitle;
                workDescInput.value = baseFandom.workDescription;
            }
        } else { 
             if (workTitleInput && workTitleInput.readOnly) workTitleInput.value = ""; 
             if (workDescInput && workDescInput.readOnly) workDescInput.value = "";
        }
    });
}

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', () => {
    const styleSheet = document.getElementById('game-styles');
    if (styleSheet) styleSheet.textContent = gameStyles;
    cacheUIElements();
    initializeGame(); 
    setupEventListeners(); 
    
    if (uiElements['player-sns-post-cooldown-message']) updatePlayerSnsPostCooldownMessage();
});
