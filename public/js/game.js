import { fetchPokemonCards } from "./api.js";

const DIFFICULTIES = {
    EASY: { rows: 2, cols: 3, time: 60 },
    MEDIUM: { rows: 3, cols: 4, time: 120 },
    HARD: { rows: 4, cols: 5, time: 180 },
};

let gameState = {
    gameActive: false,
    powerActive: false,
    timer: {
        timerId: null,
        timeLeft: 0,
    },
    currentDifficulty: Object.keys(DIFFICULTIES)[0],
    flippedCards: [],
    stats: {
        clicks: 0,
        pairsMatched: 0,
        totalPairs: 0,
    },
};
const powerupInterval = 5;
const powerupDuration = 1000;

const gameGrid = document.getElementById("game");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");

const clickCounter = document.getElementById("click-counter");
const totalPairsCounter = document.getElementById("totalpairs-counter");
const matchCounter = document.getElementById("match-counter");
const pairsLeftCounter = document.getElementById("pairsleft-counter");

const timer = document.getElementById("timer");
const progressBar = document.getElementById("game-progress");

const difficultyDropdownList = document.getElementById("difficulty-dropdown-list");
const difficultyLabel = document.getElementById("difficulty-label");

const cardTemplate = document.getElementById("card-template");
const rowTemplate = document.getElementById("row-template");

function setup() {
    populateDifficulty();
    resetGame();

    startBtn.addEventListener("click", startGame);
    resetBtn.addEventListener("click", resetGame);
}

function populateDifficulty() {
    difficultyDropdownList.innerHTML = "";

    Object.keys(DIFFICULTIES).forEach((difficulty) => {
        const li = document.createElement("li");
        const button = document.createElement("button");

        button.textContent = difficulty;

        if (difficulty == gameState.currentDifficulty) {
            button.textContent += " X";
            difficultyLabel.textContent = difficulty;
        }

        button.addEventListener("click", (e) => {
            selectDifficulty(e, difficulty);
        });
        li.appendChild(button);
        difficultyDropdownList.appendChild(li);
    });
}

function selectDifficulty(e, difficulty) {
    gameState.currentDifficulty = difficulty;
    timer.innerText = `${DIFFICULTIES[gameState.currentDifficulty].time}`;

    const allButtons = difficultyDropdownList.querySelectorAll("button");
    const allDifficulties = Object.keys(DIFFICULTIES);
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].textContent = allDifficulties[i];
    }

    const button = e.currentTarget;
    button.textContent += " X";
    difficultyLabel.textContent = difficulty;

    document.activeElement.blur();
}

function startGame() {
    if (gameState.gameActive) {
        console.log("Game already running");
        return;
    }

    gameState.gameActive = true;
    const { rows, cols } = DIFFICULTIES[gameState.currentDifficulty];
    gameState.stats.totalPairs = (rows * cols) / 2;
    totalPairsCounter.innerText = `${gameState.stats.totalPairs}`;

    startTimer();
    createBoard(rows, cols);
}

function startTimer() {
    clearInterval(gameState.timer.timerId);

    const totalTime = DIFFICULTIES[gameState.currentDifficulty].time;
    gameState.timer.timeLeft = totalTime;

    progressBar.max = totalTime;
    progressBar.value = 0;

    timer.innerText = `${gameState.timer.timeLeft}`;

    gameState.timer.timerId = setInterval(() => {
        gameState.timer.timeLeft--;
        // progressBar.value = (gameState.timer.timeLeft * 100) / totalTime;
        timer.innerText = `${gameState.timer.timeLeft}`;
        progressBar.value = gameState.timer.timeLeft;

        if (
            gameState.timer.timeLeft % powerupInterval == 0 &&
            gameState.timer.timeLeft != totalTime
        ) {
            triggerPowerup();
        }

        if (gameState.timer.timeLeft <= 0) {
            clearInterval(gameState.timer.timerId);
            gameState.gameActive = false;

            setTimeout(() => {
                alert("Game Over! You ran out of time.");
            }, 200);
        }
    }, 1000);
}

