import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedData.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    req.userId = decodedData.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado', error: error.message });
  }
};