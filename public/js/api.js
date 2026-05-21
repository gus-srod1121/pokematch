export async function fetchPokemonCards(count) {
    try {
        const response = await fetch(`/api/pokemon?amount=${count}`);
        if (!response.ok) throw new Error("Failed to fetch Pokémon data");
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
    }
}