function triggerPowerup() {
    console.log("Powerup active");
    gameState.powerupActive = true;

    const allCards = Array.from(document.querySelectorAll(".card"));

    const unmatchedCards = allCards.filter((card) => !(card.classList.contains("matched") || card.classList.contains("flipped")));
    unmatchedCards.forEach((card) => card.classList.add("flipped"));

    setTimeout(() => {
        unmatchedCards.forEach((card) => {
            card.classList.remove("flipped");
        });
        gameState.powerActive = false;
    }, powerupDuration);
}

async function createBoard(rows, cols) {
    gameGrid.innerHTML = "";
    let pokemons;
    try {
        pokemons = await fetchPokemonCards(rows * cols);
    } catch (error) {
        console.error("API error:", error);
        return;
    }

    if (!pokemons || !Array.isArray(pokemons)) {
        console.error("API did not return a sortable object");
        return;
    }

    shuffle(pokemons);
    let deckIndex = 0;

    for (let i = 0; i < rows; i++) {
        const row = rowTemplate.content.cloneNode(true).querySelector("div");
        for (let j = 0; j < cols; j++) {
            if (deckIndex >= pokemons.length) {
                console.error("Not enough pokemon to fill the board");
                break;
            }
            const data = pokemons[deckIndex];
            const card = cardTemplate.content.cloneNode(true).querySelector(".card");

            const image = card.querySelector(".pokemon-img");
            if (image) {
                image.src = data.image_url;
                image.alt = data.name || "Unknown pokemon";
            } else {
                console.error(`<img> object for card no. ${deckIndex} not found.`);
            }

            card.addEventListener("click", () => {
                if (!(gameState.gameActive || gameState.powerActive)) {
                    console.log("Game not started");
                    return;
                }

                if (gameState.flippedCards.length >= 2) {
                    console.log("Too many cards flipped:", gameState.flippedCards);
                }

                if (card.classList.contains("flipped") || card.classList.contains("matched")) {
                    return;
                }

                card.classList.toggle("flipped");
                gameState.flippedCards.push(card);

                clickCounter.innerText = `${++gameState.stats.clicks}`;

                if (gameState.flippedCards.length == 2) {
                    checkForMatch();
                }
            });

            card.setAttribute("poke-id", data.id);

            row.appendChild(card);
            deckIndex++;
        }
        gameGrid.appendChild(row);
    }
}

function checkForMatch() {
    const [card1, card2] = gameState.flippedCards;

    const id1 = card1.getAttribute("poke-id");
    const id2 = card2.getAttribute("poke-id");

    if (id1 == id2) {
        /* MATCH */
        console.log("Match!");
        card1.classList.add("matched");
        card2.classList.add("matched");

        gameState.stats.pairsMatched++;
        gameState.flippedCards = [];

        pairsLeftCounter.innerText = `${gameState.stats.totalPairs - gameState.stats.pairsMatched}`;
        matchCounter.innerText = `${gameState.stats.pairsMatched}`;

        if (gameState.stats.pairsMatched == gameState.stats.totalPairs) {
            setTimeout(() => {
                clearInterval(gameState.timer.timerId);
                alert(`You won! Completed in ${gameState.stats.clicks} clicks.`);
            }, 500);
        }
    } else {
        /* NO MATCH */
        console.log("No match, removing flipped");
        gameState.flippedCards = [];
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
        }, 400);
    }
}

function shuffle(group) {
    for (let i = 1; i < group.length; i++) {
        const j = Math.floor(Math.random() * i);
        const temp = group[i];
        group[i] = group[j];
        group[j] = temp;
    }
    return group;
}

function resetGame() {
    clearInterval(gameState.timer.timerId);
    gameGrid.innerHTML = "";
    progressBar.value = 0;

    gameState.gameActive = false;
    gameState.powerupActive = false;

    gameState.timer.timerId = null;
    gameState.timer.timeLeft = 0;

    gameState.stats.clicks = 0;
    gameState.stats.pairsMatched = 0;
    gameState.stats.totalPairs = 0;
    gameState.flippedCards = [];

    clickCounter.innerText = "0";
    totalPairsCounter.innerText = "0";
    matchCounter.innerText = "0";
    pairsLeftCounter.innerText = "0";
    timer.innerText = DIFFICULTIES[gameState.currentDifficulty].time;
}

setup();
