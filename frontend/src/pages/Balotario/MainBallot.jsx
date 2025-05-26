import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import api from '../../services/api';
import './MainBallot.css';

const MainBallot = () => {
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const fetchTopics = async () => {
      try {
        const response = await api.get('/api/topics');
        setTopics(response.data);
      } catch (error) {
        console.error('Error fetching topics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (!user || loading) return <div>Cargando...</div>;

  return (
    <div className='ballot-container'>
      <div className='background-image'>
        <img src="/images/fondoSolo.png" alt='background' />
      </div>
      
      <div className="ballot-content">
        <h1>{user.username}</h1>
        <p>¿Qué BALOTARIO DIDÁCTICO deseas practicar?</p>

        <div className="topics-grid">
          {topics.map(topic => (
            <Link 
              key={topic._id} 
              to={`/balotario/${topic._id}`}
              className="topics-card"
            >
              <img src='/images/img-balotario.png' alt='topic' />
              <span>{topic.short_name || topic.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainBallot;