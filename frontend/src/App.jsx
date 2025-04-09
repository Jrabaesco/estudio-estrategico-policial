import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import MainBallot from './pages/Balotario/MainBallot';
import QuestionPage from './pages/Balotario/TopicDetail';
import MainExamTemas from './pages/ExamenTemas/MainExamTemas';
import ExamPage from './pages/ExamenTemas/ExamPage';
import MainSiecopol from './pages/Siecopol/MainSiecopol';
import SiecopolExam from './pages/Siecopol/SiecopolExam';
import MainAudio from './pages/Audio/MainAudio';
import AudioPage from './pages/Audio/AudioPage';
import ResultPage from './pages/Result/ResultPage';
import CorrectErrors from './pages/Result/CorrectErrors';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/balotario" element={<MainBallot />} />
          <Route path="/balotario/:topicId" element={<QuestionPage />} />
          <Route path="/examen-temas" element={<MainExamTemas />} />
          <Route path="/examen-temas/:topicId" element={<ExamPage />} />
          <Route path="/siecopol" element={<MainSiecopol />} />
          <Route path="/siecopol/examen" element={<SiecopolExam />} />
          <Route path="/audio" element={<MainAudio />} />
          <Route path="/audio/:topicId" element={<AudioPage />} />
          <Route path="/resultado" element={<ResultPage />} />
          <Route path="/corregir-errores" element={<CorrectErrors />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;