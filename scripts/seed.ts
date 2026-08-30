import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Auto-load .env.local
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
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// Schema definitions
const OptionSchema = new mongoose.Schema(
  {
    optionId: { type: String, required: true },
    optionText: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    questionNumber: { type: Number, required: true, unique: true, index: true },
    questionText: { type: String, required: true },
    category: { type: String, default: 'General' },
    section: { type: String, default: 'Section A' },
    options: [OptionSchema],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AnswerSnapshotSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    questionNumber: { type: Number, required: true },
    questionText: { type: String, required: true },
    selectedOptionId: { type: String, required: true },
    selectedOptionText: { type: String, required: true },
    score: { type: Number, required: true },
    category: { type: String },
  },
  { _id: false }
);

const SurveyResponseSchema = new mongoose.Schema(
  {
    respondent: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      age: { type: Number, required: true },
    },
    answers: [AnswerSnapshotSchema],
    totalScore: { type: Number, required: true },
    indexValue: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },
    emailError: { type: String },
  },
  { timestamps: true }
);

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'admin' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
const SurveyResponse = mongoose.models.SurveyResponse || mongoose.model('SurveyResponse', SurveyResponseSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

// 25 Financial Wellness Assessment Questions organized into 5 Sections
export const surveyQuestionsData = [
  // ==========================================
  // Section A — Money Management (Q1 - Q5)
  // ==========================================
  {
    questionNumber: 1,
    questionText: 'You receive your salary. Which statement best describes your usual approach?',
    category: 'Section A — Money Management',
    section: 'Section A — Money Management',
    options: [
      { optionId: 'q1_a', optionText: 'I spend first and save whatever remains', score: 0 },
      { optionId: 'q1_b', optionText: "I save a little but don't have a fixed approach", score: 1 },
      { optionId: 'q1_c', optionText: 'I have a fixed savings/investment amount', score: 2 },
      { optionId: 'q1_d', optionText: 'I allocate money towards specific goals before discretionary spending', score: 4 },
    ],
  },
  {
    questionNumber: 2,
    questionText: 'Your income increases by 20%. What would you ideally do?',
    category: 'Section A — Money Management',
    section: 'Section A — Money Management',
    options: [
      { optionId: 'q2_a', optionText: 'Increase lifestyle immediately', score: 0 },
      { optionId: 'q2_b', optionText: 'Increase savings slightly', score: 1 },
      { optionId: 'q2_c', optionText: 'Increase investments substantially', score: 2 },
      { optionId: 'q2_d', optionText: 'Review goals first and allocate the additional income intentionally', score: 4 },
    ],
  },
  {
    questionNumber: 3,
    questionText: "You don't know exactly where your money goes every month. What is the biggest issue?",
    category: 'Section A — Money Management',
    section: 'Section A — Money Management',
    options: [
      { optionId: 'q3_a', optionText: 'I may be spending too much', score: 2 },
      { optionId: 'q3_b', optionText: 'I may not be saving enough', score: 1 },
      { optionId: 'q3_c', optionText: 'I cannot accurately plan future goals', score: 0 },
      { optionId: 'q3_d', optionText: 'All of the above', score: 4 },
    ],
  },
  {
    questionNumber: 4,
    questionText: 'Which is generally the better approach to a financial goal?',
    category: 'Section A — Money Management',
    section: 'Section A — Money Management',
    options: [
      { optionId: 'q4_a', optionText: 'Save whatever is left', score: 1 },
      { optionId: 'q4_b', optionText: 'Invest first without knowing the required amount', score: 0 },
      { optionId: 'q4_c', optionText: 'Estimate the goal, timeline and required contribution', score: 4 },
      { optionId: 'q4_d', optionText: 'Worry about it when the goal gets closer', score: 2 },
    ],
  },
  {
    questionNumber: 5,
    questionText: 'Your credit-card bill is ₹50,000 and you can only pay the minimum amount. What should concern you most?',
    category: 'Section A — Money Management',
    section: 'Section A — Money Management',
    options: [
      { optionId: 'q5_a', optionText: 'Nothing if the card is active', score: 0 },
      { optionId: 'q5_b', optionText: 'The interest cost and possibility of debt accumulation', score: 4 },
      { optionId: 'q5_c', optionText: 'Whether your credit limit increases', score: 2 },
      { optionId: 'q5_d', optionText: 'Whether you can get another card', score: 1 },
    ],
  },

  // ==========================================
  // Section B — Emergency Preparedness (Q6 - Q9)
  // ==========================================
  {
    questionNumber: 6,
    questionText: 'An emergency fund primarily exists to:',
    category: 'Section B — Emergency Preparedness',
    section: 'Section B — Emergency Preparedness',
    options: [
      { optionId: 'q6_a', optionText: 'Generate high returns', score: 1 },
      { optionId: 'q6_b', optionText: 'Fund vacations', score: 0 },
      { optionId: 'q6_c', optionText: 'Handle unexpected financial needs without disrupting long-term investments', score: 4 },
      { optionId: 'q6_d', optionText: 'Beat inflation', score: 2 },
    ],
  },
  {
    questionNumber: 7,
    questionText: 'Which expense would most likely qualify as an emergency?',
    category: 'Section B — Emergency Preparedness',
    section: 'Section B — Emergency Preparedness',
    options: [
      { optionId: 'q7_a', optionText: 'New smartphone', score: 0 },
      { optionId: 'q7_b', optionText: 'Weekend trip', score: 1 },
      { optionId: 'q7_c', optionText: 'Sudden medical expense or temporary loss of income', score: 4 },
      { optionId: 'q7_d', optionText: 'Festival shopping', score: 0 },
    ],
  },
  {
    questionNumber: 8,
    questionText: 'If your income stopped tomorrow, which question would be most important?',
    category: 'Section B — Emergency Preparedness',
    section: 'Section B — Emergency Preparedness',
    options: [
      { optionId: 'q8_a', optionText: 'Which stocks should I buy?', score: 0 },
      { optionId: 'q8_b', optionText: 'How long can my current savings support essential expenses?', score: 4 },
      { optionId: 'q8_c', optionText: 'Which credit card gives the best rewards?', score: 2 },
      { optionId: 'q8_d', optionText: 'Can I upgrade my car?', score: 1 },
    ],
  },
  {
    questionNumber: 9,
    questionText: 'Where should emergency money generally prioritise?',
    category: 'Section B — Emergency Preparedness',
    section: 'Section B — Emergency Preparedness',
    options: [
      { optionId: 'q9_a', optionText: 'High liquidity and reasonable safety', score: 4 },
      { optionId: 'q9_b', optionText: 'Maximum possible return', score: 2 },
      { optionId: 'q9_c', optionText: 'Highly volatile assets', score: 1 },
      { optionId: 'q9_d', optionText: 'Long-lock-in investments', score: 0 },
    ],
  },

  // ==========================================
  // Section C — Investing (Q10 - Q15)
  // ==========================================
  {
    questionNumber: 10,
    questionText: 'If inflation averages 6% and your money earns 4%, what is happening to its purchasing power?',
    category: 'Section C — Investing',
    section: 'Section C — Investing',
    options: [
      { optionId: 'q10_a', optionText: 'Increasing', score: 0 },
      { optionId: 'q10_b', optionText: 'Staying exactly the same', score: 1 },
      { optionId: 'q10_c', optionText: 'Declining in real terms', score: 4 },
      { optionId: 'q10_d', optionText: 'Cannot say', score: 2 },
    ],
  },
  {
    questionNumber: 11,
    questionText: 'The biggest advantage of starting long-term investing early is:',
    category: 'Section C — Investing',
    section: 'Section C — Investing',
    options: [
      { optionId: 'q11_a', optionText: 'Guaranteed returns', score: 1 },
      { optionId: 'q11_b', optionText: 'More time for compounding', score: 4 },
      { optionId: 'q11_c', optionText: 'Avoiding all market volatility', score: 2 },
      { optionId: 'q11_d', optionText: 'Paying no taxes', score: 0 },
    ],
  },
  {
    questionNumber: 12,
    questionText: 'Why is diversification important?',
    category: 'Section C — Investing',
    section: 'Section C — Investing',
    options: [
      { optionId: 'q12_a', optionText: 'It guarantees profits', score: 1 },
      { optionId: 'q12_b', optionText: 'It eliminates all risk', score: 0 },
      { optionId: 'q12_c', optionText: 'It reduces dependence on a single investment or asset', score: 4 },
      { optionId: 'q12_d', optionText: 'It guarantees higher returns', score: 2 },
    ],
  },
  {
    questionNumber: 13,
    questionText: 'A higher expected return generally comes with:',
    category: 'Section C — Investing',
    section: 'Section C — Investing',
    options: [
      { optionId: 'q13_a', optionText: 'No additional risk', score: 0 },
      { optionId: 'q13_b', optionText: 'Some form of additional uncertainty/risk', score: 4 },
      { optionId: 'q13_c', optionText: 'Guaranteed loss', score: 2 },
      { optionId: 'q13_d', optionText: 'Guaranteed profit', score: 1 },
    ],
  },
  {
    questionNumber: 14,
    questionText: 'A 25-year-old says: “I don\'t need to invest for retirement because retirement is 30+ years away.” What is the strongest counterpoint?',
    category: 'Section C — Investing',
    section: 'Section C — Investing',
    options: [
      { optionId: 'q14_a', optionText: 'Retirement is always urgent', score: 2 },
      { optionId: 'q14_b', optionText: 'Starting early can give compounding more time to work', score: 4 },
      { optionId: 'q14_c', optionText: 'Young people should never spend money', score: 1 },
      { optionId: 'q14_d', optionText: 'Retirement investments always give high returns', score: 0 },
    ],
  },
  {
    questionNumber: 15,
    questionText: 'A market falls 15%. What should a long-term investor understand first?',
    category: 'Section C — Investing',
    section: 'Section C — Investing',
    options: [
      { optionId: 'q15_a', optionText: 'Every investment must be sold immediately', score: 0 },
      { optionId: 'q15_b', optionText: 'Market volatility is a normal part of many long-term investments', score: 4 },
      { optionId: 'q15_c', optionText: 'The market can never recover', score: 1 },
      { optionId: 'q15_d', optionText: 'Falling markets always mean recession', score: 2 },
    ],
  },

  // ==========================================
  // Section D — Risk Protection (Q16 - Q19)
  // ==========================================
  {
    questionNumber: 16,
    questionText: 'What is the primary purpose of health insurance?',
    category: 'Section D — Risk Protection',
    section: 'Section D — Risk Protection',
    options: [
      { optionId: 'q16_a', optionText: 'Investment returns', score: 1 },
      { optionId: 'q16_b', optionText: 'Protecting against potentially large medical expenses', score: 4 },
      { optionId: 'q16_c', optionText: 'Creating retirement income', score: 2 },
      { optionId: 'q16_d', optionText: 'Saving tax only', score: 0 },
    ],
  },
  {
    questionNumber: 17,
    questionText: 'For someone whose family depends substantially on their income, life insurance primarily protects against:',
    category: 'Section D — Risk Protection',
    section: 'Section D — Risk Protection',
    options: [
      { optionId: 'q17_a', optionText: 'Inflation', score: 1 },
      { optionId: 'q17_b', optionText: 'Market volatility', score: 0 },
      { optionId: 'q17_c', optionText: 'Loss of income due to premature death', score: 4 },
      { optionId: 'q17_d', optionText: 'Lifestyle inflation', score: 2 },
    ],
  },
  {
    questionNumber: 18,
    questionText: 'Which statement is generally more appropriate?',
    category: 'Section D — Risk Protection',
    section: 'Section D — Risk Protection',
    options: [
      { optionId: 'q18_a', optionText: 'Insurance and investments serve exactly the same purpose', score: 0 },
      { optionId: 'q18_b', optionText: 'Insurance primarily manages risk; investments primarily build wealth', score: 4 },
      { optionId: 'q18_c', optionText: 'Insurance always gives higher returns', score: 2 },
      { optionId: 'q18_d', optionText: 'Investments eliminate the need for insurance', score: 1 },
    ],
  },
  {
    questionNumber: 19,
    questionText: 'You earn ₹15 lakh annually and have substantial financial dependants. What deserves attention?',
    category: 'Section D — Risk Protection',
    section: 'Section D — Risk Protection',
    options: [
      { optionId: 'q19_a', optionText: 'Only your investment return', score: 2 },
      { optionId: 'q19_b', optionText: 'Only tax saving', score: 1 },
      { optionId: 'q19_c', optionText: 'Whether your family could maintain its financial goals if your income stopped', score: 4 },
      { optionId: 'q19_d', optionText: 'Only your savings account balance', score: 0 },
    ],
  },

  // ==========================================
  // Section E — Long-Term Financial Planning (Q20 - Q25)
  // ==========================================
  {
    questionNumber: 20,
    questionText: 'Which is the strongest financial goal?',
    category: 'Section E — Long-Term Financial Planning',
    section: 'Section E — Long-Term Financial Planning',
    options: [
      { optionId: 'q20_a', optionText: '“I want to become rich.”', score: 1 },
      { optionId: 'q20_b', optionText: '“I want to invest more.”', score: 2 },
      { optionId: 'q20_c', optionText: '“I want ₹30 lakh for a house down payment in 5 years.”', score: 4 },
      { optionId: 'q20_d', optionText: '“I want good returns.”', score: 0 },
    ],
  },
  {
    questionNumber: 21,
    questionText: 'When planning for a long-term goal, which three factors matter particularly?',
    category: 'Section E — Long-Term Financial Planning',
    section: 'Section E — Long-Term Financial Planning',
    options: [
      { optionId: 'q21_a', optionText: 'Goal amount, time horizon and expected return/assumptions', score: 4 },
      { optionId: 'q21_b', optionText: 'Salary, credit card and car', score: 2 },
      { optionId: 'q21_c', optionText: 'Bank balance, phone and lifestyle', score: 1 },
      { optionId: 'q21_d', optionText: 'Only expected return', score: 0 },
    ],
  },
  {
    questionNumber: 22,
    questionText: 'Why should retirement planning ideally begin well before retirement?',
    category: 'Section E — Long-Term Financial Planning',
    section: 'Section E — Long-Term Financial Planning',
    options: [
      { optionId: 'q22_a', optionText: 'To maximise available time for saving and compounding', score: 4 },
      { optionId: 'q22_b', optionText: 'Because retirement products are compulsory', score: 1 },
      { optionId: 'q22_c', optionText: 'Because markets only work for older people', score: 0 },
      { optionId: 'q22_d', optionText: 'Because taxes disappear after retirement', score: 2 },
    ],
  },
  {
    questionNumber: 23,
    questionText: 'What should ideally happen when your salary increases?',
    category: 'Section E — Long-Term Financial Planning',
    section: 'Section E — Long-Term Financial Planning',
    options: [
      { optionId: 'q23_a', optionText: 'Lifestyle should automatically increase by the same amount', score: 0 },
      { optionId: 'q23_b', optionText: 'Financial goals should be reviewed and savings/investments adjusted', score: 4 },
      { optionId: 'q23_c', optionText: 'All additional income should be spent', score: 1 },
      { optionId: 'q23_d', optionText: 'Nothing should change', score: 2 },
    ],
  },
  {
    questionNumber: 24,
    questionText: 'Which person is potentially financially better prepared?',
    category: 'Section E — Long-Term Financial Planning',
    section: 'Section E — Long-Term Financial Planning',
    options: [
      { optionId: 'q24_a', optionText: 'High salary but no emergency savings, insurance or goals', score: 1 },
      { optionId: 'q24_b', optionText: 'Moderate salary with clear goals, adequate protection, emergency preparedness and disciplined investing', score: 4 },
      { optionId: 'q24_c', optionText: 'High salary and expensive lifestyle', score: 2 },
      { optionId: 'q24_d', optionText: 'Someone with the highest stock returns last year', score: 0 },
    ],
  },
  {
    questionNumber: 25,
    questionText: 'Which statement best describes financial wellbeing?',
    category: 'Section E — Long-Term Financial Planning',
    section: 'Section E — Long-Term Financial Planning',
    options: [
      { optionId: 'q25_a', optionText: 'Having a high salary', score: 1 },
      { optionId: 'q25_b', optionText: 'Having a large bank balance', score: 2 },
      { optionId: 'q25_c', optionText: "Being able to manage today's needs while preparing for future goals and unexpected events", score: 4 },
      { optionId: 'q25_d', optionText: 'Owning many investments', score: 0 },
    ],
  },
];

const sampleRespondents = [
  { name: 'Arjun Sharma', email: 'arjun.sharma@example.com', age: 29 },
  { name: 'Priya Nair', email: 'priya.nair@example.com', age: 34 },
  { name: 'Rohan Mehta', email: 'rohan.mehta@example.com', age: 26 },
  { name: 'Ananya Iyer', email: 'ananya.iyer@example.com', age: 41 },
  { name: 'Vikram Patel', email: 'vikram.patel@example.com', age: 38 },
  { name: 'Sneha Kulkarni', email: 'sneha.k@example.com', age: 24 },
  { name: 'Aditya Verma', email: 'aditya.verma@example.com', age: 31 },
  { name: 'Neha Gupta', email: 'neha.gupta@example.com', age: 45 },
];

async function seed() {
  let uri = (process.env.MONGODB_URI || 'mongodb://localhost:27017/survey_platform').trim();
  if (uri.endsWith('/')) {
    uri = `${uri}survey_platform?retryWrites=true&w=majority`;
  }
  console.log(`Connecting to MongoDB...`);

  await mongoose.connect(uri);
  console.log('MongoDB Connected successfully.');

  // 1. Seed Questions
  console.log('Seeding 25 Survey Questions across 5 Sections...');
  await Question.deleteMany({});

  for (const q of surveyQuestionsData) {
    await Question.create({
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      category: q.category,
      section: q.section,
      options: q.options,
      isActive: true,
      order: q.questionNumber,
    });
  }
  console.log(`Successfully seeded ${surveyQuestionsData.length} questions across 5 sections.`);

  // 2. Seed Default Admin
  console.log('Seeding Admin account...');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  await Admin.deleteMany({ email: adminEmail });
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  await Admin.create({
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: 'admin',
    lastLoginAt: new Date(),
  });
  console.log(`Admin account created -> Email: ${adminEmail} | Password: ${adminPassword}`);

  // 3. Seed Sample Responses
  console.log('Seeding sample survey responses...');
  await SurveyResponse.deleteMany({});

  const seededQuestions = await Question.find().sort({ questionNumber: 1 });

  for (let i = 0; i < sampleRespondents.length; i++) {
    const resp = sampleRespondents[i];
    const answers = [];
    let totalScore = 0;

    for (const q of seededQuestions) {
      // Pick predominantly high/medium scoring options for realistic data
      const randomOptIdx = Math.floor(Math.random() * q.options.length);
      const chosenOpt = q.options[randomOptIdx] || q.options[0];

      answers.push({
        questionId: q._id.toString(),
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        selectedOptionId: chosenOpt.optionId,
        selectedOptionText: chosenOpt.optionText,
        score: chosenOpt.score,
        category: q.category,
      });

      totalScore += chosenOpt.score;
    }

    const indexValue = totalScore;
    const submittedDate = new Date();
    submittedDate.setDate(submittedDate.getDate() - (sampleRespondents.length - i));

    await SurveyResponse.create({
      respondent: {
        name: resp.name,
        email: resp.email,
        age: resp.age,
      },
      answers,
      totalScore,
      indexValue,
      submittedAt: submittedDate,
      emailSent: i % 2 === 0,
      emailSentAt: i % 2 === 0 ? submittedDate : undefined,
    });
  }

  console.log(`Seeded ${sampleRespondents.length} survey responses.`);
  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
