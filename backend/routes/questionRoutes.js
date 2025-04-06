import express from 'express';
import { 
  getQuestionsByTopic, 
  getQuestionById, 
  getRandomQuestions,
  getTopics
} from '../controllers/questionController.js';

const router = express.Router();

router.get('/topics', getTopics);
router.get('/questions/topic/:topicId', getQuestionsByTopic);
router.get('/questions/:id', getQuestionById);
router.get('/questions/random/:topicId/:count', getRandomQuestions);

export default router;