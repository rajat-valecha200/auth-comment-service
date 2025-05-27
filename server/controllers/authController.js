const bcrypt = require("bcryptjs")
const Joi = require("joi")
const { PrismaClient } = require("@prisma/client")
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generatePasswordResetToken,
  storeRefreshToken,
  removeRefreshToken,
} = require("../utils/tokenUtils")

const prisma = new PrismaClient()

// Validation schemas
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
})

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
})

const signup = async (req, res) => {
  try {
    const { error, value } = signupSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { name, email, password } = value

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        canRead: true,
        canWrite: true,
        canDelete: true,
      },
    })

    // Generate tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken)

    res.status(201).json({
      message: "User created successfully",
      user,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { email, password } = value

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken)

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      canRead: user.canRead,
      canWrite: user.canWrite,
      canDelete: user.canDelete,
    }

    res.json({
      message: "Login successful",
      user: userResponse,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body

    if (!token) {
      return res.status(401).json({ error: "Refresh token required" })
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token)

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(403).json({ error: "Invalid or expired refresh token" })
    }

    // Generate new access token
    const accessToken = generateAccessToken(storedToken.userId)

    res.json({ accessToken })
  } catch (error) {
    console.error("Refresh token error:", error)
    res.status(403).json({ error: "Invalid refresh token" })
  }
}

const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body

    if (token) {
      await removeRefreshToken(token)
    }

    res.json({ message: "Logout successful" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { email } = value

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ message: "If the email exists, a reset token has been sent" })
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry

    // Store reset token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        email,
        expiresAt,
      },
    })

    // In a real app, you would send this token via email
    console.log(`Password reset token for ${email}: ${resetToken}`)

    res.json({
      message: "If the email exists, a reset token has been sent",
      // For demo purposes, include the token in response
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { token, newPassword } = value

    // Find and validate reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired reset token" })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    })

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    })

    res.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
}
