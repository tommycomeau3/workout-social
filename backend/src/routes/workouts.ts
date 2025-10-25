import express from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create a new workout
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, date, duration, notes, is_public } = req.body;
    const userId = (req as any).userId;

    // Validate required fields
    if (!title || !date) {
      return res.status(400).json({ 
        error: 'Title and date are required' 
      });
    }

    // Create workout
    const result = await pool.query(
      'INSERT INTO workouts (user_id, title, date, duration, notes, is_public) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, title, date, duration || null, notes || '', is_public !== false]
    );

    res.status(201).json({
      message: 'Workout created successfully',
      workout: result.rows[0]
    });

  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's workouts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { limit = 20, offset = 0 } = req.query;

    // Get workouts with exercise count
    const result = await pool.query(`
      SELECT 
        w.*,
        COUNT(we.id) as exercise_count
      FROM workouts w
      LEFT JOIN workout_exercises we ON w.id = we.workout_id
      WHERE w.user_id = $1
      GROUP BY w.id
      ORDER BY w.date DESC, w.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit as string), parseInt(offset as string)]);

    res.json({
      workouts: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific workout with exercises and sets
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Get workout details
    const workoutResult = await pool.query(
      'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (workoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const workout = workoutResult.rows[0];

    // Get exercises with sets
    const exercisesResult = await pool.query(`
      SELECT 
        we.id as workout_exercise_id,
        we.order_in_workout,
        e.id as exercise_id,
        e.name as exercise_name,
        e.description as exercise_description,
        e.muscle_group,
        e.equipment_type
      FROM workout_exercises we
      JOIN exercises e ON we.exercise_id = e.id
      WHERE we.workout_id = $1
      ORDER BY we.order_in_workout
    `, [id]);

    // Get sets for each exercise
    const exercisesWithSets = await Promise.all(
      exercisesResult.rows.map(async (exercise) => {
        const setsResult = await pool.query(
          'SELECT * FROM sets WHERE workout_exercise_id = $1 ORDER BY set_number',
          [exercise.workout_exercise_id]
        );
        
        return {
          ...exercise,
          sets: setsResult.rows
        };
      })
    );

    res.json({
      workout: {
        ...workout,
        exercises: exercisesWithSets
      }
    });

  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update workout
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, duration, notes, is_public } = req.body;
    const userId = (req as any).userId;

    // Check if workout exists and belongs to user
    const existingWorkout = await pool.query(
      'SELECT id FROM workouts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingWorkout.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Update workout
    const result = await pool.query(
      'UPDATE workouts SET title = $1, date = $2, duration = $3, notes = $4, is_public = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
      [title, date, duration, notes, is_public, id, userId]
    );

    res.json({
      message: 'Workout updated successfully',
      workout: result.rows[0]
    });

  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete workout
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    // Check if workout exists and belongs to user
    const existingWorkout = await pool.query(
      'SELECT id FROM workouts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingWorkout.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Delete workout (cascades to workout_exercises and sets)
    await pool.query('DELETE FROM workouts WHERE id = $1', [id]);

    res.json({
      message: 'Workout deleted successfully'
    });

  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add exercise to workout
router.post('/:id/exercises', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { exercise_id, order_in_workout } = req.body;
    const userId = (req as any).userId;

    // Validate required fields
    if (!exercise_id) {
      return res.status(400).json({ 
        error: 'Exercise ID is required' 
      });
    }

    // Check if workout exists and belongs to user
    const workoutResult = await pool.query(
      'SELECT id FROM workouts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (workoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Check if exercise exists
    const exerciseResult = await pool.query(
      'SELECT id FROM exercises WHERE id = $1',
      [exercise_id]
    );

    if (exerciseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Get next order if not provided
    let order = order_in_workout;
    if (!order) {
      const orderResult = await pool.query(
        'SELECT COALESCE(MAX(order_in_workout), 0) + 1 as next_order FROM workout_exercises WHERE workout_id = $1',
        [id]
      );
      order = orderResult.rows[0].next_order;
    }

    // Add exercise to workout
    const result = await pool.query(
      'INSERT INTO workout_exercises (workout_id, exercise_id, order_in_workout) VALUES ($1, $2, $3) RETURNING *',
      [id, exercise_id, order]
    );

    res.status(201).json({
      message: 'Exercise added to workout successfully',
      workout_exercise: result.rows[0]
    });

  } catch (error) {
    console.error('Add exercise to workout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove exercise from workout
router.delete('/:workoutId/exercises/:exerciseId', authenticateToken, async (req, res) => {
  try {
    const { workoutId, exerciseId } = req.params;
    const userId = (req as any).userId;

    // Check if workout exists and belongs to user
    const workoutResult = await pool.query(
      'SELECT id FROM workouts WHERE id = $1 AND user_id = $2',
      [workoutId, userId]
    );

    if (workoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Remove exercise from workout (cascades to sets)
    const result = await pool.query(
      'DELETE FROM workout_exercises WHERE workout_id = $1 AND exercise_id = $2 RETURNING *',
      [workoutId, exerciseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found in workout' });
    }

    res.json({
      message: 'Exercise removed from workout successfully'
    });

  } catch (error) {
    console.error('Remove exercise from workout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add set to workout exercise
router.post('/exercises/:workoutExerciseId/sets', authenticateToken, async (req, res) => {
  try {
    const { workoutExerciseId } = req.params;
    const { set_number, reps, weight, rest_time, notes } = req.body;
    const userId = (req as any).userId;

    // Validate required fields
    if (!set_number) {
      return res.status(400).json({ 
        error: 'Set number is required' 
      });
    }

    // Check if workout exercise exists and belongs to user
    const workoutExerciseResult = await pool.query(`
      SELECT we.id 
      FROM workout_exercises we
      JOIN workouts w ON we.workout_id = w.id
      WHERE we.id = $1 AND w.user_id = $2
    `, [workoutExerciseId, userId]);

    if (workoutExerciseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workout exercise not found' });
    }

    // Add set
    const result = await pool.query(
      'INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [workoutExerciseId, set_number, reps || null, weight || null, rest_time || null, notes || '']
    );

    res.status(201).json({
      message: 'Set added successfully',
      set: result.rows[0]
    });

  } catch (error) {
    console.error('Add set error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update set
router.put('/sets/:setId', authenticateToken, async (req, res) => {
  try {
    const { setId } = req.params;
    const { reps, weight, rest_time, notes } = req.body;
    const userId = (req as any).userId;

    // Check if set exists and belongs to user
    const setResult = await pool.query(`
      SELECT s.id 
      FROM sets s
      JOIN workout_exercises we ON s.workout_exercise_id = we.id
      JOIN workouts w ON we.workout_id = w.id
      WHERE s.id = $1 AND w.user_id = $2
    `, [setId, userId]);

    if (setResult.rows.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    // Update set
    const result = await pool.query(
      'UPDATE sets SET reps = $1, weight = $2, rest_time = $3, notes = $4 WHERE id = $5 RETURNING *',
      [reps, weight, rest_time, notes, setId]
    );

    res.json({
      message: 'Set updated successfully',
      set: result.rows[0]
    });

  } catch (error) {
    console.error('Update set error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete set
router.delete('/sets/:setId', authenticateToken, async (req, res) => {
  try {
    const { setId } = req.params;
    const userId = (req as any).userId;

    // Check if set exists and belongs to user
    const setResult = await pool.query(`
      SELECT s.id 
      FROM sets s
      JOIN workout_exercises we ON s.workout_exercise_id = we.id
      JOIN workouts w ON we.workout_id = w.id
      WHERE s.id = $1 AND w.user_id = $2
    `, [setId, userId]);

    if (setResult.rows.length === 0) {
      return res.status(404).json({ error: 'Set not found' });
    }

    // Delete set
    await pool.query('DELETE FROM sets WHERE id = $1', [setId]);

    res.json({
      message: 'Set deleted successfully'
    });

  } catch (error) {
    console.error('Delete set error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
