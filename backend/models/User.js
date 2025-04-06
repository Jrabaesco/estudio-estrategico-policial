import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  mail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Método para generar el siguiente _id autoincremental
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    const lastUser = await this.constructor.findOne({}, {}, { sort: { '_id': -1 } });
    if (lastUser) {
      const lastId = parseInt(lastUser._id.split('_')[1]);
      this._id = `usuario_${(lastId + 1).toString().padStart(4, '0')}`;
    } else {
      this._id = 'usuario_0001';
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;