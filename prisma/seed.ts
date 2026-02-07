import { PrismaClient } from "@prisma/client";

import path from "path";

const dbPath = path.resolve(__dirname, "dev.db");
const prisma = new PrismaClient({
  datasources: {
    db: { url: `file:${dbPath}` },
  },
});

async function main() {
  // Clean existing data
  await prisma.eventLog.deleteMany();
  await prisma.application.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.lender.deleteMany();
  await prisma.clinic.deleteMany();

  // Create clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: "Dubai Dental Clinic",
    },
  });

  // Create lenders
  const lenderA = await prisma.lender.create({
    data: {
      name: "Al Masraf Finance",
      minSalaryMonthly: 15000,
      maxDBR: 0.5,
      active: true,
    },
  });

  const lenderB = await prisma.lender.create({
    data: {
      name: "Emirates Health Credit",
      minSalaryMonthly: 8000,
      maxDBR: 0.5,
      active: true,
    },
  });

  console.log("\n=== Seed Complete ===\n");
  console.log(`Clinic: ${clinic.name}`);
  console.log(`  ID: ${clinic.id}`);
  console.log(`\nLenders:`);
  console.log(`  ${lenderA.name} (min salary: ${lenderA.minSalaryMonthly}, max DBR: ${lenderA.maxDBR})`);
  console.log(`  ${lenderB.name} (min salary: ${lenderB.minSalaryMonthly}, max DBR: ${lenderB.maxDBR})`);
  console.log(`\nTest URL:`);
  console.log(`  http://localhost:3000/apply?clinic=${clinic.id}`);
  console.log(`\nClinic Dashboard:`);
  console.log(`  http://localhost:3000/clinic/dashboard`);
  console.log(`  Password: clinic123`);
  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
