const express = require("express")
const { authenticateToken } = require("../middleware/authMiddleware")
const { getProfile, getAllUsers, updateUserPermissions } = require("../controllers/userController")

const router = express.Router()

router.get("/profile", authenticateToken, getProfile)
router.get("/all", authenticateToken, getAllUsers)
router.put("/:userId/permissions", authenticateToken, updateUserPermissions)

module.exports = router
