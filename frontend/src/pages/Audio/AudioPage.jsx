import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import api from '../../services/api';
import './AudioPage.css';

const AudioPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioMode, setAudioMode] = useState('all'); // 'all' o 'correct'
  const [startQuestion, setStartQuestion] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [topic, setTopic] = useState(null);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);

    // Verificar si el navegador soporta speechSynthesis
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    } else {
      alert('Tu navegador no soporta la funcionalidad de texto a voz');
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [topicRes, questionsRes] = await Promise.all([
          api.get(`/topics/${topicId}`),
          api.get(`/questions/topic/${topicId}`)
        ]);
        
        setTopic(topicRes.data);
        setQuestions(questionsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [topicId, navigate]);

  const speak = (text, voiceType = 'male') => {
    if (!speechSynthesis) return;

    // Cancelar cualquier habla en curso
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Seleccionar voz según el tipo (masculino/femenino)
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => {
      if (voiceType === 'male') {
        return voice.name.includes('Male') || voice.lang.includes('es-MX') || voice.lang.includes('es-ES');
      } else {
        return voice.name.includes('Female') || voice.lang.includes('es-US');
      }
    });

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    speechSynthesis.speak(utterance);
  };

  const playCurrentQuestion = () => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) return;

    const currentQuestion = questions[currentQuestionIndex];
    
    // Leer pregunta con voz masculina
    speak(`Pregunta número ${currentQuestionIndex + 1}. ${currentQuestion.question_text}`, 'male');
    
    if (audioMode === 'all') {
      // Leer todas las alternativas con voz femenina
      setTimeout(() => {
        speak(`Alternativas: ${currentQuestion.options.map((opt, i) => 
          `${String.fromCharCode(65 + i)}. ${opt}`).join('. ')}`, 'female');
        
        // Leer respuesta correcta
        setTimeout(() => {
          const correctIndex = currentQuestion.options.indexOf(currentQuestion.correct_option);
          speak(`Respuesta correcta: ${String.fromCharCode(65 + correctIndex)}. ${currentQuestion.correct_option}`, 'female');
        }, 3000);
      }, 3000);
    } else {
      // Solo leer la respuesta correcta
      setTimeout(() => {
        const correctIndex = currentQuestion.options.indexOf(currentQuestion.correct_option);
        speak(`Alternativa correcta: ${String.fromCharCode(65 + correctIndex)}. ${currentQuestion.correct_option}`, 'female');
      }, 3000);
    }
  };

  const handlePlay = () => {
    if (startQuestion < 1 || startQuestion > questions.length) {
      alert('Por favor ingresa un número de pregunta válido');
      return;
    }

    setCurrentQuestionIndex(startQuestion - 1);
    setIsPlaying(true);
    playCurrentQuestion();
  };

  const handleStop = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => {
        const newIndex = prev + 1;
        if (isPlaying) {
          playCurrentQuestion();
        }
        return newIndex;
      });
    } else {
      handleStop();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => {
        const newIndex = prev - 1;
        if (isPlaying) {
          playCurrentQuestion();
        }
        return newIndex;
      });
    }
  };

  const handleModeChange = (mode) => {
    setAudioMode(mode);
    if (isPlaying) {
      playCurrentQuestion();
    }
  };

  if (!user || isLoading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!topic || questions.length === 0) {
    return <div className="error">No se encontraron preguntas para este tema</div>;
  }

  const currentQuestion = questions[currentQuestionIndex] || {};

  return (
    <div className="topic-detail audio-page">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Estudio Estrategico Policial</h2>
        <h3>Balotario en audio</h3>
        <p>SIMULADOR DEL PROCESO DE ASCENSO DE SUBOFICIALES DE ARMAS 2025 - PROMOCIÓN 2026</p>
      </div>

      <div className="name_usuario">
        <p>Hola {user.username}, ¿a partir de qué pregunta deseas estudiar?</p>
      </div>

      <div className="seleccionar_como_escuchar">
        <ol>
          <li>
            <input 
              type="radio" 
              name="audioMode" 
              checked={audioMode === 'all'}
              onChange={() => handleModeChange('all')}
            /> 
            ESCUCHAR TODAS LAS ALTERNATIVAS
          </li>
          <li>
            <input 
              type="radio" 
              name="audioMode" 
              checked={audioMode === 'correct'}
              onChange={() => handleModeChange('correct')}
            /> 
            ESCUCHAR SOLO ALTERNATIVA CORRECTA
          </li>
        </ol>

        <div className="opciones_de_audio">
          <div className="input-container">
            <form onSubmit={(e) => { e.preventDefault(); handlePlay(); }}>
              <fieldset>
                <legend>Número de pregunta conforme al balotario oficial</legend>
                <input 
                  type="number" 
                  className="numero_empezar"
                  min="1"
                  max={questions.length}
                  value={startQuestion}
                  onChange={(e) => setStartQuestion(parseInt(e.target.value) || 1)}
                />
              </fieldset>
              <span>min: 1 - max: {questions.length}</span>
              <button type="submit" className="text" disabled={isPlaying}>
                {isPlaying ? 'REPRODUCIENDO...' : 'PLAY'}
              </button>
            </form>
          </div>
          
          <div className="botones_reproduccion">
            <button onClick={handlePrev} disabled={currentQuestionIndex === 0}>Anterior</button>
            <button onClick={isPlaying ? handleStop : handlePlay}>
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>
            <button onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>Siguiente</button>
          </div>

          <div className="pregunta_completa">
            <div className="pregunta">
              <span>{currentQuestionIndex + 1}.</span>
              <label>{currentQuestion.question_text}</label>
            </div>
            
            <div className="todas_alternativas">
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="alternativas">
                  <div>
                    <input 
                      type="radio" 
                      checked={option === currentQuestion.correct_option}
                      readOnly
                    />
                  </div>
                  <span>{String.fromCharCode(65 + index)}.</span>
                  <label>{option}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <button onClick={() => navigate('/audio')} className="back-button">Escoger otro tema</button>
      </div>
    </div>
  );
};

export default AudioPage;