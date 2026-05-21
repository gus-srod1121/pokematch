import { fetchPokemonCards } from "./api.js";

const DIFFICULTIES = {
    EASY: { rows: 2, cols: 3, time: 60 },
    MEDIUM: { rows: 3, cols: 4, time: 120 },
    HARD: { rows: 4, cols: 5, time: 180 },
};

let gameState = {
    isGameActive: false,
    currentDifficulty: Object.keys(DIFFICULTIES)[0],
    flippedCards: [],
    stats: {
        clicks: 0,
        pairsMatched: 0,
        totalPairs: 0,
    },
};

const gameGrid = document.getElementById("game");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");

const clickCounter = document.getElementById("click-counter");
const totalPairsCounter = document.getElementById("totalpairs-counter");
const matchCounter = document.getElementById("match-counter");
const pairsLeftCounter = document.getElementById("pairsleft-counter");

const progressBar = document.getElementById("game-progress");

const difficultyDropdownList = document.getElementById("difficulty-dropdown-list");
const difficultyLabel = document.getElementById("difficulty-label");

const cardTemplate = document.getElementById("card-template");
const rowTemplate = document.getElementById("row-template");

function setup() {
    populateDifficulty();

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
    if (gameState.isGameActive) {
        console.log("Game already running");
        return;
    }

    gameState.isGameActive = true;
    const { rows, cols } = DIFFICULTIES[gameState.currentDifficulty];
    gameState.stats.totalPairs = (rows * cols) / 2;
    totalPairsCounter.innerText = `${gameState.stats.totalPairs}`;

    createBoard(rows, cols);
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
                console.log("Card clicked");
                console.log("IsGameActive:", gameState.isGameActive);
                console.log("Flipped Cards:", gameState.flippedCards.length);
                console.log("Does card have 'flipped' class?:", card.classList.contains("flipped"));

                if (!gameState.isGameActive) {
                    console.log("BLOCKED: Game is not active! Did you press the Start button?");
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

        gameState.pairsMatched++;
        gameState.flippedCards = [];

        pairsLeftCounter.innerText = `${gameState.stats.totalPairs - gameState.stats.pairsMatched}`;
        matchCounter.innerText = `${gameState.stats.pairsMatched}`;

        if (gameState.stats.pairsMatched == gameState.stats.totalPairs) {
            alert(`You won! Completed in ${gameState.stats.clicks} clicks.`);
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
    gameGrid.innerHTML = "";
    progressBar.value = 0;
    gameState.isGameActive = false;
    gameState.stats.clicks = 0;
    gameState.stats.pairsMatched = 0;
    gameState.stats.totalPairs = 0;
    gameState.flippedCards = [];
}

setup();
