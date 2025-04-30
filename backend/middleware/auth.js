import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware de autenticación JWT
 */
export const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // 1. Verificar existencia del header Authorization
  if (!authHeader) {
    console.warn('[AUTH] Intento de acceso sin token', {
      ip: req.ip,
      method: req.method,
      path: req.path
    });
    return res.status(401).json({ 
      success: false,
      message: 'Token de autenticación requerido',
      code: 'MISSING_AUTH_TOKEN'
    });
  }

  // 2. Extraer token del header
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.warn('[AUTH] Formato de token inválido');
    return res.status(401).json({ 
      success: false,
      message: 'Formato de token inválido. Use: Bearer <token>',
      code: 'INVALID_TOKEN_FORMAT'
    });
  }

  try {
    console.debug('[AUTH] Verificando token...');

    // 3. Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Buscar usuario en base de datos
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.warn('[AUTH] Usuario no encontrado en BD', { userId: decoded.id });
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // 5. Adjuntar información de usuario al request
    req.user = user;
    console.debug('[AUTH] Autenticación exitosa', {
      user: user.username,
      role: user.role,
      path: req.path
    });

    next();
  } catch (error) {
    console.error('[AUTH] Error en autenticación', { 
      error: error.name,
      message: error.message 
    });

    const response = {
      success: false,
      message: 'Error de autenticación',
      code: 'AUTH_ERROR'
    };

    if (error.name === 'TokenExpiredError') {
      response.message = 'Token expirado';
      response.code = 'TOKEN_EXPIRED';
      response.expiredAt = error.expiredAt;
    } else if (error.name === 'JsonWebTokenError') {
      response.message = 'Token inválido';
      response.code = 'INVALID_TOKEN';
    }

    res.status(401).json(response);
  }
};