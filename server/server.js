import express from 'express'
import cors from 'cors'
import userRoutes from './routes/users.js'
import foodItemRoutes from './routes/foodItems.js'
import mealRoutes from './routes/meals.js'
import mealFoodItemRoutes from './routes/mealFoodItems.js'
import authRoutes from './routes/auth.js'
import chatbotRoutes from './routes/chatbot.js'
import ResetController from './controllers/reset.js'
import authenticateToken from './middleware/auth.js'

const app = express()

app.use(express.json())
app.use(cors({
  origin: [
    'http://localhost:5173', // local dev
    'https://web103-client.onrender.com' // your frontend
  ],
  credentials: true
}))

app.get('/', (req, res) => {
    res.status(200).send('<h1 style="text-align: center; margin-top: 50px;">MacroMate API</h1>')
})

app.use('/api/auth', authRoutes)

app.use('/api/users', authenticateToken, userRoutes)
app.use('/api/food-items', authenticateToken, foodItemRoutes)
app.use('/api/meals', authenticateToken, mealRoutes)
app.use('/api/meal-food-items', authenticateToken, mealFoodItemRoutes)
app.use('/api/chatbot', authenticateToken, chatbotRoutes)
app.post('/api/reset', ResetController.resetDatabase)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})