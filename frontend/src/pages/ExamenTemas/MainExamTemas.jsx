import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import api from '../../services/api';
import './MainExamTemas.css';

const MainExamTemas = () => {
  const [user] = useState(getCurrentUser());
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [maxQuestions, setMaxQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchTopics = async () => {
      try {
        const response = await api.get('/topics');
        setTopics(response.data);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setError('Error al cargar los temas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [navigate, user]);

  useEffect(() => {
    if (!selectedTopic) {
      setMaxQuestions(0);
      return;
    }

    const fetchQuestionCount = async () => {
      try {
        const response = await api.get(`/questions/count?topicId=${selectedTopic}`);
        
        if (!response.data) {
          throw new Error('Respuesta inválida del servidor');
        }

        const count = response.data.count || 0;
        setMaxQuestions(count);
        
        if (questionCount > count) {
          setQuestionCount(count > 0 ? count : 1);
        }
      } catch (error) {
        console.error('Error fetching question count:', error);
        setError('Error al cargar el número de preguntas');
        setMaxQuestions(0);
      }
    };

    fetchQuestionCount();
  }, [selectedTopic, questionCount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTopic || maxQuestions === 0) return;
    
    navigate(`/examen-temas/${selectedTopic}`, {
      state: {
        questionCount: Math.min(questionCount, maxQuestions),
        topicName: topics.find(t => t._id === selectedTopic)?.name
      }
    });
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="exam-container">
        <div className="loading-container">
          <p>Cargando temas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-container">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className='exam-container'>
      <div className='background-image'>
        <img src="/images/fondoSolo.png" alt='background' />
      </div>
      
      <div className="exam-content">
        <div className="exam-header">
          <img src="/images/favicon.ico" alt="Logo" />
          <h4>POLICÍA NACIONAL DEL PERÚ</h4>
          <h2>Proceso de Ascenso Suboficiales de Armas 2025 - Promoción 2026</h2>
          <h3>Módulo de Examen por Temas</h3>
        </div>

        <form className='exam-form' onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Selecciona un tema:</label>
            <select 
              className='selec-tema'
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setError(null);
              }}
              required
            >
              <option value="">-- Selecciona un tema --</option>
              {topics.map(topic => (
                <option key={topic._id} value={topic._id}>
                  {topic.short_name || topic.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Número de preguntas 
              <span>{maxQuestions > 0 && `(máximo ${maxQuestions})`}:
              </span>
            </label>
            <input
              type="number"
              min="1"
              max={maxQuestions || 1}
              value={questionCount}
              onChange={(e) => {
                const value = Math.min(
                  Math.max(1, parseInt(e.target.value) || 1),
                  maxQuestions || 1
                );
                setQuestionCount(value);
              }}
              disabled={!selectedTopic || maxQuestions === 0}
              required
            />
          </div>

          {maxQuestions === 0 && selectedTopic && (
            <p className="info-message">
              No hay preguntas disponibles para este tema
            </p>
          )}

          <button 
            type="submit" 
            className="start-button"
            disabled={!selectedTopic || maxQuestions === 0}
          >
            Iniciar Examen
          </button>
        </form>
      </div>
    </div>
  );
};

export default MainExamTemas;