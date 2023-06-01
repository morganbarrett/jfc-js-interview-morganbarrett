import { prisma } from "../src/prisma";

beforeEach(async () => {
  await prisma.flight.deleteMany();
  await prisma.deal.deleteMany();
});

afterAll(() => {
  prisma.$disconnect();
});
