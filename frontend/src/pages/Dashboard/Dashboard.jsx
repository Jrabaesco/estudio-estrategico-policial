import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  if (!user) return <div>Cargando...</div>;

  return (
    <div className='dashboard-container'>
      <div className='background-image'>
        <img src="/images/fondoSolo.png" alt='img_fondo' />
      </div>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Bienvenido! <span>{user.username}</span></h1>
        </div>
        
        <div className="modules-grid">
          <Link to="/balotario" className="module-card">
            <img src='/images/img-balotario.png' alt='logo' />
            <span>BALOTARIO DIDÁCTICO</span>
          </Link>
          
          <Link to="/examen-temas" className="module-card">
            <img src='/images/logo_transparente.png' alt='logo' />
            <span>EXÁMENES POR TEMAS</span>
          </Link>
          
          <Link to="/siecopol" className="module-card">
            <img src='/images/img-siecopol.png' alt='logo' />
            <span>EXAMEN TIPO SIECOPOL</span>
          </Link>
          
          <Link to="/audio" className="module-card">
            <img src='/images/img_audio.png' alt='logo' />
            <span>BALOTARIO VERSIÓN AUDIO</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;