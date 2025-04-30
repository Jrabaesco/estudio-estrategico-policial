import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import api from '../../services/api';
import './ExamPage.css';

const ExamPage = () => {
  const { topicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(false);
  const [time, setTime] = useState(0);
  const [topic, setTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showColors, setShowColors] = useState(false);
  const [questionCount] = useState(location.state?.questionCount || 10);

  // Función para mezclar solo las alternativas
  const shuffleOptions = useCallback((options) => {
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Obtener datos del tema y preguntas
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [topicRes, questionsRes] = await Promise.all([
          api.get(`/api/topics/${topicId}`),
          api.get(`/api/questions/topic/${topicId}`)
        ]);
        
        setTopic(topicRes.data);
        
        // Seleccionar cantidad aleatoria de preguntas y mezclar alternativas
        const allQuestions = questionsRes.data;
        const selectedQuestions = allQuestions
          .sort(() => 0.5 - Math.random())
          .slice(0, questionCount)
          .map(question => ({
            ...question,
            options: shuffleOptions(question.options)
          }));
        
        setQuestions(selectedQuestions);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('No se pudo cargar el examen. Por favor intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Configurar cronómetro
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [topicId, navigate, shuffleOptions, questionCount]);

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

  // Borrar respuesta seleccionada
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

  // Finalizar examen
  const handleFinish = () => {
    if (window.confirm('¿Estás seguro que deseas finalizar el examen?')) {
      const correct = answers.filter(a => a?.isCorrect).length;
      navigate('/resultado', {
        state: {
          correct,
          incorrect: answers.filter(a => a && !a.isCorrect).length,
          total: questions.length,
          time,
          topic: topic?.name,
          answers,
          questions
        }
      });
    }
  };

  // Reiniciar examen
  const resetExam = () => {
    if (window.confirm('¿Estás seguro que deseas reiniciar el examen?')) {
      setQuestions(prevQuestions => 
        prevQuestions.map(q => ({
          ...q,
          options: shuffleOptions(q.options)
        }))
      );
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setTime(0);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return <div className="loading">Redirigiendo...</div>;
  }

  if (isLoading) {
    return <div className="loading">Cargando examen...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!topic || questions.length === 0) {
    return <div className="error">No se encontraron preguntas para este tema</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswers = answers.filter(a => a?.isCorrect).length;
  const totalAnswered = answers.filter(a => a !== undefined).length;
  const answerSummary = answers.map((a, i) => a ? `${i+1}${String.fromCharCode(65 + a.selected)}` : null)
                              .filter(Boolean).join(', ');

  return (
    <div className="container-exams">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Estudio Estrategico Policial</h2>
        <h3>Módulo de Examen por Temas</h3>
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
            <div className="tema_pregunta2">{topic.short_name}</div>
          </div>

          <div className="encabezamiento_pregunta">
            <label 
              className="icono_preguntas"
              onClick={() => setShowQuestionNumbers(!showQuestionNumbers)}
            >
              <img src="/images/menu-icon.png" className="menu_icono" alt="icon" />
            </label>
            <div className="cronometro">
              <span>{formatTime(time)}</span>
            </div>
            <div className="tema_pregunta">{topic.name}</div>
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
              <li>CORRECTAS: {correctAnswers}</li>
              <li>INCORRECTAS: {totalAnswered - correctAnswers}</li>
              <li>TOTAL RESPONDIDAS: {totalAnswered}</li>
              <li>TOTAL PREGUNTAS: {questions.length}</li>
            </ul>
          </div>

          <div className="numero_letra_respuestas">
            {answerSummary || 'Ninguna respuesta marcada'}
          </div>
          <div className="botones">
            <button onClick={resetExam}>Reiniciar</button>
            <button onClick={goToPrev} disabled={currentQuestionIndex === 0}>Anterior</button>
            <button onClick={goToNext} disabled={currentQuestionIndex === questions.length - 1}>Siguiente</button>
            <button onClick={() => navigate('/examen-temas')}>Escoger otro tema</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;