// src/state.ts
// Fix: Changed import from updateActiveProjectInfoBar to updateFicActiveProjectInfoBar
import { GoogleGenAI } from "@google/genai";
// Fix: Import Transaction
import { GameState, FandomSet, Transaction, ActiveFanficProject, PublishedFic, WeeklyActionLogEntry } from './types'; // Added ActiveFanficProject, PublishedFic
import { SAVE_KEY, DEFAULT_GEMINI_MODEL_TEXT, ALL_GENRES, ALL_MATERIALS, DEOKCHINI_MESSAGES, DEFAULT_FONT_FAMILY, DEFAULT_LANGUAGE, DEFAULT_PRIMARY_THEME_COLOR, DEFAULT_SECONDARY_THEME_COLOR } from './constants';
// Fix: Import updateActiveProjectInfoBar directly from ./fanfic instead of ./ui
// Fix: Import getUIText from ./ui
import { applyThemeStyles, updateAllDisplays, uiElements, showNotification, applyFontStyles, updateUILanguage, getUIText, showArea } from './ui';
import { setupScheduler } from './gameLoop';
import { generateInitialSNSPosts, renderSNSFeed } from './sns';
import { triggerDeokchiniMilestone } from "./profile";
// Fix: Import updateActiveProjectInfoBar directly from ./fanfic
import { updateActiveProjectInfoBar } from './fanfic';
import { ai, initializeAi } from "./api";
// Fix: Import applyDebugCheatsOnLoad
import { applyDebugCheatsOnLoad } from './debug';


export let gameState: GameState;

export function getDefaultGameState(): GameState {
    const initialFandomSetId = `fandomset-${1}`;
    return {
        apiKey: '', playerName: 'AnonAuthor',
        fandomSets: [{
            id: initialFandomSetId,
            workTitle: 'Default Fandom Work', workDescription: 'A very popular series.',
            favCharacter: 'Character A', favCharacterDescription: 'A stoic and skilled individual with a hidden soft spot.',
            favPairing: 'Character A/Character B',
            pairingInterpretation: 'Classic Enemies to Lovers', isPrimary: true,
            reversePenaltyTriggers: {}, fandomSpecificPopularity: 0,
            relationshipType: "new_work_new_ip", // Default relationship type
        }],
        money: 1000, stamina: 100, maxStamina: 100, writingSkill: 10, popularity: 5, deokryeok: 50,
        currentWeek: 1, currentDay: 1, weeklySchedule: {},
        
        activeFanficProject: null, 

        publishedFics: [], snsPosts: [],
        nextPostId: 1, nextCommentId: 1, nextProjectId: 1, nextFandomSetId: 2,
        npcs: [
            { name: "LoyalFan_01", type: "Fan", relationship: 50, personalityTraits: ["Supportive", "Excitable"], recentPlayerInteraction: null, currentActivity: null },
            { name: "SupportivePal_22", type: "Fan", relationship: 60, personalityTraits: ["Kind", "Creative"], recentPlayerInteraction: null, currentActivity: null },
            { name: "RivalWriter_X", type: "Rival", relationship: 10, personalityTraits: ["Competitive", "Arrogant", "Talented"], recentPlayerInteraction: null, currentActivity: "writing" },
            { name: "ProCritic_99", type: "Rival", relationship: 5, personalityTraits: ["Analytical", "Harsh", "Fair"], recentPlayerInteraction: null, currentActivity: "reading" },
            { name: "BigNameSensei", type: "BigNameCreator", fandomFocus: "Default Fandom Work", personalityTraits: ["Wise", "Respected", "Busy"], recentPlayerInteraction: null, currentActivity: null },
            { name: "TrendingArtist_Y", type: "BigNameCreator", fandomFocus: "Another Popular Work", personalityTraits: ["Stylish", "Prolific", "Friendly"], recentPlayerInteraction: null, currentActivity: null },
            { name: "덕친이", type: "TutorialFriend", relationship: 100, personalityTraits: ["Energetic", "Supportive", "Knowledgeable"], recentPlayerInteraction: null, currentActivity: null }
        ],
        currentEvent: null, registeredEventId: null,
        gameInitialized: false, 
        isNewUser: true, 
        isTutorialVisible: false, 
        controversyScore: 0,
        
        availableGenres: ALL_GENRES,
        unlockedGenres: ["Fluff", "Angst", "Humor", "Slice of Life"],
        availableMaterials: ALL_MATERIALS,
        unlockedMaterials: ["Enemies to Lovers", "Childhood Friends", "Slow Burn", "High School AU", "Coffee Shop AU", "Sequel to Previous Fic"],
        genreProficiency: {},
        lastLivingExpenseWeek: 0,
        favoriteCharacterThemeColor: DEFAULT_PRIMARY_THEME_COLOR,
        achievedMilestones: [],
        lastPlayerSnsPostWeek: 0,
        selectedGeminiModel: DEFAULT_GEMINI_MODEL_TEXT,
        useTextEmphasisOnDarkThemes: false,
        publishedDoujinshis: [],
        nextDoujinshiId: 1,
        activeDoujinshiProduction: null,
        promptLogs: [],
        aiDeveloperMode: false,
        aiSnsGhostwritingEnabled: true, 
        showDeokchiniTutorialOnNewGame: true, 
        selectedFontFamily: DEFAULT_FONT_FAMILY,
        currentLanguage: 'en', 
        themeSecondaryColor: DEFAULT_SECONDARY_THEME_COLOR,
        transactions: [],
        nextTransactionId: 1,
        debugInfiniteStaminaActive: false,
        debugOriginalStamina: 100,
        debugInfiniteMoneyActive: false,
        debugOriginalMoney: 1000,
        debugMaxWritingSkillActive: false,
        debugOriginalWritingSkill: 10,
        debugMaxPopularityActive: false,
        debugOriginalPopularity: 5,
        weeklyActionLog: [], 
    };
}

