import express from 'express';
import { 
  getQuestionsByTopic,
  getQuestionById,
  getRandomQuestions,
  getTopics,
  getTopicById,
  getQuestionCountByTopic // Agregamos el nuevo controlador
} from '../controllers/questionController.js';

const router = express.Router();

router.get('/topics', getTopics);
router.get('/topics/:topicId', getTopicById);
router.get('/questions/topic/:topicId', getQuestionsByTopic);
router.get('/questions/count', getQuestionCountByTopic); // Nueva ruta para contar preguntas
router.get('/questions/:id', getQuestionById);
router.get('/questions/random/:topicId/:count', getRandomQuestions);

export default router;