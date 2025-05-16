import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileExtension: {
    type: String,
    required: true
  },
  filePath: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  listType: {
    type: String,
    enum: ['None', 'Block'],
    default: 'None'
  },
  label: {
    type: String,
    enum: ['None', 'adult'],
    default: 'None'
  },
  liked: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  uploadTime: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const File = mongoose.model('File', fileSchema);

export default File;
