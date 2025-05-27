const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      canRead: true,
      canWrite: true,
      canDelete: true,
    },
  })

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 12)
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Regular User",
      email: "user@example.com",
      password: userPassword,
      canRead: true,
      canWrite: true,
      canDelete: false,
    },
  })

  // Create read-only user
  const readOnlyPassword = await bcrypt.hash("readonly123", 12)
  const readOnlyUser = await prisma.user.upsert({
    where: { email: "readonly@example.com" },
    update: {},
    create: {
      name: "Read Only User",
      email: "readonly@example.com",
      password: readOnlyPassword,
      canRead: true,
      canWrite: false,
      canDelete: false,
    },
  })

  // Create sample comments
  await prisma.comment.createMany({
    data: [
      {
        content: "This is a great application! Love the authentication system.",
        authorId: admin.id,
      },
      {
        content: "The permission system works perfectly. Very well designed.",
        authorId: user.id,
      },
      {
        content: "Looking forward to more features being added.",
        authorId: readOnlyUser.id,
      },
    ],
  })

  console.log("Database seeded successfully!")
  console.log("Test users created:")
  console.log("Admin: admin@example.com / admin123 (all permissions)")
  console.log("User: user@example.com / user123 (read, write)")
  console.log("Read-only: readonly@example.com / readonly123 (read only)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
