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
    'http://localhost:5173' // Para desarrollo local
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

// Conexión a MongoDB Atlas (configuración actualizada)
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => {
  console.error('❌ Error de conexión a MongoDB:', err);
  process.exit(1);
});

// Middleware de prueba de ruta (para debug)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Configuración de rutas
app.use('/api/auth', authRoutes);
app.use('/api/questions', auth, questionRoutes);

// Endpoints básicos del sistema
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
      questions: '/api/questions',
      health: '/health'
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    requestedUrl: req.originalUrl,
    availableEndpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register'
      },
      questions: {
        getAll: 'GET /api/questions',
        create: 'POST /api/questions'
      }
    }
  });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  
  const response = {
    success: false,
    error: err.message || 'Error interno del servidor',
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    response.fullError = err;
  }

  res.status(err.statusCode || 500).json(response);
});

// Configuración del puerto
const PORT = process.env.PORT || 10000; // Asegúrate de que coincida con el puerto en Render
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CLIENT_URL: ${process.env.CLIENT_URL}`);
  console.log(`🔒 Modo seguro: ${process.env.NODE_ENV === 'production' ? 'ACTIVADO' : 'DESACTIVADO'}`);
});

// Manejo de cierre elegante
process.on('SIGTERM', () => {
  console.log('👋 Recibido SIGTERM. Cerrando servidor...');
  server.close(() => {
    console.log('🚪 Servidor cerrado');
    mongoose.connection.close(false, () => {
      console.log('🚪 Conexión a MongoDB cerrada');
      process.exit(0);
    });
  });
});