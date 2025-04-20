import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/auth";
import api from "../../services/api";
import "./AudioPage.css";

const AudioPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readAllOptions, setReadAllOptions] = useState(true);
  const [startQuestion, setStartQuestion] = useState(1);
  const [topic, setTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const currentCharIndex = useRef(0);

  // Cargar datos del tema y preguntas
  useEffect(() => {
    const synth = synthRef.current;
    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate("/");
      return;
    }
    setUser(currentUser);

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [topicRes, questionsRes] = await Promise.all([
          api.get(`/topics/${topicId}`),
          api.get(`/questions/topic/${topicId}`),
        ]);

        setTopic(topicRes.data);
        setQuestions(questionsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("No se pudo cargar el tema. Por favor intenta nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      synth.cancel();
    };
  }, [topicId, navigate]);

  // Función para generar el texto a leer
  const getTextToRead = useCallback(
    (question) => {
      let textToRead = `Pregunta ${currentQuestionIndex + 1}: ${
        question.question_text
      }`;

      if (readAllOptions) {
        question.options.forEach((option, index) => {
          textToRead += ` Alternativa ${String.fromCharCode(
            65 + index
          )}: ${option}.`;
        });

        const correctIndex = question.options.indexOf(question.correct_option);
        textToRead += ` La respuesta correcta es la alternativa ${String.fromCharCode(
          65 + correctIndex
        )}: ${question.correct_option}.`;
      } else {
        const correctIndex = question.options.indexOf(question.correct_option);
        textToRead += ` La respuesta correcta es la alternativa ${String.fromCharCode(
          65 + correctIndex
        )}: ${question.correct_option}.`;
      }

      return textToRead;
    },
    [currentQuestionIndex, readAllOptions]
  );

  // Manejar la reproducción de preguntas
  useEffect(() => {
    const synth = synthRef.current;
    const utterance = new SpeechSynthesisUtterance();
    utteranceRef.current = utterance;

    if (
      !isPlaying ||
      questions.length === 0 ||
      currentQuestionIndex >= questions.length
    ) {
      return;
    }

    const speakQuestion = () => {
      const currentQuestion = questions[currentQuestionIndex];
      const textToRead = getTextToRead(currentQuestion);

      synth.cancel();

      utterance.text = textToRead;
      utterance.lang = "es-ES";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          currentCharIndex.current = event.charIndex;
        }
      };

      utterance.onend = () => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      };

      if (isPaused && currentCharIndex.current > 0) {
        utterance.text = textToRead.substring(currentCharIndex.current);
      }

      synth.speak(utterance);
      setIsPaused(false);
    };

    speakQuestion();

    return () => {
      synth.cancel();
      utterance.onend = null;
      utterance.onboundary = null;
    };
  }, [isPlaying, currentQuestionIndex, questions, isPaused, getTextToRead]);

  // Manejar play/pause
  const togglePlayPause = () => {
    const synth = synthRef.current;

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
      setIsPaused(true);
    } else {
      if (synth.paused) {
        synth.resume();
      } else if (currentQuestionIndex >= questions.length) {
        setCurrentQuestionIndex(0);
      }
      setIsPlaying(true);
    }
  };

  // Detener completamente la lectura
  const handleStop = () => {
    const synth = synthRef.current;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    currentCharIndex.current = 0;
  };

  // Ir a la pregunta especificada
  const goToStartQuestion = () => {
    const newIndex = Math.min(
      Math.max(startQuestion - 1, 0),
      questions.length - 1
    );
    setCurrentQuestionIndex(newIndex);
    currentCharIndex.current = 0;

    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      const synth = synthRef.current;
      synth.cancel();
    }
  };

  // Saltar a una pregunta específica
  const jumpToQuestion = (index) => {
    const newIndex = Math.min(Math.max(index - 1, 0), questions.length - 1);
    setCurrentQuestionIndex(newIndex);
    currentCharIndex.current = 0;
    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      const synth = synthRef.current;
      synth.cancel();
    }
  };

  if (!user) {
    return <div className="loading">Redirigiendo...</div>;
  }

  if (isLoading) {
    return <div className="loading">Cargando preguntas...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!topic || questions.length === 0) {
    return (
      <div className="error">No se encontraron preguntas para este tema</div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex] || questions[0];

  return (
    <div className="container-exams">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Estudio Estrategico Policial</h2>
        <h3>VERSIÓN AUDIO</h3>
        <p>
          SIMULADOR DEL PROCESO DE ASCENSO DE SUBOFICIALES DE ARMAS 2025 -
          PROMOCIÓN 2026
        </p>
      </div>
      <div className="name_usuario">
        <p>Usuario: {user.username}</p>
      </div>
      <div className="contenedor_examen">
        <div className="contenedor_caja_preguntas">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => jumpToQuestion(index + 1)}
                  className={`question-button ${
                    currentQuestionIndex === index ? "active" : ""
                  }`}
                >
                  {index + 1}
                </button>
              ))}
        </div>
        <div className="datos_preguntas">
          <div className="mobile-header">
            <div className="tema_pregunta2">{topic.short_name}</div>
          </div>
          <div className="encabezamiento_pregunta3">
            <div className="tema_pregunta">{topic.short_name}</div>
          </div>
          <div className="audio-controls">
          <div className="control-group">
              <label className="radio-option">
                <input
                  type="radio"
                  checked={readAllOptions}
                  onChange={() => setReadAllOptions(true)}
                />
                <span>Leer todas las alternativas</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  checked={!readAllOptions}
                  onChange={() => setReadAllOptions(false)}
                />
                <span>Leer solo alternativa correcta</span>
              </label>
          </div>
            <div className="control-group start-question-control">
              <label>
                COMENZAR EN:
                <input
                  type="number"
                  min="1"
                  max={questions.length}
                  value={startQuestion}
                  onChange={(e) =>
                    setStartQuestion(
                      Math.min(
                        Math.max(parseInt(e.target.value) || 1, 1),
                        questions.length
                      )
                    )
                  }
                />
              </label>
              <button onClick={goToStartQuestion} className="go-to-button">
                Ir a pregunta
              </button>
            </div>
            <div className="playback-controls">
              <button
                onClick={togglePlayPause}
                className={`control-button ${
                  isPlaying ? "pause-button" : "play-button"
                }`}
              >
                {isPlaying ? (
                  <>
                    <span className="icon">⏸</span> Pausar
                  </>
                ) : (
                  <>
                    <span className="icon">▶</span> Reproducir
                  </>
                )}
              </button>
              <button
                onClick={handleStop}
                className="control-button stop-button"
              >
                <span className="icon">⏹</span> Detener
              </button>

            </div>
          </div>

          <div className="pregunta_completa">
            <h3 className="encabezamiento_pregunta3">
              Pregunta actual: {currentQuestionIndex + 1} de {questions.length}
            </h3>
            <div className="pregunta">
              <span>{currentQuestionIndex + 1}.</span>
              <label>
                {currentQuestion.question_text}
              </label>
            </div>

            {readAllOptions && (
              <div className="todas_alternativas">
                <ul>
                  {currentQuestion.options.map((option, index) => (
                    <li key={index}>
                      <strong>{String.fromCharCode(65 + index)}:</strong>{" "}
                      {option}
                      {option === currentQuestion.correct_option && (
                        <span className="correct-indicator"> (Correcta)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!readAllOptions && (
              <div className="correct-answer">
                <h4>Respuesta correcta:</h4>
                <p>
                  <strong>
                    {String.fromCharCode(
                      65 +
                        currentQuestion.options.indexOf(
                          currentQuestion.correct_option
                        )
                    )}
                    :
                  </strong>{" "}
                  {currentQuestion.correct_option}
                </p>
              </div>
            )}
          </div>
          <div className="boton_regresar">
            <button
                onClick={() => navigate("/audio")}
                className="control-button back-button"
              >
                <span className="icon">↩</span> Escoger otro tema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPage;
