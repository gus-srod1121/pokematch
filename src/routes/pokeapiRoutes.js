import express from "express";
import { getMatchingPokemon } from "../controllers/pokeapiControllers.js";
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const pokemonAmount = req.query.amount;
        const pokemonList = await getMatchingPokemon(pokemonAmount);
        return res.json(pokemonList);
    } catch (error) {
        console.log("Route error:", error);
    }
});

export default router;
