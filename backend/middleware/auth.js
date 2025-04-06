import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Autenticación fallida' });
    }
    
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedData?.id;
    
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Autenticación fallida' });
  }
};