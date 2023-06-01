import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { exchangeRatesMiddleware } from "./exchangeRates";
import { query } from "./controllers/queryController";
import { create } from "./controllers/createController";

dotenv.config();

export const app = express();

app.use(helmet());
app.use(express.text({ type: "text/csv" }));
app.use(express.json());
app.use(exchangeRatesMiddleware);

app.get("/api/query", query);
app.post("/api/create", create);
