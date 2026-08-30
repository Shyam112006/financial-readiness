import mongoose, { Schema, Document, Model } from 'mongoose';
import { IOption } from '@/lib/types';

export interface IQuestionDocument extends Document {
  questionNumber: number;
  questionText: string;
  category: string;
  section: string;
  options: IOption[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema<IOption>(
  {
    optionId: {
      type: String,
      required: true,
    },
    optionText: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestionDocument>(
  {
    questionNumber: {
      type: Number,
      required: [true, 'Question number is required'],
      unique: true,
      index: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
      index: true,
    },
    section: {
      type: String,
      default: 'Section A — Money Management',
      trim: true,
      index: true,
    },
    options: {
      type: [OptionSchema],
      required: [true, 'Options are required'],
      validate: [
        (opts: IOption[]) => opts && opts.length >= 2,
        'Question must have at least 2 options',
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize query performance with compound index
QuestionSchema.index({ isActive: 1, order: 1, questionNumber: 1 });

export const Question: Model<IQuestionDocument> =
  mongoose.models.Question ||
  mongoose.model<IQuestionDocument>('Question', QuestionSchema);

export default Question;
