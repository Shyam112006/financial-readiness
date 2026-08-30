import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAnswerSnapshot } from '@/lib/types';

export interface ISurveyResponseDocument extends Document {
  respondent: {
    name: string;
    email: string;
    phone?: string;
    age: number;
  };
  answers: IAnswerSnapshot[];
  totalScore: number;
  indexValue: number;
  submittedAt: Date;
  emailSent: boolean;
  emailSentAt?: Date;
  emailError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSnapshotSchema = new Schema<IAnswerSnapshot>(
  {
    questionId: {
      type: String,
      required: true,
    },
    questionNumber: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    selectedOptionId: {
      type: String,
      required: true,
    },
    selectedOptionText: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
    },
  },
  { _id: false }
);

const SurveyResponseSchema = new Schema<ISurveyResponseDocument>(
  {
    respondent: {
      name: {
        type: String,
        required: [true, 'Respondent name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Respondent email is required'],
        trim: true,
        lowercase: true,
        index: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      age: {
        type: Number,
        min: [10, 'Age must be at least 10'],
        max: [120, 'Age must be valid'],
      },
    },
    answers: {
      type: [AnswerSnapshotSchema],
      required: true,
      validate: [
        (ans: IAnswerSnapshot[]) => ans && ans.length > 0,
        'Survey response must have at least one answer',
      ],
    },
    totalScore: {
      type: Number,
      required: true,
    },
    indexValue: {
      type: Number,
      required: true,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailSentAt: {
      type: Date,
    },
    emailError: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful compound indexes for fast sorting and filtering in admin
SurveyResponseSchema.index({ 'respondent.name': 'text', 'respondent.email': 'text' });
SurveyResponseSchema.index({ submittedAt: -1, indexValue: -1 });

export const SurveyResponse: Model<ISurveyResponseDocument> =
  mongoose.models.SurveyResponse ||
  mongoose.model<ISurveyResponseDocument>('SurveyResponse', SurveyResponseSchema);

export default SurveyResponse;
