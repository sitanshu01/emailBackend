import { RoleType } from "../generated/prisma";
import { prisma } from "../src/db/index.js";

async function main() {
  const roles = [RoleType.ADMIN, RoleType.STUDENT, RoleType.SUPERADMIN];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

