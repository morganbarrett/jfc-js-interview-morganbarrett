import express from "express";
import Joi from "joi";
import { queryDeals } from "../models/Deal";

const querySchema = Joi.object({
  origin: Joi.string().length(3).uppercase().required(),
  destination: Joi.string().length(3).uppercase().required(),
  fromDate: Joi.date(),
  toDate: Joi.date(),
  fromTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/),
  toTime: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/),
  durationLessThan: Joi.number().integer(),
});

//endpoint for querying stored deals
export const query = async (req: express.Request, res: express.Response) => {
  const { error, value } = querySchema.validate(req.query);

  if (error) {
    res.status(400).json({ error: error.details[0] });
  } else {
    try {
      const data = await queryDeals(value);

      res.json({ data });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
};