export function saveGameState() {
    try {
        const stateToSave = JSON.stringify(gameState);
        localStorage.setItem(SAVE_KEY, stateToSave);
        console.log("Game state saved.");
    } catch (error) {
        console.error("Error saving game state:", error);
        showNotification("Failed to save game progress. LocalStorage might be full or disabled.", 5000);
    }
}
export function loadGameState(): boolean {
    const savedState = localStorage.getItem(SAVE_KEY);
    if (savedState) {
        try {
            const loaded = JSON.parse(savedState) as Partial<GameState>;
            const defaultState = getDefaultGameState();
            gameState = { ...defaultState, ...loaded };
            gameState.isNewUser = false; 
            
            gameState.fandomSets = loaded.fandomSets && loaded.fandomSets.length > 0 
                ? loaded.fandomSets.map(fs => ({
                    ...defaultState.fandomSets[0], 
                    ...fs, 
                    fandomSpecificPopularity: fs.fandomSpecificPopularity || 0,
                    relationshipType: fs.relationshipType || "new_work_new_ip" 
                })) 
                : defaultState.fandomSets;

            gameState.npcs = loaded.npcs?.map(n => ({...defaultState.npcs[0], ...n})) || defaultState.npcs;
            if (!gameState.npcs.find(n => n.name === "덕친이")) {
                gameState.npcs.push({ name: "덕친이", type: "TutorialFriend", relationship: 100, personalityTraits: ["Energetic", "Supportive", "Knowledgeable"], recentPlayerInteraction: null, currentActivity: null });
            }
            gameState.unlockedGenres = loaded.unlockedGenres || defaultState.unlockedGenres;
            gameState.availableGenres = defaultState.availableGenres;
            gameState.unlockedMaterials = loaded.unlockedMaterials || defaultState.unlockedMaterials;
            gameState.availableMaterials = defaultState.availableMaterials;
            gameState.weeklySchedule = loaded.weeklySchedule || {};
            gameState.genreProficiency = loaded.genreProficiency || {};
            
            gameState.publishedFics = loaded.publishedFics?.map(fic => ({
                ...defaultState.publishedFics[0], 
                ...fic, 
                genres: Array.isArray(fic.genres) ? fic.genres : [fic.genres].filter(Boolean) as string[],
                isManuallyWritten: typeof fic.isManuallyWritten === 'boolean' ? fic.isManuallyWritten : false,
                aiEvaluationText: fic.aiEvaluationText || null,
                aiEvaluationRating: typeof fic.aiEvaluationRating === 'number' ? fic.aiEvaluationRating : null,
            })) || [];
            
            gameState.activeFanficProject = loaded.activeFanficProject || null;
            if (gameState.activeFanficProject) {
                 gameState.activeFanficProject.isManuallyWritten = typeof gameState.activeFanficProject.isManuallyWritten === 'boolean' ? gameState.activeFanficProject.isManuallyWritten : false;
                 gameState.activeFanficProject.manualContent = gameState.activeFanficProject.manualContent || null;
                 gameState.activeFanficProject.hasBeenRevised = typeof gameState.activeFanficProject.hasBeenRevised === 'boolean' ? gameState.activeFanficProject.hasBeenRevised : false;
            }


            gameState.favoriteCharacterThemeColor = loaded.favoriteCharacterThemeColor || defaultState.favoriteCharacterThemeColor;
            gameState.achievedMilestones = loaded.achievedMilestones || defaultState.achievedMilestones;
            gameState.lastPlayerSnsPostWeek = loaded.lastPlayerSnsPostWeek || defaultState.lastPlayerSnsPostWeek;
            gameState.selectedGeminiModel = loaded.selectedGeminiModel || defaultState.selectedGeminiModel;
            gameState.useTextEmphasisOnDarkThemes = typeof loaded.useTextEmphasisOnDarkThemes === 'boolean' ? loaded.useTextEmphasisOnDarkThemes : defaultState.useTextEmphasisOnDarkThemes;
            gameState.publishedDoujinshis = loaded.publishedDoujinshis || defaultState.publishedDoujinshis;
            gameState.nextDoujinshiId = loaded.nextDoujinshiId || defaultState.nextDoujinshiId;
            gameState.activeDoujinshiProduction = loaded.activeDoujinshiProduction || defaultState.activeDoujinshiProduction;
            gameState.promptLogs = loaded.promptLogs || defaultState.promptLogs;
            gameState.aiDeveloperMode = typeof loaded.aiDeveloperMode === 'boolean' ? loaded.aiDeveloperMode : defaultState.aiDeveloperMode;
            gameState.aiSnsGhostwritingEnabled = typeof loaded.aiSnsGhostwritingEnabled === 'boolean' ? loaded.aiSnsGhostwritingEnabled : defaultState.aiSnsGhostwritingEnabled; 
            gameState.showDeokchiniTutorialOnNewGame = typeof loaded.showDeokchiniTutorialOnNewGame === 'boolean' ? loaded.showDeokchiniTutorialOnNewGame : defaultState.showDeokchiniTutorialOnNewGame;
            gameState.selectedFontFamily = loaded.selectedFontFamily || defaultState.selectedFontFamily;
            gameState.currentLanguage = loaded.currentLanguage || defaultState.currentLanguage;
            gameState.themeSecondaryColor = loaded.themeSecondaryColor || defaultState.themeSecondaryColor;
            
            gameState.transactions = loaded.transactions || defaultState.transactions;
            gameState.nextTransactionId = loaded.nextTransactionId || defaultState.nextTransactionId;
            gameState.debugInfiniteStaminaActive = loaded.debugInfiniteStaminaActive || false;
            gameState.debugOriginalStamina = loaded.debugOriginalStamina !== undefined ? loaded.debugOriginalStamina : defaultState.maxStamina;
            gameState.debugInfiniteMoneyActive = loaded.debugInfiniteMoneyActive || false;
            gameState.debugOriginalMoney = loaded.debugOriginalMoney !== undefined ? loaded.debugOriginalMoney : defaultState.money;
            gameState.debugMaxWritingSkillActive = loaded.debugMaxWritingSkillActive || false;
            gameState.debugOriginalWritingSkill = loaded.debugOriginalWritingSkill !== undefined ? loaded.debugOriginalWritingSkill : defaultState.writingSkill;
            gameState.debugMaxPopularityActive = loaded.debugMaxPopularityActive || false;
            gameState.debugOriginalPopularity = loaded.debugOriginalPopularity !== undefined ? loaded.debugOriginalPopularity : defaultState.popularity;
            gameState.weeklyActionLog = loaded.weeklyActionLog || defaultState.weeklyActionLog; 


            console.log("Game state loaded.");
            return true;
        } catch (error) {
            console.error("Error loading game state:", error);
            localStorage.removeItem(SAVE_KEY); 
            return false;
        }
    }
    gameState = getDefaultGameState(); 
    gameState.isNewUser = true;
    return false;
}
export function resetGame() {
    if (confirm(getUIText('confirmReset'))) {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem('hasSeenDeokchiniTutorial_v1'); 
        gameState = getDefaultGameState(); 
        gameState.isNewUser = true; 
        
        (uiElements['api-key'] as HTMLInputElement).value = '';
        (uiElements['player-name'] as HTMLInputElement).value = '';
        (uiElements['fandom-work-title'] as HTMLInputElement).value = '';
        (uiElements['fandom-work-desc'] as HTMLTextAreaElement).value = '';
        (uiElements['fandom-fav-char'] as HTMLInputElement).value = '';
        (uiElements['fandom-fav-char-desc'] as HTMLTextAreaElement).value = '';
        (uiElements['fandom-fav-pairing'] as HTMLInputElement).value = '';
        (uiElements['fandom-pairing-interp'] as HTMLTextAreaElement).value = '';
        if (uiElements['enable-deokchini-tutorial-toggle']) {
            (uiElements['enable-deokchini-tutorial-toggle'] as HTMLInputElement).checked = gameState.showDeokchiniTutorialOnNewGame;
        }

        updateActiveProjectInfoBar(); 
        applyThemeStyles(gameState.favoriteCharacterThemeColor, gameState.themeSecondaryColor); 
        applyFontStyles(gameState.selectedFontFamily);
        console.log("Game reset.");
        // Call initializeGame to handle the new user/tutorial flow correctly
        initializeGame(); 
    }
}

