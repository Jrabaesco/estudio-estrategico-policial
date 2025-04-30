import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importación de rutas y middleware
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import { auth } from './middleware/auth.js';

// Configuración de variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Configuración avanzada de CORS
const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    //'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err);
    process.exit(1);
  });

// Middleware de debug para headers
app.use((req, res, next) => {
  console.log('\n====== Headers Recibidos ======');
  console.log('Método:', req.method);
  console.log('Ruta:', req.originalUrl);
  console.log('Authorization:', req.headers.authorization);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('==============================\n');
  next();
});

// Configuración de rutas
app.use('/api/auth', authRoutes);  // Rutas públicas de autenticación
app.use('/api', auth, questionRoutes); // Todas las rutas protegidas bajo /api

// Endpoints básicos
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'API del Estudio Estratégico Policial',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    availableEndpoints: {
      auth: '/api/auth',
      questions: '/api/topics',
      health: '/health'
    }
  });
});

// Manejo de errores
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    requestedUrl: req.originalUrl,
    availableEndpoints: {
      auth: ['POST /api/auth/login', 'POST /api/auth/register'],
      topics: ['GET /api/topics', 'GET /api/topics/:id']
    }
  });
});

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV !== 'production' ? err.message : 'Error interno'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('Endpoints disponibles:');
  console.log('- GET    /api/topics');
  console.log('- GET    /api/topics/:id');
  console.log('- POST   /api/auth/login');
  console.log('- POST   /api/auth/register');
});