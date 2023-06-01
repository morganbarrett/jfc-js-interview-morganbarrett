import request from "supertest";
import { Prisma } from "@prisma/client";
import { app } from "../src/app";
import { prisma } from "../src/prisma";

interface Flight {
  flightCode: string;
  departureDate: Date;
  departureTime: number;
  duration: number;
  origin: string;
  destination: string;
}

interface Deal {
  url: string;
  cost: Prisma.Decimal;
  flight: Flight;
}

const exampleDeals: Deal[] = [
  {
    url: "https://example.com/deal-1",
    cost: new Prisma.Decimal(99.99),
    flight: {
      flightCode: "AB123",
      departureDate: new Date("2023-07-21"),
      departureTime: 671,//11:11
      duration: 120,
      origin: "CAR",
      destination: "LHR",
    },
  },
  {
    url: "https://example.com/deal-2",
    cost: new Prisma.Decimal(103),
    flight: {
      flightCode: "AB123",
      departureDate: new Date("2023-07-21"),
      departureTime: 671,//11:11
      duration: 120,
      origin: "CAR",
      destination: "LHR",
    },
  },
  {
    url: "https://example.com/deal-3",
    cost: new Prisma.Decimal(103),
    flight: {
      flightCode: "XY321",
      departureDate: new Date("2023-07-21"),
      departureTime: 200,//3:20
      duration: 66,
      origin: "CAR",
      destination: "LHR",
    },
  },
  {
    url: "https://example.com/deal-4",
    cost: new Prisma.Decimal(103),
    flight: {
      flightCode: "HD823",
      departureDate: new Date("2023-07-21"),
      departureTime: 999,//16:39
      duration: 44,
      origin: "CAR",
      destination: "LHR",
    },
  },
  {
    url: "https://example.com/deal-5",
    cost: new Prisma.Decimal(103),
    flight: {
      flightCode: "SJ789",
      departureDate: new Date("2023-07-21"),
      departureTime: 1300,//21:40
      duration: 99,
      origin: "CAR",
      destination: "LHR",
    }
  },
  {
    url: "https://example.com/deal-6",
    cost: new Prisma.Decimal(103),
    flight: {
      flightCode: "KK999",
      departureDate: new Date("2023-09-21"),
      departureTime: 1300,//21:40
      duration: 44,
      origin: "CAR",
      destination: "LHR",
    }
  },
  {
    url: "https://example.com/deal-7",
    cost: new Prisma.Decimal(32),
    flight: {
      flightCode: "HH666",
      departureDate: new Date("2023-07-21"),
      departureTime: 1300,//21:40
      duration: 99,
      origin: "LHR",
      destination: "CAR",
    }
  },
];

describe("GET /api/query", () => {
  beforeEach(async () => {
    await prisma.$transaction(
      exampleDeals.map((data) =>
        prisma.deal.create({
          data: {
            url: data.url,
            cost: data.cost,
            flight: {
              connectOrCreate: {
                where: {
                  flightCode: data.flight.flightCode,
                },
                create: data.flight,
              },
            },
          },
        })
      )
    );
  });

  test("should create a particular row in the table", async () => {
    const response = await request(app)
      .get("/api/query")
      .query({
        origin: "CAR",
        destination: "LHR",
      })
      .expect(200);

    expect(response.body.data[0].url).toBe("https://example.com/deal-1");
  });

  test("should fail without origin or destination", async () => {
    const response = await request(app)
      .get("/api/query")
      .query({
        origin: "CAR",
      })
      .expect(400);

    expect(response.body?.error?.message).toBe('"destination" is required');
  });

  test("should fail with incorrect data type", async () => {
    const response = await request(app)
      .get("/api/query")
      .query({
        origin: "CAR",
        destination: "london",
      })
      .expect(400);

    expect(response.body?.error?.message).toBe(
      '"destination" length must be 3 characters long'
    );
  });

  test("should find deals with duration less than durationLessThan", async () => {
    const response = await request(app)
      .get("/api/query")
      .query({
        origin: "CAR",
        destination: "LHR",
        durationLessThan: 100
      })
      .expect(200);

    expect(response.body.data.length).toBe(4);

    for(const deal of response.body.data){
      expect(deal.duration).toBeLessThan(100);
    }
  });

  test("should find deals within date range", async () => {
    const response = await request(app)
      .get("/api/query")
      .query({
        origin: "CAR",
        destination: "LHR",
        fromDate: "2023-06-01",
        toDate: "2023-08-01"
      })
      .expect(200);

    expect(response.body.data.length).toBe(4);
  });

  test("should find no deals when none in date range", async () => {
    const response = await request(app)
      .get("/api/query")
      .query({
        origin: "CAR",
        destination: "LHR",
        fromDate: "2023-02-01",
        toDate: "2023-03-01"
      })
      .expect(200);

    expect(response.body.data.length).toBe(0);
  });

  test("should find deals within time range", async () => {
    const response = await request(app)
      .get("/api/query")
      .query({
        origin: "CAR",
        destination: "LHR",
        fromTime: "11:00",
        toTime: "13:00"
      })
      .expect(200);

    expect(response.body.data.length).toBe(1);
  });
});
