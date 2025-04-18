import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  return (
    <div className="main-nav">
      <div className="menu-container">
        <Link to="/dashboard" className="logo" onClick={closeMenu}>
          <img className="logo-ico" src="/images/favicon.ico" alt="logo" />
        </Link>
        
        <input 
          type="checkbox" 
          id="menu-toggle" 
          checked={isMenuOpen}
          onChange={toggleMenu}
        />
        
        <label htmlFor="menu-toggle" className="menu-button">
          <img src="/images/menu-icon.png" className="menu-icon" alt="Menú" />
        </label>
        
        <nav className={`navbar ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><Link to="/dashboard" onClick={closeMenu}>INICIO</Link></li>
            <li><Link to="/balotario" onClick={closeMenu}>BALOTARIO DIDÁCTICO</Link></li>
            <li><Link to="/examen-temas" onClick={closeMenu}>EXÁMENES POR TEMA</Link></li>
            <li><Link to="/siecopol" onClick={closeMenu}>EXAMEN SIECOPOL</Link></li>
            <li><Link to="/audio" onClick={closeMenu}>VERSIÓN AUDIO</Link></li>
            <li><button onClick={handleLogout} className="logout-button">CERRAR SESIÓN</button></li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;