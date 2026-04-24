import { pool } from '../config/database.js'

const createFoodItem = async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, serving_unit } = req.body
    const user_id = req.user.id

    const results = await pool.query(
      'INSERT INTO food_items (user_id, is_global, name, calories, protein, carbs, fat, serving_unit) \
      VALUES ($1, false, $2, $3, $4, $5, $6, $7) \
      RETURNING *',
      [user_id, name, calories, protein, carbs, fat, serving_unit]
    )

    res.status(201).json(results.rows[0])
  } catch (error) {
    res.status(409).json({ error: error.message })
  }
}

const getFoodItems = async (req, res) => {
  try {
    const user_id = req.user.id

    const results = await pool.query(
      'SELECT * FROM food_items WHERE is_global = true OR user_id = $1 ORDER BY name ASC',
      [user_id]
    )

    res.status(200).json(results.rows)
  } catch (error) {
    res.status(409).json({ error: error.message })
  }
}

const getFoodItem = async (req, res) => {
  try {
    const { id } = req.params
    const user_id = req.user.id

    const results = await pool.query(
      'SELECT * FROM food_items WHERE id = $1 AND (is_global = true OR user_id = $2)',
      [id, user_id]
    )

    if (results.rows.length === 0) {
      return res.status(404).json({ error: 'Food item not found' })
    }

    res.status(200).json(results.rows[0])
  } catch (error) {
    res.status(409).json({ error: error.message })
  }
}

const updateFoodItem = async (req, res) => {
  try {
    const { id } = req.params
    const { name, calories, protein, carbs, fat, serving_unit } = req.body
    const user_id = req.user.id

    const results = await pool.query(
      'UPDATE food_items SET name = $1, calories = $2, protein = $3, carbs = $4, fat = $5, serving_unit = $6 \
      WHERE id = $7 AND user_id = $8 AND is_global = false \
      RETURNING *',
      [name, calories, protein, carbs, fat, serving_unit, id, user_id]
    )

    if (results.rows.length === 0) {
      return res.status(403).json({ error: 'Global food items cannot be edited or deleted' })
    }

    res.status(200).json(results.rows[0])
  } catch (error) {
    res.status(409).json({ error: error.message })
  }
}

const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params
    const user_id = req.user.id

    const item = await pool.query(
      'SELECT * FROM food_items WHERE id = $1 AND user_id = $2 AND is_global = false',
      [id, user_id]
    )

    if (item.rows.length === 0) {
      return res.status(403).json({ error: 'Global food items cannot be edited or deleted' })
    }

    await pool.query('DELETE FROM food_items WHERE id = $1', [id])

    res.status(200).json({ message: `Food item ${id} deleted successfully` })
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({ error: 'This food item is used in one or more meals and cannot be deleted' })
    }
    res.status(409).json({ error: error.message })
  }
}

export default {
  createFoodItem,
  getFoodItems,
  getFoodItem,
  updateFoodItem,
  deleteFoodItem
}
