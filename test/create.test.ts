import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/prisma";

const header =
  "URL,FlightCode,Origin,Destination,Date,Time,Duration,Cost,Currency";

const payload = [
  "https://myflightwebsite.com/deal-1,IB1234,STN,MAD,2022-01-03,13:01,125,25,GBP",
  "https://myflightwebsite.com/deal-2,IB4231,CAR,LHR,2023-06-02,01:00,99,2,USD",
  "https://myflightwebsite.com/deal-3,IB4231,CAR,LHR,2023-07-02,01:00,99,1,USD",
];

const invalidPayload =
  "https://myflightwebsite.com/deal-1,IB1234,STN,MAD,2022-01-03,13:01,hey,25,GBP";

describe("POST /api/create", () => {
  test("should recognise header row", async () => {
    await request(app)
      .post("/api/create")
      .set("Content-Type", "text/csv")
      .send([header, ...payload].join("\n"))
      .expect(200);

    expect(await prisma.deal.count()).toBe(3);
    expect(await prisma.flight.count()).toBe(2);
  });

  test("should work without header row", async () => {
    await request(app)
      .post("/api/create")
      .set("Content-Type", "text/csv")
      .send(payload.join("\n"))
      .expect(200);

    expect(await prisma.deal.count()).toBe(3);
    expect(await prisma.flight.count()).toBe(2);
  });

  test("should work without any rows", async () => {
    await request(app)
      .post("/api/create")
      .set("Content-Type", "text/csv")
      .send("")
      .expect(200);

    expect(await prisma.deal.count()).toBe(0);
    expect(await prisma.flight.count()).toBe(0);
  });

  test("should fail with invalid data", async () => {
    const response = await request(app)
      .post("/api/create")
      .set("Content-Type", "text/csv")
      .send(invalidPayload)
      .expect(400);

    expect(response.body?.error?.message).toBe(
      '"[0].duration" must be a number'
    );

    expect(await prisma.deal.count()).toBe(0);
    expect(await prisma.flight.count()).toBe(0);
  });

  test("should return a success message", async () => {
    const response = await request(app)
      .post("/api/create")
      .set("Content-Type", "text/csv")
      .send(payload.join("\n"))
      .expect(200);

    expect(response.body?.message).toBe("success");
  });
});
