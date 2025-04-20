import { useState } from 'react';
import { register } from '../../services/auth';
import './Register.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    mail: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Para evitar doble envío
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await register(formData);
      alert('Usuario registrado exitosamente'); // Muestra alert en lugar de redirigir
      // Opcional: Limpiar el formulario después del registro exitoso
      setFormData({
        username: '',
        mail: '',
        password: '',
      });
    } catch (err) {
      setError(err.message); // Muestra el mensaje del backend
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='registro-usuario'>
      <div className='imgFondo'>
        <img src="/images/fondoSolo.png" alt='img_fondo' />
      </div>
      <form onSubmit={handleSubmit}>
        <img src='/images/logo.jpg' alt='logo' />
        <h4>REGISTRO DE USUARIOS "ESTRAPOL"</h4>

        <div>
          <input
            type="text"
            name="username"
            placeholder='GRADO, NOMBRES Y APELLIDOS'
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            type="email"
            name="mail"
            placeholder='CORREO CORPORATIVO'
            value={formData.mail}
            onChange={handleChange}
            required
          />
        </div>
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder='CONTRASEÑA (Mínimo 8 caracteres)'
            value={formData.password}
            onChange={handleChange}
            minLength="8"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
};

export default Register;