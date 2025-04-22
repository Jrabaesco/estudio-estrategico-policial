import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import { auth } from './middleware/auth.js';

// Configuración de variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Configuración de CORS para producción y desarrollo
const corsOptions = {
  origin: process.env.CLIENT_URL, // Usa la variable de entorno
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', questionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API del Estudio Estratégico Policial',
    environment: process.env.NODE_ENV,
    client: process.env.CLIENT_URL
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
  console.log(`CLIENT_URL configurado: ${process.env.CLIENT_URL}`);
  console.log(`Entorno: ${process.env.NODE_ENV}`);
});