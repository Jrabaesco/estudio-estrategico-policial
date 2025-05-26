import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { username, mail, password } = req.body;

    // Validar campos obligatorios
    if (!username || !mail || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ mail });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear nuevo usuario (sin _id personalizado)
    const newUser = new User({
      username,
      mail,
      password: hashedPassword,
    });

    await newUser.save();

    // Generar token JWT
    const token = jwt.sign(
      { id: newUser._id, mail: newUser.mail },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ result: newUser, token });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const login = async (req, res) => {
  try {
    const { mail, password } = req.body;

    // Buscar usuario
    const existingUser = await User.findOne({ mail });
    if (!existingUser) {
      return res.status(404).json({ message: 'correo invalido' });
    }

    // Validar contraseña
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Contraseña inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: existingUser._id, mail: existingUser.mail },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};