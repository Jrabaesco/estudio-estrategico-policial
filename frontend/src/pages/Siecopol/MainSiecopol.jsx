import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import './MainSiecopol.css';

const MainSiecopol = () => {
  const [user] = useState(getCurrentUser());
  const navigate = useNavigate();

  const handleStartExam = () => {
    navigate('/siecopol/examen');
  };

  if (!user) return null;

  return (
    <div className="container-exams">
      <div className="title_exam">
        <h1>POLICÍA NACIONAL DEL PERÚ</h1>
        <h2>Sistema de Evaluación del Conocimiento Policial - TIPO SIECOPOL</h2>
        <h3>Módulo de Examen Virtual</h3>
        <p>SIMULADOR DEL PROCESO DE ASCENSO DE SUBOFICIALES DE ARMAS 2025 - PROMOCIÓN 2026</p>
      </div>

      <div className="name_usuario">
        <p>Usuario: {user.username}</p>
      </div>

      <div className="instrucciones">
        <div className="instrucciones-contenido">
          <h4>Estimado(a) Usuario(a)</h4>
          <p>Usted se encuentra en el Módulo de Examen Virtual del Sistema de Evaluaciones de Conocimiento Policial (TIPO SIECOPOL), el cual ha sido desarrollado con la finalidad de generar un único examen a cada postulante a partir del Banco de Preguntas válidas seleccionadas para el presente proceso de evaluación, considerando su grado y especialidad.</p>
          
          <div className='advertencia'>
            <h4>Advertencia</h4>
            <ul>
              <li>Todas las acciones que realice en este equipo de cómputo durante el examen están siendo grabadas.</li>
              <li>Ante cualquier manipulación del teclado fuera de lo establecido, el sistema automáticamente dará por finalizado su examen.</li>
            </ul>
          </div>

          <h4>Instrucciones:</h4>
          <ul>
            <li>Para ver la pregunta debe seleccionarla haciendo click en el número del tablero ubicado a la izquierda de la pantalla</li>
            <li>Conteste la pregunta haciendo click en la letra o el texto de la alternativa que considere correcta.</li>
            <li>Puede regresar a una pregunta ya contestada, cambiar la alternativa seleccionada o borrar la respuesta para ser contestada posteriormente.</li>
            <li>Si desea puede finalizar el examen antes de cumplirse el tiempo de duración establecido.</li>
            <li>No olvide acercarse al Administrador del Examen Virtual para firmar y recibir el acta de finalización correspondiente</li>
          </ul>

          <p>Atentamente,</p>
          <p>Dirección de Recursos Humanos de la Policía Nacional del Perú</p>
        </div>

        <div className='button_instrucciones'>
          <button className="start-exam-button" onClick={handleStartExam}>
            Generar Examen Virtual
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainSiecopol;