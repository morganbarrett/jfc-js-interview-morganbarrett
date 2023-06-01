import axios from "axios";
import fx from "money";
import { Request, Response, NextFunction } from "express";

const exchangeRatesEndpoint = "https://openexchangerates.org/api/latest.json";

const loadExchangeRates = async () => {
  const response = await axios.get(exchangeRatesEndpoint, {
    params: {
      app_id: process.env.OXR_APP_ID,
    },
  });

  if (response.status !== 200) {
    throw new Error(`Failed to load "${exchangeRatesEndpoint}".`);
  }

  return response.data;
};

// loads the exchange rates into memory before starting routing
export const exchangeRatesMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { base, rates } = await loadExchangeRates();

    fx.base = base;
    fx.rates = rates;

    next();
  } catch (error) {
    res.status(500).json({ error });
  }
};
