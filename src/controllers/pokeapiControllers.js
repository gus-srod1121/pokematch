import axios from "axios";

const POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon";
const POKEMON_COUNT = 840;

export async function getMatchingPokemon(amount) {
    try {
        amount = parseInt(amount);
    } catch (error) {
        console.error("Error parsing pokemon amount:", error);
    }

    if (amount % 2 == 0) {
        amount /= 2;
    } else {
        throw new Error("Pokemon amount to fetch MUST be EVEN!");
    }

    const pokemonIds = new Set();

    while (pokemonIds.size < amount) {
        const randIndex = Math.round(Math.random() * POKEMON_COUNT) + 1;
        try {
            pokemonIds.add(randIndex);
        } catch (error) {
            console.error(error);
        }
    }

    const getPokemons = Array.from(pokemonIds).map((id) => getPokemon(id));

    try {
        const response = await Promise.all(getPokemons);
        const pokemon = response.map((res) => ({
            id: res.data.id,
            name: res.data.name,
            image_url: res.data.sprites.front_default,
        }));

        const pairedPokemon = [];
        for (const p of pokemon) {
            pairedPokemon.push({ ...p });
            pairedPokemon.push({ ...p });
        }
        return pairedPokemon;
    } catch (error) {
        console.error("Parallel promise fetch error:", error);
    }
}

async function getPokemon(pokeIndex) {
    try {
        const response = await axios.get(`${POKEAPI_URL}/${pokeIndex}`, {
            timeout: 5000,
        });
        return response;
    } catch (error) {
        console.error(`Error fetching ID ${pokeIndex}from axios:`, error);
    } finally {
        console.log(`Request for ID ${pokeIndex} completed`);
    }
}
