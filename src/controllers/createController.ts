import express from "express";
import Joi from "joi";
import { createDeals, RawDeal } from "../models/Deal";

const createSchema = Joi.array().items(
  Joi.object({
    url: Joi.string().required(),
    flightCode: Joi.string().required(),
    origin: Joi.string().length(3).uppercase().required(),
    destination: Joi.string().length(3).uppercase().required(),
    departureDate: Joi.string().isoDate(),
    departureTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/),
    duration: Joi.number().integer().required(),
    cost: Joi.number().required(),
    currency: Joi.string().length(3).uppercase().required(),
  })
);

//parses a csv string in the expected format from scrapers
export const parseCSV = (csv: string) =>
  !csv
    ? []
    : csv
        .split("\n")
        .map((row) => row.split(","))
        .filter((fields) => fields[0] !== "URL")
        .map((arr) => ({
          url: arr[0],
          flightCode: arr[1],
          origin: arr[2],
          destination: arr[3],
          departureDate: arr[4],
          departureTime: arr[5],
          duration: arr[6],
          cost: arr[7],
          currency: arr[8],
        }));

//endpoint for adding deals to the database
export const create = async (req: express.Request, res: express.Response) => {
  const dealsData = parseCSV(req.body);
  const { error, value } = createSchema.validate(dealsData);

  if (error) {
    res.status(400).json({ error: error.details[0] });
  } else {
    try {
      await createDeals(value as RawDeal[]);

      res.json({ message: "success" });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
};
