import { Prisma } from "@prisma/client";
import fx from "money";
import moment from "moment";
import { prisma } from "../prisma";

export interface QueryParameters {
  origin: string;
  destination: string;
  fromDate: string;
  toDate: string;
  fromTime: string;
  toTime: string;
  durationLessThan: number;
}

export interface Deal {
  id: number;
  url: string;
  cost: Prisma.Decimal;
  flightCode: string;
  departure: Date;
  duration: number;
}

export interface RawDeal {
  url: string;
  cost: number;
  currency: string;
  flightCode: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  duration: number;
}

const toMins = (time: string) => {
  const obj = moment(time, "HH:mm");
  return obj.hours() * 60 + obj.minutes();
}

export const queryDeals = async (query: QueryParameters): Promise<Deal[]> => {
  const {
    origin,
    destination,
    fromDate,
    toDate,
    fromTime,
    toTime,
    durationLessThan,
  } = query;

  const prices = await prisma.flight.findMany({
    where: {
      origin,
      destination,
      departureDate: {
        gte: fromDate,
        lte: toDate,
      },
      departureTime: {
        gte: fromTime ? toMins(fromTime) : undefined,
        lte: toTime ? toMins(toTime) : undefined,
      },
      duration: {
        lt: durationLessThan,
      },
    },
    include: {
      deals: {
        orderBy: {
          cost: "asc",
        },
        take: 1,
      },
    },
  });

  return prices.map((data) => {
    const { id, url, cost } = data.deals[0];
    const { departureDate, departureTime, flightCode, duration } = data;
    const departure = moment(departureDate)
      .add(departureTime, "minutes")
      .toDate();

    return { id, url, cost, flightCode, departure, duration };
  });
};

export const createDeals = (deals: RawDeal[]) =>
  prisma.$transaction(
    deals.map(
      ({
        url,
        cost,
        currency,
        flightCode,
        origin,
        destination,
        departureDate,
        departureTime,
        duration,
      }) =>
        prisma.deal.upsert({
          where: { url },
          create: {
            url,
            cost: fx(cost).from(currency).to("GBP") as number,
            flight: {
              connectOrCreate: {
                where: { flightCode },
                create: {
                  flightCode,
                  departureDate,
                  departureTime: toMins(departureTime),
                  duration,
                  origin,
                  destination,
                },
              },
            },
          },
          update: {},
        })
    )
  );
