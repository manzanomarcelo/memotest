"use strict";

const STORAGE_KEYS = {
  bestScores: "memotest-best-scores-v2",
  soundEnabled: "memotest-sound-enabled-v1",
};

const CONFIG = {
  flipDelay: 650,
  initialReveal: 2200,
  timerUpdate: 1000,
};

const flagCards = [
  { id: "argentina", src: "images/flag-argentina.webp", label: "Argentina" },
  { id: "bolivia", src: "images/Flag-Bolivia.webp", label: "Bolivia" },
  { id: "brazil", src: "images/Flag-Brazil.webp", label: "Brasil" },
  { id: "denmark", src: "images/Flag-Denmark.webp", label: "Dinamarca" },
  { id: "finland", src: "images/flag-finland.webp", label: "Finlandia" },
  { id: "iceland", src: "images/Flag-Iceland.webp", label: "Islandia" },
  { id: "norway", src: "images/Flag-Norway.webp", label: "Noruega" },
  { id: "paraguay", src: "images/Flag-Paraguay.webp", label: "Paraguay" },
  { id: "sweden", src: "images/flag-sweden.webp", label: "Suecia" },
  { id: "uruguay", src: "images/flag-uruguay.webp", label: "Uruguay" },
];

const difficulties = {
  easy: { pairs: 4, maxColumns: 4, label: "Facil" },
  medium: { pairs: 8, maxColumns: 4, label: "Media" },
  hard: { pairs: 10, maxColumns: 5, label: "Dificil" },
};

const elements = {
  timer: document.querySelector(".timer"),
  moves: document.querySelector(".moves"),
  pairsFound: document.querySelector(".pairs-found"),
  bestSummary: document.querySelector(".best-summary"),
  difficultySelect: document.getElementById("difficulty-select"),
  cardsSection: document.getElementById("cards-section"),
  statusMessage: document.getElementById("status-message"),
  newGameButton: document.getElementById("new-game"),
  toggleSoundButton: document.getElementById("toggle-sound"),
  winModal: document.getElementById("win-modal"),
  playAgainButton: document.getElementById("play-again"),
  finalDifficulty: document.getElementById("final-difficulty"),
  finalTime: document.getElementById("final-time"),
  finalMoves: document.getElementById("final-moves"),
  bestTime: document.getElementById("best-time"),
  bestMoves: document.getElementById("best-moves"),
};

const audio = {
  match: new Audio("audio/match.mp3"),
  flip: new Audio("audio/flip.mp3"),
  win: new Audio("audio/winner.mp3"),
  error: new Audio("audio/error.mp3"),
};

const state = {
  currentDifficulty: elements.difficultySelect.value || "medium",
  bestScores: loadBestScores(),
  soundEnabled: loadSoundPreference(),
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  moves: 0,
  startTime: 0,
  elapsedTime: 0,
  gameStarted: false,
  boardLocked: true,
  focusIndex: 0,
  resizeTicking: false,
  lastFocusedBeforeModal: null,
  intervalId: 0,
  revealTimeoutId: 0,
  resolveTimeoutId: 0,
};

Object.values(audio).forEach((track) => {
  track.preload = "auto";
});

function createEmptyBestScores() {
  return Object.keys(difficulties).reduce((accumulator, key) => {
    accumulator[key] = { time: null, moves: null };
    return accumulator;
  }, {});
}

function normalizeScoreValue(value) {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized >= 0 ? normalized : null;
}

function loadBestScores() {
  const fallback = createEmptyBestScores();

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEYS.bestScores);
    if (!rawValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(rawValue);
    return Object.keys(difficulties).reduce((accumulator, key) => {
      const score = parsedValue && typeof parsedValue === "object" ? parsedValue[key] : null;
      accumulator[key] = {
        time: normalizeScoreValue(score && score.time),
        moves: normalizeScoreValue(score && score.moves),
      };
      return accumulator;
    }, {});
  } catch (error) {
    return fallback;
  }
}

