const Joi = require("joi")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
})

const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
})

const getAllComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json({ comments })
  } catch (error) {
    console.error("Get all comments error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const createComment = async (req, res) => {
  try {
    const { error, value } = createCommentSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { content } = value

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    })
  } catch (error) {
    console.error("Create comment error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const { error, value } = updateCommentSchema.validate(req.body)

    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { content } = value

    // Check if comment exists and user owns it
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" })
    }

    if (existingComment.authorId !== req.user.id) {
      return res.status(403).json({ error: "You can only update your own comments" })
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    res.json({
      message: "Comment updated successfully",
      comment,
    })
  } catch (error) {
    console.error("Update comment error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" })
    }

    // Delete permission allows deleting any comment (global delete rights)
    await prisma.comment.delete({
      where: { id: commentId },
    })

    res.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  getAllComments,
  createComment,
  updateComment,
  deleteComment,
}
