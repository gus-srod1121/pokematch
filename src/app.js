import express from "express";
import cors from "cors";
import pokemonRoutes from "./routes/pokeapiRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import sendPage from "./utils/sendPage.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

app.get("/", (req, res) => res.redirect("/game"));
app.get("/game", (req, res) => sendPage(res, "game.html"));

app.use("/api/pokemon", pokemonRoutes);

app.get("/*any", (req, res) => sendPage(res, "notfound.html"));
app.use(errorHandler);

export default app;
