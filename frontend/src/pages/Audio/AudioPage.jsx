import { useState, useEffect, useRef } from 'react';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioMode, setAudioMode] = useState('all');
  const [startQuestion, setStartQuestion] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [topic, setTopic] = useState(null);
  const [voicesReady, setVoicesReady] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [currentlySpeaking, setCurrentlySpeaking] = useState(null);
  
  const speechSynthesisRef = useRef(null);
  const currentUtteranceRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);

    // Configurar speechSynthesis
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      const checkVoices = () => {
        const voices = speechSynthesisRef.current.getVoices();
        if (voices.length > 0) {
          setVoicesReady(true);
          console.log('Voces disponibles:', voices);
        } else {
          // Reintentar después de un breve retraso si no hay voces
          setTimeout(checkVoices, 500);
        }
      };
      
      speechSynthesisRef.current.onvoiceschanged = checkVoices;
      checkVoices();
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

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      if (currentUtteranceRef.current) {
        currentUtteranceRef.current.onend = null;
      }
    };
  }, [topicId, navigate]);

  const getVoice = (gender = 'male') => {
    if (!speechSynthesisRef.current) return null;
    
    const voices = speechSynthesisRef.current.getVoices();
    const spanishVoices = voices.filter(v => v.lang.includes('es'));
    
    if (spanishVoices.length === 0) return null;
    
    // Priorizar voces específicas
    const preferredMaleNames = ['Microsoft Pablo', 'Google español', 'Jorge'];
    const preferredFemaleNames = ['Microsoft Helena', 'Google español de Estados Unidos', 'Paulina'];
    
    // Buscar voces preferidas primero
    const preferredVoices = spanishVoices.filter(v => 
      gender === 'male' 
        ? preferredMaleNames.some(name => v.name.includes(name))
        : preferredFemaleNames.some(name => v.name.includes(name))
    );
    
    if (preferredVoices.length > 0) return preferredVoices[0];
    
    // Si no hay voces preferidas, buscar por género
    const genderVoices = spanishVoices.filter(v => 
      gender === 'male' 
        ? v.name.toLowerCase().includes('male') || 
          v.name.toLowerCase().includes('hombre') ||
          v.name.toLowerCase().includes('man')
        : v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('mujer') ||
          v.name.toLowerCase().includes('woman')
    );
    
    // Si no hay voces del género, usar cualquier voz en español
    return genderVoices.length > 0 ? genderVoices[0] : spanishVoices[0];
  };

  const speak = (text, voiceType = 'male', onEndCallback = null) => {
    if (!speechSynthesisRef.current || !voicesReady) {
      console.error('Speech synthesis not available or voices not loaded');
      return;
    }

    speechSynthesisRef.current.cancel();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getVoice(voiceType);
      
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'es-ES';
      }
      
      utterance.rate = playbackRate;
      utterance.pitch = 1.0;

      utterance.onend = (event) => {
        if (onEndCallback) onEndCallback(event);
      };

      utterance.onerror = (event) => {
        console.error('Error en la reproducción:', event);
        if (onEndCallback) onEndCallback(event);
      };

      currentUtteranceRef.current = utterance;
      speechSynthesisRef.current.speak(utterance);
    } catch (error) {
      console.error('Error al crear utterance:', error);
    }
  };

  const playCurrentQuestion = () => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setCurrentlySpeaking('question');
    speak(`Pregunta número ${currentQuestionIndex + 1}. ${currentQuestion.question_text}`, 'male', () => {
      setCurrentlySpeaking('options');
      
      if (audioMode === 'all') {
        speak(`Alternativas: ${currentQuestion.options.map((opt, i) => 
          `${String.fromCharCode(65 + i)}. ${opt}`).join('. ')}`, 'female', () => {
          setCurrentlySpeaking('answer');
          const correctIndex = currentQuestion.options.indexOf(currentQuestion.correct_option);
          speak(`Respuesta correcta: ${String.fromCharCode(65 + correctIndex)}. ${currentQuestion.correct_option}`, 'female', () => {
            setCurrentlySpeaking(null);
            if (autoAdvance && isPlaying && currentQuestionIndex < questions.length - 1) {
              timeoutRef.current = setTimeout(() => {
                handleNext();
              }, 1000);
            }
          });
        });
      } else {
        const correctIndex = currentQuestion.options.indexOf(currentQuestion.correct_option);
        speak(`Alternativa correcta: ${String.fromCharCode(65 + correctIndex)}. ${currentQuestion.correct_option}`, 'female', () => {
          setCurrentlySpeaking(null);
          if (autoAdvance && isPlaying && currentQuestionIndex < questions.length - 1) {
            timeoutRef.current = setTimeout(() => {
              handleNext();
            }, 1000);
          }
        });
      }
    });
  };

  const handlePlay = () => {
    if (startQuestion < 1 || startQuestion > questions.length) {
      alert('Por favor ingresa un número de pregunta válido');
      return;
    }

    setCurrentQuestionIndex(startQuestion - 1);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      playCurrentQuestion();
    }
  }, [isPlaying, currentQuestionIndex, audioMode, playbackRate]);

  const handleStop = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsPlaying(false);
    setCurrentlySpeaking(null);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleStop();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleModeChange = (mode) => {
    setAudioMode(mode);
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (isPlaying) {
      handleStop();
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
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
        <div className="mode-selector">
          <button 
            className={`mode-button ${audioMode === 'all' ? 'active' : ''}`}
            onClick={() => handleModeChange('all')}
          >
            Todas las alternativas
          </button>
          <button 
            className={`mode-button ${audioMode === 'correct' ? 'active' : ''}`}
            onClick={() => handleModeChange('correct')}
          >
            Solo correcta
          </button>
          <label className="auto-advance-toggle">
            <input 
              type="checkbox" 
              checked={autoAdvance}
              onChange={() => setAutoAdvance(!autoAdvance)}
            />
            Avance automático
          </label>
        </div>

        <div className="playback-controls">
          <label>Velocidad:</label>
          <button 
            onClick={() => handleRateChange(0.5)} 
            className={playbackRate === 0.5 ? 'active' : ''}
          >
            Lento (0.5x)
          </button>
          <button 
            onClick={() => handleRateChange(1)} 
            className={playbackRate === 1 ? 'active' : ''}
          >
            Normal (1x)
          </button>
          <button 
            onClick={() => handleRateChange(1.5)} 
            className={playbackRate === 1.5 ? 'active' : ''}
          >
            Rápido (1.5x)
          </button>
          <button 
            onClick={() => handleRateChange(2)} 
            className={playbackRate === 2 ? 'active' : ''}
          >
            Muy rápido (2x)
          </button>
        </div>

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
            <button onClick={handlePrev} disabled={currentQuestionIndex === 0 || isPlaying}>
              Anterior
            </button>
            <button onClick={isPlaying ? handleStop : handlePlay}>
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>
            <button onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1 || isPlaying}>
              Siguiente
            </button>
          </div>

          <div className="pregunta_completa">
            <div className={`pregunta ${currentlySpeaking === 'question' ? 'speaking' : ''}`}>
              <span>{currentQuestionIndex + 1}.</span>
              <label>{currentQuestion.question_text}</label>
            </div>
            
            <div className="todas_alternativas">
              {currentQuestion.options?.map((option, index) => (
                <div 
                  key={index} 
                  className={`alternativas ${
                    (currentlySpeaking === 'options' || currentlySpeaking === 'answer') && 
                    (audioMode === 'all' || option === currentQuestion.correct_option) ? 'speaking' : ''
                  }`}
                >
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
        
        <button onClick={() => navigate('/audio')} className="back-button">
          Escoger otro tema
        </button>
      </div>
    </div>
  );
};

export default AudioPage;