import express from 'express'
import authRoutes from './routes/authRoutes.js'

const app = express();
const PORT = 8383;

app.use(express.json())

app.use('/auth', authRoutes)
//app.use('/*', authMiddleware, yourRoutes)

app.listen(PORT, () => {
    console.log('Server started on port 8383');
});