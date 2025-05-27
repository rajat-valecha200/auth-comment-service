const express = require("express")
const { authenticateToken } = require("../middleware/authMiddleware")
const { requirePermission } = require("../middleware/permissionMiddleware")
const { getAllComments, createComment, updateComment, deleteComment } = require("../controllers/commentController")

const router = express.Router()

// Public route - anyone can view comments if they have read permission
router.get("/", authenticateToken, requirePermission("read"), getAllComments)

// Protected routes
router.post("/", authenticateToken, requirePermission("write"), createComment)
router.put("/:commentId", authenticateToken, requirePermission("write"), updateComment)
router.delete("/:commentId", authenticateToken, requirePermission("delete"), deleteComment)

module.exports = router
