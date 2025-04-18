import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpeechSynthesis } from 'react-speech-kit';
import { getCurrentUser } from '../../services/auth';
import api from '../../services/api';
import './AudioPage.css';

const AudioPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { speak, cancel, speaking, voices } = useSpeechSynthesis();
  
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [topic, setTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioMode, setAudioMode] = useState('complete'); // 'complete' o 'correct-only'
  const [isPlaying, setIsPlaying] = useState(false);
  const [jumpToQuestion, setJumpToQuestion] = useState('');
  const [minQuestionId, setMinQuestionId] = useState(0);
  const [maxQuestionId, setMaxQuestionId] = useState(0);

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
          api.get(`/topics/${topicId}`),
          api.get(`/questions/topic/${topicId}`)
        ]);
        
        setTopic(topicRes.data);
        setQuestions(questionsRes.data);
        
        // Obtener IDs mínimo y máximo para mostrar en el formulario
        if (questionsRes.data.length > 0) {
          const ids = questionsRes.data.map(q => q._id);
          setMinQuestionId(Math.min(...ids));
          setMaxQuestionId(Math.max(...ids));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('No se pudo cargar el tema. Por favor intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [topicId, navigate]);

  // Efecto para manejar la reproducción automática
  useEffect(() => {
    if (isPlaying && questions.length > 0) {
      speakQuestion(currentQuestionIndex);
    }
  }, [isPlaying, currentQuestionIndex, questions]);

  // Función para leer la pregunta según el modo seleccionado
  const speakQuestion = useCallback((index) => {
    if (index >= questions.length) {
      setIsPlaying(false);
      return;
    }

    const question = questions[index];
    let textToSpeak = '';

    if (audioMode === 'complete') {
      textToSpeak = `Pregunta número ${index + 1}. ${question.question_text}. Alternativas: `;
      question.options.forEach((option, i) => {
        textToSpeak += `${String.fromCharCode(65 + i)}. ${option}. `;
      });
      textToSpeak += `Respuesta correcta: ${question.correct_option}.`;
    } else {
      textToSpeak = `Pregunta número ${index + 1}. ${question.question_text}. Respuesta correcta es: ${question.correct_option}.`;
    }

    cancel(); // Cancelar cualquier lectura previa
    
    speak({
      text: textToSpeak,
      onEnd: () => {
        if (isPlaying && index < questions.length - 1) {
          setCurrentQuestionIndex(index + 1);
        } else {
          setIsPlaying(false);
        }
      }
    });
  }, [speak, cancel, questions, audioMode, isPlaying]);

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
    
    // Si estamos en modo reproducción, continuar con la siguiente pregunta
    if (isPlaying) {
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1000);
    }
  };

  // Manejar cambio de pregunta manual
  const handleJumpToQuestion = (e) => {
    e.preventDefault();
    const questionNum = parseInt(jumpToQuestion);
    
    if (!isNaN(questionNum) && questionNum >= minQuestionId && questionNum <= maxQuestionId) {
      const index = questions.findIndex(q => q._id === questionNum);
      if (index !== -1) {
        setCurrentQuestionIndex(index);
        cancel();
        if (isPlaying) {
          speakQuestion(index);
        }
      }
    }
  };

  // Alternar reproducción/pausa
  const togglePlayPause = () => {
    if (speaking) {
      cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  // Finalizar examen
  const handleFinish = () => {
    if (window.confirm('¿Estás seguro que deseas finalizar el examen en audio?')) {
      cancel();
      navigate('/balotario');
    }
  };

  // Mostrar ayuda
  const showHelp = () => {
    const currentQuestion = questions[currentQuestionIndex];
    alert(`TIP: ${currentQuestion?.tips || 'No hay sugerencias para esta pregunta'}`);
  };

  if (!user) {
    return <div className="loading">Redirigiendo...</div>;
  }

  if (isLoading) {
    return <div className="loading">Cargando tema y preguntas...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!topic || questions.length === 0) {
    return <div className="error">No se encontraron preguntas para este tema</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="topic-detail">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Estudio Estrategico Policial</h2>
        <h3>BALOTARIO DIDÁCTICO</h3>
        <p>SIMULADOR DEL PROCESO DE ASCENSO DE SUBOFICIALES DE ARMAS 2025 - PROMOCIÓN 2026</p>
      </div>

      <div className="name_usuario">
        <p>{user.username}</p>
      </div>

      <div className="contenedor_examen">
        <div className="jump-to-question">
          <form onSubmit={handleJumpToQuestion}>
            <fieldset>
              <legend>Número de pregunta</legend>
              <label className="numero_empezar">
                <input 
                  type="number" 
                  value={jumpToQuestion}
                  onChange={(e) => setJumpToQuestion(e.target.value)}
                  min={minQuestionId}
                  max={maxQuestionId}
                  placeholder="0000"
                />
              </label>
            </fieldset>
            <span>min: {minQuestionId} - max: {maxQuestionId}</span>
          </form>
          <button className="text" onClick={handleJumpToQuestion}>Ir a pregunta</button>
        </div>

        <div className="datos_preguntas">
          <div className="tema_pregunta2">{topic.short_name}</div>

          <div className="encabezamiento_pregunta">
            <div className="tema_pregunta">{topic.name}</div>
            <button className="text" onClick={handleFinish}>Finalizar Examen</button>
          </div>

          <div className="opciones-audio">
            <div 
              className={`audio-mode ${audioMode === 'complete' ? 'active' : ''}`}
              onClick={() => setAudioMode('complete')}
            >
              MODO COMPLETO (P+A+R)
            </div>
            <div 
              className={`audio-mode ${audioMode === 'correct-only' ? 'active' : ''}`}
              onClick={() => setAudioMode('correct-only')}
            >
              MODO SOLO CORRECTA (P+RC)
            </div>
          </div>

          <div className="play-pause" onClick={togglePlayPause}>
            {isPlaying ? 'PAUSE' : 'PLAY'}
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
                    selectedAnswer === index 
                      ? answers[currentQuestionIndex]?.isCorrect 
                        ? 'correct' 
                        : 'incorrect'
                      : ''
                  } ${
                    answers[currentQuestionIndex] && 
                    currentQuestion.options[index] === currentQuestion.correct_option 
                      ? 'show-correct' 
                      : ''
                  }`}
                  onClick={() => handleAnswerSelect(index)}
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
              <button className="ayuda" onClick={showHelp}>Ayuda</button>
            </div>
          </div>
        </div>
      </div>

      <div className="botones">
        <button onClick={() => navigate('/balotario')}>Escoger otro tema</button>
      </div>
    </div>
  );
};

export default AudioPage;