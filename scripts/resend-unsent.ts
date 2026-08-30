import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { sendSurveyResultEmail } from '../src/lib/email';
import { sanitizeMongoUri } from '../src/lib/mongodb';
import { calculateSurveyIndex } from '../src/lib/scoring';

// Load .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  }
}

// Schemas
const AnswerSnapshotSchema = new mongoose.Schema(
  {
    questionId: String,
    questionNumber: Number,
    questionText: String,
    selectedOptionId: String,
    selectedOptionText: String,
    score: Number,
    category: String,
  },
  { _id: false }
);

const SurveyResponseSchema = new mongoose.Schema(
  {
    respondent: {
      name: String,
      email: String,
    },
    answers: [AnswerSnapshotSchema],
    totalScore: Number,
    indexValue: Number,
    submittedAt: { type: Date, default: Date.now },
    emailSent: { type: Boolean, default: false },
    emailSentAt: Date,
    emailError: String,
  },
  { timestamps: true }
);

const SurveyResponse = mongoose.models.SurveyResponse || mongoose.model('SurveyResponse', SurveyResponseSchema);

async function run() {
  const uri = sanitizeMongoUri(process.env.MONGODB_URI);
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  console.log('\n--- Environment Check ---');
  console.log('BREVO_API_KEY present:', Boolean(process.env.BREVO_API_KEY));
  console.log('BREVO_API_KEY prefix:', process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 10) + '...' : 'none');
  console.log('SMTP_FROM:', process.env.SMTP_FROM);

  const allResponses = await SurveyResponse.find().sort({ submittedAt: -1 });
  console.log(`\nTotal responses in database: ${allResponses.length}`);

  const unsent = allResponses.filter((r) => !r.emailSent);
  console.log(`Unsent responses count: ${unsent.length}`);

  for (const resp of unsent) {
    console.log(`\nAttempting to send email for respondent: ${resp.respondent.name} (${resp.respondent.email}) [Score: ${resp.totalScore}, Index: ${resp.indexValue}]`);

    const scoringItems = (resp.answers || []).map((a: { questionNumber: number; score: number; category?: string; section?: string }) => ({
      questionNumber: a.questionNumber,
      score: a.score,
      category: a.category,
      section: a.section,
    }));
    const calculation = calculateSurveyIndex(scoringItems);

    const result = await sendSurveyResultEmail({
      toEmail: resp.respondent.email,
      toName: resp.respondent.name,
      toAge: resp.respondent.age,
      totalScore: resp.totalScore,
      indexValue: resp.indexValue,
      readinessLevel: calculation.readinessLevel,
      sectionBreakdown: calculation.sectionBreakdown,
      strongestDimension: calculation.strongestDimension,
      opportunityDimension: calculation.opportunityDimension,
      nextActions: calculation.nextActions,
      interpretation: calculation.interpretation,
      answers: resp.answers,
      submittedAt: resp.submittedAt,
      appName: 'Financial Ready™ by Shree Capital',
    });

    if (result.success) {
      resp.emailSent = true;
      resp.emailSentAt = new Date();
      resp.emailError = undefined;
      await resp.save();
      console.log(`  ✓ SUCCESS: Email delivered via ${result.provider} (Message ID: ${result.messageId})`);
    } else {
      resp.emailError = result.error;
      await resp.save();
      console.log(`  ✗ FAILED: ${result.error}`);
    }
  }

  const updatedSent = await SurveyResponse.countDocuments({ emailSent: true });
  const updatedUnsent = await SurveyResponse.countDocuments({ emailSent: false });
  console.log(`\n--- Final Summary ---`);
  console.log(`Delivered emails: ${updatedSent}`);
  console.log(`Failed / Pending emails: ${updatedUnsent}`);

  process.exit(0);
}

run().catch((err) => {
  console.error('Error running script:', err);
  process.exit(1);
});
