import { useLocation, useNavigate } from 'react-router-dom';
import './ResultPage.css';

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate('/');
    return null;
  }

  // Función para formatear el tiempo que funciona para todos los exámenes
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular puntaje porcentual
  const calculateScore = () => {
    const percentage = (state.correct / state.total) * 100;
    return Math.round(percentage);
  };

  // Determinar la ruta de origen según el tipo de examen
  const getOriginPath = () => {
    if (state.examType === 'balotario') return '/balotario';
    if (state.examType === 'examen-temas') return '/examen-temas';
    if (state.examType === 'SIECOPOL') return '/siecopol';
    return '/dashboard';
  };

  // Obtener título según el tipo de examen
  const getExamTitle = () => {
    if (state.examType === 'SIECOPOL') {
      return 'Examen Virtual Finalizado';
    } else if (state.topic) {
      return state.examType === 'examen-temas' 
        ? `Balotario de ${state.topic} Finalizado` 
        : `Examen de ${state.topic} Finalizado`;
    }
    return 'Examen Virtual Finalizado';
  };

  // Calcular estadísticas consistentes para todos los tipos de examen
  const getExamStats = () => {
    // Para compatibilidad con los diferentes componentes
    const correct = state.correct || 0;
    const incorrect = state.incorrect || (state.answers ? state.answers.filter(a => a && !a.isCorrect).length : 0);
    const unanswered = state.unanswered || (state.total - (correct + incorrect));
    const timeUsed = state.timeUsed || state.time || 0;

    return { correct, incorrect, unanswered, timeUsed };
  };

  const { correct, incorrect, unanswered, timeUsed } = getExamStats();

  return (
    <div className='container-exams'>
      <div className="results">
        <h1>{getExamTitle()}</h1>
        <p>Estimado usuario, su examen virtual ha finalizado.</p>
        <p>Usted ha obtenido:</p>
        <p className='puntaje'>{calculateScore()} PUNTO(S)</p>
        <p>Conforme al detalle siguiente:</p>
        
        <div className="result-details">
          <p>Correctas: <strong>{correct}</strong></p>
          <p>Incorrectas: <strong>{incorrect}</strong></p>
          {unanswered > 0 && (
            <p>Sin Contestar: <strong>{unanswered}</strong></p>
          )}
          <p>Total de preguntas: <strong>{state.total}</strong></p>
          <p>Tiempo utilizado: <strong>{formatTime(timeUsed)}</strong></p>
        </div>

        <div className="result_botones">
          <button 
            onClick={() => navigate('/corregir-errores', { state })}
            className="btn-corregir"
          >
            Corregir Errores
          </button>
          <button 
            onClick={() => navigate(getOriginPath())}
            className="btn-volver"
          >
            Volver al Menú
          </button>
        </div>

        <div className='respuestas_desarrolladas'>
          <h2>Examen Desarrollado</h2>
          {state.questions.map((question, index) => {
            const answer = state.answers[index];
            const questionNumber = index + 1;
            const isCorrect = answer?.isCorrect;
            const hasAnswer = answer !== undefined && answer !== null;
            
            return (
              <div key={index} className={`pregunta_completa_resultado ${hasAnswer ? (isCorrect ? 'correct-question' : 'incorrect-question') : ''}`}>
                <div className="pregunta">
                  <span>{questionNumber}. </span>
                  <label>{question.question_text}</label>
                </div>
                <div className="todas_alternativas">
                  {question.options.map((option, i) => {
                    const isOptionCorrect = option === question.correct_option;
                    const isSelected = answer?.selected === i;
                    let className = 'alternativas';
                    
                    // Establecer clases según las respuestas
                    if (isOptionCorrect) {
                      className += ' correct-answer';
                    }
                    if (isSelected) {
                      className += isCorrect ? ' user-correct' : ' user-incorrect';
                    }

                    return (
                      <div key={i} className={className}>
                        <div className="option-marker">
                          <span>{String.fromCharCode(65 + i)}.</span>
                        </div>
                        <label>{option}</label>
                        {isOptionCorrect && isSelected && (
                          <div className="feedback-icon correct">✓</div>
                        )}
                        {!isOptionCorrect && isSelected && (
                          <div className="feedback-icon incorrect">✗</div>
                        )}
                      </div>
                    );
                  })}
                  {question.tips && (
                    <div className="tips-section">
                      <strong>Sugerencia:</strong> {question.tips}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;