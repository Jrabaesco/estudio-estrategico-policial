import Question from '../models/Question.js';
import Topic from '../models/Topic.js';

// Obtener todas las preguntas de un tema
export const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const questions = await Question.find({ topic_id: topicId });
    res.status(200).json(questions);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Obtener pregunta por ID
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    res.status(200).json(question);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Obtener preguntas aleatorias por tema
export const getRandomQuestions = async (req, res) => {
  try {
    const { topicId, count } = req.params;
    const questions = await Question.aggregate([
      { $match: { topic_id: topicId } },
      { $sample: { size: parseInt(count) } }
    ]);
    res.status(200).json(questions);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Obtener todos los temas
export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find();
    res.status(200).json(topics);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};