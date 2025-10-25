import express from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// ==================== FOLLOWS ====================

// Follow a user
router.post('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = (req as any).userId;

    // Can't follow yourself
    if (followerId === parseInt(userId)) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existingFollow = await pool.query(
      'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, userId]
    );

    if (existingFollow.rows.length > 0) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create follow relationship
    await pool.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
      [followerId, userId]
    );

    res.status(201).json({
      message: 'Successfully followed user'
    });

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unfollow a user
router.delete('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = (req as any).userId;

    const result = await pool.query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Follow relationship not found' });
    }

    res.json({
      message: 'Successfully unfollowed user'
    });

  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's followers
router.get('/followers/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.bio,
        u.created_at,
        f.created_at as followed_at
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit as string), parseInt(offset as string)]);

    res.json({
      followers: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get users that a user is following
router.get('/following/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.bio,
        u.created_at,
        f.created_at as followed_at
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit as string), parseInt(offset as string)]);

    res.json({
      following: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if current user follows another user
router.get('/follow-status/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).userId;

    const result = await pool.query(
      'SELECT * FROM follows WHERE follower_id = $1 AND following_id = $2',
      [currentUserId, userId]
    );

    res.json({
      is_following: result.rows.length > 0
    });

  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== LIKES ====================

// Like a workout
router.post('/like/:workoutId', authenticateToken, async (req, res) => {
  try {
    const { workoutId } = req.params;
    const userId = (req as any).userId;

    // Check if workout exists and is public
    const workoutResult = await pool.query(
      'SELECT id, is_public FROM workouts WHERE id = $1',
      [workoutId]
    );

    if (workoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (!workoutResult.rows[0].is_public) {
      return res.status(403).json({ error: 'Cannot like private workout' });
    }

    // Check if already liked
    const existingLike = await pool.query(
      'SELECT * FROM likes WHERE user_id = $1 AND workout_id = $2',
      [userId, workoutId]
    );

    if (existingLike.rows.length > 0) {
      return res.status(400).json({ error: 'Already liked this workout' });
    }

    // Create like
    await pool.query(
      'INSERT INTO likes (user_id, workout_id) VALUES ($1, $2)',
      [userId, workoutId]
    );

    res.status(201).json({
      message: 'Workout liked successfully'
    });

  } catch (error) {
    console.error('Like workout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unlike a workout
router.delete('/like/:workoutId', authenticateToken, async (req, res) => {
  try {
    const { workoutId } = req.params;
    const userId = (req as any).userId;

    const result = await pool.query(
      'DELETE FROM likes WHERE user_id = $1 AND workout_id = $2',
      [userId, workoutId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Like not found' });
    }

    res.json({
      message: 'Workout unliked successfully'
    });

  } catch (error) {
    console.error('Unlike workout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get workout likes
router.get('/likes/:workoutId', authenticateToken, async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        l.created_at as liked_at
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.workout_id = $1
      ORDER BY l.created_at DESC
      LIMIT $2 OFFSET $3
    `, [workoutId, parseInt(limit as string), parseInt(offset as string)]);

    res.json({
      likes: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get workout likes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if current user liked a workout
router.get('/like-status/:workoutId', authenticateToken, async (req, res) => {
  try {
    const { workoutId } = req.params;
    const userId = (req as any).userId;

    const result = await pool.query(
      'SELECT * FROM likes WHERE user_id = $1 AND workout_id = $2',
      [userId, workoutId]
    );

    res.json({
      is_liked: result.rows.length > 0
    });

  } catch (error) {
    console.error('Check like status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== COMMENTS ====================

// Add comment to workout
router.post('/comment/:workoutId', authenticateToken, async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { content } = req.body;
    const userId = (req as any).userId;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Comment content is required' 
      });
    }

    // Check if workout exists and is public
    const workoutResult = await pool.query(
      'SELECT id, is_public FROM workouts WHERE id = $1',
      [workoutId]
    );

    if (workoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (!workoutResult.rows[0].is_public) {
      return res.status(403).json({ error: 'Cannot comment on private workout' });
    }

    // Add comment
    const result = await pool.query(
      'INSERT INTO comments (user_id, workout_id, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, workoutId, content.trim()]
    );

    // Get comment with user info
    const commentWithUser = await pool.query(`
      SELECT 
        c.*,
        u.username,
        u.bio
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [result.rows[0].id]);

    res.status(201).json({
      message: 'Comment added successfully',
      comment: commentWithUser.rows[0]
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get workout comments
router.get('/comments/:workoutId', authenticateToken, async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        u.id as user_id,
        u.username,
        u.bio
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.workout_id = $1
      ORDER BY c.created_at ASC
      LIMIT $2 OFFSET $3
    `, [workoutId, parseInt(limit as string), parseInt(offset as string)]);

    res.json({
      comments: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get workout comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete comment (only by comment author)
router.delete('/comment/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = (req as any).userId;

    // Check if comment exists and belongs to user
    const commentResult = await pool.query(
      'SELECT id FROM comments WHERE id = $1 AND user_id = $2',
      [commentId, userId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }

    // Delete comment
    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);

    res.json({
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== FEED ====================

// Get feed of workouts from followed users
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT 
        w.id,
        w.title,
        w.date,
        w.duration,
        w.notes,
        w.is_public,
        w.created_at,
        u.id as user_id,
        u.username,
        u.bio,
        COUNT(DISTINCT l.id) as like_count,
        COUNT(DISTINCT c.id) as comment_count,
        CASE WHEN my_likes.id IS NOT NULL THEN true ELSE false END as is_liked
      FROM workouts w
      JOIN users u ON w.user_id = u.id
      JOIN follows f ON f.following_id = w.user_id
      LEFT JOIN likes l ON l.workout_id = w.id
      LEFT JOIN comments c ON c.workout_id = w.id
      LEFT JOIN likes my_likes ON my_likes.workout_id = w.id AND my_likes.user_id = $1
      WHERE f.follower_id = $1 AND w.is_public = true
      GROUP BY w.id, u.id, u.username, u.bio, my_likes.id
      ORDER BY w.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit as string), parseInt(offset as string)]);

    res.json({
      feed: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get public workouts (discover page)
router.get('/discover', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT 
        w.id,
        w.title,
        w.date,
        w.duration,
        w.notes,
        w.is_public,
        w.created_at,
        u.id as user_id,
        u.username,
        u.bio,
        COUNT(DISTINCT l.id) as like_count,
        COUNT(DISTINCT c.id) as comment_count
      FROM workouts w
      JOIN users u ON w.user_id = u.id
      LEFT JOIN likes l ON l.workout_id = w.id
      LEFT JOIN comments c ON c.workout_id = w.id
      WHERE w.is_public = true
      GROUP BY w.id, u.id, u.username, u.bio
      ORDER BY w.created_at DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit as string), parseInt(offset as string)]);

    res.json({
      workouts: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get discover workouts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
