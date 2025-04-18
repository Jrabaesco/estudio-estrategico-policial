import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import api from '../../services/api';
import './SiecopolExam.css';

// Distribución de preguntas por tema (temaId: cantidad)
const TOPICS_ORDER = [
  'topic_01', 'topic_02', 'topic_03', 'topic_04', 'topic_05',
  'topic_06', 'topic_07', 'topic_08', 'topic_09', 'topic_10',
  'topic_11', 'topic_12', 'topic_13', 'topic_14', 'topic_15',
  'topic_16', 'topic_17', 'topic_18'
];

const QUESTIONS_PER_TOPIC = {
  'topic_01': 8,
  'topic_02': 4,
  'topic_03': 7,
  'topic_04': 9,
  'topic_05': 5,
  'topic_06': 4,
  'topic_07': 9,
  'topic_08': 5,
  'topic_09': 12,
  'topic_10': 12,
  'topic_11': 2,
  'topic_12': 4,
  'topic_13': 3,
  'topic_14': 4,
  'topic_15': 6,
  'topic_16': 2,
  'topic_17': 2,
  'topic_18': 2
};

const EXAM_DURATION = 2 * 60 * 60; // 2 horas en segundos

const SiecopolExam = () => {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [showColors, setShowColors] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicProgress, setTopicProgress] = useState({});

  // Función para mezclar arrays (solo para alternativas)
  const shuffleArray = useCallback((array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  // Función para enviar el examen
  const submitExam = useCallback(() => {
    const correct = answers.filter(a => a?.isCorrect).length;
    navigate('/resultado', {
      state: {
        correct,
        incorrect: answers.filter(a => a && !a.isCorrect).length,
        unanswered: questions.length - answers.filter(a => a).length,
        total: questions.length,
        timeUsed: EXAM_DURATION - timeLeft,
        examType: 'SIECOPOL',
        answers,
        questions
      }
    });
  }, [answers, questions, timeLeft, navigate]);

  // Función para finalización automática
  const handleAutoFinish = useCallback(() => {
    alert('¡El tiempo ha terminado! Su examen será enviado automáticamente.');
    submitExam();
  }, [submitExam]);

  // Cargar datos iniciales (temas y preguntas)
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchExamData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Obtener todos los temas primero
        const topicsResponse = await api.get('/topics');
        const questionsByTopic = [];
        const progress = {};

        for (const topicId of TOPICS_ORDER) {
          const count = QUESTIONS_PER_TOPIC[topicId];
          if (count > 0) {
            const response = await api.get(`/questions/random/${topicId}/${count}`);
            const topicQuestions = response.data.map(q => ({
              ...q,
              options: shuffleArray(q.options) // Mezclar alternativas
            }));

            // Encontrar el tema correspondiente
            const topic = topicsResponse.data.find(t => t._id === topicId);
            
            // Configurar progreso para este tema
            progress[topicId] = {
              name: topic?.name || topicId,
              shortName: topic?.short_name || topicId,
              total: count,
              indexes: Array.from(
                { length: count }, 
                (_, i) => questionsByTopic.length - count + i
              )
            };

            questionsByTopic.push(...topicQuestions);
          }
        }

        setQuestions(questionsByTopic);
        setTopicProgress(progress);

      } catch (err) {
        console.error('Error loading exam data:', err);
        setError('Error al cargar los datos del examen');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
  }, [navigate, user, shuffleArray]);

  // Temporizador del examen
  useEffect(() => {
    if (questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        // Mostrar alertas en tiempos específicos
        if (newTime === 30 * 60) {
          alert('¡Atención! Le quedan 30 minutos para finalizar el examen.');
        } else if (newTime === 15 * 60) {
          alert('¡Atención! Le quedan 15 minutos para finalizar el examen.');
        } else if (newTime === 5 * 60) {
          alert('¡Atención! Le quedan 5 minutos para finalizar el examen.');
        }
        
        // Finalizar examen cuando el tiempo se acaba
        if (newTime <= 0) {
          clearInterval(timer);
          handleAutoFinish();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions, handleAutoFinish]);

  // Obtener información del tema actual
  const getCurrentTopicInfo = () => {
    if (questions.length === 0 || currentQuestionIndex === undefined) return null;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const topicId = currentQuestion.topic_id;
    const topicInfo = topicProgress[topicId];
    if (!topicInfo) return null;

    // Encontrar la posición de la pregunta actual en este tema
    const questionPosInTopic = topicInfo.indexes.indexOf(currentQuestionIndex) + 1;

    return {
      name: topicInfo.name,
      shortName: topicInfo.shortName,
      current: questionPosInTopic,
      total: topicInfo.total
    };
  };

  // Manejar selección de respuesta
  const handleAnswerSelect = (answerIndex) => {
    if (answers[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options[answerIndex] === currentQuestion.correct_option;
    
    setSelectedAnswer(answerIndex);
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      questionId: currentQuestion._id,
      selected: answerIndex,
      isCorrect,
      correctOption: currentQuestion.options.indexOf(currentQuestion.correct_option)
    };
    setAnswers(newAnswers);
  };

  // Borrar respuesta
  const clearAnswer = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = undefined;
    setAnswers(newAnswers);
    setSelectedAnswer(null);
  };

  // Navegación entre preguntas
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setSelectedAnswer(answers[index]?.selected ?? null);
    setShowQuestionNumbers(false);
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  // Finalización del examen
  const handleFinish = () => {
    if (window.confirm('¿Estás seguro que deseas finalizar el examen?')) {
      submitExam();
    }
  };

  // Reiniciar examen
  const resetExam = () => {
    if (window.confirm('¿Estás seguro que deseas reiniciar el examen?')) {
      setQuestions(prevQuestions => 
        prevQuestions.map(q => ({
          ...q,
          options: shuffleArray(q.options)
        }))
      );
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setTimeLeft(EXAM_DURATION);
    }
  };

  // Formatear tiempo (HH:MM:SS)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Resumen de respuestas (1A, 2B, etc)
  const getAnswerSummary = () => {
    return answers
      .map((a, i) => a ? `${i+1}${String.fromCharCode(65 + a.selected)}` : null)
      .filter(Boolean)
      .join(', ');
  };

  if (!user) {
    return <div className="loading">Redirigiendo...</div>;
  }

  if (isLoading) {
    return <div className="loading">Cargando examen SIECOPOL...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="error">No se pudieron cargar las preguntas del examen</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentTopic = getCurrentTopicInfo();
  const answeredCount = answers.filter(a => a !== undefined).length;
  const incorrectCount = answers.filter(a => a && !a.isCorrect).length;

  return (
    <div className="container-exams">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Estudio Estrategico Policial</h2>
        <h3>Módulo de Examen Virtual</h3>
        <p>SIMULADOR DEL PROCESO DE ASCENSO DE SUBOFICIALES DE ARMAS 2025 - PROMOCIÓN 2026</p>
      </div>

      <div className="name_usuario">
        <p>{user.username}</p>
      </div>

      <div className="contenedor_examen">
        <div className={`contenedor_caja_preguntas ${showQuestionNumbers ? 'active' : ''}`}>
          {questions.map((_, index) => (
            <label 
              key={index}
              className={`caja_numero_preguntas ${answers[index] ? 'answered' : ''}`} 
              onClick={() => goToQuestion(index)}
            >
              <input 
                type="radio" 
                name="pregunta"
              />
              <span>{index + 1}</span>
            </label>
          ))}
        </div>

        <div className="datos_preguntas">
          <div className="mobile-header">
            {currentTopic && (
              <div className="tema_pregunta2">
                {currentTopic.shortName} ({currentTopic.current} de {currentTopic.total})
              </div>
            )}
          </div>

          <div className="encabezamiento_pregunta">
            <label 
              className="icono_preguntas"
              onClick={() => setShowQuestionNumbers(!showQuestionNumbers)}
            >
              <img src="/images/menu-icon.png" className="menu_icono" alt="menu" />
            </label>
            <div className="cronometro">
              <span>{formatTime(timeLeft)}</span>
            </div>
            {currentTopic && (
              <div className="tema_pregunta">
                {currentTopic.name} ({currentTopic.current} de {currentTopic.total})
              </div>
            )}
            <button className="finish-btn" onClick={handleFinish}>Finalizar Examen</button>
          </div>
          
          <div className="pregunta_completa">
            <div className="pregunta">
              <span>{currentQuestionIndex + 1}.</span>
              <label>{currentQuestion.question_text}</label>
            </div>
            
            <div className="todas_alternativas">
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index}
                  className={`alternativas ${
                    showColors && selectedAnswer === index 
                      ? answers[currentQuestionIndex]?.isCorrect 
                        ? 'correct' 
                        : 'incorrect'
                      : ''
                  } ${
                    showColors && answers[currentQuestionIndex] && 
                    currentQuestion.options[index] === currentQuestion.correct_option
                      ? 'show-correct' 
                      : ''
                  }`}
                  onClick={() => !answers[currentQuestionIndex] && handleAnswerSelect(index)}
                >
                  <div>
                    <input 
                      type="radio" 
                      checked={selectedAnswer === index}
                      readOnly
                    />
                  </div>
                  <span>{String.fromCharCode(65 + index)}.</span>
                  <label>{option}</label>
                </div>
              ))}
              
              <div className="botones_ayuda">
                <button className="borrar" onClick={clearAnswer}>Borrar Respuesta</button>
                <button className="activar" onClick={() => setShowColors(!showColors)}>
                  {showColors ? 'Ocultar colores' : 'Mostrar colores'}
                </button>
              </div>
            </div>
          </div>
        
          <div className="registro_respuestas">
            <ul className="resumen_resultado">
              <li>PREGUNTAS CONTESTADAS: {answeredCount}</li>
              <li>INCORRECTAS SIN CONTESTAR: {incorrectCount}</li>
            </ul>
          </div>

          <div className="numero_letra_respuestas">
            {getAnswerSummary() || 'Ninguna respuesta marcada'}
          </div>
          <div className="botones">
            <button onClick={resetExam}>Reiniciar</button>
            <button onClick={goToPrev} disabled={currentQuestionIndex === 0}>Anterior</button>
            <button onClick={goToNext} disabled={currentQuestionIndex === questions.length - 1}>Siguiente</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SiecopolExam;