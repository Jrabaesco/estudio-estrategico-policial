import Question from '../models/Question.js';
import Topic from '../models/Topic.js';

// Obtener todas las preguntas de un tema (ordenadas por _id)
export const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const questions = await Question.find({ topic_id: topicId })
      .sort({ _id: 1 }); // Orden ascendente por _id
      
    if (questions.length === 0) {
      return res.status(404).json({ 
        message: 'No se encontraron preguntas para este tema' 
      });
    }
    
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error al obtener preguntas por tema:', error);
    res.status(500).json({ 
      message: 'Error al obtener preguntas',
      error: error.message 
    });
  }
};

// Obtener pregunta por ID
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    
    if (!question) {
      return res.status(404).json({ 
        message: 'Pregunta no encontrada' 
      });
    }
    
    res.status(200).json(question);
  } catch (error) {
    console.error('Error al obtener pregunta por ID:', error);
    res.status(500).json({ 
      message: 'Error al obtener pregunta',
      error: error.message 
    });
  }
};

// Obtener preguntas aleatorias por tema
export const getRandomQuestions = async (req, res) => {
  try {
    const { topicId, count } = req.params;
    const parsedCount = parseInt(count);
    
    if (isNaN(parsedCount) || parsedCount <= 0) {
      return res.status(400).json({ 
        message: 'El conteo de preguntas debe ser un número positivo' 
      });
    }

    const questions = await Question.aggregate([
      { $match: { topic_id: topicId } },
      { $sample: { size: parsedCount } }
    ]);
    
    if (questions.length === 0) {
      return res.status(404).json({ 
        message: 'No se encontraron preguntas para este tema' 
      });
    }
    
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error al obtener preguntas aleatorias:', error);
    res.status(500).json({ 
      message: 'Error al obtener preguntas aleatorias',
      error: error.message 
    });
  }
};

// Obtener todos los temas
export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort({ name: 1 }); // Orden alfabético
    
    if (topics.length === 0) {
      return res.status(404).json({ 
        message: 'No se encontraron temas' 
      });
    }
    
    res.status(200).json(topics);
  } catch (error) {
    console.error('Error al obtener temas:', error);
    res.status(500).json({ 
      message: 'Error al obtener temas',
      error: error.message 
    });
  }
};

// Obtener un tema específico por ID
export const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);
    
    if (!topic) {
      return res.status(404).json({ 
        message: 'Tema no encontrado' 
      });
    }
    
    res.status(200).json(topic);
  } catch (error) {
    console.error('Error al obtener tema por ID:', error);
    res.status(500).json({ 
      message: 'Error al obtener tema',
      error: error.message 
    });
  }
};

// Contar preguntas por tema (NUEVO MÉTODO)
export const getQuestionCountByTopic = async (req, res) => {
  try {
    const { topicId } = req.query;
    
    if (!topicId) {
      return res.status(400).json({ 
        message: 'Se requiere el ID del tema' 
      });
    }

    const count = await Question.countDocuments({ topic_id: topicId });
    
    res.status(200).json({ 
      count,
      topicId 
    });
  } catch (error) {
    console.error('Error al contar preguntas:', error);
    res.status(500).json({ 
      message: 'Error al contar preguntas',
      error: error.message 
    });
  }
};

// Opcional: Método para verificar existencia de tema y preguntas
export const checkTopicQuestions = async (req, res) => {
  try {
    const { topicId } = req.params;
    
    const [topic, count] = await Promise.all([
      Topic.findById(topicId),
      Question.countDocuments({ topic_id: topicId })
    ]);
    
    if (!topic) {
      return res.status(404).json({ 
        exists: false,
        message: 'Tema no encontrado' 
      });
    }
    
    res.status(200).json({ 
      exists: true,
      hasQuestions: count > 0,
      count,
      topic: {
        _id: topic._id,
        name: topic.name,
        short_name: topic.short_name
      }
    });
  } catch (error) {
    console.error('Error al verificar tema:', error);
    res.status(500).json({ 
      message: 'Error al verificar tema',
      error: error.message 
    });
  }
};