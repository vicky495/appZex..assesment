require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("../src/utils/prisma");

async function main() {
  const password = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "superadmin@appzex.com",
    },
    update: {
  password,
  name: "Super Admin",
  role: "SUPER_ADMIN",
  agencyId: null,
},
    create: {
      name: "Super Admin",
      email: "superadmin@appzex.com",
      password,
      role: "SUPER_ADMIN",
      agencyId: null,
    },
  });

  console.log("Super Admin created:");
  console.log({
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });