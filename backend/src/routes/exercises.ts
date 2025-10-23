import express from 'express';
import pool from '../db';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();

// Get all exercises with optional filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { muscle_group, equipment_type, search } = req.query;
    
    let query = 'SELECT id, name, description, muscle_group, equipment_type, created_at FROM exercises';
    const queryParams: any[] = [];
    const conditions: string[] = [];
    
    // Add filtering conditions
    if (muscle_group) {
      conditions.push(`muscle_group = $${queryParams.length + 1}`);
      queryParams.push(muscle_group);
    }
    
    if (equipment_type) {
      conditions.push(`equipment_type = $${queryParams.length + 1}`);
      queryParams.push(equipment_type);
    }
    
    if (search) {
      conditions.push(`(name ILIKE $${queryParams.length + 1} OR description ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${search}%`);
    }
    
    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add ordering
    query += ' ORDER BY muscle_group, name';
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      exercises: result.rows,
      count: result.rows.length,
      filters: {
        muscle_group: muscle_group || null,
        equipment_type: equipment_type || null,
        search: search || null
      }
    });
    
  } catch (error) {
    console.error('Exercises fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get exercise by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT id, name, description, muscle_group, equipment_type, created_at FROM exercises WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    res.json({
      exercise: result.rows[0]
    });
    
  } catch (error) {
    console.error('Exercise fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unique muscle groups
router.get('/muscle-groups', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT muscle_group FROM exercises ORDER BY muscle_group'
    );
    
    const muscleGroups = result.rows.map(row => row.muscle_group);
    
    res.json({
      muscle_groups: muscleGroups
    });
    
  } catch (error) {
    console.error('Muscle groups fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unique equipment types
router.get('/equipment-types', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT equipment_type FROM exercises ORDER BY equipment_type'
    );
    
    const equipmentTypes = result.rows.map(row => row.equipment_type);
    
    res.json({
      equipment_types: equipmentTypes
    });
    
  } catch (error) {
    console.error('Equipment types fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get exercises by muscle group
router.get('/muscle-group/:muscleGroup', optionalAuth, async (req, res) => {
  try {
    const { muscleGroup } = req.params;
    
    const result = await pool.query(
      'SELECT id, name, description, muscle_group, equipment_type, created_at FROM exercises WHERE muscle_group = $1 ORDER BY name',
      [muscleGroup]
    );
    
    res.json({
      exercises: result.rows,
      count: result.rows.length,
      muscle_group: muscleGroup
    });
    
  } catch (error) {
    console.error('Muscle group exercises fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get exercises by equipment type
router.get('/equipment/:equipmentType', optionalAuth, async (req, res) => {
  try {
    const { equipmentType } = req.params;
    
    const result = await pool.query(
      'SELECT id, name, description, muscle_group, equipment_type, created_at FROM exercises WHERE equipment_type = $1 ORDER BY muscle_group, name',
      [equipmentType]
    );
    
    res.json({
      exercises: result.rows,
      count: result.rows.length,
      equipment_type: equipmentType
    });
    
  } catch (error) {
    console.error('Equipment exercises fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