export function reInitializeGameForSetup() {
    gameState.gameInitialized = false; // Mark as not fully initialized for setup flow
    if (uiElements['setup-screen']) (uiElements['setup-screen'] as HTMLElement).style.display = 'block';
    if (uiElements['main-game-screen']) (uiElements['main-game-screen'] as HTMLElement).style.display = 'none';
    if (uiElements['deokchini-tutorial-screen']) (uiElements['deokchini-tutorial-screen'] as HTMLElement).style.display = 'none';
    gameState.isTutorialVisible = false; // Ensure tutorial is not re-shown
    
    // Populate setup screen toggle based on gameState
    if (uiElements['enable-deokchini-tutorial-toggle']) {
        (uiElements['enable-deokchini-tutorial-toggle'] as HTMLInputElement).checked = gameState.showDeokchiniTutorialOnNewGame;
    }
    updateUILanguage(); // Ensure setup screen language is correct
}


export function initializeGame() {
    loadGameState(); // Sets gameState, including isNewUser

    const hasSeenTutorialBefore = localStorage.getItem('hasSeenDeokchiniTutorial_v1') === 'true';

    if (gameState.isNewUser && gameState.showDeokchiniTutorialOnNewGame && !hasSeenTutorialBefore) {
        console.log("Showing Deokchin-i Tutorial for new user.");
        gameState.isTutorialVisible = true;
        if (uiElements['deokchini-tutorial-screen']) (uiElements['deokchini-tutorial-screen'] as HTMLElement).style.display = 'block';
        if (uiElements['setup-screen']) (uiElements['setup-screen'] as HTMLElement).style.display = 'none';
        if (uiElements['main-game-screen']) (uiElements['main-game-screen'] as HTMLElement).style.display = 'none';
        updateUILanguage(); 
        return; 
    }
    
    if (!gameState.gameInitialized) { 
        console.log("Starting new game setup or continuing previous setup.");
        reInitializeGameForSetup();
    } else { 
        console.log("Resuming saved game.");
        if (uiElements['setup-screen']) (uiElements['setup-screen'] as HTMLElement).style.display = 'none';
        if (uiElements['main-game-screen']) (uiElements['main-game-screen'] as HTMLElement).style.display = 'block';
        if (uiElements['deokchini-tutorial-screen']) (uiElements['deokchini-tutorial-screen'] as HTMLElement).style.display = 'none';

        if (gameState.apiKey) { 
            initializeAi(gameState.apiKey);
        }
        
        applyThemeStyles(gameState.favoriteCharacterThemeColor, gameState.themeSecondaryColor);
        applyFontStyles(gameState.selectedFontFamily);
        updateUILanguage(); 
        updateAllDisplays(); 
        setupScheduler();
        applyDebugCheatsOnLoad(); 

        if (!gameState.snsPosts || gameState.snsPosts.length === 0 || !gameState.snsPosts.some(p => p.author === "FandomNewsBot")) {
            generateInitialSNSPosts();
        }

        if (!gameState.achievedMilestones.includes("welcome_post")) {
            triggerDeokchiniMilestone("welcome_post");
        }
    }
}