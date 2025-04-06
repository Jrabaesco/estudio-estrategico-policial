import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Registrar nuevo usuario
export const register = async (req, res) => {
  try {
    const { mail, password, username } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ mail });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Crear nuevo usuario
    const newUser = new User({
      mail,
      password: hashedPassword,
      username
    });
    
    await newUser.save();
    
    // Crear token JWT
    const token = jwt.sign(
      { id: newUser._id, mail: newUser.mail },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(201).json({ result: newUser, token });
  } catch (error) {
    res.status(500).json({ message: 'Algo salió mal al registrar el usuario' });
    console.error(error);
  }
};

// Iniciar sesión
export const login = async (req, res) => {
  try {
    const { mail, password } = req.body;
    
    // Buscar usuario
    const existingUser = await User.findOne({ mail });
    if (!existingUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    
    // Crear token JWT
    const token = jwt.sign(
      { id: existingUser._id, mail: existingUser.mail },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: 'Algo salió mal al iniciar sesión' });
    console.error(error);
  }
};