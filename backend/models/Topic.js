import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  short_name: {
    type: String,
    required: true
  }
});

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;