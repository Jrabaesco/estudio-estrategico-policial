import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/auth';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    mail: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/'); // Redirigir al login después del registro
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
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
        <div>
          <input
            type="password"
            name="password"
            placeholder='CONTRASEÑA'
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Register;