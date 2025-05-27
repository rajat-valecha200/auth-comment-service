const Joi = require("joi")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const updatePermissionsSchema = Joi.object({
  canRead: Joi.boolean(),
  canWrite: Joi.boolean(),
  canDelete: Joi.boolean(),
})

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        canRead: true,
        canWrite: true,
        canDelete: true,
        createdAt: true,
      },
    })

    res.json({ user })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        canRead: true,
        canWrite: true,
        canDelete: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    res.json({ users })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params
    const { error, value } = updatePermissionsSchema.validate(req.body)

    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userExists) {
      return res.status(404).json({ error: "User not found" })
    }

    // Update permissions
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: value,
      select: {
        id: true,
        name: true,
        email: true,
        canRead: true,
        canWrite: true,
        canDelete: true,
      },
    })

    res.json({
      message: "User permissions updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update user permissions error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  getProfile,
  getAllUsers,
  updateUserPermissions,
}
