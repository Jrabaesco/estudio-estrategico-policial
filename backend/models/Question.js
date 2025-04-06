import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  topic_id: {
    type: String,
    required: true,
    ref: 'Topic'
  },
  question_text: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correct_option: {
    type: String,
    required: true
  },
  tips: {
    type: String,
    required: true
  }
});

const Question = mongoose.model('Question', questionSchema);

export default Question;