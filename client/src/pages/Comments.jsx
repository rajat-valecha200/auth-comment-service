"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { commentAPI } from "../api/auth"
import { useAuth } from "../context/AuthContext"

const Comments = () => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState(null)
  const [editContent, setEditContent] = useState("")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getAllComments()
      setComments(response.data.comments)
    } catch (error) {
      toast.error("Failed to fetch comments")
      console.error("Fetch comments error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const response = await commentAPI.createComment(newComment)
      setComments([response.data.comment, ...comments])
      setNewComment("")
      toast.success("Comment created successfully!")
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create comment")
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return

    try {
      const response = await commentAPI.updateComment(commentId, editContent)
      setComments(comments.map((comment) => (comment.id === commentId ? response.data.comment : comment)))
      setEditingComment(null)
      setEditContent("")
      toast.success("Comment updated successfully!")
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update comment")
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return

    try {
      await commentAPI.deleteComment(commentId)
      setComments(comments.filter((comment) => comment.id !== commentId))
      toast.success("Comment deleted successfully!")
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete comment")
    }
  }

  const startEditing = (comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const cancelEditing = () => {
    setEditingComment(null)
    setEditContent("")
  }

  if (loading) {
    return <div className="loading">Loading comments...</div>
  }

  return (
    <div>
      <h1>Comments</h1>

      {user?.canWrite && (
        <div className="card">
          <h2>Add New Comment</h2>
          <form onSubmit={handleCreateComment}>
            <div className="form-group">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                rows="4"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Post Comment
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>All Comments ({comments.length})</h2>

        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          <div>
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <div>
                    <span className="comment-author">{comment.author.name}</span>
                    <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {editingComment === comment.id ? (
                  <div>
                    <div className="form-group">
                      <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows="3" />
                    </div>
                    <div className="comment-actions">
                      <button onClick={() => handleEditComment(comment.id)} className="btn btn-success">
                        Save
                      </button>
                      <button onClick={cancelEditing} className="btn btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="comment-content">{comment.content}</div>

                    <div className="comment-actions">
                      {user?.canWrite && comment.author.id === user.id && (
                        <button onClick={() => startEditing(comment)} className="btn btn-secondary">
                          Edit
                        </button>
                      )}
                      {user?.canDelete && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="btn btn-danger">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Comments