function saveBestScores() {
  try {
    window.localStorage.setItem(STORAGE_KEYS.bestScores, JSON.stringify(state.bestScores));
  } catch (error) {
    // Ignore storage errors so the game keeps working.
  }
}

function loadSoundPreference() {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEYS.soundEnabled);
    return storedValue === null ? true : storedValue === "true";
  } catch (error) {
    return true;
  }
}

function saveSoundPreference() {
  try {
    window.localStorage.setItem(STORAGE_KEYS.soundEnabled, String(state.soundEnabled));
  } catch (error) {
    // Ignore storage errors so the game keeps working.
  }
}

function shuffleArray(array) {
  const copy = [...array];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getCurrentDifficultyConfig() {
  return difficulties[state.currentDifficulty];
}

function getCurrentBestScore() {
  return state.bestScores[state.currentDifficulty];
}

function buildBestSummary(score) {
  if (!score || (score.time === null && score.moves === null)) {
    return "Sin marca";
  }

  const timeText = score.time === null ? "--:--" : formatTime(score.time);
  const movesText = score.moves === null ? "-- mov." : `${score.moves} mov.`;
  return `${timeText} / ${movesText}`;
}

function setStatus(message) {
  elements.statusMessage.textContent = message;
}

function updateBestScoreUI() {
  const score = getCurrentBestScore();
  elements.bestSummary.textContent = buildBestSummary(score);
  elements.bestTime.textContent = score.time === null ? "Sin marca" : formatTime(score.time);
  elements.bestMoves.textContent = score.moves === null ? "Sin marca" : `${score.moves}`;
}

function updateStatsUI() {
  elements.timer.textContent = formatTime(state.elapsedTime);
  elements.moves.textContent = String(state.moves);
  elements.pairsFound.textContent = `${state.matchedPairs}/${getCurrentDifficultyConfig().pairs}`;
  updateBestScoreUI();
}

function updateSoundButtonUI() {
  elements.toggleSoundButton.textContent = state.soundEnabled ? "Sonido activado" : "Sonido desactivado";
  elements.toggleSoundButton.setAttribute("aria-pressed", String(state.soundEnabled));
}

function clearScheduledTasks() {
  window.clearInterval(state.intervalId);
  window.clearTimeout(state.revealTimeoutId);
  window.clearTimeout(state.resolveTimeoutId);
  state.intervalId = 0;
  state.revealTimeoutId = 0;
  state.resolveTimeoutId = 0;
}

function setModalOpen(isOpen, restoreFocus = true) {
  if (isOpen) {
    state.lastFocusedBeforeModal =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }

  elements.winModal.hidden = !isOpen;
  elements.winModal.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("modal-open", isOpen);

  if (isOpen) {
    window.requestAnimationFrame(() => {
      elements.playAgainButton.focus();
    });
    return;
  }

  if (!restoreFocus) {
    return;
  }

  const fallbackFocusTarget =
    state.lastFocusedBeforeModal instanceof HTMLElement &&
    document.contains(state.lastFocusedBeforeModal)
      ? state.lastFocusedBeforeModal
      : elements.newGameButton;

  window.requestAnimationFrame(() => {
    fallbackFocusTarget.focus();
  });
}

function updateTimer() {
  if (!state.gameStarted) {
    return;
  }

  state.elapsedTime = Date.now() - state.startTime;
  elements.timer.textContent = formatTime(state.elapsedTime);
}

function startTimerIfNeeded() {
  if (state.gameStarted) {
    return;
  }

  state.gameStarted = true;
  state.startTime = Date.now() - state.elapsedTime;
  state.intervalId = window.setInterval(updateTimer, CONFIG.timerUpdate);
  updateTimer();
}

function updateBestScoresForCurrentGame() {
  const currentBest = getCurrentBestScore();

  if (currentBest.time === null || state.elapsedTime < currentBest.time) {
    currentBest.time = state.elapsedTime;
  }

  if (currentBest.moves === null || state.moves < currentBest.moves) {
    currentBest.moves = state.moves;
  }

  saveBestScores();
}

function playAudio(track) {
  if (!state.soundEnabled) {
    return;
  }

  try {
    const instance = track.cloneNode();
    instance.volume = 0.6;
    instance.play().catch(() => {});
  } catch (error) {
    // Ignore audio errors so they do not block the game.
  }
}

function primeAudio() {
  try {
    const instance = audio.flip.cloneNode();
    instance.volume = 0;
    instance.play().then(() => {
      instance.pause();
      instance.currentTime = 0;
    }).catch(() => {});
  } catch (error) {
    // Ignore audio priming errors.
  }
}

function createDeck() {
  const difficulty = getCurrentDifficultyConfig();
  const selectedFlags = shuffleArray(flagCards).slice(0, difficulty.pairs);
  const duplicatedCards = selectedFlags.flatMap((card, pairIndex) => [
    {
      uid: `${card.id}-${pairIndex}-a`,
      pairId: card.id,
      label: card.label,
      src: card.src,
      flipped: false,
      matched: false,
    },
    {
      uid: `${card.id}-${pairIndex}-b`,
      pairId: card.id,
      label: card.label,
      src: card.src,
      flipped: false,
      matched: false,
    },
  ]);

  return shuffleArray(duplicatedCards);
}

function getCardButtons() {
  return Array.from(elements.cardsSection.querySelectorAll(".card-button"));
}

function getBoardColumnCount() {
  const templateColumns = window.getComputedStyle(elements.cardsSection).gridTemplateColumns;
  if (!templateColumns || templateColumns === "none") {
    return 1;
  }

  return templateColumns.split(" ").length;
}

function updateBoardLayout() {
  const totalCards = getCurrentDifficultyConfig().pairs * 2;
  const maxColumns = Math.min(getCurrentDifficultyConfig().maxColumns, totalCards);
  const viewportWidth = window.innerWidth;
  const minCardWidth = viewportWidth < 480 ? 70 : viewportWidth < 768 ? 86 : 112;
  const availableWidth = elements.cardsSection.clientWidth || window.innerWidth;
  const gap = parseFloat(window.getComputedStyle(elements.cardsSection).gap) || 0;
  const fittedColumns = Math.floor((availableWidth + gap) / (minCardWidth + gap));
  const minimumColumns = availableWidth >= minCardWidth * 2 ? 2 : 1;
  const columns = Math.max(
    minimumColumns,
    Math.min(maxColumns, fittedColumns || 1, totalCards)
  );

  elements.cardsSection.style.setProperty("--board-cols", String(columns));
}

function updateFocus(shouldMoveFocus = false) {
  const buttons = getCardButtons();
  if (!buttons.length) {
    return;
  }

  state.focusIndex = Math.min(state.focusIndex, buttons.length - 1);

  buttons.forEach((button, index) => {
    const isFocused = index === state.focusIndex;
    button.tabIndex = isFocused ? 0 : -1;
    button.classList.toggle("focused", isFocused);
  });

  if (shouldMoveFocus) {
    buttons[state.focusIndex].focus({ preventScroll: true });
  }
}

function syncCardButtons() {
  const buttons = getCardButtons();

  buttons.forEach((button, index) => {
    const card = state.cards[index];
    const isVisible = card.flipped || card.matched;
    let accessibleLabel = `Carta ${index + 1} boca abajo.`;

    if (card.matched) {
      accessibleLabel = `Bandera de ${card.label}. Pareja encontrada.`;
    } else if (isVisible) {
      accessibleLabel = `Bandera de ${card.label}. Carta descubierta.`;
    }

    button.classList.toggle("is-flipped", isVisible);
    button.classList.toggle("matched", card.matched);
    button.setAttribute("aria-label", accessibleLabel);
    button.setAttribute("aria-pressed", String(isVisible));
    button.setAttribute("data-state", card.matched ? "matched" : isVisible ? "visible" : "hidden");
  });

  elements.cardsSection.classList.toggle("is-locked", state.boardLocked);
  elements.cardsSection.setAttribute(
    "aria-label",
    `Tablero MemoTest, dificultad ${getCurrentDifficultyConfig().label}, ${getCurrentDifficultyConfig().pairs} parejas.`
  );
  updateFocus(false);
}

function renderBoard() {
  elements.cardsSection.innerHTML = state.cards
    .map(
      (card, index) => `
        <div class="card">
          <button
            class="card-button"
            type="button"
            data-card-id="${card.uid}"
            aria-label="Carta ${index + 1} boca abajo."
          >
            <span class="card-face card-front" aria-hidden="true">
              <img src="${card.src}" alt="" decoding="async" />
            </span>
            <span class="card-face card-back" aria-hidden="true">
              <img src="images/Orange_question_mark.svg.png" alt="" decoding="async" />
            </span>
          </button>
        </div>
      `
    )
    .join("");

  updateBoardLayout();
  syncCardButtons();
}

function startRevealPhase() {
  state.boardLocked = true;
  state.cards.forEach((card) => {
    card.flipped = true;
  });

  syncCardButtons();
  setStatus("Memoriza las cartas. En unos segundos empieza la partida.");

  state.revealTimeoutId = window.setTimeout(() => {
    state.cards.forEach((card) => {
      card.flipped = false;
    });

    state.boardLocked = false;
    syncCardButtons();
    setStatus("Partida lista. Encuentra todas las parejas.");
  }, CONFIG.initialReveal);
}

function finishGame() {
  window.clearInterval(state.intervalId);
  state.intervalId = 0;
  state.gameStarted = false;
  state.boardLocked = true;
  state.elapsedTime = Date.now() - state.startTime;

  updateBestScoresForCurrentGame();
  updateStatsUI();
  syncCardButtons();

  elements.finalDifficulty.textContent = getCurrentDifficultyConfig().label;
  elements.finalTime.textContent = formatTime(state.elapsedTime);
  elements.finalMoves.textContent = String(state.moves);

  const bestScore = getCurrentBestScore();
  elements.bestTime.textContent = bestScore.time === null ? "Sin marca" : formatTime(bestScore.time);
  elements.bestMoves.textContent = bestScore.moves === null ? "Sin marca" : `${bestScore.moves}`;

  setStatus(
    `Partida completada en ${formatTime(state.elapsedTime)} con ${state.moves} movimientos.`
  );
  setModalOpen(true, false);
  playAudio(audio.win);
}

function resolveTurn() {
  state.boardLocked = true;
  const [firstCard, secondCard] = state.flippedCards;
  const isMatch = firstCard.pairId === secondCard.pairId;

  state.resolveTimeoutId = window.setTimeout(() => {
    if (isMatch) {
      firstCard.matched = true;
      secondCard.matched = true;
      state.matchedPairs += 1;
      setStatus(`Encontraste la pareja de ${firstCard.label}.`);
      playAudio(audio.match);
    } else {
      firstCard.flipped = false;
      secondCard.flipped = false;
      setStatus("No coinciden. Intentalo otra vez.");
      playAudio(audio.error);
    }

    state.flippedCards = [];
    updateStatsUI();
    syncCardButtons();

    if (state.matchedPairs === getCurrentDifficultyConfig().pairs) {
      finishGame();
      return;
    }

    state.boardLocked = false;
    syncCardButtons();
  }, CONFIG.flipDelay);
}

function handleCardSelection(cardId) {
  const selectedCard = state.cards.find((card) => card.uid === cardId);

  if (!selectedCard || state.boardLocked || selectedCard.flipped || selectedCard.matched) {
    return;
  }

  startTimerIfNeeded();
  selectedCard.flipped = true;
  state.flippedCards.push(selectedCard);
  state.moves += 1;

  updateStatsUI();
  syncCardButtons();
  playAudio(audio.flip);

  if (state.flippedCards.length === 1) {
    setStatus("Busca la carta que completa la pareja.");
    return;
  }

  resolveTurn();
}

function startNewGame(options = {}) {
  const { focusBoard = false } = options;

  clearScheduledTasks();
  state.currentDifficulty = elements.difficultySelect.value;
  state.cards = createDeck();
  state.flippedCards = [];
  state.matchedPairs = 0;
  state.moves = 0;
  state.startTime = 0;
  state.elapsedTime = 0;
  state.gameStarted = false;
  state.boardLocked = true;
  state.focusIndex = 0;

  setModalOpen(false, false);
  updateStatsUI();
  renderBoard();

  if (focusBoard) {
    const firstButton = getCardButtons()[0];
    if (firstButton) {
      firstButton.focus({ preventScroll: true });
    }
  }

  startRevealPhase();
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  updateSoundButtonUI();
  saveSoundPreference();
  setStatus(state.soundEnabled ? "Sonido activado." : "Sonido desactivado.");
}

function handleBoardClick(event) {
  const targetButton = event.target.closest(".card-button");
  if (!targetButton) {
    return;
  }

  handleCardSelection(targetButton.dataset.cardId);
}

function handleBoardFocus(event) {
  const targetButton = event.target.closest(".card-button");
  if (!targetButton) {
    return;
  }

  const buttons = getCardButtons();
  const nextFocusIndex = buttons.indexOf(targetButton);

  if (nextFocusIndex >= 0) {
    state.focusIndex = nextFocusIndex;
    updateFocus(false);
  }
}

function handleKeyboardNavigation(event) {
  const activeElement = document.activeElement;
  const focusIsInsideModal =
    activeElement instanceof HTMLElement && Boolean(activeElement.closest(".modal"));

  if (elements.winModal.classList.contains("is-open")) {
    if (event.key === "Escape") {
      event.preventDefault();
      setModalOpen(false);
      setStatus("Resumen cerrado. Puedes iniciar una nueva partida cuando quieras.");
    }
    return;
  }

  if (
    activeElement instanceof HTMLElement &&
    activeElement.matches("select, input, textarea, button:not(.card-button)")
  ) {
    return;
  }

  if (focusIsInsideModal || !state.cards.length) {
    return;
  }

  const columns = getBoardColumnCount();

  if (event.key === "ArrowRight") {
    event.preventDefault();
    state.focusIndex = (state.focusIndex + 1) % state.cards.length;
    updateFocus(true);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    state.focusIndex = (state.focusIndex - 1 + state.cards.length) % state.cards.length;
    updateFocus(true);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    state.focusIndex = Math.max(0, state.focusIndex - columns);
    updateFocus(true);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    state.focusIndex = Math.min(state.cards.length - 1, state.focusIndex + columns);
    updateFocus(true);
  } else if (event.key === "Home") {
    event.preventDefault();
    state.focusIndex = 0;
    updateFocus(true);
  } else if (event.key === "End") {
    event.preventDefault();
    state.focusIndex = state.cards.length - 1;
    updateFocus(true);
  } else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const button = getCardButtons()[state.focusIndex];
    if (button) {
      handleCardSelection(button.dataset.cardId);
    }
  }
}

function handleResize() {
  if (state.resizeTicking) {
    return;
  }

  state.resizeTicking = true;
  window.requestAnimationFrame(() => {
    updateBoardLayout();
    updateFocus(false);
    state.resizeTicking = false;
  });
}

elements.cardsSection.addEventListener("click", handleBoardClick);
elements.cardsSection.addEventListener("focusin", handleBoardFocus);
elements.difficultySelect.addEventListener("change", () => {
  startNewGame();
});
elements.newGameButton.addEventListener("click", () => {
  startNewGame();
});
elements.playAgainButton.addEventListener("click", () => {
  startNewGame({ focusBoard: true });
});
elements.toggleSoundButton.addEventListener("click", toggleSound);
window.addEventListener("resize", handleResize);
window.addEventListener("pointerdown", primeAudio, { once: true });
window.addEventListener("keydown", primeAudio, { once: true });
document.addEventListener("keydown", handleKeyboardNavigation);

updateSoundButtonUI();
updateStatsUI();
setModalOpen(false, false);
startNewGame();
