import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import './CorrectErrors.css';

const CorrectErrors = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(false);
  const [time, setTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showColors, setShowColors] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);

    // Obtener preguntas incorrectas del estado de navegación o del localStorage
    const state = location.state;
    const incorrectQuestions = [];
    const previousAnswers = [];

    if (state && state.answers && state.questions) {
      state.questions.forEach((question, index) => {
        if (state.answers[index] && !state.answers[index].isCorrect) {
          incorrectQuestions.push(question);
          previousAnswers.push(state.answers[index]);
        }
      });
    }

    setQuestions(incorrectQuestions);
    setAnswers(Array(incorrectQuestions.length).fill(null));
    setIsLoading(false);

    // Configurar cronómetro
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [location.state, navigate]);

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

  const clearAnswer = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = null;
    setAnswers(newAnswers);
    setSelectedAnswer(null);
  };

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

  const handleFinish = () => {
    if (window.confirm('¿Estás seguro que deseas finalizar la corrección de errores?')) {
      const correct = answers.filter(a => a?.isCorrect).length;
      navigate('/resultado', {
        state: {
          correct,
          incorrect: answers.length - correct,
          total: questions.length,
          time,
          topic: 'Corrección de Errores',
          answers,
          questions,
          origin: 'correccion-errores'
        }
      });
    }
  };

  const resetExam = () => {
    if (window.confirm('¿Estás seguro que deseas reiniciar la corrección de errores?')) {
      setAnswers(Array(questions.length).fill(null));
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setTime(0);
      setShowColors(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnswerSummary = () => {
    return questions.map((_, index) => {
      const answer = answers[index];
      if (!answer) return null;
      return `${index + 1}${String.fromCharCode(65 + answer.selected)}`;
    }).filter(Boolean).join(', ');
  };

  if (!user || isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="no-errors">
        <h3>¡No hay errores para corregir!</h3>
        <button onClick={() => navigate('/dashboard')}>Volver al Inicio</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswers = answers.filter(a => a?.isCorrect).length;
  const totalAnswered = answers.filter(a => a !== null).length;

  return (
    <div className="container-exams">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Estudio Estrategico Policial</h2>
        <h3>CORRECCIÓN DE ERRORES</h3>
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
            <div className="tema_pregunta2">MÓDULO DE CORRECCIÓN DE ERRORES</div>
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
            <div className="tema_pregunta">MÓDULO DE CORRECCIÓN DE ERRORES</div>
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
            {getAnswerSummary()}
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

export default CorrectErrors;