import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth';
import './Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import WhatsAppChat from '../../components/WhatsAppChat';

const Login = () => {
  const [formData, setFormData] = useState({ mail: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='conteiner1'>
      <div className='imgFondo'>
        <img src="/images/fondoSolo.png" alt='img_fondo' />
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <div>
          <img src='/images/logo.jpg' alt='logo' />
          <h1>POLICÍA NACIONAL DEL PERÚ</h1>
          <h3>ESTUDIO ESTRATÉGICO POLICIAL</h3>
          <h4>Suboficiales de Armas</h4>
          
          <input
            type="email"
            name="mail"
            placeholder='CORREO'
            value={formData.mail}
            onChange={handleChange}
            required
          />
        </div>
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder='CONTRASEÑA'
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button 
            type="button" 
            className="password-toggle"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Ingresar</button>
      </form>
      
      {/* Componente del Chatbot de WhatsApp */}
      <WhatsAppChat />
    </div>
  );
};

export default Login;