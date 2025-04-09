import { useLocation, useNavigate } from 'react-router-dom';
import './ResultPage.css';

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate('/');
    return null;
  }

  const formatTime = (seconds) => {
    if (!seconds) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    const percentage = (state.correct / state.total) * 100;
    return Math.round(percentage);
  };

  const getOriginPath = () => {
    if (state.examType === 'balotario') return '/balotario';
    if (state.examType === 'examen-temas') return '/examen-temas';
    if (state.examType === 'siecopol') return '/siecopol';
    return '/dashboard';
  };

  const getExamTitle = () => {
    switch(state.examType) {
      case 'siecopol':
        return 'Examen SIECOPOL Finalizado';
      case 'examen-temas':
        return 'Examen por Tema Finalizado';
      case 'balotario':
        return 'Balotario Finalizado';
      default:
        return 'Examen Virtual Finalizado';
    }
  };

  return (
    <div className="results">
      <h1>{getExamTitle()}</h1>
      <p>Estimado usuario, su examen virtual ha finalizado.</p>
      <p>Usted ha obtenido:</p>
      <p className='puntaje'>{calculateScore()} PUNTO(S)</p>
      <p>Conforme al detalle siguiente:</p>
      
      <div className="result-details">
        <p>Preguntas correctas: <strong>{state.correct}</strong></p>
        <p>Preguntas incorrectas: <strong>{state.incorrect}</strong></p>
        {state.unanswered > 0 && (
          <p>Preguntas sin contestar: <strong>{state.unanswered}</strong></p>
        )}
        <p>Total de preguntas: <strong>{state.total}</strong></p>
        <p>Tiempo utilizado: <strong>{formatTime(state.timeUsed)}</strong></p>
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
          
          return (
            <div key={index} className="pregunta_completa">
              <div className="pregunta">
                <span>{questionNumber}. </span>
                <label>{question.question_text}</label>
              </div>
              <div className="todas_alternativas">
                {question.options.map((option, i) => {
                  const isCorrect = option === question.correct_option;
                  const isSelected = answer?.selected === i;
                  let className = 'alternativas';
                  
                  // Establecer clases según las respuestas
                  if (isCorrect) {
                    className += ' correct-answer';
                  }
                  if (isSelected) {
                    className += answer?.isCorrect ? ' user-correct' : ' user-incorrect';
                  }

                  return (
                    <div key={i} className={className}>
                      <div className="option-marker">
                        <span>{String.fromCharCode(65 + i)}.</span>
                      </div>
                      <label>{option}</label>
                      {isCorrect && isSelected && (
                        <div className="feedback-icon correct">✓</div>
                      )}
                      {!isCorrect && isSelected && (
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
  );
};

export default ResultPage;