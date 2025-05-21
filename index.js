import { SAVE_KEY, // renamed to avoid conflict
getDefaultGameState, gameStyles } from './gameData.js'; // Use .js for browser compatibility if not using a bundler
// --- Game State ---
let gameState;
let uiElements = {};
// --- Game Logic: UI Cache, Save/Load, Init, Updates ---
function cacheUIElements() {
    const ids = [
        'setup-screen', 'main-game-screen', 'start-game-button', 'api-key', 'player-name',
        'initial-fandom-popularity-tier', 'initial-story-mode-checkbox',
        'fandom-work-title', 'fandom-work-desc', 'fandom-fav-char', 'fandom-fav-char-desc', 'fandom-fav-pairing', 'fandom-pairing-interp',
        'stat-money', 'stat-stamina', 'stat-writing', 'stat-popularity', 'stat-deokryeok',
        'stat-week', 'stat-day', 'schedule-days', 'start-week-button', 'scheduler-validation-msg',
        'daily-popup', 'daily-popup-image', 'daily-popup-text', 'daily-project-progress-text',
        'manage-projects-button', 'view-fics-button', 'view-sns-button', 'open-player-custom-sns-post-modal-button',
        'sns-feed', 'posts-container',
        'fanfic-planning-modal', 'plan-fic-fandom-set', 'plan-fic-title', 'plan-fic-genre-checkboxes', 'plan-fic-materials', 'plan-fic-scenario', 'plan-fic-target-progress', 'start-new-project-button', 'plan-fic-sequel-group', 'plan-fic-previous-fic-for-sequel',
        'project-detail-modal', 'modal-project-title', 'modal-project-fandom-set-name', 'modal-project-genre', 'modal-project-materials', 'modal-project-scenario', 'modal-project-progress', 'modal-project-target', 'modal-project-sequel-info', 'modal-project-previous-fic-title',
        'finalize-fic-button', 'fic-loading-indicator', 'generated-fic-output', 'fic-paid-checkbox', 'fic-price-group', 'fic-price-group-small', 'fic-price', 'post-fic-button', 'clear-fic-button', 'submit-to-event-button',
        'view-fics-area', 'my-fics-list',
        'event-bar', 'event-name-display', 'event-fandom-display', 'event-deadline-display', 'view-upcoming-events-button',
        'upcoming-events-modal', 'upcoming-events-list', 'event-submission-fic-selection-area', 'event-submit-fic-select', 'confirm-event-fic-submission-button', 'event-submission-context-info',
        'manual-save-button', 'start-over-button', 'clear-schedule-button', 'edit-profile-button', 'analytics-button', 'view-message-log-button', 'tutorial-friend-toggle-main',
        'analytics-area', 'analytics-content', 'profile-edit-area', 'profile-general-settings',
        'edit-player-name', 'edit-api-key', 'save-general-settings-button',
        'fandom-sets-management-area', 'add-new-fandom-set-button', 'edit-fandom-set-form', 'edit-fandom-set-form-title',
        'edit-fandom-set-id-input', 'edit-fandom-relationship-type', 'select-base-fandom-set-group', 'select-base-fandom-set', 'edit-fandom-popularity-tier-group', 'edit-fandom-popularity-tier',
        'edit-fandom-work-title-input', 'edit-fandom-work-desc-input', 'edit-fandom-fav-char-input', 'edit-fandom-fav-char-desc-input',
        'edit-fandom-fav-pairing-input', 'edit-fandom-pairing-interp-input', 'edit-fandom-is-primary-checkbox',
        'save-fandom-set-button', 'cancel-edit-fandom-set-button',
        'notification-popup', 'notification-text',
        'player-custom-sns-post-modal', 'player-custom-sns-post-title', 'player-custom-sns-post-content', 'player-custom-sns-post-char-count', 'submit-player-custom-sns-post-button', 'player-custom-sns-post-cooldown-message',
        'message-log-area', 'message-log-container',
        'prologue-modal', 'prologue-text', 'close-prologue-button',
        'manage-projects-modal', 'fanfic-projects-list-container', 'plan-new-project-from-manage-button',
        'doujinshi-printing-options-modal', 'doujinshi-modal-title', 'doujinshi-fic-title-span', 'doujinshi-target-fic-id', 'doujinshi-target-event-id', 'doujinshi-is-rerelease-flag',
        'doujinshi-paper-quality', 'doujinshi-cover-quality', 'doujinshi-print-run-size', 'doujinshi-estimated-page-count', 'doujinshi-estimated-printing-cost', 'doujinshi-early-bird-discount-text', 'confirm-doujinshi-printing-button'
    ];
    ids.forEach(id => {
        const element = document.getElementById(id);
        if (element)
            uiElements[id] = element;
        // else console.warn(\`UI Element with id '\${id}' not found.\`);
    });
    document.querySelectorAll('.close-modal-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetId = event.currentTarget.getAttribute('data-target');
            if (targetId && uiElements[targetId] && uiElements[targetId] instanceof HTMLElement) {
                uiElements[targetId].style.display = 'none';
            }
        });
    });
}
function saveGameState() {
    try {
        const stateToSave = JSON.stringify(gameState);
        localStorage.setItem(SAVE_KEY, stateToSave);
    }
    catch (error) {
        console.error("Error saving game state:", error);
        showNotification("Error: Failed to save game progress. LocalStorage might be full or disabled.", 'error', 5000);
    }
}
function loadGameState() {
    const savedState = localStorage.getItem(SAVE_KEY);
    if (savedState) {
        try {
            const loaded = JSON.parse(savedState);
            const defaultState = getDefaultGameState();
            gameState = { ...defaultState, ...loaded };
            gameState.fandomSets = loaded.fandomSets && loaded.fandomSets.length > 0 ? loaded.fandomSets : defaultState.fandomSets;
            gameState.npcs = loaded.npcs && loaded.npcs.length > 0 ? loaded.npcs : defaultState.npcs;
            gameState.fanficProjects = loaded.fanficProjects || [];
            gameState.publishedFics = loaded.publishedFics?.map(fic => ({
                ...fic,
                genres: Array.isArray(fic.genres) ? fic.genres : (fic.genres ? [fic.genres].filter(Boolean) : []),
                materials: Array.isArray(fic.materials) ? fic.materials : (fic.materials ? [fic.materials].filter(Boolean) : []),
                inventory: fic.inventory || 0,
            })) || [];
            gameState.snsPosts = loaded.snsPosts || [];
            gameState.dailyLogs = loaded.dailyLogs || [];
            gameState.notificationLog = loaded.notificationLog || [];
            gameState.weeklySchedule = loaded.weeklySchedule || {};
            gameState.dailyProjectSelections = loaded.dailyProjectSelections || {};
            gameState.unlockedGenres = loaded.unlockedGenres || defaultState.unlockedGenres;
            gameState.availableGenres = defaultState.availableGenres; // Should always come from constants
            gameState.unlockedMaterials = loaded.unlockedMaterials || defaultState.unlockedMaterials;
            gameState.availableMaterials = defaultState.availableMaterials; // Should always come from constants
            gameState.genreProficiency = loaded.genreProficiency || {};
            gameState.tutorialFriendEnabled = typeof loaded.tutorialFriendEnabled === 'boolean' ? loaded.tutorialFriendEnabled : defaultState.tutorialFriendEnabled;
            gameState.storyModeEnabled = typeof loaded.storyModeEnabled === 'boolean' ? loaded.storyModeEnabled : defaultState.storyModeEnabled;
            gameState.prologueShown = typeof loaded.prologueShown === 'boolean' ? loaded.prologueShown : defaultState.prologueShown;
            gameState.lastPlayerCustomSnsPostWeek = loaded.lastPlayerCustomSnsPostWeek || 0;
            gameState.playerMilestones = loaded.playerMilestones || defaultState.playerMilestones;
            gameState.lowStaminaWritingStreak = loaded.lowStaminaWritingStreak || 0;
            if (gameState.fandomSets.length > 0 && !gameState.fandomSets.some(fs => fs.isPrimary)) {
                gameState.fandomSets[0].isPrimary = true;
            }
            if (!gameState.npcs.some(n => n.isMotivationalFriend)) {
                gameState.npcs.push({ name: "SupportiveSenpai_1004", type: "Fan", relationship: 75, fandomFocus: "Any", isMotivationalFriend: true });
            }
            return true;
        }
        catch (error) {
            console.error("Error loading game state:", error);
            localStorage.removeItem(SAVE_KEY);
            return false;
        }
    }
    return false;
}
function startOver() {
    if (confirm("Are you sure you want to start over? All progress will be lost and you will return to the setup screen.")) {
        localStorage.removeItem(SAVE_KEY);
        gameState = getDefaultGameState();
        uiElements['api-key'].value = '';
        uiElements['player-name'].value = '';
        uiElements['fandom-work-title'].value = '';
        uiElements['fandom-work-desc'].value = '';
        uiElements['fandom-fav-char'].value = '';
        uiElements['fandom-fav-char-desc'].value = '';
        uiElements['fandom-fav-pairing'].value = '';
        uiElements['fandom-pairing-interp'].value = '';
        uiElements['initial-fandom-popularity-tier'].value = 'Minor';
        uiElements['initial-story-mode-checkbox'].checked = true;
        if (uiElements['setup-screen'])
            uiElements['setup-screen'].style.display = 'block';
        if (uiElements['main-game-screen'])
            uiElements['main-game-screen'].style.display = 'none';
        addLogEntry("Game reset, returning to setup.", "system");
    }
}
function clearCurrentSchedule() {
    if (confirm("Clear all actions planned for the current week?")) {
        gameState.weeklySchedule = {};
        gameState.dailyProjectSelections = {};
        setupScheduler();
        showNotification("Weekly schedule cleared.", 'info');
        addLogEntry("Weekly schedule cleared by player.", "system");
        saveGameState();
    }
}
function initializeGame() {
    const styleEl = document.getElementById('game-styles');
    if (styleEl)
        styleEl.innerHTML = gameStyles;
    gameState = getDefaultGameState();
    if (loadGameState() && gameState.gameInitialized) {
        if (uiElements['setup-screen'])
            uiElements['setup-screen'].style.display = 'none';
        if (uiElements['main-game-screen'])
            uiElements['main-game-screen'].style.display = 'block';
        if (gameState.dailyLogs.length === 0 || !gameState.dailyLogs.some(l => l.message.includes("Game session started"))) {
            addLogEntry("Game session started. Welcome back!", "system");
        }
    }
    else {
        if (uiElements['setup-screen'])
            uiElements['setup-screen'].style.display = 'block';
        if (uiElements['main-game-screen'])
            uiElements['main-game-screen'].style.display = 'none';
        gameState.gameInitialized = false;
        addLogEntry("New game setup started.", "system");
    }
    uiElements['tutorial-friend-toggle-main'].checked = gameState.tutorialFriendEnabled;
    updateAllDisplays();
    setupScheduler();
    updatePlayerSnsPostCooldownMessage();
}
function showPrologueIfNeeded() {
    if (gameState.storyModeEnabled && !gameState.prologueShown) {
        const senpai = gameState.npcs.find(n => n.isMotivationalFriend);
        const prologueModal = uiElements['prologue-modal'];
        const prologueTextEl = uiElements['prologue-text'];
        if (senpai && prologueModal && prologueTextEl) {
            // FIX: Removed erroneous backslash before template literal start.
            prologueTextEl.innerHTML = `<p><strong>${senpai.name}:</strong> "안녕, ${gameState.playerName}! 드디어 동인계에 발을 들였구나! 정말 환영해! 🎉"</p> <p>"여긴 열정과 창의력이 넘치는 곳이지만, 가끔은 힘들 때도 있을 거야. 하지만 걱정 마! 네 안에는 분명 반짝이는 이야기가 숨겨져 있을 테니까."</p> <p>"팬픽을 쓰고, 사람들과 교류하고, 이벤트를 통해 네 작품을 선보이는 건 정말 멋진 경험이 될 거야. 중요한 건 '좋아서' 하는 마음을 잃지 않는 것!"</p> <p>"체력 관리 잘 하고 (스케줄에서 '휴식' 잊지 마!), 가끔은 SNS에서 다른 작가들 보면서 힘도 얻고, 네 글쓰기 실력도 꾸준히 갈고 닦아봐. '도서관 가기'도 도움이 될 거야."</p> <p>"네가 훌륭한 팬픽 작가가 되는 그날까지, 내가 여기서 응원할게! ✨ 지금부터 너의 이야기를 시작해봐!"</p>`;
            showArea('prologue-modal');
            gameState.prologueShown = true;
            addLogEntry("Prologue shown to player.", "system");
        }
    }
}
function addLogEntry(message, type) {
    if (!message || message.trim() === "")
        return;
    const newEntry = {
        week: gameState.currentWeek,
        day: gameState.currentDay,
        message: message.trim(),
        type
    };
    gameState.dailyLogs.push(newEntry);
    if (gameState.dailyLogs.length > 300) {
        gameState.dailyLogs.shift();
    }
    if (uiElements['message-log-area']?.style.display === 'flex') {
        renderMessageLog();
    }
}
function addNotificationLog(message, type) {
    if (!message || message.trim() === "")
        return;
    const newEntry = {
        timestamp: new Date().toLocaleTimeString(),
        message: message.trim(),
        type
    };
    gameState.notificationLog.push(newEntry);
    if (gameState.notificationLog.length > 100) {
        gameState.notificationLog.shift();
    }
    if (uiElements['message-log-area']?.style.display === 'flex') {
        renderMessageLog();
    }
}
function updateAllDisplays() {
    updateStatsDisplay();
    updateEventDisplay();
    renderSNSFeed();
    renderMyFicsList();
    populateGenreCheckboxes();
    populateMaterialsSelect();
    populateFandomSetSelect(uiElements['plan-fic-fandom-set']);
    uiElements['tutorial-friend-toggle-main'].checked = gameState.tutorialFriendEnabled;
}
function updateStatsDisplay() {
    if (uiElements['stat-money'])
        uiElements['stat-money'].textContent = String(Math.round(gameState.money));
    if (uiElements['stat-stamina'])
        uiElements['stat-stamina'].textContent = ;
    `\${Math.round(gameState.stamina)} / \${Math.round(gameState.maxStamina)}\`;
    if (uiElements['stat-writing']) uiElements['stat-writing'].textContent = String(Math.round(gameState.writingSkill));
    if (uiElements['stat-popularity']) uiElements['stat-popularity'].textContent = String(Math.round(gameState.popularity));
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
            let deadlineText = \`Event Week: \${gameState.currentEvent.eventWeek}\`;
            if (gameState.currentWeek <= gameState.currentEvent.registrationDeadlineWeek && gameState.registeredEventId !== gameState.currentEvent.id) {
                deadlineText += \` (Reg. by Wk \${gameState.currentEvent.registrationDeadlineWeek})\`;
            } else if (gameState.registeredEventId === gameState.currentEvent.id) {
                const submittedFic = gameState.currentEvent.submittedFicId ? gameState.publishedFics.find(f => f.id === gameState.currentEvent!.submittedFicId) : null;
                if (submittedFic) {
                    deadlineText += \` (Registered! "\${escapeHTML(submittedFic.title.substring(0,15))}..." Submitted!)\`;
                } else {
                    deadlineText += \` (Registered! Submit Fic by Wk \${gameState.currentEvent.eventWeek})\`;
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
    if (Math.random() < 0.25 && gameState.fandomSets.length > 0) {
        const targetFandomSet = gameState.fandomSets[Math.floor(Math.random() * gameState.fandomSets.length)];
        const eventTypes: GameEvent['type'][] = ["OnlineContest", "LocalFanMeet", "MajorConvention"];
        const eventNames = {
            "OnlineContest": ["SpeedWrite Challenge", "Themed Flash Fic Contest", "Pairing Popularity Poll", "Genre Bender Fest"],
            "LocalFanMeet": ["Indie Doujin Market", "Local Fan Circle Meetup", "Fandom Cafe Day", "Character Birthday Bash"],
            "MajorConvention": ["AniCon", "Comic Fiesta", "WonderFest", "FandomNation Expo"]
        };
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const name = \`\${targetFandomSet.workTitle} \${eventNames[type][Math.floor(Math.random() * eventNames[type].length)]}\`;
        const announcementWeek = gameState.currentWeek;
        const registrationDeadlineWeek = announcementWeek + EVENT_REGISTRATION_WINDOW_WEEKS;
        const eventWeek = registrationDeadlineWeek + 2 + Math.floor(Math.random() * 2);

        return {
            id: \`event-\${gameState.currentWeek}-\${Math.random().toString(36).substring(2,7)}\`,
            fandomSetId: targetFandomSet.id,
            fandomWorkTitle: targetFandomSet.workTitle,
            name: name,
            description: \`A \${type} event focused on \${targetFandomSet.workTitle}. Showcase your work!\`,
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
            const eventMessage = \`New Event for "\${newEvent.fandomWorkTitle}": \${newEvent.name} (Register by Week \${newEvent.registrationDeadlineWeek}, Event in Week \${newEvent.eventWeek});\`;
            const eventPost = createHNPost(
                "EventBot", \`\${newEvent.name} Announced!\`,
                \`Get ready for \${newEvent.name} (focused on \${newEvent.fandomWorkTitle})! Registration opens now (Cost: \${newEvent.registrationCost}G) and closes at the end of Week \${newEvent.registrationDeadlineWeek}. Event takes place in Week \${newEvent.eventWeek}. Check 'View Events' to register!\`,
                30 + Math.floor(Math.random() * 20), false
            );
            gameState.snsPosts.unshift(eventPost);
            showNotification(eventMessage, 'info');
            addLogEntry(eventMessage, "event");
        }
    }
    updateEventDisplay();
    renderUpcomingEventsList();
}

function renderUpcomingEventsList() {
    const listContainer = uiElements['upcoming-events-list'] as HTMLElement;
    const submissionArea = uiElements['event-submission-fic-selection-area'] as HTMLElement;
    if (!listContainer || !submissionArea) return;
    listContainer.innerHTML = '';
    submissionArea.style.display = 'none';

    if (gameState.currentEvent && gameState.currentEvent.eventWeek >= gameState.currentWeek) {
        const event = gameState.currentEvent;
        const entry = document.createElement('div');
        entry.classList.add('event-entry', 'p-3', 'border-b', 'border-gray-200');
        let registrationStatusHTML = '';
        if (gameState.registeredEventId === event.id) {
            registrationStatusHTML = '<span class="text-green-600 font-semibold">(Registered!)</span>';
            if (!event.submittedFicId) {
                submissionArea.style.display = 'block';
                populateEventFicSubmissionSelect(event.id);
            } else {
                 const submittedFic = gameState.publishedFics.find(f => f.id === event.submittedFicId);
                 if(submittedFic && uiElements['event-submission-context-info']) (uiElements['event-submission-context-info'] as HTMLElement).textContent = \`Already submitted: "\${escapeHTML(submittedFic.title)}"\`;
            }
        } else if (gameState.currentWeek <= event.registrationDeadlineWeek) {
            registrationStatusHTML = \`<button class="register-event-btn btn-primary-sm" data-event-id="\${event.id}">Register (\${event.registrationCost}G)</button>\`;
        } else {
            registrationStatusHTML = '<span class="text-red-600">(Registration Closed)</span>';
        }
        entry.innerHTML = \`
            <h4 class="text-md font-semibold text-purple-700">\${escapeHTML(event.name)} for \${escapeHTML(event.fandomWorkTitle)} \${registrationStatusHTML}</h4>
            <p class="text-sm text-gray-600">\${escapeHTML(event.description)}</p>
            <p class="text-xs text-gray-500"><strong>Type:</strong> \${event.type}</p>
            <p class="text-xs text-gray-500"><strong>Registration Closes:</strong> Week \${event.registrationDeadlineWeek}</p>
            <p class="text-xs text-gray-500"><strong>Event Date:</strong> Week \${event.eventWeek}</p>
        \`;
        listContainer.appendChild(entry);
        const regButton = entry.querySelector('.register-event-btn') as HTMLButtonElement;
        if (regButton) {
            regButton.addEventListener('click', () => handleRegisterForEvent(event.id));
        }
    } else {
        listContainer.innerHTML = '<p class="text-sm text-gray-500">No major events currently announced. Keep an eye on SNS!</p>';
    }
}

function populateEventFicSubmissionSelect(eventId: string) {
    const select = uiElements['event-submit-fic-select'] as HTMLSelectElement;
    const contextInfo = uiElements['event-submission-context-info'] as HTMLElement;
    if (!select || !contextInfo || !gameState.currentEvent || gameState.currentEvent.id !== eventId) return;

    select.innerHTML = '<option value="">-- Select Fic to Submit/Reprint --</option>';
    contextInfo.textContent = '';

    const eligibleFics = gameState.publishedFics.filter(fic =>
        fic.author === gameState.playerName && fic.fandomSetId === gameState.currentEvent!.fandomSetId
    );

    if (eligibleFics.length === 0) {
        select.add(new Option("No eligible fics published for this fandom yet.", ""));
        select.disabled = true;
        (uiElements['confirm-event-fic-submission-button'] as HTMLButtonElement).disabled = true;
        contextInfo.textContent = "You need to publish a fic in this event's fandom first.";
        return;
    }

    eligibleFics.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).forEach(fic => {
        const optionText = \`\${fic.title} \${fic.inventory && fic.inventory > 0 ? \`(\${fic.inventory} in stock)\` : '(No stock - New Print)'}\`;
        select.add(new Option(optionText, fic.id));
    });
    select.disabled = false;
    (uiElements['confirm-event-fic-submission-button'] as HTMLButtonElement).disabled = false;

    select.onchange = () => {
        const selectedFicId = select.value;
        const fic = gameState.publishedFics.find(f => f.id === selectedFicId);
        if (fic) {
            const isReRelease = (fic.inventory || 0) > 0;
            contextInfo.textContent = isReRelease
                ? \`Submitting from stock (Cost: \${EVENT_PRINTING_COST_RERELEASE}G table fee). You can choose to print more.\`
                : \`New print required. Printing options will appear.\`;
        } else {
            contextInfo.textContent = '';
        }
    };
}

function handleRegisterForEvent(eventId: string) {
    const eventToRegister = gameState.currentEvent;
    if (!eventToRegister || eventToRegister.id !== eventId) { alert("Event not found or no longer active."); return; }
    if (gameState.registeredEventId === eventId) { alert("You are already registered for this event!"); return; }
    if (gameState.currentWeek > eventToRegister.registrationDeadlineWeek) { alert("Registration deadline has passed for this event."); return; }
    if (gameState.money < eventToRegister.registrationCost) { alert(\`Not enough money to register! Need \${eventToRegister.registrationCost}G.\`); return; }
    gameState.money -= eventToRegister.registrationCost;
    gameState.registeredEventId = eventId;
    const message = \`Successfully registered for \${eventToRegister.name}! Prepare your fic!\`;
    showNotification(message, 'success');
    addLogEntry(message, "event");
    updateAllDisplays();
    renderUpcomingEventsList();
    saveGameState();
}

function openDoujinshiPrintingModal(ficId: string, eventId: string, isReRelease: boolean) {
    const fic = gameState.publishedFics.find(f => f.id === ficId);
    const event = gameState.currentEvent;
    if (!fic || !event || event.id !== eventId) {
        showNotification("Error: Fic or event not found for printing.", 'error');
        return;
    }

    (uiElements['doujinshi-target-fic-id'] as HTMLInputElement).value = ficId;
    (uiElements['doujinshi-target-event-id'] as HTMLInputElement).value = eventId;
    (uiElements['doujinshi-is-rerelease-flag'] as HTMLInputElement).value = String(isReRelease);
    (uiElements['doujinshi-fic-title-span'] as HTMLElement).textContent = escapeHTML(fic.title);

    const pageCount = fic.pageCount || Math.ceil((fic.content?.length || 2000) / 1800);
    (uiElements['doujinshi-estimated-page-count'] as HTMLElement).textContent = String(pageCount);

    (uiElements['doujinshi-paper-quality'] as HTMLSelectElement).value = 'Standard';
    (uiElements['doujinshi-cover-quality'] as HTMLSelectElement).value = 'Color';
    (uiElements['doujinshi-print-run-size'] as HTMLInputElement).value = isReRelease ? '20' : '50';

    updateDoujinshiCostEstimate();
    showArea('doujinshi-printing-options-modal');
}

function updateDoujinshiCostEstimate() {
    const paperQuality = (uiElements['doujinshi-paper-quality'] as HTMLSelectElement).value as PrintPaperQuality;
    const coverQuality = (uiElements['doujinshi-cover-quality'] as HTMLSelectElement).value as PrintCoverQuality;
    const printRunSize = parseInt((uiElements['doujinshi-print-run-size'] as HTMLInputElement).value, 10) || 0;
    const pageCount = parseInt((uiElements['doujinshi-estimated-page-count'] as HTMLElement).textContent || '0', 10);
    const isReRelease = (uiElements['doujinshi-is-rerelease-flag'] as HTMLInputElement).value === 'true';
    const event = gameState.currentEvent;

    let baseCostPerPage = 2;
    if (paperQuality === "Premium") baseCostPerPage = 3;
    else if (paperQuality === "Budget") baseCostPerPage = 1.5;

    let coverCostBonus = 0;
    if (coverQuality === "PremiumGlossy") coverCostBonus = 50;
    else if (coverQuality === "Color") coverCostBonus = 20;

    let totalPrintingCost = ((pageCount * baseCostPerPage) + coverCostBonus) * printRunSize;
    if (!isReRelease) {
        totalPrintingCost += EVENT_PRINTING_COST_NEW_BASE_FEE;
    }

    const earlyBirdText = uiElements['doujinshi-early-bird-discount-text'] as HTMLElement;
    if (event && gameState.currentWeek < (event.registrationDeadlineWeek - 1) && !isReRelease) {
        totalPrintingCost *= 0.9; // 10% discount
        if (earlyBirdText) earlyBirdText.style.display = 'block';
    } else {
        if (earlyBirdText) earlyBirdText.style.display = 'none';
    }

    (uiElements['doujinshi-estimated-printing-cost'] as HTMLElement).textContent = String(Math.round(totalPrintingCost));
}

function handleConfirmDoujinshiPrinting() {
    const ficId = (uiElements['doujinshi-target-fic-id'] as HTMLInputElement).value;
    const eventId = (uiElements['doujinshi-target-event-id'] as HTMLInputElement).value;
    const isReRelease = (uiElements['doujinshi-is-rerelease-flag'] as HTMLInputElement).value === 'true';
    const paperQuality = (uiElements['doujinshi-paper-quality'] as HTMLSelectElement).value as PrintPaperQuality;
    const coverQuality = (uiElements['doujinshi-cover-quality'] as HTMLSelectElement).value as PrintCoverQuality;
    const printRunSize = parseInt((uiElements['doujinshi-print-run-size'] as HTMLInputElement).value, 10);
    let printingCost = parseFloat((uiElements['doujinshi-estimated-printing-cost'] as HTMLElement).textContent || '0');

    const fic = gameState.publishedFics.find(f => f.id === ficId);
    const event = gameState.currentEvent;

    if (!fic || !event || event.id !== eventId || printRunSize <= 0) {
        showNotification("Error: Invalid data for printing.", 'error'); return;
    }
    if (!fic.pageCount) fic.pageCount = parseInt((uiElements['doujinshi-estimated-page-count'] as HTMLElement).textContent || '10', 10);

    let finalCost = printingCost;
    if (isReRelease) {
        finalCost += EVENT_PRINTING_COST_RERELEASE;
    }

    if (gameState.money < finalCost) {
        showNotification(\`Not enough money! Need \${Math.round(finalCost)}G.\`, 'error'); return;
    }

    if (!confirm(\`Print \${printRunSize} copies of "\${escapeHTML(fic.title)}" with \${paperQuality} paper & \${coverQuality} cover for \${Math.round(finalCost)}G and submit to event?\`)) {
        return;
    }

    gameState.money -= finalCost;
    fic.printQuality = { paper: paperQuality, cover: coverQuality };
    fic.inventory = (fic.inventory || 0) + printRunSize;

    event.submittedFicId = ficId;
    event.isNewSubmission = !isReRelease;

    const message = \`Printed \${printRunSize} copies of "\${escapeHTML(fic.title)}" and submitted to \${escapeHTML(event.name)}! Cost: \${Math.round(finalCost)}G. Current Stock: \${fic.inventory}.\`;
    showNotification(message, 'success');
    addLogEntry(message, "event");

    showArea(null);
    updateAllDisplays();
    renderUpcomingEventsList();
    saveGameState();
}

function handleSubmitToEvent() {
    const selectedFicId = (uiElements['event-submit-fic-select'] as HTMLSelectElement).value;
    const ficToSubmit = gameState.publishedFics.find(f => f.id === selectedFicId);
    const event = gameState.currentEvent;

    if (!event || gameState.registeredEventId !== event.id) {
        showNotification("You are not registered for the current active event, or no event is active.", 'error'); return;
    }
    if (event.submittedFicId) {
        showNotification("You have already submitted a fic for this event.", 'warning'); return;
    }
    if (!ficToSubmit) {
        showNotification("Please select a valid fanfic to submit.", 'warning'); return;
    }
    if (ficToSubmit.fandomSetId !== event.fandomSetId) {
        showNotification(\`This fic is for a different fandom than the event.\`, 'error'); return;
    }

    const isReRelease = (ficToSubmit.inventory || 0) > 0;

    if (isReRelease) {
        if (confirm(\`Submit "\${escapeHTML(ficToSubmit.title)}" from existing stock (\${ficToSubmit.inventory} copies)? Table fee: \${EVENT_PRINTING_COST_RERELEASE}G. Or click 'Cancel' to print additional copies.\`)) {
            if (gameState.money < EVENT_PRINTING_COST_RERELEASE) {
                showNotification(\`Not enough money for table fee! Need \${EVENT_PRINTING_COST_RERELEASE}G.\`, 'error'); return;
            }
            gameState.money -= EVENT_PRINTING_COST_RERELEASE;
            event.submittedFicId = ficToSubmit.id;
            event.isNewSubmission = false;
            const message = \`"\${escapeHTML(ficToSubmit.title)}" (from stock) submitted to \${escapeHTML(event.name)}! Good luck!\`;
            showNotification(message, 'success');
            addLogEntry(message, "event");
            updateAllDisplays();
            renderUpcomingEventsList();
            saveGameState();
        } else {
            openDoujinshiPrintingModal(ficToSubmit.id, event.id, true);
        }
    } else {
        openDoujinshiPrintingModal(ficToSubmit.id, event.id, false);
    }
}

function setupScheduler() {
    const scheduleDaysContainer = uiElements['schedule-days'] as HTMLElement;
    if (!scheduleDaysContainer) return;
    scheduleDaysContainer.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day-schedule');
        const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i - 1];
        dayDiv.innerHTML = \`
            <label for="day-\${i}-action" class="day-label">\${dayName}</label>
            <select id="day-\${i}-action" data-day="\${i}" class="daily-action-select" aria-label="Action for \${dayName}">
                <option value="">-- Select --</option>
                \${gameActions.map(action => \`<option value="\${action.id}">\${action.label}</option>\`).join('')}
            </select>
            <div class="project-select-container" style="display:none; margin-top:5px;">
                <label for="day-\${i}-project" class="small-label">Project:</label>
                <select id="day-\${i}-project" data-day="\${i}" class="daily-project-select" aria-label="Project for \${dayName}">
                    <option value="">-- Select Project --</option>
                </select>
            </div>\`;
        scheduleDaysContainer.appendChild(dayDiv);

        const actionSelectElement = dayDiv.querySelector(\`#day-\${i}-action\`) as HTMLSelectElement;
        const projectSelectContainer = dayDiv.querySelector('.project-select-container') as HTMLElement;
        const projectSelectElement = dayDiv.querySelector(\`#day-\${i}-project\`) as HTMLSelectElement;

        const savedDaySchedule = gameState.weeklySchedule[i];
        if (savedDaySchedule) {
            actionSelectElement.value = savedDaySchedule.actionId;
            if (savedDaySchedule.actionId === 'WriteFicProject' && projectSelectContainer && projectSelectElement) {
                renderProjectSelectForDay(projectSelectElement, i);
                projectSelectElement.value = savedDaySchedule.projectId || "";
                projectSelectContainer.style.display = 'block';
            }
        } else {
            actionSelectElement.value = "";
        }

        actionSelectElement.addEventListener('change', (event) => {
            const day = parseInt((event.target as HTMLElement).dataset.day!, 10);
            const actionId = (event.target as HTMLSelectElement).value;
            const currentDayDiv = (event.target as HTMLElement).closest('.day-schedule');
            const projSelectContainer = currentDayDiv?.querySelector('.project-select-container') as HTMLElement;
            const projSelect = currentDayDiv?.querySelector(\`.daily-project-select[data-day="\${day}"]\`) as HTMLSelectElement;

            if (actionId === 'WriteFicProject' && projSelectContainer && projSelect) {
                renderProjectSelectForDay(projSelect, day); // This now handles auto-selection too
                projSelectContainer.style.display = 'block';
                 // Ensure weeklySchedule is updated with the auto-selected project if one was chosen
                if (projSelect.value) {
                     gameState.weeklySchedule[day] = { actionId, projectId: projSelect.value };
                } else {
                    gameState.weeklySchedule[day] = { actionId, projectId: undefined };
                }
            } else {
                if (projSelectContainer) projSelectContainer.style.display = 'none';
                gameState.dailyProjectSelections[day] = undefined;
                gameState.weeklySchedule[day] = { actionId, projectId: undefined };
            }
            validateScheduler();
        });

        projectSelectElement.addEventListener('change', (event) => {
            const day = parseInt((event.target as HTMLElement).dataset.day!, 10);
            const projectId = (event.target as HTMLSelectElement).value;
            gameState.dailyProjectSelections[day] = projectId;
            if (gameState.weeklySchedule[day]) {
                gameState.weeklySchedule[day].projectId = projectId;
            }
            validateScheduler();
        });
    }
    validateScheduler();
}

function renderProjectSelectForDay(selectElement: HTMLSelectElement, day: number) {
    const currentVal = selectElement.value; // Preserve current selection if valid
    selectElement.innerHTML = '<option value="">-- Select Project --</option>';
    const activeUnfinishedProjects = gameState.fanficProjects.filter(p =>
        p.progress < p.targetProgress && !gameState.publishedFics.some(pf => pf.id === p.id)
    );

    if (activeUnfinishedProjects.length > 0) {
        activeUnfinishedProjects.forEach(p => {
            const progressPercent = Math.round((p.progress / p.targetProgress) * 100);
            selectElement.add(new Option(\`\${p.title.substring(0,15)}... (\${progressPercent}%)\`, p.id));
        });
        selectElement.disabled = false;

        // Try to restore current selection or previously selected for this day, or default to first
        if (currentVal && activeUnfinishedProjects.some(p => p.id === currentVal)) {
            selectElement.value = currentVal;
        } else if (gameState.dailyProjectSelections[day] && activeUnfinishedProjects.some(p => p.id === gameState.dailyProjectSelections[day])) {
            selectElement.value = gameState.dailyProjectSelections[day]!;
        } else { // Default to the first project if no specific selection is applicable
            selectElement.value = activeUnfinishedProjects[0].id;
        }
    } else {
        selectElement.add(new Option("No active projects", ""));
        selectElement.disabled = true;
    }
    // Update gameState with the final selected project ID (could be auto-selected)
    const finalSelectedProjectId = selectElement.value;
    gameState.dailyProjectSelections[day] = finalSelectedProjectId; // Ensure this is always set
    if(gameState.weeklySchedule[day] && gameState.weeklySchedule[day].actionId === 'WriteFicProject'){
        gameState.weeklySchedule[day].projectId = finalSelectedProjectId;
    }
}


function validateScheduler() {
    const startWeekButton = uiElements['start-week-button'] as HTMLButtonElement;
    const schedulerValidationMsg = uiElements['scheduler-validation-msg'] as HTMLElement;
    if (!startWeekButton || !schedulerValidationMsg) return;
    let allSelected = true;
    for (let i = 1; i <= 7; i++) {
        const daySchedule = gameState.weeklySchedule[i];
        if (!daySchedule || !daySchedule.actionId) {
            allSelected = false;
            break;
        }
        if (daySchedule.actionId === 'WriteFicProject' && (!daySchedule.projectId || daySchedule.projectId === "")) {
            allSelected = false;
            break;
        }
    }
    startWeekButton.disabled = !allSelected;
    schedulerValidationMsg.style.display = allSelected ? 'none' : 'block';
}

function showArea(areaId: string | null) {
    ['sns-feed', 'fanfic-planning-modal', 'project-detail-modal', 'view-fics-area', 'analytics-area', 'profile-edit-area',
    'upcoming-events-modal', 'player-custom-sns-post-modal', 'message-log-area', 'prologue-modal', 'manage-projects-modal',
    'doujinshi-printing-options-modal'
    ].forEach(id => {
        const element = uiElements[id] as HTMLElement;
        if (element) element.style.display = 'none'; // Ensure all modals are hidden by default
    });
    if (areaId) {
        const elementToShow = uiElements[areaId] as HTMLElement;
        if (elementToShow) {
             // Use flex for modal-base to enable centering, block for others if needed.
            elementToShow.style.display = elementToShow.classList.contains('modal-base') ? 'flex' : 'block';
        }
    }
}


function showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 4500) {
    const popup = uiElements['notification-popup'] as HTMLElement;
    const textElement = uiElements['notification-text'] as HTMLElement;
    if (popup && textElement) {
        textElement.textContent = message;
        popup.style.display = 'block';
        popup.classList.remove('bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'); // Clear previous
        switch (type) {
            case 'error': popup.classList.add('bg-red-500'); duration = 6000; break;
            case 'warning': popup.classList.add('bg-yellow-500'); duration = 5000; break;
            case 'success': popup.classList.add('bg-green-500'); break;
            case 'info':
            default: popup.classList.add('bg-blue-500'); break;
        }
        addNotificationLog(message, type);
        setTimeout(() => {
            popup.style.display = 'none';
        }, duration);
    }
}

async function processDayAction(day: number): Promise<void> {
    return new Promise(resolve => {
        gameState.currentDay = day;
        updateStatsDisplay();
        const scheduledDay = gameState.weeklySchedule[day];
        const selectedActionId = scheduledDay?.actionId;
        const action = gameActions.find(a => a.id === selectedActionId); // Use gameActions
        const dailyPopup = uiElements['daily-popup'] as HTMLElement;
        const dailyPopupImage = uiElements['daily-popup-image'] as HTMLImageElement;
        const dailyPopupText = uiElements['daily-popup-text'] as HTMLElement;
        const dailyProjectProgressText = uiElements['daily-project-progress-text'] as HTMLElement;

        if (dailyProjectProgressText) dailyProjectProgressText.textContent = '';
        let effectiveStaminaCost = action ? action.staminaCost : 0;
        let actionDescriptionForPopup = action ? action.possibleDescriptions[Math.floor(Math.random() * action.possibleDescriptions.length)] : "Day skipped...";
        let logMessage = \`Day \${day} (\${action?.label || 'Skipped'}): \`;
        let actionFailedDueToStamina = false;

        if (action) {
            if (gameState.stamina <= 0 && action.id !== 'Rest') {
                actionDescriptionForPopup = \`Burnout! Not enough stamina for \${action.label}. You barely managed to rest. (Deokryeok -1, Popularity -1)\`;
                logMessage += \`Attempted \${action.label}, but 0 stamina. Burnout! Deokryeok -1, Pop -1. Minimal Rest.\`;
                gameState.stamina = Math.max(0, gameState.stamina + 5);
                gameState.deokryeok = Math.max(0, gameState.deokryeok - 1);
                gameState.popularity = Math.max(0, gameState.popularity - 1);
                effectiveStaminaCost = 2;
                actionFailedDueToStamina = true;
                gameState.lowStaminaWritingStreak = 0;
            } else if (gameState.stamina < effectiveStaminaCost && action.id !== 'Rest') {
                actionDescriptionForPopup = \`Not enough stamina for \${action.label}! You ended up resting instead.\`;
                logMessage += \`Attempted \${action.label}, but too tired. Rested.\`;
                gameState.stamina += Math.min(10, gameState.maxStamina - gameState.stamina);
                effectiveStaminaCost = 0;
                gameState.lowStaminaWritingStreak = 0;
            }

            if (!actionFailedDueToStamina && action.id === 'WriteFicProject') {
                const projectId = gameState.dailyProjectSelections[day];
                const project = gameState.fanficProjects.find(p => p.id === projectId);
                if (!project || !projectId) {
                    actionDescriptionForPopup = "Attempted to work on a fic, but no project is selected/active for today. Spent some time daydreaming...";
                    effectiveStaminaCost = 5;
                    logMessage += "Attempted to write, no project selected. Stamina -5.";
                    gameState.lowStaminaWritingStreak = 0;
                } else if (project.progress >= project.targetProgress) {
                    actionDescriptionForPopup = \`"\${project.title}" manuscript is complete. Time to finalize or work on another project.\`;
                    effectiveStaminaCost = 5;
                    logMessage += \`Reviewed completed manuscript for "\${project.title}". Stamina -5.\`;
                    gameState.lowStaminaWritingStreak = 0;
                } else {
                    if (gameState.stamina < LOW_STAMINA_WRITING_THRESHOLD) gameState.lowStaminaWritingStreak++; else gameState.lowStaminaWritingStreak = 0;

                    if (gameState.lowStaminaWritingStreak >= BURNOUT_STREAK_THRESHOLD && Math.random() < BURNOUT_CHANCE) {
                        const deokPenalty = Math.max(5, Math.floor(gameState.deokryeok * 0.2));
                        const skillPenalty = Math.max(3, Math.floor(gameState.writingSkill * 0.15));
                        gameState.deokryeok = Math.max(0, gameState.deokryeok - deokPenalty);
                        gameState.writingSkill = Math.max(0, gameState.writingSkill - skillPenalty);
                        gameState.stamina = Math.max(0, gameState.stamina - 15);
                        actionDescriptionForPopup = \`결국 번아웃이 와버렸습니다... 모든 것에 대한 열의가 식어버린 것 같아요. (덕력 -\${deokPenalty}, 글쓰기 스킬 -\${skillPenalty}, 스태미나 추가 감소)\`;
                        logMessage += \`Burnout on project "\${project.title}"! Deokryeok -\${deokPenalty}, Writing Skill -\${skillPenalty}. Stamina -\${effectiveStaminaCost + 15}.\`;
                        addLogEntry(actionDescriptionForPopup, "burnout");
                        showNotification(actionDescriptionForPopup, 'warning', 6000);
                        gameState.lowStaminaWritingStreak = 0;
                        actionFailedDueToStamina = true;
                    } else {
                        let progressRoll = Math.random();
                        let progressMade = 0;
                        let dayQuality = "an okay day";
                        const skillFactor = gameState.writingSkill / 100;

                        if (progressRoll < 0.15 - (skillFactor * 0.10)) { progressMade = 5 + Math.floor(gameState.writingSkill / 20); dayQuality = "a tough writing day"; }
                        else if (progressRoll > 0.85 + (skillFactor * 0.10)) { progressMade = 20 + Math.floor(gameState.writingSkill / 5); dayQuality = "a fantastic writing day"; }
                        else { progressMade = 10 + Math.floor(gameState.writingSkill / 10); }
                        progressMade = Math.max(3, progressMade);
                        project.progress += progressMade;
                        project.progress = Math.min(project.progress, project.targetProgress);

                        const skillGainFromWriting = 0.2 + (gameState.genreProficiency[project.genres.join('/')] || 0) * 0.05 + (progressMade / 50);
                        gameState.writingSkill = Math.min(100, gameState.writingSkill + skillGainFromWriting);

                        const progressPercent = Math.round((project.progress / project.targetProgress) * 100);
                        if (dailyProjectProgressText) dailyProjectProgressText.textContent = \`Project: \${project.title.substring(0, 15)}... Progress: +\${progressMade} (Total: \${progressPercent}%) - It was \${dayQuality}!\`;
                        actionDescriptionForPopup = \`Working hard on "\${project.title}"! It was \${dayQuality}.\`;
                        logMessage += \`Wrote for "\${project.title}". Progress +\${progressMade} (Total: \${progressPercent}%). Writing skill +\${skillGainFromWriting.toFixed(2)}. Stamina -\${effectiveStaminaCost}.\`;

                        if (project.progress >= project.targetProgress && !project.generatedContent) {
                            showNotification(\`Manuscript for "\${project.title}" is complete! Finalize it with AI.\`, 'success');
                            addLogEntry(\`Manuscript for "\${project.title}" complete. Ready to finalize.\`, "milestone");
                        }
                    }
                }
            } else if (!actionFailedDueToStamina) {
                gameState.lowStaminaWritingStreak = 0;
                let statChangesLog = "";
                if (action.staminaGain) { gameState.stamina += action.staminaGain; statChangesLog += \`Stamina +\${action.staminaGain}. \`; }
                if (action.moneyGain) { gameState.money += action.moneyGain; statChangesLog += \`Money +\${action.moneyGain}G. \`; }
                if (action.deokryeokGain) { gameState.deokryeok += action.deokryeokGain; statChangesLog += \`Deokryeok +\${action.deokryeokGain}. \`; }
                if (action.maxStaminaGain) { gameState.maxStamina = Math.min(200, gameState.maxStamina + action.maxStaminaGain); statChangesLog += \`Max Stamina +\${action.maxStaminaGain}. \`; }
                
                if (action.id === 'VisitLibrary') {
                    let skillGain = 0;
                    if (gameState.writingSkill < 30) skillGain = 3;
                    else if (gameState.writingSkill < 50) skillGain = 2;
                    else if (gameState.writingSkill < 70) skillGain = 1;
                    else if (gameState.writingSkill < 90 && Math.random() < 0.5) skillGain = 1;
                    gameState.writingSkill = Math.min(100, gameState.writingSkill + skillGain);
                    if (skillGain > 0) statChangesLog += \`Writing Skill +\${skillGain}. \`;
                    if (Math.random() < 0.15) {
                        const inspirationLog = handleInspirationUnlocks('Library');
                        logMessage += inspirationLog.replace(/.+?:/, "");
                    }
                } else if (action.writingSkillGain) {
                    gameState.writingSkill = Math.min(100, gameState.writingSkill + action.writingSkillGain);
                    statChangesLog += \`Writing Skill +\${action.writingSkillGain}. \`;
                }

                if (action.id === 'SNS') { handleSnsActivityEvents(logMessage); logMessage = ""; }
                else if (action.id === 'Inspiration') { const inspirationLog = handleInspirationUnlocks('Inspiration'); logMessage += inspirationLog.replace(/.+?:/, ""); }
                else if (action.id === 'Source') {
                    let sourceEventLog = "";
                    if (Math.random() < SOURCE_STAMINA_HEAL_CHANCE) {
                        const healedStamina = Math.min(SOURCE_STAMINA_HEAL_AMOUNT, gameState.maxStamina - gameState.stamina);
                        gameState.stamina += healedStamina; sourceEventLog += \` 원작에 치유받았습니다! (스태미나 +\${healedStamina}) \`;
                        showNotification(\`Revisiting source was refreshing! Stamina +\${healedStamina}\`, 'success');
                    }
                    if (Math.random() < SOURCE_SKILL_DROP_CHANCE) {
                        const skillDrop = Math.min(gameState.writingSkill, SOURCE_SKILL_DROP_AMOUNT);
                        gameState.writingSkill = Math.max(0, gameState.writingSkill - skillDrop);
                        const skillDropMsg = \`원작만 너무 많이 봤더니 창작 의욕이 떨어지는 것 같아요... (글쓰기 스킬 -\${skillDrop.toFixed(1)})\`;
                        actionDescriptionForPopup = skillDropMsg; sourceEventLog += \` \${skillDropMsg} \`;
                        addLogEntry(skillDropMsg, "skill_change"); showNotification(skillDropMsg, 'warning', 4000);
                    }
                    logMessage += sourceEventLog;
                }
                logMessage += \`Stamina -\${effectiveStaminaCost}. \${statChangesLog}\`;
            }
            gameState.stamina -= effectiveStaminaCost;
            gameState.stamina = Math.max(0, Math.min(gameState.stamina, gameState.maxStamina));
            gameState.deokryeok = Math.max(0, Math.round(gameState.deokryeok));
            gameState.popularity = Math.round(gameState.popularity);
            gameState.writingSkill = Math.round(gameState.writingSkill);

            if (dailyPopupImage) { dailyPopupImage.src = action.image || 'https://picsum.photos/80/80?grayscale'; dailyPopupImage.alt = action.label; }
            if (dailyPopupText) dailyPopupText.textContent = actionDescriptionForPopup;
            if (dailyPopup) dailyPopup.style.display = 'flex';

            const finalLogMessage = logMessage.replace(\`Day \${day} (\${action?.label || 'Skipped'}): \`, "").trim();
            if (finalLogMessage) addLogEntry(finalLogMessage, "action");

            setTimeout(() => { if (dailyPopup) dailyPopup.style.display = 'none'; resolve(); }, 1200);
        } else {
            gameState.lowStaminaWritingStreak = 0;
            if (dailyPopupImage) { dailyPopupImage.src = \`https://picsum.photos/80/80?random=skip&grayscale\`; dailyPopupImage.alt = "Skipped"; }
            if (dailyPopupText) dailyPopupText.textContent = "Day skipped...";
            if (dailyPopup) dailyPopup.style.display = 'flex';
            addLogEntry(\`Day \${day}: Skipped.\`, "action");
            setTimeout(() => { if (dailyPopup) dailyPopup.style.display = 'none'; resolve(); }, 800);
        }
        updateAllDisplays();
    });
}

async function handleStartWeek() {
    const startWeekButton = uiElements['start-week-button'] as HTMLButtonElement;
    if (startWeekButton && startWeekButton.disabled) return;
    if (startWeekButton) { startWeekButton.disabled = true; startWeekButton.textContent = 'Week in Progress...'; }
    addLogEntry(\`Starting Week \${gameState.currentWeek}.\`, "system");
    for (let i = 1; i <= 7; i++) { await processDayAction(i); }
    gameState.currentWeek++;
    gameState.currentDay = 1;
    const decayAmount = 1 + Math.floor(gameState.currentWeek / 15);
    gameState.deokryeok = Math.max(0, gameState.deokryeok - decayAmount);
    addLogEntry(\`Deok-ryeok naturally decayed by \${decayAmount}. Current: \${Math.round(gameState.deokryeok)}.\`, "system");

    if (gameState.currentWeek > gameState.lastLivingExpenseWeek && (gameState.currentWeek - gameState.lastLivingExpenseWeek) >= LIVING_EXPENSE_INTERVAL_WEEKS) {
        gameState.lastLivingExpenseWeek = gameState.currentWeek;
        if (gameState.money >= LIVING_EXPENSE_AMOUNT) {
            gameState.money -= LIVING_EXPENSE_AMOUNT;
            const msg = \`Living expenses of \${LIVING_EXPENSE_AMOUNT}G paid.\`;
            showNotification(msg, 'info'); addLogEntry(msg, "system");
        } else {
            const msg = "Oh no! You couldn't afford living expenses... Parents helped out, but they seem worried. Stressful! (Stamina -10, Deok-ryeok -10. Parents gave 50G)";
            showNotification(msg, 'warning', 6000); addLogEntry(msg, "system");
            gameState.deokryeok = Math.max(0, gameState.deokryeok - 10);
            gameState.stamina = Math.max(0, gameState.stamina - 10);
            gameState.money += 50;
        }
    }
    // TODO (Future - Doujin Events): Implement post-event titles/medals based on sales and event performance.
    if (gameState.currentEvent && gameState.currentWeek > gameState.currentEvent.eventWeek) {
        let eventOutcomeMessage = \`The event "\${gameState.currentEvent.name}" has now concluded!\`;
        const submittedFic = gameState.currentEvent.submittedFicId ? gameState.publishedFics.find(f => f.id === gameState.currentEvent!.submittedFicId) : null;
        if (submittedFic) {
            const rating = submittedFic.readerRating || 3;
            let popularityGain = (rating * 2) + (gameState.currentEvent.isNewSubmission ? 5 : 2);
            if (gameState.currentEvent.type === "MajorConvention") popularityGain += 5;
            else if (gameState.currentEvent.type === "LocalFanMeet") popularityGain += 2;
            gameState.popularity += popularityGain;

            const qualityBonus = (submittedFic.printQuality?.paper === "Premium" ? 0.1 : 0) + (submittedFic.printQuality?.cover === "PremiumGlossy" ? 0.15 : (submittedFic.printQuality?.cover === "Color" ? 0.05 : 0));
            const maxPotentialSales = Math.round(
                (submittedFic.inventory || 0) *
                (0.25 + (gameState.popularity / 250) + (rating / 15) + (eventTypeBonus(gameState.currentEvent.type)) + qualityBonus - (gameState.currentEvent.isNewSubmission === false ? 0.1 : 0))
            );
            const actualSales = Math.min((submittedFic.inventory || 0), Math.floor(Math.random() * maxPotentialSales) + Math.floor(maxPotentialSales * 0.4));
            const salePrice = submittedFic.ficPrice || DEFAULT_EVENT_SALE_PRICE;
            const moneyEarned = actualSales * salePrice;
            gameState.money += moneyEarned;
            submittedFic.inventory = (submittedFic.inventory || 0) - actualSales;

            eventOutcomeMessage += \` Your fic "\${submittedFic.title}" sold \${actualSales} copies, earning \${moneyEarned}G! (+\${popularityGain} Pop). \${submittedFic.inventory} copies remain.\`;
        } else if (gameState.registeredEventId === gameState.currentEvent.id) {
            eventOutcomeMessage += \` You were registered but didn't submit a fic. A missed opportunity! Pop -2.\`;
            gameState.popularity = Math.max(0, gameState.popularity - 2);
        }
        showNotification(eventOutcomeMessage, 'info', 7000);
        addLogEntry(eventOutcomeMessage, "event");
        const resultPost = createHNPost("EventBot", \`\${gameState.currentEvent.name} Concluded!\`, eventOutcomeMessage, 20 + Math.floor(Math.random()*20), false);
        gameState.snsPosts.unshift(resultPost);
        gameState.currentEvent = null;
        gameState.registeredEventId = null;
    }

    const rival = gameState.npcs.find(n => n.type === "Rival");
    if (rival && Math.random() < 0.33) {
        const primaryFandom = gameState.fandomSets.find(fs => fs.isPrimary) || gameState.fandomSets[0];
        if(primaryFandom) {
            const rivalPostTitle = \`New Fic Dropped: "\${primaryFandom.workTitle} - My Masterpiece Vol.\${Math.floor(Math.random()*5+1)}"\`;
            const rivalPostContent = \`Just released my latest work for \${primaryFandom.workTitle}. The fans are going WILD. Clearly, some of us just have what it takes. My writing skill is probably \${Math.floor(Math.random()*40+60)}/100. #TrueTalent #RivalQuality\`;
            const rivalPost = createHNPost(rival.name, rivalPostTitle, rivalPostContent, 30 + Math.floor(Math.random()*30));
            generateSimulatedComments(rivalPost, 2, 5, { isRivalPost: true });
            gameState.snsPosts.unshift(rivalPost);
            addLogEntry(\`\${rival.name} posted a new fic announcement.\`, "sns");
        }
    }

    checkSupportiveSenpaiMilestones();
    checkAndSetNewEvent();
    updateAllDisplays();
    setupScheduler();
    if (startWeekButton) { startWeekButton.textContent = 'Start Week'; startWeekButton.disabled = false; }
    validateScheduler();
    addLogEntry(\`Week \${gameState.currentWeek-1} ended.\`, "system");
    saveGameState();
}

// --- Fanfic Project System ---
function populateGenreCheckboxes() {
    const container = uiElements['plan-fic-genre-checkboxes'] as HTMLElement;
    if (!container) return;
    container.innerHTML = '';
    gameState.unlockedGenres.forEach(genre => {
        const label = document.createElement('label');
        label.className = "flex items-center space-x-2 text-sm";
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'fic-genre';
        checkbox.value = genre;
        checkbox.id = \`genre-cb-\${genre.replace(/\\s|\\//g, '-')}\`;
        checkbox.setAttribute('aria-label', genre);
        checkbox.className = "form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out";
        checkbox.addEventListener('change', () => {
            const checkedGenres = Array.from(container.querySelectorAll<HTMLInputElement>('input[name="fic-genre"]:checked'));
            if (checkedGenres.length > 2) {
                showNotification("You can select up to 2 genres.", 'warning', 2000);
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
        const currentValues = Array.from(materialsSelect.selectedOptions).map(opt => opt.value);
        materialsSelect.innerHTML = '<option value="">-- None --</option>';
        gameState.unlockedMaterials.forEach(m => {
            const option = new Option(m,m);
            if (currentValues.includes(m)) option.selected = true;
            materialsSelect.add(option);
        });
        materialsSelect.removeEventListener('change', handleMaterialSelectionChange);
        materialsSelect.addEventListener('change', handleMaterialSelectionChange);
    }
}

function handleMaterialSelectionChange() {
    const materialsSelect = uiElements['plan-fic-materials'] as HTMLSelectElement;
    const selectedValues = Array.from(materialsSelect.selectedOptions).map(opt => opt.value);
    const sequelGroup = uiElements['plan-fic-sequel-group'] as HTMLElement;
    if (selectedValues.includes("Sequel to Previous Fic")) {
        populatePreviousFicsForSequelDropdown();
        if(sequelGroup) sequelGroup.style.display = 'block';
    } else {
        if(sequelGroup) sequelGroup.style.display = 'none';
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
        selectElement.add(new Option(\`\${fs.workTitle} (\${fs.favPairing}) \${fs.isPrimary ? "[Primary]" : ""}\`, fs.id));
    });
    if (currentValue && Array.from(selectElement.options).some(opt => opt.value === currentValue)) {
        selectElement.value = currentValue;
    } else if (gameState.fandomSets.length > 0) {
        const primaryFandomSet = gameState.fandomSets.find(fs => fs.isPrimary) || gameState.fandomSets[0];
        selectElement.value = primaryFandomSet.id;
    }
    handleMaterialSelectionChange(); // Update sequel dropdown if needed
}

function openFanficPlanningModal() {
    if (gameState.fandomSets.length === 0) {
        showNotification("You need to set up at least one Fandom Set in your profile before planning a fic!", 'warning', 4000);
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
        } else { alert("If 'Sequel to Previous Fic' is selected, you must choose a previous fic to continue."); return; }
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
            proficiencyWarning += \`The genre "\${genre}" is relatively new to you. \`;
        }
    });
    if (proficiencyWarning) {
        showNotification(\`\${proficiencyWarning}This project might require more effort (Target: \${targetProgress} WU).\`, 'info', 5000);
    }
    const newProject: ActiveFanficProject = {
        id: \`project-\${gameState.nextProjectId++}\`, fandomSetId, title, genres, scenarioPlan, materials,
        progress: 0, targetProgress, generatedContent: null, previousFicIdForSequel
    };
    gameState.fanficProjects.push(newProject);
    const projectMessage = \`New Project Started: "\${title}" for fandom "\${findFandomSetById(fandomSetId)?.workTitle}". (Target: \${targetProgress} WU)\`;
    showNotification(projectMessage, 'success');
    addLogEntry(projectMessage, "system");
    showArea(null);
    setupScheduler(); // Refresh scheduler to include new project
    saveGameState();
}

function openProjectDetailModal(projectId: string) {
    const project = gameState.fanficProjects.find(p => p.id === projectId) || gameState.publishedFics.find(f => f.id === projectId);
    if (!project) {
        showNotification("Project or Fic not found.", 'error');
        return;
    }
    const projectFandomSet = findFandomSetById(project.fandomSetId);
    (uiElements['modal-project-title'] as HTMLElement).textContent = escapeHTML(project.title);
    (uiElements['modal-project-fandom-set-name'] as HTMLElement).textContent = escapeHTML(projectFandomSet?.workTitle || "Unknown Fandom");
    (uiElements['modal-project-genre'] as HTMLElement).textContent = escapeHTML(project.genres.join(', '));
    (uiElements['modal-project-materials'] as HTMLElement).textContent = escapeHTML(project.materials.join(', '));
    (uiElements['modal-project-scenario'] as HTMLElement).textContent = escapeHTML(project.scenarioPlan);

    const isPublished = 'content' in project; // Check if it's a PublishedFic
    const currentProgress = isPublished ? project.targetProgress : (project as ActiveFanficProject).progress;
    (uiElements['modal-project-progress'] as HTMLElement).textContent = String(currentProgress);
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
    const paidCheckbox = uiElements['fic-paid-checkbox'] as HTMLInputElement;
    const priceGroup = uiElements['fic-price-group'] as HTMLElement;
    const priceGroupSmall = uiElements['fic-price-group-small'] as HTMLElement;
    const priceInput = uiElements['fic-price'] as HTMLInputElement;

    finalizeButton.dataset.projectId = project.id;
    postButton.dataset.projectId = project.id;
    submitToEventButton.dataset.projectId = project.id;
    (uiElements['clear-fic-button'] as HTMLButtonElement).dataset.projectId = project.id;

    const activeProject = gameState.fanficProjects.find(p => p.id === project.id); // Re-check if it's an active project

    if (activeProject && activeProject.progress >= activeProject.targetProgress && !activeProject.generatedContent) {
        finalizeButton.disabled = false;
        outputArea.value = "Manuscript complete! Ready to finalize with AI.";
    } else {
        finalizeButton.disabled = true;
        outputArea.value = activeProject?.generatedContent || (isPublished ? (project as PublishedFic).content : "Manuscript in progress...");
    }
    postButton.disabled = !(activeProject?.generatedContent); // Can only post if content is generated and it's an active (not yet published) project

    if (isPublished) { // If it's a PublishedFic
        finalizeButton.disabled = true; // Cannot re-finalize
        postButton.disabled = true; // Cannot re-post from here
        paidCheckbox.checked = (project as PublishedFic).isPaid;
        paidCheckbox.disabled = true;
        priceInput.value = String((project as PublishedFic).ficPrice || DEFAULT_EVENT_SALE_PRICE);
        priceInput.disabled = true;
        const displayPriceGroup = (project as PublishedFic).isPaid ? 'flex' : 'none';
        if (priceGroup) priceGroup.style.display = displayPriceGroup;
        if (priceGroupSmall) priceGroupSmall.style.display = (project as PublishedFic).isPaid ? 'block' : 'none';
    } else { // If it's an ActiveFanficProject (not yet published)
        paidCheckbox.checked = false;
        paidCheckbox.disabled = false;
        priceInput.value = String(DEFAULT_EVENT_SALE_PRICE);
        priceInput.disabled = false;
        if (priceGroup) priceGroup.style.display = 'none';
        if (priceGroupSmall) priceGroupSmall.style.display = 'none';
    }

    if (gameState.currentEvent && 
        gameState.registeredEventId === gameState.currentEvent.id && 
        (activeProject?.generatedContent || isPublished) && 
        project.fandomSetId === gameState.currentEvent.fandomSetId && 
        !gameState.currentEvent.submittedFicId) {
        submitToEventButton.disabled = false;
        submitToEventButton.textContent = \`Submit "\${project.title.substring(0,10)}..." to \${gameState.currentEvent.name.substring(0,10)}...\`;
        submitToEventButton.title = \`Submit this fic to the current event: \${gameState.currentEvent.name}\`;
    } else {
        submitToEventButton.disabled = true;
        submitToEventButton.textContent = 'Submit to Current Event';
        if((activeProject?.generatedContent || isPublished) && gameState.currentEvent && gameState.registeredEventId === gameState.currentEvent.id && project.fandomSetId !== gameState.currentEvent.fandomSetId){
            submitToEventButton.title = \`This fic's fandom (\${projectFandomSet?.workTitle}) doesn't match the event's fandom (\${gameState.currentEvent.fandomWorkTitle}).\`;
        } else if ((activeProject?.generatedContent || isPublished) && gameState.currentEvent && gameState.currentEvent.submittedFicId) {
            submitToEventButton.title = \`A fic has already been submitted to this event.\`;
        } else if (!activeProject?.generatedContent && !isPublished) {
            submitToEventButton.title = \`Finalize the fic manuscript first.\`;
        } else if (!gameState.currentEvent || gameState.registeredEventId !== gameState.currentEvent.id) {
            submitToEventButton.title = \`Not registered for an active event, or no event currently allows submissions.\`;
        }
    }
    (uiElements['fic-loading-indicator'] as HTMLElement).style.display = 'none';
    showArea('project-detail-modal');
}

async function callGeminiAPI_Actual(
    apiKey: string,
    ficPlan: { title: string; genres: string[]; scenarioPlan: string; materials: string[]; fandomSet: FandomSet; previousFicFullText?: string; isSequel: boolean; partNumber?: number; }
): Promise<{ success: boolean; text?: string; error?: string }> {
    if (!apiKey) return { success: false, error: "[Config Error] API Key is missing." };
    const ai = new GoogleGenAI({ apiKey });

    const skill = Math.round(gameState.writingSkill);
    const isFirstFicEver = gameState.publishedFics.filter(f => f.author === gameState.playerName).length === 0 && gameState.fanficProjects.filter(p => p.generatedContent).length === 0;

    let skillDescription = "";
    let lengthGuidance = "The fanfiction should be approximately 500-1000 words and form a complete narrative.";

    if (isFirstFicEver) {
        skillDescription = "This is the author's very first attempt at writing fanfiction. The story should be EXTREMELY simple, using basic vocabulary and short sentences. It may contain awkward phrasing, inconsistencies, or feel very unpolished and incomplete. Plot points might be unclear or jump around. Aim for a 'beginner's first draft' quality, clearly showing a lack of experience. Focus on conveying a very basic plot, even if it's rough and somewhat childish.";
        lengthGuidance = "The fanfiction should be very short, approximately 200-400 words, covering only a single simple event.";
    } else if (skill <= 25) {
        skillDescription = "The author's writing skill is at a novice level (0-25/100). The story should reflect this by being amateurish, possibly with noticeable plot holes, inconsistent characterization, awkward dialogue, or overly simplistic prose. The narrative might feel disjointed or unconvincing. Aim for a 'garbage' to 'below average' quality output. Use simple sentence structures.";
    } else if (skill <= 50) {
        skillDescription = "The author's writing skill is at an intermediate level (26-50/100). The story should be average or decent. It should be generally coherent and readable, but may lack significant depth, originality, or polish. Some parts might be stronger than others, and standard tropes might be used without much unique flair. Aim for an 'average' quality output. Sentence structures can be slightly more varied but still straightforward.";
    } else if (skill <= 75) {
        skillDescription = "The author's writing skill is at a proficient level (51-75/100). The story should be well-written and engaging. It should demonstrate good control of plot, character development, and thematic elements. The prose should be competent, enjoyable, and show some creative use of language or ideas. Aim for a 'good' to 'outstanding' quality output. Use varied sentence structures and some descriptive language.";
    } else {
        skillDescription = "The author's writing skill is at an expert level (76-100/100). The story should be a masterpiece. It needs to be exceptionally well-crafted, emotionally resonant, and memorable. The writing should be polished, sophisticated, and demonstrate a strong, unique authorial voice. Aim for a 'clear masterpiece' quality output. Use complex sentence structures, rich vocabulary, and nuanced thematic exploration.";
    }

    let systemInstructionText = \`You are an AI storyteller highly proficient in various fandom cultures and derivative works (2차 창작). Your primary task is to generate a complete fanfiction based on the detailed settings provided by the player. Deeply explore the characters' emotions, relationships, and the chosen genres/materials to create an original and engaging story. Avoid explicit or violent content. The fanfiction MUST be written naturally in Korean. Do not generate a title, only the body of the fic.
Crucial: The overall writing quality, style, and narrative structure of the generated fanfiction MUST reflect the author's current writing skill level (Writing Skill: \${skill}/100). Refer to the following description:
\${skillDescription}
\${lengthGuidance}
\`;
    if(ficPlan.isSequel && ficPlan.partNumber) { systemInstructionText += \` This fanfiction is part \${ficPlan.partNumber} of a series. It should naturally continue the story from the previous part while also having its own independent entertainment value and sense of completeness.\`;
    }

    let userPromptCore = \`
Author and Primary Work Settings:
Author Name: "\${gameState.playerName}"
Current Author Stats: Writing Skill \${skill}/100, Popularity \${Math.round(gameState.popularity)}, Deok-ryeok \${Math.round(gameState.deokryeok)}/100
Target Work for this Fanfic: "\${ficPlan.fandomSet.workTitle}" (Description: \${ficPlan.fandomSet.workDescription || 'No specifics'})
Favorite Character for this Fanfic: "\${ficPlan.fandomSet.favCharacter}" (Character Description: \${ficPlan.fandomSet.favCharacterDescription || 'No detailed description'})
Favorite Pairing for this Fanfic: "\${ficPlan.fandomSet.favPairing}" (Author's Interpretation: \${ficPlan.fandomSet.pairingInterpretation})

Detailed Creation Request:
The plan for the fanfic to be written is as follows.

Title (for reference, do not include in the body): "\${ficPlan.title}"
Genres: "\${ficPlan.genres.join(', ')}" (Author's average proficiency in these genres: \${(ficPlan.genres.reduce((acc, g) => acc + (gameState.genreProficiency[g] || 0), 0) / (ficPlan.genres.length || 1)).toFixed(1)} / 10)
Key Materials/Tropes: \${ficPlan.materials.join(', ') || 'No specific materials designated'}
Overall Scenario Plan:
"""
\${ficPlan.scenarioPlan}
"""
\`;
    if (ficPlan.isSequel && ficPlan.previousFicFullText && ficPlan.partNumber) {
        userPromptCore += \`
Previous Part Content (reference for continuing story):
This fanfic is a continuation of a series. The previous part (Part \${ficPlan.partNumber-1}) had the following content (may be summarized if too long, focusing on key events and ending):
"""
\${ficPlan.previousFicFullText.substring(0,1500)} 
"""
Please ensure the story flows logically from this previous part.
\`;
    }
    userPromptCore += \`
Focus on the relationship and emotional changes of the main character "\${ficPlan.fandomSet.favCharacter}" and the pairing "\${ficPlan.fandomSet.favPairing}", describing them vividly for reader immersion.
Effectively utilize the characteristics of the selected genres: \${ficPlan.genres.join(', ')}.
Remember, the output quality must clearly reflect the author's writing skill level (\${skill}/100).
The fanfiction output MUST be in Korean.
\`;

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
                    errorMessage = \`[API Safety Stop] Content generation stopped. Reason: \${candidate.finishReason}.\`;
                    if (candidate.finishReason === 'MAX_TOKENS') errorMessage += " The story context or request might be too long.";
                    if (candidate.safetyRatings && candidate.safetyRatings.length > 0) errorMessage += \` Safety issues: \${candidate.safetyRatings.map(r => \`\${r.category} (\${r.probability})\`).join(', ')}\`;
                } else if (!generatedText && candidate.finishReason === 'STOP') errorMessage = "[API Error] Generation finished but no text content was returned.";
            }
            console.error("Gemini API Error/Block (Fic Gen):", errorMessage, genAIResponse);
            return { success: false, error: errorMessage };
        }
    } catch (error: any) {
        console.error("Error calling Gemini API (Fic Gen):", error);
        let detail = error.message || String(error);
        if (error.message && (error.message.includes("token") || error.message.includes("size"))) detail += " (The story context or request might be too long for the AI.)";
        return { success: false, error: \`[SDK/Network Error] \${detail}\` };
    }
}

async function handleFinalizeFic(projectId: string) {
    const project = gameState.fanficProjects.find(p => p.id === projectId);
    if (!project || project.progress < project.targetProgress) { alert("Manuscript is not yet complete!"); return; }
    if (project.generatedContent) { alert("Fic already finalized!"); return; }
    if (!gameState.apiKey) { alert("API Key is not set. Please set it up in Profile."); return; }
    const projectFandomSet = findFandomSetById(project.fandomSetId);
    if (!projectFandomSet) { alert("Fandom set for this project not found. Please check profile settings."); return; }

    let previousFicFullText: string | undefined = undefined;
    let partNumber: number = 1;
    if (project.previousFicIdForSequel) {
        const prevFic = gameState.publishedFics.find(f => f.id === project!.previousFicIdForSequel);
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
        title: project.title, genres: project.genres,
        scenarioPlan: project.scenarioPlan, materials: project.materials,
        fandomSet: projectFandomSet, previousFicFullText, isSequel: !!previousFicFullText, partNumber
    };
    const result = await callGeminiAPI_Actual(gameState.apiKey, ficPlan);
    (uiElements['fic-loading-indicator'] as HTMLElement).style.display = 'none';
    if (result.success && result.text) {
        project.generatedContent = result.text;
        (uiElements['generated-fic-output'] as HTMLTextAreaElement).value = result.text;
        (uiElements['post-fic-button'] as HTMLButtonElement).disabled = false;
        const finalizeMsg = \`"\${project.title}" finalized! Ready to post or submit to event.\`;
        showNotification(finalizeMsg, 'success');
        addLogEntry(finalizeMsg, "system");
    } else {
        (uiElements['generated-fic-output'] as HTMLTextAreaElement).value = \`팬픽 생성 오류: \${result.error}\\n\\nAPI 키, 프롬프트 안전 문제, 또는 Gemini API 서비스 상태를 확인하세요. 요청이 너무 길거나 복잡할 수도 있습니다.\`;
        (uiElements['finalize-fic-button'] as HTMLButtonElement).disabled = false; // Re-enable if failed
        addLogEntry(\`Error finalizing fic "\${project.title}": \${result.error}\`, "error");
    }
    openProjectDetailModal(project.id); // Refresh modal view
    saveGameState();
}

// --- SNS & Posting ---
function createHNPost(author: string, title: string, content: string, initialLikes: number, isPaid: boolean = false, type: HNPost['type'] = 'post'): HNPost {
    const postId = \`post-\${gameState.nextPostId++}\`;
    return {
        id: postId, type, author, title, content,
        timestamp: new Date().toISOString(),
        likes: initialLikes || 0,
        retweets: Math.floor((initialLikes || 0) / (isPaid ? 4 : 2.5)),
        comments: [], commentCount: 0, isPaid
    };
}

function createHNComment(postId: string, author: string, text: string): HNComment {
    const commentId = \`comment-\${gameState.nextCommentId++}\`;
    return { id: commentId, postId, type: 'comment', author, text, timestamp: new Date().toISOString(), replies: [] };
}

function generateInitialSNSPosts() {
    if (gameState.snsPosts.length > 0 && gameState.gameInitialized && gameState.prologueShown) {
        if (!gameState.dailyLogs.some(log => log.message.includes("Initial generic SNS posts generated"))) {
            // Continue
        } else {
            return;
        }
    } else if (!gameState.gameInitialized) {
        return;
    }

    const primaryFandom = gameState.fandomSets.find(fs => fs.isPrimary) || gameState.fandomSets[0];
    if (!primaryFandom) return;

    const fanNPC = gameState.npcs.find(n => n.type === 'Fan' && !n.isMotivationalFriend && n.fandomFocus === primaryFandom.workTitle);
    const rivalNPC = gameState.npcs.find(n => n.type === 'Rival' && n.fandomFocus === primaryFandom.workTitle);
    const antiNPC = gameState.npcs.find(n => n.type === 'Anti');
    const bigNameNPC = gameState.npcs.find(n => n.type === 'BigNameCreator' && n.fandomFocus === primaryFandom.workTitle);

    if (gameState.snsPosts.filter(p => p.author !== "SupportiveSenpai_1004").length === 0) {
        gameState.snsPosts.push(createHNPost("FandomNewsBot", "Welcome to the Feed!", "This is where you'll see posts from yourself and others in the community.", 5));
    }

    if (fanNPC && !gameState.snsPosts.some(p => p.author === fanNPC.name)) {
        gameState.snsPosts.push(createHNPost(fanNPC.name, \`So excited for more \${primaryFandom.workTitle}!\`, \`Just rewatched the latest episode! It was amazing! Can't wait for fan content for \${primaryFandom.favPairing}!\`, 10));
    }
    if (rivalNPC && !gameState.snsPosts.some(p => p.author === rivalNPC.name)) {
        gameState.snsPosts.push(createHNPost(rivalNPC.name, \`Working on my own \${primaryFandom.favPairing} fic...\`, \`Trying a different take on the \${primaryFandom.pairingInterpretation} trope. It's going to be epic. My skill level (\${Math.floor(Math.random()*30+50)}) is probably way higher than any newbie's.\`, 8));
    }
    if (antiNPC && !gameState.snsPosts.some(p => p.author === antiNPC.name)) {
        gameState.snsPosts.push(createHNPost(antiNPC.name, \`Is anyone else tired of \${primaryFandom.workTitle}?\`, \`The writing quality has really dropped off lately imo. And don't get me started on the shipping wars for \${primaryFandom.favPairing}. Some authors clearly don't get the characters.\`, 2));
    }
    if (bigNameNPC && !gameState.snsPosts.some(p => p.author === bigNameNPC.name)) {
        gameState.snsPosts.push(createHNPost(bigNameNPC.name, \`New \${primaryFandom.workTitle} Thoughts\`, \`Just finished pondering the latest arc of \${primaryFandom.workTitle}, especially \${primaryFandom.favCharacter}'s role. Some interesting developments! Looking forward to quality fan works. #\${primaryFandom.workTitle.replace(/\\s/g, '')}\`, 50));
    }
    addLogEntry("Initial generic SNS posts generated.", "system");
}

interface CommentGenerationOptions {
    isRivalPost?: boolean;
}

function generateSimulatedComments(post: HNPost, targetCount: number, ficRatingInput?: number, options?: CommentGenerationOptions) {
    const comments: HNComment[] = [];
    const genericUsernames = ["FanGirl_xoxo", "CoolDude12", "ArtLover99", "StorySeeker", "MemeLord", "KpopStan7", "AnimeWeebPro", "BLFanatic", "OtakuQueen", "NoonaSays", "HyungIsHere", "DongsaengPower"];
    let potentialAuthors = [...genericUsernames, ...gameState.npcs.map(n => n.name)];
    potentialAuthors = potentialAuthors.filter(name => name !== post.author && name !== gameState.playerName);

    for (let i = 0; i < Math.min(targetCount, 10); i++) {
        let commentText = "";
        const author = potentialAuthors[Math.floor(Math.random() * potentialAuthors.length)] || "RandomReader";
        const npcData = gameState.npcs.find(n => n.name === author);
        const authorType = npcData ? npcData.type : 'Generic';
        const isMotivationalFriend = npcData?.isMotivationalFriend;

        let ficRating = ficRatingInput;
        if (typeof ficRating === 'undefined' && !options?.isRivalPost) {
            ficRating = 3 + Math.floor(Math.random() * 3) - 1;
        } else if (options?.isRivalPost) {
            ficRating = Math.random() < 0.8 ? 5 : 4; // Rival's posts get good comments
        }

        if (isMotivationalFriend && post.author === gameState.playerName) {
            commentText = ALL_COMMENTS_VARIETY.positive[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.positive.length)];
        } else if (authorType === 'Anti') {
            commentText = Math.random() < 0.7 ? ALL_COMMENTS_VARIETY.maliciousSarcasticFemale[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.maliciousSarcasticFemale.length)] : ALL_COMMENTS_VARIETY.maliciousSwear[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.maliciousSwear.length)];
        } else if (ficRating === 1) {
            const postedFic = gameState.publishedFics.find(f => f.id === post.id || f.title.startsWith(post.title.split(" (")[0]));
            const isPlayerFic = postedFic?.author === gameState.playerName;
            if (isPlayerFic && ( (gameState.deokryeok < 15 && findFandomSetById(postedFic.fandomSetId!)?.isPrimary) || gameState.controversyScore > 70) ) {
                 commentText = ALL_COMMENTS_VARIETY.maliciousSwear[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.maliciousSwear.length)]; // "Flame hard"
            } else {
                commentText = Math.random() < 0.7 ? ALL_COMMENTS_VARIETY.maliciousSarcasticFemale[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.maliciousSarcasticFemale.length)] : ALL_COMMENTS_VARIETY.maliciousSwear[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.maliciousSwear.length)];
            }
        } else if (ficRating === 2) {
            if (i < Math.floor(targetCount * 0.67) || Math.random() < 0.6) { // Higher chance for sarcastic
                 commentText = ALL_COMMENTS_VARIETY.maliciousSarcasticFemale[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.maliciousSarcasticFemale.length)];
            } else { // Mix of neutral or general negative
                 commentText = Math.random() < 0.5 ? ALL_COMMENTS_VARIETY.neutral[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.neutral.length)] : ALL_COMMENTS_VARIETY.negativeGeneral[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.negativeGeneral.length)];
            }
        } else if (ficRating === 3) { // "Mixed/Std Plot" reactions
             if (i === 0 && Math.random() < 0.5) { // First comment might be negative/sarcastic
                commentText = Math.random() < 0.6 ? ALL_COMMENTS_VARIETY.maliciousSarcasticFemale[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.maliciousSarcasticFemale.length)] : ALL_COMMENTS_VARIETY.negativeGeneral[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.negativeGeneral.length)];
             } else { // Mix of positive and neutral
                commentText = Math.random() < 0.7 ? ALL_COMMENTS_VARIETY.positive[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.positive.length)] : ALL_COMMENTS_VARIETY.neutral[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.neutral.length)];
             }
        } else { // 4-5 stars - "Cider Plot" reactions
            commentText = (Math.random() < 0.15 && authorType !== 'Fan') ? ALL_COMMENTS_VARIETY.neutral[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.neutral.length)] : ALL_COMMENTS_VARIETY.positive[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.positive.length)];
        }

        if (authorType === 'Rival' && ficRating >= 4 && post.author === gameState.playerName) {
            if (Math.random() < 0.4) commentText = ALL_COMMENTS_VARIETY.neutral[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.neutral.length)] + " (나쁘진 않네. 내 다음 작품에 비하면 아직 멀었지만.)";
        } else if (authorType === 'Rival' && ficRating <=2 && post.author === gameState.playerName) {
            if (Math.random() < 0.5) commentText = "흥, 역시 이 정도 실력밖에 안 되는군. 내 발끝에도 못 미쳐.";
        }

        const postedFic = gameState.publishedFics.find(f => f.id === post.id || f.title.startsWith(post.title.split(" (")[0]));
        const ficDeokryeok = postedFic?.author === gameState.playerName ? gameState.deokryeok : 50;
        if (ficDeokryeok < 25 && Math.random() < 0.4 && ficRating < 4 && post.author === gameState.playerName) {
             const ficFandom = postedFic ? findFandomSetById(postedFic.fandomSetId) : null;
             commentText += \` (솔직히 캐릭터(\${ficFandom?.favCharacter || '이름모를애'}) 해석이 좀... 원작이랑 다른데요? \${ficDeokryeok < 15 ? "팬심이 부족하신듯;" : "좀 더 파셔야할듯."})\`;
        }
        if (post.isPaid && Math.random() < 0.3 && ficRating <=3 && !isMotivationalFriend && authorType !== 'Anti') {
            commentText = ALL_COMMENTS_VARIETY.paidNegative[Math.floor(Math.random() * ALL_COMMENTS_VARIETY.paidNegative.length)];
        }

        comments.push(createHNComment(post.id, author, commentText));
    }
    post.comments = comments;
    post.commentCount = comments.length;
}

async function callGeminiAPI_GenerateCommentsForPlayerPost(apiKey: string, playerPostContent: string, playerPostTitle?: string): Promise<{ success: boolean; comments?: string[]; error?: string }> {
    if (!apiKey) return { success: false, error: "[Config Error] API Key for comments is missing." };
    const ai = new GoogleGenAI({ apiKey });

    const primaryFandom = gameState.fandomSets.find(fs => fs.isPrimary) || gameState.fandomSets[0];
    const fandomHistory = gameState.fandomSets.map(fs => \`\${fs.workTitle} (\${fs.favPairing}, \${fs.popularityTier || 'N/A'} tier)\`).join(', ') || "No specific primary fandom yet";
    const recentFics = gameState.publishedFics.filter(f => f.author === gameState.playerName).slice(-2).map(f => \`"\${f.title}" (Genres: \${f.genres.join('/')}, Rating: \${f.readerRating || 'N/A'} stars)\`).join('; ') || "No recent works";

    const systemInstruction = \`
You are an AI that perfectly simulates the speech patterns and behaviors of Korean internet otaku community users in their teens and early twenties.
You need to generate 1-3 natural-sounding comments for the player's SNS post.
Comments should be very short, colloquial, and appropriately use internet memes or slang.
Show a variety of reactions: enthusiastic support, humorous agreement, sarcastic remarks, light complaints, brief personal opinions on the topic, etc.
It's good if you can naturally incorporate the player's current status (nickname, popularity, primary fandom, recent works, controversy score, etc.) into the comments.
Avoid violent or excessively explicit content. All comments MUST be in Korean.
Each comment should be independent and not appear as if multiple comments were made by the same person.
Keep each comment concise, within 2-3 sentences.
The response MUST be a JSON array, where each element is a comment string. Example: ["Comment 1 text", "Comment 2 text"]
\`.trim();

    const userPrompt = \`
Player Information:
Nickname: \${gameState.playerName}
Popularity: \${Math.round(gameState.popularity)}
Current Controversy Score: \${gameState.controversyScore}
Primary Fandom Setting: \${primaryFandom ? \`\${primaryFandom.workTitle} (\${primaryFandom.favPairing}, Character: \${primaryFandom.favCharacter}, Tier: \${primaryFandom.popularityTier})\` : 'Info not available'}
Fandom Activity History Summary: \${fandomHistory}
Recent Works and Ratings: \${recentFics}
Current Writing Skill: \${Math.round(gameState.writingSkill)}/100

Player's SNS Post:
\${playerPostTitle ? \`### Title: \${playerPostTitle}\\n\` : ''}
"""
\${playerPostContent}
"""

Instructions:
Generate 1-3 comments for the player's post above, using the Korean internet otaku slang/tone of teens-early twenties.
Each comment should seem like it's from a different user.
Example tones: "헐 대박ㅋㅋ", "작가님 천재만재ㅠㅠ", "이건 좀 아니지 않냐?", "ㅇㄱㄹㅇ ㅂㅂㅂㄱ", "ㅋㅋㅋㅋㅋ미쳤나봐", "아니 그래서 내 최애는 언제 나오냐고ㅡㅡ", "가보자고~", "언냐 이건 좀...", "XX좌 연성 존버합니다."
Return ONLY the JSON array of comment strings. Example: ["댓글1 내용", "댓글2 내용"]
\`.trim();

    let rawApiResponseText: string | undefined;
    try {
        const geminiApiResponse = await ai.models.generateContent({
            model: GEMINI_MODEL_TEXT, contents: userPrompt,
            config: { systemInstruction, temperature: 0.85, topK: 40, topP: 0.95, responseMimeType: "application/json" }
        });
        rawApiResponseText = geminiApiResponse.text;
        let jsonStr = rawApiResponseText.trim();
        // Updated regex to be more robust and avoid 's' flag issues in some environments
        // FIX: Corrected regex: `;
    s ` became `;
    s `, `;
    n ` became `;
    n `. This fixes issues where `;
    s ` and `;
    n ` were treated as unknown identifiers.
        const fenceRegex = /^` ``(json) ?  : ;
    s * ;
    n ? ([s, S] *  ?  : ) : ;
    n ?  : ;
    s * `` `$/; 
        const match = jsonStr.match(fenceRegex);
        if (match && match[1]) jsonStr = match[1].trim();

        const parsedData = JSON.parse(jsonStr);
        if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
            return { success: true, comments: parsedData.slice(0, 3) };
        } else {
            console.error("Gemini API (Player Comment Gen) - Unexpected JSON structure:", parsedData);
            return { success: false, error: \`[API Error] AI returned comments in an unexpected format. Raw: \${rawApiResponseText ? rawApiResponseText.substring(0,100) : "N/A"}\` };
        }
    } catch (error: any) {
        console.error("Error calling Gemini API (Player Comment Gen):", error, rawApiResponseText);
        let detail = error.message || String(error);
        if (error instanceof SyntaxError && rawApiResponseText) {
            detail = \`Failed to parse JSON response. Error: \${error.message}. Received: "\${rawApiResponseText.substring(0, 200)}..."\`;
        } else if (rawApiResponseText && !detail.includes(rawApiResponseText.substring(0,50))) {
            detail += \` (Received: "\${rawApiResponseText.substring(0,100)}...")\`;
        }
        return { success: false, error: \`[API/SDK Error] \${detail}\` };
    }
}

async function callGeminiAPI_GeneratePlayerAnecdote(apiKey: string, anecdoteType: 'personal_creative' | 'fandom_specific'): Promise<{ success: boolean; text?: string; error?: string}> {
    if (!apiKey) return { success: false, error: "[Config Error] API Key for anecdote is missing." };
    const ai = new GoogleGenAI({ apiKey });
    const randomFandomForAnecdote = gameState.fandomSets.length > 0 ? gameState.fandomSets[Math.floor(Math.random() * gameState.fandomSets.length)] : null;

    const systemInstruction = \`You are an AI that generates short, casual SNS posts (like '썰' or daily thoughts) for a Korean fanfiction author in their teens to early twenties. The post must be 1-3 sentences, in colloquial Korean, and can include internet slang, light self-deprecation, or humor. The output should be a single post text, not a list or JSON.\`;
    
    let userPromptContent = "";
    if (anecdoteType === 'fandom_specific' && randomFandomForAnecdote) {
        userPromptContent = \`
        Player Info: '\${gameState.playerName}' (Writing Skill: \${Math.round(gameState.writingSkill)}/100).
        Current Fandom Focus for this thought: \${randomFandomForAnecdote.workTitle} (Favorite Character: \${randomFandomForAnecdote.favCharacter}, Favorite Pairing: \${randomFandomForAnecdote.favPairing}).

        Task: Generate a short, casual SNS post (1-3 sentences) in Korean where the player shares a random thought, headcanon, "what if" scenario, or a micro-fic idea related to THEIR FANDOM FOCUS (\${randomFandomForAnecdote.workTitle}, its characters, or pairings).
        Examples:
        - "아놔 \${randomFandomForAnecdote.favCharacter} 과거날조썰 쓰다가 내가 눈물 한바가지 흘림 ㅠㅠㅠ #주접"
        - "님들 그거 앎? \${randomFandomForAnecdote.favPairing} 사실 첫만남부터 쌍방삽질이었음;; 이제야 깨달음 ㅋㅋ큐ㅠㅠ"
        - "오늘 \${randomFandomForAnecdote.workTitle} 정주행하는데 \${randomFandomForAnecdote.favCharacter} 대사 하나에 또 과몰입함... 나만 이런거 아니지? 제발 그렇다고 해줘."
        Make it sound natural for a young Korean fanfic author.
        Output only the post text.
        \`;
    } else { // personal_creative
        userPromptContent = \`
        Player Info: '\${gameState.playerName}' (Writing Skill: \${Math.round(gameState.writingSkill)}/100).
        Task: Generate a short, casual SNS post (1-3 sentences) in Korean about the player's general creative process, writing struggles, minor daily observations as a fanfic author, or humorous thoughts. Avoid specific fandom details.
        Examples:
        - "밤새도록 글쓰다 해떴네... 내 허리 돌려줘... 하지만 후회는 없다... 아마도?"
        - "커피 수혈 없이는 한 줄도 못 쓰는 병에 걸렸습니다..."
        - "영감이 떠오를랑 말랑... 밀당 고수시네 아주 그냥;"
        Make it sound natural for a young Korean fanfic author.
        Output only the post text.
        \`;
    }
    
    try { 
        const response = await ai.models.generateContent({model: GEMINI_MODEL_TEXT, contents: userPromptContent, config: {systemInstruction, temperature: 0.9}}); 
        if (response.text) { return { success: true, text: response.text.trim() }; } 
        else { 
             console.error("Gemini Anecdote API did not return text. Response:", response);
            return { success: false, error: "AI did not return text for anecdote."}; 
        } 
    } catch (error: any) { 
        console.error("Error calling Gemini for Player Anecdote:", error); 
        return { success: false, error: \`[API Error] \${error.message}\`};
    }
}

function renderHNComment(comment: HNComment, isReply: boolean = false): HTMLElement {
    const commentDiv = document.createElement('div');
    commentDiv.classList.add('hn-comment');
    if (isReply) { commentDiv.style.marginLeft = '20px'; } // Simple indent for replies
    commentDiv.innerHTML = \`
        <div class="hn-comment-header"><strong>\${escapeHTML(comment.author)}</strong> - \${timeAgo(comment.timestamp)}</div>
        <div class="hn-comment-body">\${escapeHTML(comment.text)}</div>
        <div class="hn-comment-footer"><button class="reply-comment-btn btn-secondary-sm !text-xs !py-0.5 !px-1.5" data-comment-id="\${comment.id}" data-post-id="\${comment.postId}" title="Reply functionality not implemented yet." disabled>Reply</button></div>
        \${comment.replies && comment.replies.length > 0 ? '<div class="hn-replies"></div>': ''}
    \`;
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
    if (gameState.snsPosts.length === 0) { postsContainer.innerHTML = '<p class="text-sm text-gray-500">No posts on the feed yet.</p>'; return; }

    const sortedPosts = [...gameState.snsPosts].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    sortedPosts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('hn-post'); postDiv.id = \`post-\${post.id}\`;
        let deleteButtonHTML = post.author === gameState.playerName ? \`<button class="delete-post-btn btn-danger-sm !text-xs !py-0.5 !px-1.5 absolute top-2 right-2" data-post-id="\${post.id}">Del</button>\` : '';
        postDiv.innerHTML = \`
            <div class="hn-post-header relative"><strong>\${escapeHTML(post.author)}</strong> - \${timeAgo(post.timestamp)}\${deleteButtonHTML}</div>
            <h3 class="hn-post-title">\${escapeHTML(post.title)} \${post.isPaid ? '<span class="text-green-600 text-xs font-semibold">[유료💰]</span>': ''}</h3>
            <div class="hn-post-content"><pre>\${escapeHTML(post.content)}</pre></div>
            <div class="hn-post-footer"><span>Likes: \${post.likes}</span><span>Retweets: \${post.retweets}</span><span>Comments: \${post.commentCount}</span></div>
            <div class="hn-comments-section" id="comments-for-\${post.id}"><h4>Comments</h4>\${post.comments.length === 0 ? '<p style="font-size:0.9em; color:#777;">No comments yet.</p>' : ''}</div>
        \`;
        const commentsSection = postDiv.querySelector(\`#comments-for-\${post.id}\`) as HTMLElement;
        if (commentsSection && post.comments.length > 0) {
            const sortedComments = [...post.comments].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            sortedComments.forEach(comment => { commentsSection.appendChild(renderHNComment(comment)); });
        }
        postsContainer.appendChild(postDiv);
        const deleteBtn = postDiv.querySelector('.delete-post-btn');
        deleteBtn?.addEventListener('click', (e) => {
            const postIdToDelete = (e.target as HTMLButtonElement).dataset.postId;
            if (postIdToDelete && confirm("Delete this SNS post?")) {
                gameState.snsPosts = gameState.snsPosts.filter(p => p.id !== postIdToDelete);
                renderSNSFeed();
                saveGameState();
                showNotification("Post deleted.", "info");
            }
        });
    });
}

async function handleSubmitPlayerCustomSnsPost() {
    const titleInput = uiElements['player-custom-sns-post-title'] as HTMLInputElement;
    const contentInput = uiElements['player-custom-sns-post-content'] as HTMLTextAreaElement;
    const submitButton = uiElements['submit-player-custom-sns-post-button'] as HTMLButtonElement;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!content) { showNotification("SNS post content cannot be empty.", 'warning'); return; }
    if (content.length > 280) { showNotification("SNS post content cannot exceed 280 characters.", 'warning'); return; }

    submitButton.disabled = true; submitButton.textContent = 'Posting...';

    const newPlayerPost = createHNPost(gameState.playerName, title || "Musings", content, Math.floor(Math.random() * 5) + 1, false, "player_custom_post");

    if (gameState.apiKey) {
        const commentResult = await callGeminiAPI_GenerateCommentsForPlayerPost(gameState.apiKey, content, title);
        if (commentResult.success && commentResult.comments) {
            commentResult.comments.forEach(commentText => {
                const potentialCommenters = gameState.npcs.filter(n => n.type !== 'PublisherBot').map(n => n.name).concat(["RandomUser1", "NetizenCool", "FandomVoice_Active", "PasserbyFan"]);
                const commenter = potentialCommenters[Math.floor(Math.random() * potentialCommenters.length)];
                newPlayerPost.comments.push(createHNComment(newPlayerPost.id, commenter, commentText));
            });
            newPlayerPost.commentCount = newPlayerPost.comments.length;
        } else {
            showNotification(\`Error generating AI comments: \${commentResult.error || "Unknown error"}. Post will appear without AI comments.\`, 'error', 4000);
            addLogEntry(\`Error generating AI comments for player SNS post: \${commentResult.error || "Unknown error"}.\`, "error");
        }
    } else {
        showNotification("API Key not set. Player post will appear without AI comments.", "warning");
    }

    gameState.snsPosts.unshift(newPlayerPost);
    gameState.lastPlayerCustomSnsPostWeek = gameState.currentWeek;

    const postMessage = \`You posted to SNS: "\${escapeHTML(title) || escapeHTML(content.substring(0, 20)) + "..."}"\`;
    showNotification(postMessage, 'success'); addLogEntry(postMessage, "sns");

    titleInput.value = ''; contentInput.value = '';
    if (uiElements['player-custom-sns-post-char-count']) (uiElements['player-custom-sns-post-char-count'] as HTMLElement).textContent = '280 characters remaining';

    showArea(null); renderSNSFeed(); updatePlayerSnsPostCooldownMessage(); saveGameState();
    submitButton.disabled = false; submitButton.textContent = 'Post to SNS';
}

function updatePlayerSnsPostCooldownMessage() {
    const cooldownMessageEl = uiElements['player-custom-sns-post-cooldown-message'] as HTMLElement;
    const openModalButton = uiElements['open-player-custom-sns-post-modal-button'] as HTMLButtonElement;
    const submitModalButton = uiElements['submit-player-custom-sns-post-button'] as HTMLButtonElement;

    const weeksSinceLastPost = gameState.currentWeek - gameState.lastPlayerCustomSnsPostWeek;
    const canPost = weeksSinceLastPost >= PLAYER_CUSTOM_SNS_POST_COOLDOWN_WEEKS || gameState.lastPlayerCustomSnsPostWeek === 0;

    if (openModalButton) openModalButton.disabled = !canPost;
    if (submitModalButton) submitModalButton.disabled = !canPost;

    if (cooldownMessageEl) {
        if (canPost) {
            cooldownMessageEl.textContent = \`You can make a custom post now! (Cooldown: \${PLAYER_CUSTOM_SNS_POST_COOLDOWN_WEEKS} weeks)\`;
            cooldownMessageEl.style.color = "green";
        } else {
            const weeksRemaining = PLAYER_CUSTOM_SNS_POST_COOLDOWN_WEEKS - weeksSinceLastPost;
            cooldownMessageEl.textContent = \`You can post again in \${weeksRemaining} week(s).\`;
            cooldownMessageEl.style.color = "#777";
        }
    }
}

function handlePostFic(projectId: string) {
    const project = gameState.fanficProjects.find(p => p.id === projectId);
    if (!project || !project.generatedContent) { alert("Please finalize the active fanfic project with AI first."); return; }
    if (gameState.publishedFics.some(f => f.id === project.id)) { alert("This fic has already been published!"); return; }

    const ficText = project.generatedContent;
    const isPaid = (uiElements['fic-paid-checkbox'] as HTMLInputElement).checked;
    const ficPrice = parseInt((uiElements['fic-price'] as HTMLInputElement).value, 10) || undefined;

    const ficTitleBase = project.title;
    const partNumberSuffix = project.previousFicIdForSequel ? \` (Pt. \${gameState.publishedFics.filter(f => f.title.startsWith(ficTitleBase.split(" Pt.")[0])).length + 1})\` : "";
    const paidSuffix = isPaid ? ' (유료💰)' : '';
    const ficDisplayTitle = \`\${ficTitleBase}\${partNumberSuffix}\${paidSuffix}\`;

    let readerRating = 2 + Math.floor(gameState.writingSkill / 25) + Math.floor(gameState.deokryeok / 25);
    readerRating = Math.round(readerRating / 1.8);
    if (isPaid) readerRating -= 1;
    const isFirstPlayerFic = gameState.publishedFics.filter(f => f.author === gameState.playerName).length === 0;
    if (isFirstPlayerFic) {
        readerRating = Math.max(1, Math.min(2, Math.floor(Math.random() * 2) + 1));
    } else {
        readerRating = Math.max(1, Math.min(5, readerRating + (Math.floor(Math.random() * 3) -1) ));
    }

    const baseLikes = Math.floor(gameState.popularity / 2.5 + gameState.writingSkill / 3.5 + gameState.deokryeok / 4.5 + readerRating * 3.5);
    const initialLikes = Math.max(1, isPaid ? Math.floor(baseLikes * 0.5) : baseLikes);
    const newPost = createHNPost(gameState.playerName, ficDisplayTitle, ficText, initialLikes, isPaid, "post");
    const targetCommentCount = Math.max(1, Math.floor(gameState.popularity / 12 + gameState.writingSkill / 18 + gameState.deokryeok / 25 + readerRating) + (isPaid ? 1 : 0) );
    generateSimulatedComments(newPost, targetCommentCount, readerRating);
    gameState.snsPosts.unshift(newPost);

    const newPublishedFic: PublishedFic = {
        id: project.id, fandomSetId: project.fandomSetId, title: ficTitleBase,
        content: ficText, genres: project.genres, materials: project.materials, scenarioPlan: project.scenarioPlan,
        timestamp: new Date().toISOString(), author: gameState.playerName, isPaid, ficPrice,
        targetProgress: project.targetProgress, readerRating: readerRating, memo: "",
        previousFicIdForSequel: project.previousFicIdForSequel,
        pageCount: Math.ceil(ficText.length / 1800)
    };
    gameState.publishedFics.push(newPublishedFic);
    gameState.playerMilestones.publishedFicCount = (gameState.playerMilestones.publishedFicCount || 0) + 1;

    const currentFandomSet = findFandomSetById(project.fandomSetId);
    if (currentFandomSet && currentFandomSet.isPrimary) {
        const [charA, charB] = currentFandomSet.favPairing.split('/');
        if (charA && charB && currentFandomSet.favPairing.includes('/')) {
            const originalPairing = \`\${charA}/\${charB}\`;
            const reversedPairingAttempt = \`\${charB}/\${charA}\`;
            if (currentFandomSet.favPairing === reversedPairingAttempt && !(currentFandomSet.reversePenaltyTriggers || {})[originalPairing]) {
                const penalty = Math.round(gameState.popularity * 0.70);
                gameState.popularity = Math.max(0, gameState.popularity - penalty);
                const reverseMsg = \`REVERSE PAIRING ALERT! You published a fic for "\${reversedPairingAttempt}" which is a reverse of a known primary pairing (\${originalPairing}) for these characters. Some fans are upset! Popularity -\${penalty} (70%). This penalty is one-time per original pairing.\`;
                showNotification(reverseMsg, 'warning', 8000);
                addLogEntry(reverseMsg, "sns");
                if (!currentFandomSet.reversePenaltyTriggers) currentFandomSet.reversePenaltyTriggers = {};
                currentFandomSet.reversePenaltyTriggers[originalPairing] = true;
            }
        }
    }

    project.genres.forEach(genre => { gameState.genreProficiency[genre] = (gameState.genreProficiency[genre] || 0) + 1; });
    let popularityChange = 1 + Math.floor(gameState.writingSkill / 20) + Math.floor(gameState.deokryeok / 25) - (isPaid ? 1 : 0) + (readerRating - 2.5);
    popularityChange = Math.round(popularityChange);
    gameState.popularity = Math.max(0, gameState.popularity + popularityChange);
    if (isPaid) {
        gameState.controversyScore += 10;
        if (Math.random() < OFFICIAL_WARNING_CHANCE_FOR_PAID_CONTENT) {
            const warningTitle = \`[Official Notice] Regarding Monetization of "\${currentFandomSet?.workTitle || 'Related'}" Fan Content\`;
            const warningContent = \`Dear Creator \${gameState.playerName},\\nWe have noted your recent paid fanfiction release. While we appreciate fan enthusiasm, please be reminded that commercializing content based on our IP without explicit permission can lead to complications. We urge creators to review our official fan content guidelines. Continued unapproved monetization may result in further action.\\n\\nSincerely,\\n\${gameState.npcs.find(n => n.type === 'PublisherBot')?.name || 'SourceMaterialPublisher_Bot'}\`;
            const warningPost = createHNPost(gameState.npcs.find(n => n.type === 'PublisherBot')?.name || 'SourceMaterialPublisher_Bot', warningTitle, warningContent, 0, false);
            gameState.snsPosts.unshift(warningPost);
            gameState.controversyScore += 25;
            gameState.popularity = Math.max(0, gameState.popularity - 5);
            const officialWarningMsg = \`An official-looking warning about your paid content for "\${currentFandomSet?.workTitle}" appeared on SNS! (Controversy +25, Pop -5)\`;
            showNotification(officialWarningMsg, 'error', 8000);
            addLogEntry(officialWarningMsg, "sns");
        }
    }

    updateAllDisplays();
    const postSuccessMsg = \`Fanfic "\${ficDisplayTitle}" posted to SNS! (Rating: \${readerRating}⭐). Initial Buzz: +\${initialLikes} Likes, +\${newPost.retweets} Retweets. Popularity Change: \${popularityChange >= 0 ? '+' : ''}\${popularityChange}.\`;
    showNotification(postSuccessMsg, 'success', 7000);
    addLogEntry(postSuccessMsg, "fic_published");

    (uiElements['fic-paid-checkbox'] as HTMLInputElement).checked = false;
    const priceGroup = uiElements['fic-price-group'] as HTMLElement;
    const priceGroupSmall = uiElements['fic-price-group-small'] as HTMLElement;
    if (priceGroup) priceGroup.style.display = 'none';
    if (priceGroupSmall) priceGroupSmall.style.display = 'none';
    (uiElements['fic-price'] as HTMLInputElement).value = String(DEFAULT_EVENT_SALE_PRICE);

    if (!gameState.playerMilestones.firstFicPublished) {
        gameState.playerMilestones.firstFicPublished = true;
    }
    checkSupportiveSenpaiMilestones();

    showArea(null);
    setupScheduler();
    saveGameState();
}

function renderMyFicsList() {
    const myFicsListContainer = uiElements['my-fics-list'] as HTMLElement;
    if (!myFicsListContainer) return;
    myFicsListContainer.innerHTML = '';
    if (gameState.publishedFics.length === 0) { myFicsListContainer.innerHTML = '<p class="text-sm text-gray-500">You haven\\'t published any fanfics yet.</p>'; return; }
    const sortedFics = [...gameState.publishedFics].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    sortedFics.forEach(fic => {
        const ficDiv = document.createElement('div');
        ficDiv.classList.add('my-fic-entry');
        const fandomSet = findFandomSetById(fic.fandomSetId);
        let paidIndicator = fic.isPaid ? \`<span class="text-green-600 font-bold">[유료💰 \${fic.ficPrice || DEFAULT_EVENT_SALE_PRICE}G]</span>\` : '';
        let ratingStars = fic.readerRating ? '⭐'.repeat(fic.readerRating) + '☆'.repeat(5 - fic.readerRating) : 'Not Rated Yet';
        let sequelIndicator = fic.previousFicIdForSequel ? \`(Sequel to: \${escapeHTML(gameState.publishedFics.find(pf => pf.id === fic.previousFicIdForSequel)?.title || 'Unknown')})\` : '';
        const partNumberSuffix = fic.previousFicIdForSequel ? \` (Pt. \${gameState.publishedFics.filter(f => f.title.startsWith(fic.title.split(" Pt.")[0]) && new Date(f.timestamp).getTime() <= new Date(fic.timestamp).getTime() ).length})\` : "";
        const displayTitleWithPart = \`\${escapeHTML(fic.title)}\${partNumberSuffix}\`;
        const inventoryText = fic.inventory !== undefined ? \`<span class="fic-meta fic-inventory">Stock: \${fic.inventory} copies</span>\` : '';
        const printQualityText = fic.printQuality ? \`<span class="fic-meta">Print: \${fic.printQuality.paper} paper, \${fic.printQuality.cover} cover</span>\` : '';

        ficDiv.innerHTML = \`
            <strong>\${paidIndicator}\${displayTitleWithPart} \${escapeHTML(sequelIndicator)}</strong>
            <span class="fic-meta">For Fandom: \${escapeHTML(fandomSet?.workTitle || "Unknown")}</span>
            <span class="fic-meta">Genres: \${escapeHTML(fic.genres.join(', ') || 'N/A')}, Materials: \${escapeHTML(fic.materials?.join(', ') || 'N/A')}</span>
            <span class="fic-meta">Published: \${timeAgo(fic.timestamp)}</span>
            <span class="fic-meta">Reader Rating: <span class="reader-rating">\${ratingStars}</span> (\${fic.readerRating || 'N/A'}/5)</span>
            \${inventoryText} \${printQualityText}
            <button class="view-fic-details-btn btn-secondary-sm !text-xs mt-1" data-fic-id="\${fic.id}">View/Manage</button>
            <details class="mt-1">
                <summary class="text-xs text-blue-600 cursor-pointer hover:underline">View Content (AI Generated)</summary>
                <pre class="fic-content-preview">\${escapeHTML(fic.content)}</pre>
            </details>
            <details class="mt-1">
                <summary class="text-xs text-blue-600 cursor-pointer hover:underline">View Original Plan</summary>
                <pre class="fic-content-preview">Scenario: \${escapeHTML(fic.scenarioPlan || 'N/A')}</pre>
            </details>
            <div class="input-group mt-1"><label for="memo-\${fic.id}" class="label-primary !text-xs !mb-0.5">Personal Memo:</label><textarea id="memo-\${fic.id}" class="memo-area" rows="2" placeholder="Add notes...">\${escapeHTML(fic.memo || '')}</textarea></div>
        \`;
        myFicsListContainer.appendChild(ficDiv);
        const memoTextarea = ficDiv.querySelector(\`#memo-\${fic.id}\`) as HTMLTextAreaElement;
        if(memoTextarea) { memoTextarea.addEventListener('change', (e) => { const updatedMemo = (e.target as HTMLTextAreaElement).value; const ficToUpdate = gameState.publishedFics.find(f => f.id === fic.id); if (ficToUpdate) { ficToUpdate.memo = updatedMemo; saveGameState(); } }); }

        const viewDetailsButton = ficDiv.querySelector('.view-fic-details-btn') as HTMLButtonElement;
        viewDetailsButton?.addEventListener('click', () => {
            const projectId = viewDetailsButton.dataset.ficId;
            if (projectId) openProjectDetailModal(projectId);
        });
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
            baseWorkInfo = \`<small style="display:block; color:#555;">(Extends: \${escapeHTML(baseFandom?.workTitle || 'Unknown Base Work')})</small>\`;
        }
        const popularityTierText = fs.popularityTier ? \`<span class="text-xs text-gray-500">(\${fs.popularityTier} Tier)</span>\` : '';
        div.innerHTML = \`
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="flex items-center">\${escapeHTML(fs.workTitle)} \${popularityTierText} \${fs.isPrimary ? '<span class="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Primary</span>' : ''}</h4>
                    \${baseWorkInfo}
                    <p class="text-xs text-gray-600"><strong>Character:</strong> \${escapeHTML(fs.favCharacter)} | <strong>Pairing:</strong> \${escapeHTML(fs.favPairing)}</p>
                    <p class="text-xs text-gray-500 italic">Char Desc: \${escapeHTML(fs.favCharacterDescription.substring(0,50))}...</p>
                    <p class="text-xs text-gray-500 italic">Pairing Interp: \${escapeHTML(fs.pairingInterpretation.substring(0,50))}...</p>
                </div>
                <div class="flex flex-col space-y-1">
                    <button class="edit-fandom-btn btn-secondary-sm !text-xs" data-id="\${fs.id}">Edit</button>
                    <button class="delete-fandom-btn btn-danger-sm !text-xs" data-id="\${fs.id}">Delete</button>
                </div>
            </div>
        \`;
        container.appendChild(div);
        div.querySelector('.edit-fandom-btn')?.addEventListener('click', (e) => handleEditFandomSetForm((e.currentTarget as HTMLElement).dataset.id));
        div.querySelector('.delete-fandom-btn')?.addEventListener('click', (e) => handleDeleteFandomSet((e.currentTarget as HTMLElement).dataset.id!));
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
    const baseWorkGroup = uiElements['select-base-fandom-set-group'] as HTMLElement;
    const baseWorkSelect = uiElements['select-base-fandom-set'] as HTMLSelectElement;
    const popularityTierGroup = uiElements['edit-fandom-popularity-tier-group'] as HTMLElement;
    const popularityTierSelect = uiElements['edit-fandom-popularity-tier'] as HTMLSelectElement;

    if (!form || !formTitle || !idInput || !workTitleInput || !workDescInput || !favCharInput || !favCharDescInput || !favPairingInput || !pairingInterpInput || !isPrimaryCheckbox || !relationshipTypeSelect || !baseWorkGroup || !baseWorkSelect || !popularityTierGroup || !popularityTierSelect) return;

    const resetAndToggleFields = (relationship: string) => {
        const isExtending = relationship !== 'new_work';
        workTitleInput.readOnly = isExtending; workDescInput.readOnly = isExtending;
        workTitleInput.classList.toggle('bg-gray-100', isExtending); workDescInput.classList.toggle('bg-gray-100', isExtending);
        baseWorkGroup.style.display = isExtending ? 'block' : 'none';
        popularityTierGroup.style.display = isExtending ? 'none' : 'block';

        if (relationship === 'existing_work_alt_interp') {
            favCharInput.readOnly = true; favCharDescInput.readOnly = true;
            favCharInput.classList.toggle('bg-gray-100', true); favCharDescInput.classList.toggle('bg-gray-100', true);
        } else {
            favCharInput.readOnly = false; favCharDescInput.readOnly = false;
            favCharInput.classList.remove('bg-gray-100'); favCharDescInput.classList.remove('bg-gray-100');
        }
    };

    const populateBaseWorkSelectAndFields = (currentEditingId?: string, selectedBaseId?: string) => {
        baseWorkSelect.innerHTML = '<option value="">-- Select Base Work --</option>';
        gameState.fandomSets.forEach(fs => {
            if (fs.id !== currentEditingId) {
                 baseWorkSelect.add(new Option(\`\${fs.workTitle} (\${fs.favPairing})\`, fs.id));
            }
        });
        if (selectedBaseId) {
            baseWorkSelect.value = selectedBaseId;
            const baseFandom = findFandomSetById(selectedBaseId);
            if (baseFandom) {
                workTitleInput.value = baseFandom.workTitle;
                workDescInput.value = baseFandom.workDescription;
                if (relationshipTypeSelect.value === 'existing_work_alt_interp') {
                    favCharInput.value = baseFandom.favCharacter;
                    favCharDescInput.value = baseFandom.favCharacterDescription;
                }
            }
        } else {
            baseWorkSelect.value = "";
            if(relationshipTypeSelect.value !== 'new_work') {
                workTitleInput.value = ""; workDescInput.value = "";
                if (relationshipTypeSelect.value === 'existing_work_alt_interp') {
                    favCharInput.value = ""; favCharDescInput.value = "";
                }
            }
        }
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
        popularityTierSelect.value = fs.popularityTier || "Average";
        resetAndToggleFields(relationshipTypeSelect.value);
        populateBaseWorkSelectAndFields(fs.id, fs.baseFandomSetId);
    } else {
        formTitle.textContent = "Add New Fandom Set"; idInput.value = "";
        [workTitleInput, workDescInput, favCharInput, favCharDescInput, favPairingInput, pairingInterpInput].forEach(el => (el as HTMLInputElement|HTMLTextAreaElement).value = "");
        isPrimaryCheckbox.checked = gameState.fandomSets.length === 0; isPrimaryCheckbox.disabled = gameState.fandomSets.length === 0;
        relationshipTypeSelect.value = "new_work";
        popularityTierSelect.value = "Average";
        resetAndToggleFields("new_work");
        populateBaseWorkSelectAndFields();
    }
    form.style.display = 'block';
}

function handleSaveFandomSet() {
    const id = (uiElements['edit-fandom-set-id-input'] as HTMLInputElement).value;
    let workTitle = (uiElements['edit-fandom-work-title-input'] as HTMLInputElement).value.trim();
    let workDescription = (uiElements['edit-fandom-work-desc-input'] as HTMLTextAreaElement).value.trim();
    let favCharacter = (uiElements['edit-fandom-fav-char-input'] as HTMLInputElement).value.trim();
    let favCharacterDescription = (uiElements['edit-fandom-fav-char-desc-input'] as HTMLTextAreaElement).value.trim();
    const favPairing = (uiElements['edit-fandom-fav-pairing-input'] as HTMLInputElement).value.trim();
    const pairingInterpretation = (uiElements['edit-fandom-pairing-interp-input'] as HTMLTextAreaElement).value.trim();
    const isPrimary = (uiElements['edit-fandom-is-primary-checkbox'] as HTMLInputElement).checked;
    const relationshipType = (uiElements['edit-fandom-relationship-type'] as HTMLSelectElement).value as FandomSet['relationshipType'];
    const baseWorkId = (uiElements['select-base-fandom-set'] as HTMLSelectElement).value;
    const popularityTier = (uiElements['edit-fandom-popularity-tier'] as HTMLSelectElement).value as FandomPopularityTier;
    let baseFandomSetIdToStore: string | undefined = undefined;

    let confirmMessage = "Save this Fandom Set?";
    let potentialPopLoss = 0;

    if (relationshipType !== 'new_work') {
        if (!baseWorkId) { alert("Please select a Base Work to extend from, or choose 'New Work & Fandom'."); return; }
        const baseFandomSet = findFandomSetById(baseWorkId);
        if (baseFandomSet) {
            workTitle = baseFandomSet.workTitle;
            workDescription = baseFandomSet.workDescription;
            baseFandomSetIdToStore = baseFandomSet.id;
            if (relationshipType === 'existing_work_alt_interp') {
                favCharacter = baseFandomSet.favCharacter;
                favCharacterDescription = baseFandomSet.favCharacterDescription;
            }
        } else { alert("Error: Base Fandom Set not found."); return; }
    }

    if (!workTitle || !favCharacter || !favPairing) { alert("Work Title, Favorite Character, and Favorite Pairing are required."); return; }
    if (!favPairing.includes('/')) {alert("Pairing format should be 'CharacterA/CharacterB'."); return;}

    const existingSet = id ? findFandomSetById(id) : null;
    if (existingSet && existingSet.isPrimary) {
        if (existingSet.workTitle !== workTitle && relationshipType === 'new_work') potentialPopLoss += 0.30;
        else if (existingSet.favCharacter !== favCharacter) potentialPopLoss += 0.20;
        else if (existingSet.favPairing !== favPairing) potentialPopLoss += 0.10;
    }
    if (isPrimary && existingSet && !existingSet.isPrimary) {
        potentialPopLoss += 0.35;
    }
    const [charA, charB] = favPairing.split('/');
    const baseFandomForReverseCheck = baseFandomSetIdToStore ? findFandomSetById(baseFandomSetIdToStore) : (existingSet || null);
    if(charA && charB && baseFandomForReverseCheck && baseFandomForReverseCheck.favPairing === \`\${charB}/\${charA}\` && !(baseFandomForReverseCheck.reversePenaltyTriggers || {})[\`\${charB}/\${charA}\`]) {
        potentialPopLoss += 0.70;
        confirmMessage += \` This appears to be a REVERSE of an existing pairing (\${charB}/\${charA}). This will cause a large popularity drop (~70%) initially if you publish fics for it.\`;
    }

    if (potentialPopLoss > 0) {
        const estimatedLoss = Math.round(gameState.popularity * potentialPopLoss);
        confirmMessage += \` This change might impact your popularity (estimated -\${estimatedLoss}). Are you sure?\`;
    }
    if (!confirm(confirmMessage)) return;

    if (existingSet) {
        const oldSet = { ...existingSet };
        existingSet.workTitle = workTitle; existingSet.workDescription = workDescription;
        existingSet.favCharacter = favCharacter; existingSet.favCharacterDescription = favCharacterDescription;
        existingSet.favPairing = favPairing; existingSet.pairingInterpretation = pairingInterpretation;
        existingSet.isPrimary = isPrimary; existingSet.relationshipType = relationshipType;
        existingSet.baseFandomSetId = baseFandomSetIdToStore;
        existingSet.popularityTier = relationshipType === 'new_work' ? popularityTier : oldSet.popularityTier;
        addLogEntry(\`Fandom Set "\${workTitle}" updated.\`, "system");
    } else {
        const newId = \`fandomset-\${gameState.nextFandomSetId++}\`;
        gameState.fandomSets.push({
            id: newId, workTitle, workDescription, favCharacter, favCharacterDescription,
            favPairing, pairingInterpretation, isPrimary, relationshipType, baseFandomSetId: baseFandomSetIdToStore,
            reversePenaltyTriggers: {}, popularityTier: relationshipType === 'new_work' ? popularityTier : undefined
        });
        addLogEntry(\`New Fandom Set "\${workTitle}" added.\`, "system");
    }

    let actualPopChange = 0;
    let popChangeReason = "";

    if (isPrimary) {
        const currentPrimaryId = id || gameState.fandomSets[gameState.fandomSets.length -1].id;
        gameState.fandomSets.forEach(fs => {
            if (fs.isPrimary && fs.id !== currentPrimaryId) {
                if (fs.workTitle !== workTitle) {
                    actualPopChange -= Math.round(gameState.popularity * 0.35);
                    popChangeReason += "Primary Fandom Work changed. ";
                }
            }
            fs.isPrimary = fs.id === currentPrimaryId;
        });
    } else if (existingSet && existingSet.isPrimary && !isPrimary && gameState.fandomSets.length > 1) {
        actualPopChange -= Math.round(gameState.popularity * 0.35);
        popChangeReason += "Primary Fandom status removed. ";
        if (!gameState.fandomSets.some(f => f.isPrimary)) {
            gameState.fandomSets[0].isPrimary = true;
            addLogEntry(\`Defaulted "\${gameState.fandomSets[0].workTitle}" to primary.\`, "system");
        }
    }

    if (existingSet && existingSet.isPrimary) {
        if (existingSet.workTitle !== workTitle && relationshipType === 'new_work' && !popChangeReason.includes("Primary Fandom Work changed")) {
            actualPopChange -= Math.round(gameState.popularity * 0.30); popChangeReason += "Primary work title changed. ";
        } else if (existingSet.favCharacter !== favCharacter) {
            actualPopChange -= Math.round(gameState.popularity * 0.20); popChangeReason += "Primary character changed. ";
        } else if (existingSet.favPairing !== favPairing) {
            actualPopChange -= Math.round(gameState.popularity * 0.10); popChangeReason += "Primary pairing changed. ";
        }
    }

    if (actualPopChange !== 0) {
        gameState.popularity = Math.max(0, gameState.popularity + actualPopChange);
        const finalPenaltyMsg = \`Fandom Shift! \${popChangeReason} Popularity \${actualPopChange < 0 ? 'decreased by' : 'increased by'} \${Math.abs(actualPopChange)}.\`;
        showNotification(finalPenaltyMsg, actualPopChange < 0 ? 'warning' : 'success', 6000);
        addLogEntry(finalPenaltyMsg, "system");
    }

    if (!gameState.fandomSets.some(fs => fs.isPrimary) && gameState.fandomSets.length > 0) {
        gameState.fandomSets[0].isPrimary = true;
        addLogEntry(\`Defaulted "\${gameState.fandomSets[0].workTitle}" to primary.\`, "system");
    }

    (uiElements['edit-fandom-set-form'] as HTMLElement).style.display = 'none';
    renderFandomSetsManagement();
    updateAllDisplays();
    saveGameState();
}

function handleDeleteFandomSet(fandomSetId: string) {
    const setToDelete = findFandomSetById(fandomSetId);
    if (!setToDelete) return;
    if (setToDelete.isPrimary && gameState.fandomSets.length === 1) { alert("Cannot delete the only Fandom Set. Add another one first, or edit this one."); return; }
    if (!confirm(\`Are you sure you want to '탈덕' (delete) the Fandom Set: "\${escapeHTML(setToDelete.workTitle)}"? This will impact your popularity and may affect ongoing projects or event registrations for this fandom.\`)) return;

    const deletedFandomTitle = setToDelete.workTitle;
    let popularityPenalty = 0;
    let penaltyMessage = \`Fandom Set "\${escapeHTML(setToDelete.workTitle)}" deleted. \`;
    if (setToDelete.isPrimary) {
        popularityPenalty = Math.round(gameState.popularity * 0.70);
        penaltyMessage += \`This was your primary fandom! Significant impact.\`;
    } else {
        popularityPenalty = Math.round(gameState.popularity * 0.20);
    }
    gameState.popularity = Math.max(0, gameState.popularity - popularityPenalty);
    showNotification(\`\${penaltyMessage} Popularity -\${popularityPenalty}.\`, 'warning', 6000);
    addLogEntry(\`\${penaltyMessage} Popularity -\${popularityPenalty}.\`, "system");
    gameState.fandomSets = gameState.fandomSets.filter(fs => fs.id !== fandomSetId);
    if (setToDelete.isPrimary && gameState.fandomSets.length > 0 && !gameState.fandomSets.some(fs => fs.isPrimary)) {
        gameState.fandomSets[0].isPrimary = true;
        const newPrimaryMsg = \`"\${escapeHTML(gameState.fandomSets[0].workTitle)}" is now your primary Fandom Set.\`;
        showNotification(newPrimaryMsg, 'info');
        addLogEntry(newPrimaryMsg, "system");
    }

    gameState.fanficProjects = gameState.fanficProjects.filter(p => {
        if (p.fandomSetId === fandomSetId) {
            addLogEntry(\`Active project "\${p.title}" for deleted fandom "\${setToDelete.workTitle}" was cancelled.\`, "system");
            return false;
        }
        return true;
    });
    if (gameState.currentEvent && gameState.currentEvent.fandomSetId === fandomSetId) {
        addLogEntry(\`Current event registration for deleted fandom "\${setToDelete.workTitle}" was cancelled.\`, "system");
        gameState.currentEvent = null; gameState.registeredEventId = null;
    }
    Object.keys(gameState.dailyProjectSelections).forEach(dayStr => {
        const day = parseInt(dayStr, 10);
        const projectId = gameState.dailyProjectSelections[day];
        if (projectId) {
            const project = gameState.fanficProjects.find(p => p.id === projectId) || gameState.publishedFics.find(f => f.id === projectId);
            if (project && project.fandomSetId === fandomSetId) {
                gameState.dailyProjectSelections[day] = undefined;
                if(gameState.weeklySchedule[day]) gameState.weeklySchedule[day].projectId = undefined;
            }
        }
    });

    const relevantNpcs = gameState.npcs.filter(npc =>
        npc.fandomFocus === deletedFandomTitle ||
        (npc.type === "Fan" && Math.random() < 0.3) ||
        (npc.type === "Rival" && Math.random() < 0.4) ||
        (npc.type === "Anti" && Math.random() < 0.5)
    ).slice(0, 2);

    relevantNpcs.forEach(npc => {
        let npcPostTitle = ""; let npcPostContent = "";
        switch(npc.type) {
            case "Fan":
                npcPostTitle = \`엥? \${gameState.playerName} 작가님 탈덕?\`;
                npcPostContent = \`\${gameState.playerName} 작가님, \${deletedFandomTitle} 이제 안 파시는 거예요? ㅠㅠ 제가 정말 좋아하던 작품인데... 너무 아쉽네요...\`;
                break;
            case "Rival":
                npcPostTitle = \`흥, \${gameState.playerName} 도망갔군.\`;
                npcPostContent = \`\${gameState.playerName} 그 녀석, 결국 \${deletedFandomTitle}에서 꼬리 내리고 도망갔구만. 쯧쯧.\`;
                break;
            case "Anti":
                npcPostTitle = \`ㅋㅋㅋ \${gameState.playerName} 드디어 꺼졌네\`;
                npcPostContent = \`속이 다 시원하다! \${gameState.playerName} 그 인간 드디어 \${deletedFandomTitle}에서 꺼지셨네 ㅋㅋㅋ\`;
                break;
            default: return;
        }
        if(npcPostContent){
            gameState.snsPosts.unshift(createHNPost(npc.name, npcPostTitle, npcPostContent, Math.floor(Math.random() * 10) + 5));
            addLogEntry(\`\${npc.name} posted about \${gameState.playerName} leaving the \${deletedFandomTitle} fandom.\`, "sns");
        }
    });

    renderFandomSetsManagement();
    updateAllDisplays();
    setupScheduler();
    saveGameState();
}

function handleSaveGeneralProfileSettings() {
    const newPlayerName = (uiElements['edit-player-name'] as HTMLInputElement).value.trim();
    const newApiKey = (uiElements['edit-api-key'] as HTMLInputElement).value.trim();
    if (!newPlayerName) { alert("Player Name cannot be empty."); return; }
    gameState.playerName = newPlayerName;
    gameState.apiKey = newApiKey;
    const msg = "General profile settings saved!";
    showNotification(msg, 'success');
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
    const mostUsedGenres = Object.entries(genresUsed).sort((a,b) => b[1] - a[1]).slice(0,3).map(entry => \`\${entry[0]} (\${entry[1]})\`).join(', ') || 'None';
    analyticsContent.innerHTML = \`
        <h3 class="text-lg font-semibold text-purple-600 mb-3">Game Analytics</h3>
        <div class="space-y-1 text-sm">
            <p><strong>Player Name:</strong> \${escapeHTML(gameState.playerName)}</p>
            <p><strong>Current Week:</strong> \${gameState.currentWeek}</p>
            <p><strong>Money:</strong> \${Math.round(gameState.money)}G</p>
            <p><strong>Popularity:</strong> \${Math.round(gameState.popularity)}</p>
            <p><strong>Total Fanfics Published by You:</strong> \${totalPlayerFics}</p>
            <p><strong>Total Likes on Your Fic Posts:</strong> \${totalLikesOnPlayerFics}</p>
            <p><strong>Average Reader Rating (Your Fics):</strong> \${averageRating} / 5</p>
            <p><strong>Your Most Used Genres:</strong> \${mostUsedGenres}</p>
            <p><strong>Unlocked Genres:</strong> \${gameState.unlockedGenres.length} / \${ALL_GENRES.length}</p>
            <p><strong>Unlocked Materials:</strong> \${gameState.unlockedMaterials.length} / \${ALL_MATERIALS.length}</p>
            <p><strong>Controversy Score:</strong> \${gameState.controversyScore}</p>
            <p><strong>Deok-ryeok Level:</strong> \${Math.round(gameState.deokryeok)}</p>
            <p><strong>Writing Skill:</strong> \${Math.round(gameState.writingSkill)}</p>
            <p><strong>Low Stamina Writing Streak:</strong> \${gameState.lowStaminaWritingStreak}</p>
        </div>
    \`;
    showArea('analytics-area');
}

async function handleSnsActivityEvents(logPrefix: string = "") {
    const rand = Math.random();
    let snsEventHappened = false;
    let eventMessage = "You browsed SNS, catching up on the latest fandom chatter.";
    gameState.popularity = Math.max(0, gameState.popularity + 0.2); // Small passive gain

    const primaryFandom = gameState.fandomSets.find(fs => fs.isPrimary) || gameState.fandomSets[0];
    const randomPlayerFandom = gameState.fandomSets.length > 0 ? gameState.fandomSets[Math.floor(Math.random() * gameState.fandomSets.length)] : null;
    let anecdotePostContent = "";

    if (rand < 0.10) { // Simple unlock
        const unlockType = Math.random() < 0.5 ? 'genre' : 'material';
        let unlockedItem = '';
        if (unlockType === 'genre' && gameState.unlockedGenres.length < ALL_GENRES.length) {
            const availableToUnlock = ALL_GENRES.filter(g => !gameState.unlockedGenres.includes(g));
            if (availableToUnlock.length > 0) {
                unlockedItem = availableToUnlock[Math.floor(Math.random() * availableToUnlock.length)];
                gameState.unlockedGenres.push(unlockedItem);
                eventMessage = \`While browsing SNS, you saw discussions about "\${unlockedItem}"! New Genre Unlocked!\`;
                populateGenreCheckboxes(); snsEventHappened = true;
            }
        } else if (unlockType === 'material' && gameState.unlockedMaterials.length < ALL_MATERIALS.length) {
            const availableToUnlock = ALL_MATERIALS.filter(m => !gameState.unlockedMaterials.includes(m));
            if (availableToUnlock.length > 0) {
                unlockedItem = availableToUnlock[Math.floor(Math.random() * availableToUnlock.length)];
                gameState.unlockedMaterials.push(unlockedItem);
                eventMessage = \`An interesting post gave you an idea for "\${unlockedItem}"! New Material Unlocked!\`;
                populateMaterialsSelect(); snsEventHappened = true;
            }
        }
    } else if (rand < 0.25) { // Stat change
        const statChangeType = Math.random();
        if (statChangeType < 0.4 && randomPlayerFandom) { gameState.deokryeok += 3; eventMessage = \`You read an insightful meta on SNS about \${randomPlayerFandom.workTitle}! Deok-ryeok +3.\`; snsEventHappened = true; }
        else if (statChangeType < 0.7) { gameState.stamina = Math.max(0, gameState.stamina - 5); gameState.controversyScore += 2; eventMessage = "You got into a pointless argument on SNS... Stamina -5, Controversy +2."; snsEventHappened = true; }
        else { gameState.popularity = Math.max(0, gameState.popularity + 0.5); eventMessage = "One of your old takes resurfaced and got positive attention! Popularity +0.5."; snsEventHappened = true;}
    } else if (rand < 0.40 && randomPlayerFandom) { // BigName post
        const bigName = gameState.npcs.find(n => n.type === 'BigNameCreator' && (n.fandomFocus === randomPlayerFandom.workTitle || n.fandomFocus === "Any" || !n.fandomFocus));
        if (bigName) { 
            const postContent = \`Pondering the latest developments in \${randomPlayerFandom.workTitle}... especially \${randomPlayerFandom.favCharacter}'s arc. Some truly inspired fanworks are emerging! #\${randomPlayerFandom.workTitle.replace(/\\s/g, '')} #deepthoughts\`;
            const post = createHNPost(bigName.name, \`Reflections on \${randomPlayerFandom.workTitle}\`, postContent, Math.floor(Math.random() * 30) + 20);
            generateSimulatedComments(post, Math.floor(Math.random() * 3)+1);
            gameState.snsPosts.unshift(post);
            eventMessage = \`You saw a post by \${bigName.name} discussing \${randomPlayerFandom.workTitle}! Insightful.\`;
            snsEventHappened = true;
        }
    } else if (rand < 0.55 && randomPlayerFandom) { // Generic NPC post
         const npc = gameState.npcs[Math.floor(Math.random() * gameState.npcs.length)];
         if (npc.type !== 'BigNameCreator' && !npc.isMotivationalFriend && npc.type !== 'PublisherBot') {
            let npcPostContent = "";
            if (npc.type === "Fan") npcPostContent = \`Still thinking about that amazing scene in \${randomPlayerFandom.workTitle} with \${randomPlayerFandom.favCharacter}! Does anyone have good fic recs for \${randomPlayerFandom.favPairing}?\`;
            else if (npc.type === "Rival") npcPostContent = \`Some of the takes on \${randomPlayerFandom.favPairing} are... questionable. My interpretation is clearly superior. Wait for my next drop. #MyWayIsCanon\`;
            else if (npc.type === "Anti") npcPostContent = \`Ugh, \${randomPlayerFandom.workTitle} is so overrated. And the shipping wars around \${randomPlayerFandom.favPairing} are toxic. Get a life, people.\`;
            
            if (npcPostContent) {
                const post = createHNPost(npc.name, \`Thoughts on \${randomPlayerFandom.workTitle}\`, npcPostContent, Math.floor(Math.random() * 10) + 3);
                generateSimulatedComments(post, Math.floor(Math.random() * 2));
                gameState.snsPosts.unshift(post);
                eventMessage = \`You saw a post by \${npc.name} about \${randomPlayerFandom.workTitle}.\`;
                snsEventHappened = true;
            }
         }
    } else if (rand < 0.70) { // Player anecdote - high chance predefined, low chance AI
        let postTitle = "Random Thought Bubble 💭";
        const usePredefinedAnecdote = Math.random() < 0.9; // 90% chance for predefined

        if (usePredefinedAnecdote) {
            const isPersonal = Math.random() < 0.2; // 20% of predefined are personal, 80% fandom-specific
            const currentFandomForAnecdote = randomPlayerFandom; // Can be null if no fandoms

            if (isPersonal || !currentFandomForAnecdote) {
                anecdotePostContent = PREDEFINED_PLAYER_ANECDOTES.personal_creative_musings[Math.floor(Math.random() * PREDEFINED_PLAYER_ANECDOTES.personal_creative_musings.length)];
            } else {
                let template = PREDEFINED_PLAYER_ANECDOTES.fandom_specific_musings[Math.floor(Math.random() * PREDEFINED_PLAYER_ANECDOTES.fandom_specific_musings.length)];
                // Fill placeholders
                template = template.replace(/\[FavCharacter\]/g, currentFandomForAnecdote.favCharacter)
                                   .replace(/\[WorkTitle\]/g, currentFandomForAnecdote.workTitle)
                                   .replace(/\[FavPairing\]/g, currentFandomForAnecdote.favPairing)
                                   .replace(/\[ScenarioIdea\]/g, SCENARIO_IDEAS_FOR_ANECDOTES[Math.floor(Math.random() * SCENARIO_IDEAS_FOR_ANECDOTES.length)])
                                   .replace(/\[QuirkyActivity\]/g, QUIRKY_ACTIVITIES_FOR_ANECDOTES[Math.floor(Math.random() * QUIRKY_ACTIVITIES_FOR_ANECDOTES.length)])
                                   .replace(/\[AnotherCharacter\]/g, ANOTHER_CHARACTERS_SAMPLE_FOR_ANECDOTES[Math.floor(Math.random() * ANOTHER_CHARACTERS_SAMPLE_FOR_ANECDOTES.length)])
                                   .replace(/\[AnotherWorkTitle\]/g, ANOTHER_WORK_TITLES_SAMPLE_FOR_ANECDOTES[Math.floor(Math.random() * ANOTHER_WORK_TITLES_SAMPLE_FOR_ANECDOTES.length)])
                                   .replace(/\[AlternativeEnding\]/g, ALTERNATIVE_ENDINGS_SAMPLE_FOR_ANECDOTES[Math.floor(Math.random() * ALTERNATIVE_ENDINGS_SAMPLE_FOR_ANECDOTES.length)])
                                   .replace(/\[UnconventionalMotivation\]/g, UNCONVENTIONAL_MOTIVATIONS_SAMPLE_FOR_ANECDOTES[Math.floor(Math.random() * UNCONVENTIONAL_MOTIVATIONS_SAMPLE_FOR_ANECDOTES.length)])
                                   .replace(/\[MicroFicIdea\]/g, MICRO_FIC_IDEAS_FOR_ANECDOTES[Math.floor(Math.random() * MICRO_FIC_IDEAS_FOR_ANECDOTES.length)])
                                   .replace(/\[ModernJob\]/g, MODERN_JOBS_FOR_ANECDOTES[Math.floor(Math.random() * MODERN_JOBS_FOR_ANECDOTES.length)]);
                anecdotePostContent = template;
            }
            eventMessage = \`You posted a random thought on SNS: "\${anecdotePostContent.substring(0,30)}..."\`;
            snsEventHappened = true;
        } else if (gameState.apiKey) { // Low chance (10%) to call AI for unique anecdote
            const anecdoteType = Math.random() < 0.8 ? 'fandom_specific' : 'personal_creative'; // AI also biased to fandom
            const anecdoteResult = await callGeminiAPI_GeneratePlayerAnecdote(gameState.apiKey, anecdoteType);
            if (anecdoteResult.success && anecdoteResult.text) {
                anecdotePostContent = anecdoteResult.text;
                eventMessage = \`You spontaneously posted a random thought (AI-assisted) on SNS: "\${anecdotePostContent.substring(0,30)}..."\`;
                snsEventHappened = true;
            } else {
                eventMessage = \`You tried to think of something witty for SNS, but drew a blank. (\${anecdoteResult.error || 'AI error'})\`;
            }
        } else {
             // Fallback if no API key for the 10% AI chance: use a personal predefined one.
            anecdotePostContent = PREDEFINED_PLAYER_ANECDOTES.personal_creative_musings[Math.floor(Math.random() * PREDEFINED_PLAYER_ANECDOTES.personal_creative_musings.length)];
            eventMessage = \`You posted a random thought on SNS: "\${anecdotePostContent.substring(0,30)}..."\`;
            snsEventHappened = true;
        }

        if (anecdotePostContent) {
            const anecdotePost = createHNPost(gameState.playerName, postTitle, anecdotePostContent, Math.floor(Math.random()*8)+2, false, "player_ai_anecdote");
            generateSimulatedComments(anecdotePost, Math.floor(Math.random()*2)+1); // Few comments for anecdotes
            gameState.snsPosts.unshift(anecdotePost);
        }
    }

    if (!snsEventHappened || Math.random() < 0.3) { // If no major event, or sometimes anyway, make a generic player post
        const currentFandom = primaryFandom || randomPlayerFandom;
        const snsPlayerPosts = [
            \`Just scrolling through the \${currentFandom?.workTitle || 'fandom'} timeline. #sns\`,
            \`Thinking about \${currentFandom?.favPairing || 'my OTP'}. Maybe I should write something... #ficideas\`,
            \`Ugh, so much drama on the timeline today. Need a break. #fandomlife\`,
        ];
        if (!anecdotePostContent) { // Don't post generic if an anecdote was just posted
            const playerPostContent = snsPlayerPosts[Math.floor(Math.random() * snsPlayerPosts.length)];
            const playerPost = createHNPost(gameState.playerName, "Daily Musings", playerPostContent, Math.floor(Math.random()*3), false, "post");
            gameState.snsPosts.unshift(playerPost);
            eventMessage = snsEventHappened ? eventMessage + " You also posted some brief thoughts." : playerPostContent;
        }
    }
    addLogEntry(\`\${logPrefix}\${eventMessage}\`, "sns");
    if(uiElements['sns-feed'] && (uiElements['sns-feed'] as HTMLElement).style.display === 'flex') { renderSNSFeed(); }
    showNotification(eventMessage, snsEventHappened ? 'success' : 'info', snsEventHappened ? 4000 : 3000);
}

function handleInspirationUnlocks(sourceAction: 'Inspiration' | 'Library' = 'Inspiration'): string {
    let message = sourceAction === 'Library' ? "At the library, you dove into various works, sparking new thoughts." : "You sought inspiration, reflecting on stories and tropes.";
    let unlockedSomething = false;
    const randAction = Math.random();
    const genreUnlockChance = sourceAction === 'Library' ? 0.20 : 0.15;
    const materialUnlockChance = sourceAction === 'Library' ? 0.30 : 0.40;

    if (randAction < genreUnlockChance && gameState.unlockedGenres.length < ALL_GENRES.length) {
        const availableToUnlock = ALL_GENRES.filter(g => !gameState.unlockedGenres.includes(g));
        if (availableToUnlock.length > 0) {
            const unlockedItem = availableToUnlock[Math.floor(Math.random() * availableToUnlock.length)];
            gameState.unlockedGenres.push(unlockedItem);
            message = \`A flash of insight! You've figured out how to write "\${unlockedItem}"! New Genre Unlocked!\`;
            populateGenreCheckboxes(); unlockedSomething = true;
        }
    } else if (randAction < materialUnlockChance && gameState.unlockedMaterials.length < ALL_MATERIALS.length) {
        const availableToUnlock = ALL_MATERIALS.filter(m => !gameState.unlockedMaterials.includes(m) && m !== "Sequel to Previous Fic");
        if (availableToUnlock.length > 0) {
            const unlockedItem = availableToUnlock[Math.floor(Math.random() * availableToUnlock.length)];
            gameState.unlockedMaterials.push(unlockedItem);
            message = \`An interesting observation sparks an idea for "\${unlockedItem}"! New Material Unlocked!\`;
            populateMaterialsSelect(); unlockedSomething = true;
        }
    }
    if (gameState.playerMilestones.publishedFicCount > 0 && !gameState.unlockedMaterials.includes("Sequel to Previous Fic")) {
        gameState.unlockedMaterials.push("Sequel to Previous Fic");
        message = (unlockedSomething ? message + " Also, " : "") + "You feel confident enough to write sequels now! 'Sequel to Previous Fic' Material Unlocked!";
        populateMaterialsSelect(); unlockedSomething = true;
    }
    showNotification(message, unlockedSomething ? 'success' : 'info', unlockedSomething ? 4000 : 3000);
    return message;
}

function checkSupportiveSenpaiMilestones() {
    if (!gameState.storyModeEnabled) return;
    const senpai = gameState.npcs.find(n => n.isMotivationalFriend);
    if (!senpai) return;

    let milestoneReached = false;
    let friendPostTitle = "";
    let friendPostContent = "";
    const pName = gameState.playerName;

    const firstFicJustPublished = gameState.publishedFics.find(f => f.author === pName && !gameState.playerMilestones.firstFicPublished);
    if (firstFicJustPublished) {
        friendPostTitle = \`💖 \${pName} 작가님 첫 작품 축하드려요!! 💖\`;
        friendPostContent = \`세상에 여러분!! 드디어 \${pName} 작가님의 첫 팬픽 "\${escapeHTML(firstFicJustPublished.title)}"이 올라왔어요! 😭✨ 방금 읽고 왔는데 정말... 작가님만의 느낌이 살아있다구요! 다들 꼭 한번 읽어보세요! 작가님 앞으로도 멋진 작품 많이많이 써주세요! 제가 항상 응원할게요! #첫작품 #신인작가_탄생 #감동의눈물\`;
        gameState.playerMilestones.firstFicPublished = true;
        milestoneReached = true;
    } else if (gameState.writingSkill >= 70 && !gameState.playerMilestones.writingSkillReached70) {
        friendPostTitle = \`🏆 \${pName} 작가님, 글쓰기 스킬 70 돌파! 이제 거장이시네요! 🏆\`;
        friendPostContent = \`믿을 수 없어요! \${pName} 작가님의 글쓰기 스킬이 벌써 70을 넘었다니! 😭 이건 정말 대단한 성과예요! 작가님의 꾸준한 노력과 열정이 만들어낸 결과라고 생각해요. 다음 작품은 분명 전설이 될 거예요! #글쓰기_마스터 #노력의_결실 #존경합니다\`;
        gameState.playerMilestones.writingSkillReached70 = true; milestoneReached = true;
    } else if (gameState.writingSkill >= 50 && !gameState.playerMilestones.writingSkillReached50) {
        friendPostTitle = \`🌟 \${pName} 작가님, 프로의 향기가?! 🌟\`;
        friendPostContent = \`\${pName} 작가님, 글쓰기 스킬 50 달성 축하드려요! 🥳 이제 정말 프로 작가님이라고 불러도 되겠는데요? 작가님의 다음 대작이 벌써부터 기다려집니다! #존잘님의_길 #문장력폭발\`;
        gameState.playerMilestones.writingSkillReached50 = true; milestoneReached = true;
    } else if (gameState.writingSkill >= 30 && !gameState.playerMilestones.writingSkillReached30) {
        friendPostTitle = \`✨ \${pName} 작가님, 글솜씨가 일취월장! ✨\`;
        friendPostContent = \`대박! \${pName} 작가님 글쓰기 스킬이 벌써 30을 넘으셨다니! 😮 역시 될성부른 떡잎은 다르다더니... 앞으로 얼마나 더 멋진 글을 쓰실지 기대돼요! 꾸준함이 비결! #글쓰기장인 #노력은배신하지않는다\`;
        gameState.playerMilestones.writingSkillReached30 = true; milestoneReached = true;
    } else if (gameState.popularity >= 100 && !gameState.playerMilestones.popularityReached100) {
        friendPostTitle = \`👑 \${pName} 작가님, 팬덤의 제왕 등극! 인기도 100! 👑\`;
        friendPostContent = \`경축! \${pName} 작가님의 인기도가 드디어 100을 달성했어요! 이건 정말 역사적인 순간이에요! ㅠㅠ 작가님의 작품이 수많은 사람들에게 사랑받고 있다는 증거죠! 앞으로도 멋진 활동 기대할게요! #팬덤대통령 #인기폭발_레전드\`;
        gameState.playerMilestones.popularityReached100 = true; milestoneReached = true;
    } else if (gameState.popularity >= 50 && !gameState.playerMilestones.popularityReached50) {
        friendPostTitle = \`🔥 \${pName} 작가님, 인기가 장난 아니에요! 🔥\`;
        friendPostContent = \`여러분 그거 아세요? \${pName} 작가님 인기도가 벌써 50을 돌파했대요! 🤩 역시 좋은 글은 모두가 알아보는 법! 작가님 슈스길만 걸으세요! #대세작가 #인기폭발\`;
        gameState.playerMilestones.popularityReached50 = true; milestoneReached = true;
    } else if (gameState.currentEvent?.submittedFicId && !gameState.playerMilestones.firstEventParticipation && gameState.publishedFics.some(f=>f.id === gameState.currentEvent!.submittedFicId && f.author === pName)) {
        friendPostTitle = \`🎉 \${pName} 작가님, 첫 이벤트 참가! 용기에 박수를! 🎉\`;
        friendPostContent = \`\${pName} 작가님이 드디어 이벤트에 작품을 내셨어요! 짝짝짝! 👏 처음은 항상 떨리지만, 이렇게 도전하는 모습 정말 멋져요! 좋은 결과 있기를 응원할게요! #첫이벤트 #용감한_도전 #결과보다_과정\`;
        gameState.playerMilestones.firstEventParticipation = true; milestoneReached = true;
    } else if (gameState.playerMilestones.publishedFicCount === 5 && !gameState.snsPosts.some(p => p.author === senpai.name && p.title.includes("5번째 작품"))) {
        friendPostTitle = \`📚 \${pName} 작가님, 벌써 5번째 작품이라니! 다작왕 등극?! 📚\`;
        friendPostContent = \`세상에, \${pName} 작가님이 벌써 5번째 작품을 완성하셨어요! 정말 대단한 창작열이세요! 🔥 작가님의 꾸준함과 열정 덕분에 저희는 항상 행복하답니다. 다음 작품도 기대할게요! #다작왕_예약 #창작열_리스펙\`;
        milestoneReached = true;
    }

    if (milestoneReached && friendPostContent) {
        gameState.snsPosts.unshift(createHNPost(senpai.name, friendPostTitle, friendPostContent, 10 + Math.floor(Math.random() * 15)));
        addLogEntry(\`\${senpai.name} posted a milestone celebration for \${pName}: \${friendPostTitle}\`, "milestone");
        if((uiElements['sns-feed'] as HTMLElement)?.style.display === 'flex') renderSNSFeed();
    }
}

function renderMessageLog() {
    const container = uiElements['message-log-container'] as HTMLElement;
    if (!container) return;
    container.innerHTML = '';

    const allLogs = [...gameState.dailyLogs, ...gameState.notificationLog.map(nl => ({ // Combine and map notification logs
        week: gameState.currentWeek, // Or a placeholder like -1 if preferred for notifications
        day: gameState.currentDay, // Or a placeholder
        message: \`[\${nl.timestamp}] \${nl.message}\`,
        type: nl.type as any // Cast to any to fit LogEntry['type'] for simplicity here
    }))];

    // Sort all logs by a derivable timestamp (approximating for dailyLogs)
    // This is a basic sort; more complex logic might be needed for perfect chronological order
    // For now, let's just show daily logs then notification logs, reversed for new-first feel.
    // A better approach would be to store full timestamps on dailyLogs too.

    const logsToDisplay = [...gameState.notificationLog].reverse(); // Newest notification logs first
    if (logsToDisplay.length === 0 && gameState.dailyLogs.length === 0) { // check both
        container.innerHTML = '<p class="text-sm text-gray-500">No messages or notifications logged yet.</p>';
        return;
    }
    
    // Display daily logs first (oldest to newest from array, but visually we might want newest on top)
    const dailyLogsReversed = [...gameState.dailyLogs].reverse();
    dailyLogsReversed.forEach(log => {
        const logDiv = document.createElement('div');
        logDiv.classList.add('log-entry', \`log-type-\${log.type}\`);
        logDiv.innerHTML = \`<span class="log-timestamp">W\${log.week}D\${log.day}:</span> \${escapeHTML(log.message)}\`;
        container.appendChild(logDiv);
    });


    logsToDisplay.forEach(log => {
        const logDiv = document.createElement('div');
        logDiv.classList.add('message-log-entry', \`log-msg-\${log.type}\`);
        logDiv.innerHTML = \`<span class="log-time">[\${log.timestamp}]</span> \${escapeHTML(log.message)}\`;
        container.appendChild(logDiv);
    });
}


function renderManageProjectsList() {
    const container = uiElements['fanfic-projects-list-container'] as HTMLElement;
    if (!container) return;
    container.innerHTML = '';

    const activeProjects = gameState.fanficProjects.filter(p => !gameState.publishedFics.some(pf => pf.id === p.id));

    if (activeProjects.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500">No active fanfic projects. Plan a new one!</p>';
        return;
    }

    activeProjects.sort((a, b) => a.title.localeCompare(b.title));

    activeProjects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.classList.add('fanfic-project-entry');
        const fandomSet = findFandomSetById(project.fandomSetId);
        const progressPercent = Math.round((project.progress / project.targetProgress) * 100);
        const isManuscriptComplete = project.progress >= project.targetProgress;
        const isFinalized = !!project.generatedContent;

        let statusText = \`In Progress (\${progressPercent}%)\`;
        if (isManuscriptComplete && !isFinalized) {
            statusText = 'Manuscript Complete (Ready to Finalize with AI)';
        } else if (isFinalized) {
            statusText = 'Finalized (Ready to Publish)';
        }

        projectDiv.innerHTML = \`
            <h4>\${escapeHTML(project.title)}</h4>
            <p><small>Fandom: \${escapeHTML(fandomSet?.workTitle || 'Unknown Fandom')}</small></p>
            <p class="text-sm font-medium \${isFinalized ? 'text-green-600' : (isManuscriptComplete ? 'text-blue-600' : 'text-yellow-600')}">Status: \${statusText}</p>
            <p><small>Target: \${project.targetProgress} WU, Current: \${project.progress} WU</small></p>
            <p><small>Genres: \${escapeHTML(project.genres.join(', ')) || 'N/A'}</small></p>
            <p><small>Materials: \${escapeHTML(project.materials.join(', ')) || 'N/A'}</small></p>
            <button class="open-project-detail-btn btn-secondary-sm !text-xs mt-2" data-project-id="\${project.id}">View/Manage Project</button>
        \`;
        container.appendChild(projectDiv);

        const viewButton = projectDiv.querySelector('.open-project-detail-btn') as HTMLButtonElement;
        viewButton?.addEventListener('click', () => {
            const projectId = viewButton.dataset.projectId;
            if (projectId) {
                openProjectDetailModal(projectId);
            }
        });
    });
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
        const storyModeEnabledSetup = (uiElements['initial-story-mode-checkbox'] as HTMLInputElement).checked;
        const initialPopTier = (uiElements['initial-fandom-popularity-tier'] as HTMLSelectElement).value as FandomPopularityTier;


        if (!playerName) { alert('Player Name is required!'); return; }
        if (!workTitle || !favChar || !favPairing) { alert('Primary Fandom (Work Title, Fav Character, Fav Pairing) are required!'); return; }
        if (!favPairing.includes('/')) {alert("Pairing format should be 'CharacterA/CharacterB'."); return;}

        if (!gameState.gameInitialized) {
            gameState.apiKey = apiKey; gameState.playerName = playerName;
            gameState.storyModeEnabled = storyModeEnabledSetup;
            const initialFandomSetId = \`fandomset-1\`;
            gameState.fandomSets = [{
                id: initialFandomSetId, workTitle,
                workDescription: (uiElements['fandom-work-desc'] as HTMLTextAreaElement).value.trim(),
                favCharacter: favChar, favCharacterDescription: favCharDesc,
                favPairing, pairingInterpretation: (uiElements['fandom-pairing-interp'] as HTMLTextAreaElement).value.trim(),
                isPrimary: true, reversePenaltyTriggers: {}, relationshipType: 'new_work', popularityTier: initialPopTier
            }];
            let basePopularity = 5;
            switch (initialPopTier) {
                case "ExtremeMinor": basePopularity = 1; break;
                case "Minor": basePopularity = 5; break;
                case "Average": basePopularity = 10; break;
                case "Major": basePopularity = 20; break;
                case "MegaHit": basePopularity = 35; break;
            }
            gameState.popularity = basePopularity;
            gameState.gameInitialized = true;
            addLogEntry(\`Game started by \${playerName}. Story Mode: \${storyModeEnabledSetup ? 'Enabled' : 'Disabled'}. Initial Pop Tier: \${initialPopTier} (+\${basePopularity} Pop).\`, "system");
            showPrologueIfNeeded();
            generateInitialSNSPosts();
        }
        (uiElements['tutorial-friend-toggle-main'] as HTMLInputElement).checked = gameState.tutorialFriendEnabled;
        (uiElements['setup-screen'] as HTMLElement).style.display = 'none';
        (uiElements['main-game-screen'] as HTMLElement).style.display = 'block';
        updateAllDisplays(); saveGameState();
    });
    (uiElements['start-week-button'] as HTMLButtonElement)?.addEventListener('click', handleStartWeek);
    (uiElements['manual-save-button'] as HTMLButtonElement)?.addEventListener('click', () => {saveGameState(); showNotification("Game Saved!", 'success', 2000);});
    (uiElements['start-over-button'] as HTMLButtonElement)?.addEventListener('click', startOver);
    (uiElements['clear-schedule-button'] as HTMLButtonElement)?.addEventListener('click', clearCurrentSchedule);

    (uiElements['manage-projects-button'] as HTMLButtonElement)?.addEventListener('click', () => {
        renderManageProjectsList();
        showArea('manage-projects-modal');
    });
    (uiElements['plan-new-project-from-manage-button'] as HTMLButtonElement)?.addEventListener('click', openFanficPlanningModal);

    (uiElements['start-new-project-button'] as HTMLButtonElement)?.addEventListener('click', handleStartNewProject);
    (uiElements['view-fics-button'] as HTMLButtonElement)?.addEventListener('click', () => { renderMyFicsList(); showArea('view-fics-area'); });
    (uiElements['view-sns-button'] as HTMLButtonElement)?.addEventListener('click', () => { renderSNSFeed(); showArea('sns-feed'); });
    (uiElements['analytics-button'] as HTMLButtonElement)?.addEventListener('click', () => {displayAnalytics(); showArea('analytics-area'); });
    (uiElements['edit-profile-button'] as HTMLButtonElement)?.addEventListener('click', openProfileEditModal);
    (uiElements['view-upcoming-events-button'] as HTMLButtonElement)?.addEventListener('click', () => { renderUpcomingEventsList(); showArea('upcoming-events-modal'); });
    (uiElements['confirm-event-fic-submission-button'] as HTMLButtonElement)?.addEventListener('click', handleSubmitToEvent);

    (uiElements['finalize-fic-button'] as HTMLButtonElement)?.addEventListener('click', (e) => {
        const projectId = (e.target as HTMLButtonElement).dataset.projectId;
        if (projectId) handleFinalizeFic(projectId);
    });
    (uiElements['post-fic-button'] as HTMLButtonElement)?.addEventListener('click', (e) => {
        const projectId = (e.target as HTMLButtonElement).dataset.projectId;
        if (projectId) handlePostFic(projectId);
    });
    (uiElements['submit-to-event-button'] as HTMLButtonElement)?.addEventListener('click', (e) => {
        const projectId = (e.target as HTMLButtonElement).dataset.projectId;
        const project = gameState.fanficProjects.find(p => p.id === projectId) || gameState.publishedFics.find(f => f.id === projectId);
        if (project && ( (project as ActiveFanficProject).generatedContent || (project as PublishedFic).content) && gameState.currentEvent) {
            const ficToSubmit = gameState.publishedFics.find(f => f.id === project.id);
            if (ficToSubmit) {
                openDoujinshiPrintingModal(ficToSubmit.id, gameState.currentEvent!.id, true);
            } else {
                openDoujinshiPrintingModal(project.id, gameState.currentEvent!.id, false);
            }
        } else { alert("Finalize the fanfic project first or select a published fic for the event!"); }
    });
    (uiElements['clear-fic-button'] as HTMLButtonElement)?.addEventListener('click', (e) => {
        const projectId = (e.target as HTMLButtonElement).dataset.projectId;
        const project = gameState.fanficProjects.find(p => p.id === projectId);
        if (project) {
            project.generatedContent = null;
            if (uiElements['generated-fic-output']) (uiElements['generated-fic-output'] as HTMLTextAreaElement).value = 'Manuscript (if complete) or previous AI text cleared. Ready to re-finalize if manuscript is done.';
            if (uiElements['post-fic-button']) (uiElements['post-fic-button'] as HTMLButtonElement).disabled = true;
            if (uiElements['submit-to-event-button']) (uiElements['submit-to-event-button'] as HTMLButtonElement).disabled = true; // Re-disable submit too
            if (uiElements['finalize-fic-button'] && project.progress >= project.targetProgress) {
                 (uiElements['finalize-fic-button'] as HTMLButtonElement).disabled = false;
            }
            showNotification("Generated fic output cleared. You can re-finalize if manuscript is complete.", 'info');
        }
    });
    
    (uiElements['fic-paid-checkbox'] as HTMLInputElement)?.addEventListener('change', (e) => {
        const isChecked = (e.target as HTMLInputElement).checked;
        const priceGroup = uiElements['fic-price-group'] as HTMLElement;
        const priceGroupSmall = uiElements['fic-price-group-small'] as HTMLElement;
        if(priceGroup) priceGroup.style.display = isChecked ? 'flex' : 'none';
        if(priceGroupSmall) priceGroupSmall.style.display = isChecked ? 'block' : 'none';
    });

    (uiElements['save-general-settings-button'] as HTMLButtonElement)?.addEventListener('click', handleSaveGeneralProfileSettings);
    (uiElements['add-new-fandom-set-button'] as HTMLButtonElement)?.addEventListener('click', () => handleEditFandomSetForm());
    (uiElements['save-fandom-set-button'] as HTMLButtonElement)?.addEventListener('click', handleSaveFandomSet);
    (uiElements['cancel-edit-fandom-set-button'] as HTMLButtonElement)?.addEventListener('click', () => {
        (uiElements['edit-fandom-set-form'] as HTMLElement).style.display = 'none';
    });
    (uiElements['edit-fandom-relationship-type'] as HTMLSelectElement)?.addEventListener('change', (e) => {
        const form = (e.target as HTMLElement).closest('#edit-fandom-set-form');
        if(!form) return;
        const relationship = (e.target as HTMLSelectElement).value;
        const workTitleInput = form.querySelector('#edit-fandom-work-title-input') as HTMLInputElement;
        const workDescInput = form.querySelector('#edit-fandom-work-desc-input') as HTMLTextAreaElement;
        const favCharInput = form.querySelector('#edit-fandom-fav-char-input') as HTMLInputElement;
        const favCharDescInput = form.querySelector('#edit-fandom-fav-char-desc-input') as HTMLTextAreaElement;
        const baseWorkGroup = form.querySelector('#select-base-fandom-set-group') as HTMLElement;
        const popularityTierGroup = form.querySelector('#edit-fandom-popularity-tier-group') as HTMLElement;
        const baseWorkSelect = form.querySelector('#select-base-fandom-set') as HTMLSelectElement;

        const isExtending = relationship !== 'new_work';
        workTitleInput.readOnly = isExtending; workDescInput.readOnly = isExtending;
        workTitleInput.classList.toggle('bg-gray-100', isExtending); workDescInput.classList.toggle('bg-gray-100', isExtending);
        if(baseWorkGroup) baseWorkGroup.style.display = isExtending ? 'block' : 'none';
        if(popularityTierGroup) popularityTierGroup.style.display = isExtending ? 'none' : 'block';

        if (relationship === 'existing_work_alt_interp') {
            favCharInput.readOnly = true; favCharDescInput.readOnly = true;
            favCharInput.classList.toggle('bg-gray-100', true); favCharDescInput.classList.toggle('bg-gray-100', true);
        } else {
            favCharInput.readOnly = false; favCharDescInput.readOnly = false;
            favCharInput.classList.remove('bg-gray-100'); favCharDescInput.classList.remove('bg-gray-100');
        }
        if (!isExtending) { // Clear base selection if switching to new_work
           if(baseWorkSelect) baseWorkSelect.value = "";
           workTitleInput.value = ""; workDescInput.value = "";
           favCharInput.value = ""; favCharDescInput.value = ""; // Clear char fields too for new work
        }
    });
    (uiElements['select-base-fandom-set'] as HTMLSelectElement)?.addEventListener('change', (e) => {
        const form = (e.target as HTMLElement).closest('#edit-fandom-set-form');
        if(!form) return;
        const baseFandomId = (e.target as HTMLSelectElement).value;
        const relationship = (form.querySelector('#edit-fandom-relationship-type') as HTMLSelectElement).value;
        const workTitleInput = form.querySelector('#edit-fandom-work-title-input') as HTMLInputElement;
        const workDescInput = form.querySelector('#edit-fandom-work-desc-input') as HTMLTextAreaElement;
        const favCharInput = form.querySelector('#edit-fandom-fav-char-input') as HTMLInputElement;
        const favCharDescInput = form.querySelector('#edit-fandom-fav-char-desc-input') as HTMLTextAreaElement;

        if (baseFandomId && (relationship === 'existing_work_new_chars_pairing' || relationship === 'existing_work_alt_interp')) {
            const baseFandom = findFandomSetById(baseFandomId);
            if (baseFandom) {
                workTitleInput.value = baseFandom.workTitle;
                workDescInput.value = baseFandom.workDescription;
                if (relationship === 'existing_work_alt_interp') {
                    favCharInput.value = baseFandom.favCharacter;
                    favCharDescInput.value = baseFandom.favCharacterDescription;
                }
            }
        }
    });

    (uiElements['open-player-custom-sns-post-modal-button'] as HTMLButtonElement)?.addEventListener('click', () => {
        updatePlayerSnsPostCooldownMessage(); // Ensure cooldown message is current
        showArea('player-custom-sns-post-modal');
    });
    (uiElements['player-custom-sns-post-content'] as HTMLTextAreaElement)?.addEventListener('input', (e) => {
        const content = (e.target as HTMLTextAreaElement).value;
        const remaining = 280 - content.length;
        const charCountEl = uiElements['player-custom-sns-post-char-count'] as HTMLElement;
        if(charCountEl) charCountEl.textContent = \`\${remaining} characters remaining\`;
    });
    (uiElements['submit-player-custom-sns-post-button'] as HTMLButtonElement)?.addEventListener('click', handleSubmitPlayerCustomSnsPost);
    (uiElements['view-message-log-button'] as HTMLButtonElement)?.addEventListener('click', () => {
        renderMessageLog();
        showArea('message-log-area');
    });
    (uiElements['close-prologue-button'] as HTMLButtonElement)?.addEventListener('click', () => {
        showArea(null); saveGameState(); // Save that prologue was shown
    });
    (uiElements['tutorial-friend-toggle-main'] as HTMLInputElement)?.addEventListener('change', (e) => {
        gameState.tutorialFriendEnabled = (e.target as HTMLInputElement).checked;
        const senpai = gameState.npcs.find(n => n.isMotivationalFriend);
        if(senpai) senpai.isMotivationalFriend = gameState.tutorialFriendEnabled; // Link to Senpai's active status
        showNotification(\`Supportive Senpai tips \${gameState.tutorialFriendEnabled ? 'Enabled' : 'Disabled'}.\`, 'info');
        saveGameState();
    });
    (uiElements['confirm-doujinshi-printing-button'] as HTMLButtonElement)?.addEventListener('click', handleConfirmDoujinshiPrinting);
    (uiElements['doujinshi-paper-quality'] as HTMLSelectElement)?.addEventListener('change', updateDoujinshiCostEstimate);
    (uiElements['doujinshi-cover-quality'] as HTMLSelectElement)?.addEventListener('change', updateDoujinshiCostEstimate);
    (uiElements['doujinshi-print-run-size'] as HTMLInputElement)?.addEventListener('input', updateDoujinshiCostEstimate);

}

// --- Main Game Init ---
document.addEventListener('DOMContentLoaded', () => {
    cacheUIElements();
    initializeGame();
    setupEventListeners();
});;
}
