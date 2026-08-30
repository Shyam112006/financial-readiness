# PulseIndex - Full-Stack Survey & Index Calculation Platform

A production-ready full-stack web application for conducting assessments, storing immutable historical question/response snapshots in MongoDB, calculating a custom index server-side based on option score weights, dispatching transactional result emails via **Mailchimp** or **SMTP**, and managing responses with an executive SaaS admin dashboard.

---

## Key Features

- **Respondent Experience**:
  - High-converting Landing Page with survey overview, completion time estimate, and start CTA.
  - Step 1: Respondent details collection (Full Name, Email with RFC 5322 validation).
  - Step 2: 25-Question Interactive Runner with progress bar, question pill strip, keyboard navigation (`1-5`, `A-E`, `Arrow keys`), clear selection option, and `localStorage` draft auto-save to prevent accidental loss of answers.
  - Step 3: Review summary modal before submission.
  - Step 4: Instant Result page displaying personalized index badge, raw score, interpretation level, and email dispatch confirmation.

- **Data Integrity & Immutability**:
  - **Server-Side Scoring**: Frontend sends only option IDs. Scores are retrieved securely from MongoDB and calculated on the server.
  - **Audit Snapshot**: Every response saves a snapshot of the exact question prompt, selected option text, and assigned score at submission time. Historical scores never mutate if questions or scores are edited later.

- **Modular Scoring Engine (`src/lib/scoring.ts`)**:
  - Built with a pluggable `ScoreCalculator` strategy pattern.
  - Default: $Index = \sum (\text{Option Scores})$.
  - Extensible for normalized scales ($0-100\%$), weighted question multipliers, or category sub-indices.

- **Resilient Email Dispatch (`src/lib/email.ts`)**:
  - Primary: **Brevo Transactional (REST API v3)** via `BREVO_API_KEY`.
  - Secondary: **Brevo SMTP Relay** (`smtp-relay.brevo.com`) or standard SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`).
  - Mobile-friendly HTML certificate email template with section-by-section breakdown.
  - Fail-safe: If SMTP fails or is unconfigured in development, the response is safely stored in MongoDB with `emailSent = false`, and admins can resend anytime.

- **SaaS Admin Dashboard**:
  - **Executive KPI Cards**: Total Responses, Responses Today, Responses This Week, Average Index, Median Score, Highest/Lowest Index, Email Delivery Rate.
  - **Analytics & Charts**: 14-day submission activity trend (Area Chart), Global Index Histogram (Bar Chart).
  - **Question-Wise Deep Dive**: Select any question (Q1 to Q25) to view option response counts, percentage breakdowns (e.g. `A: 35 (33%)`), and Pie Charts.
  - **Response Management**: Search by name/email, filter by date range, score range, or email delivery status; sorting; pagination; full question-by-question response inspector; resend email; delete response.
  - **Question Catalog Manager**: Add/edit question prompts, add/remove options, modify option scores, reorder questions, and toggle active/inactive states.
  - **CSV Export**: One-click RFC 4180 compliant CSV export containing respondent info, dates, Q1-Q25 selections, scores, total score, index, and email statuses.
  - **Admin Security**: Encrypted HTTP-only JWT cookies, bcrypt password hashing, and protected route handlers.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts
- **Backend**: Next.js Route Handlers, Node.js, TypeScript
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT (`jose`), `bcryptjs`, HTTP-only secure cookies
- **Email**: Mailchimp Transactional API / Mandrill / Nodemailer SMTP

---

## Project Structure

```
feature1/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with fonts & metadata
│   │   ├── globals.css                # Tailwind CSS v4 setup
│   │   ├── page.tsx                   # Professional Landing Page
│   │   ├── survey/
│   │   │   ├── page.tsx               # Survey Flow (Respondent Info -> 25 Questions)
│   │   │   └── result/
│   │   │       └── page.tsx           # Result Page (Index badge, score, email status)
│   │   ├── admin/
│   │   │   ├── layout.tsx             # Admin layout with sidebar & session guard
│   │   │   ├── login/
│   │   │   │   └── page.tsx           # Secure admin login
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # KPI cards, activity charts, recent submissions
│   │   │   ├── responses/
│   │   │   │   ├── page.tsx           # Responses table (search, filter, sort, paginate)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # Detailed response inspector (all 25 answers snapshot)
│   │   │   ├── questions/
│   │   │   │   └── page.tsx           # Question CRUD & score weight editor
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx           # Question-wise breakdown & distribution charts
│   │   │   └── settings/
│   │   │       └── page.tsx           # Email status & scoring engine documentation
│   │   └── api/
│   │       ├── survey/
│   │       │   └── submit/route.ts    # POST: Validate, fetch DB scores, calculate, save, email
│   │       ├── questions/route.ts     # GET: Public active questions for respondents
│   │       └── admin/
│   │           ├── login/route.ts     # POST: Verify credentials & set HTTP-only cookie
│   │           ├── logout/route.ts    # POST: Clear cookie
│   │           ├── me/route.ts        # GET: Current admin session
│   │           ├── responses/         # GET list, GET [id], DELETE [id], POST resend-email
│   │           ├── questions/         # GET list, POST create, PUT [id], DELETE [id], POST reorder
│   │           ├── analytics/         # GET overall stats, GET question/[id] breakdown
│   │           └── export/route.ts    # GET: Download all responses as CSV
│   ├── components/
│   │   ├── ui/                        # Button, Card, Modal, Badge, etc.
│   │   ├── survey/                    # RespondentForm, SurveyRunner, QuestionCard
│   │   └── admin/                     # AdminSidebar, AdminNavbar, StatCard, QuestionModal
│   ├── lib/
│   │   ├── mongodb.ts                 # Cached Mongoose connection pool
│   │   ├── auth.ts                    # JWT token signing & verification helpers
│   │   ├── scoring.ts                 # Pluggable scoring engine & strategies
│   │   ├── email.ts                   # Mailchimp API & SMTP dispatch service
│   │   ├── validation.ts              # Input validation and sanitization
│   │   └── types.ts                   # Shared TypeScript interfaces
│   └── models/
│       ├── Question.ts                # Mongoose Question model
│       ├── SurveyResponse.ts          # Mongoose SurveyResponse model with snapshots
│       └── Admin.ts                   # Mongoose Admin model
├── scripts/
│   └── seed.ts                        # Seed script: 25 questions + admin user + sample data
├── .env.local.example                 # Example environment variables
├── package.json
└── tsconfig.json
```

---

## Setup & Installation

### 1. Prerequisites
- Node.js 18+ or 20+
- MongoDB instance (local or MongoDB Atlas connection URI)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/survey_platform

# JWT Secret for Admin Auth (min 32 characters)
JWT_SECRET=super_secret_jwt_key_survey_index_platform_2026_min32chars

# Default Admin Credentials
ADMIN_NAME="System Administrator"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123456

# App Settings
APP_NAME="PulseIndex Survey Platform"
APP_URL=http://localhost:3000

# Brevo (formerly Sendinblue) Transactional API (Option 1: API Key)
BREVO_API_KEY=xkeysib-your_brevo_api_key_here

# Brevo SMTP Relay or Standard SMTP (Option 2)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_email
SMTP_PASSWORD=your_brevo_smtp_key
SMTP_SECURE=false
SMTP_FROM="PulseIndex Assessment <results@yourdomain.com>"
```

---

## Seeding the Database

Run the database seed script to insert **25 calibrated survey questions**, create the default **admin account**, and generate initial response records:

```bash
npm run seed
```

Default Admin Credentials:
- **Email**: `admin@example.com`
- **Password**: `admin123456`

---

## Running the Application

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Respondent Survey**: [http://localhost:3000/survey](http://localhost:3000/survey)
- **Admin Dashboard**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### Building for Production
```bash
npm run build
npm run start
```

---

## How to Customize Later

### 1. Modifying Questions & Option Scores
- **Via Admin UI**: Navigate to `/admin/questions` to add, edit prompts, change scores, add/remove options, and toggle questions on/off in real-time.
- **Via Seed Script**: Update `sampleQuestions` in `scripts/seed.ts` and run `npm run seed`.

### 2. Modifying the Scoring Formula
All scoring formulas are located in [`src/lib/scoring.ts`](src/lib/scoring.ts).
To change the calculation algorithm:
1. Implement the `ScoreCalculator` interface:
```typescript
export class CustomWeightedCalculator implements ScoreCalculator {
  name = 'CustomWeightedCalculator';

  calculate(answers: AnswerForScoring[]): ScoreCalculationResult {
    let totalScore = 0;

    for (const ans of answers) {
      // Example: Question 1 has 2x multiplier, Question 2 has 3x multiplier
      const multiplier = ans.questionNumber === 1 ? 2 : ans.questionNumber === 2 ? 3 : 1;
      totalScore += ans.score * multiplier;
    }

    return {
      totalScore,
      indexValue: totalScore,
    };
  }
}
```
2. Set `defaultCalculator = new CustomWeightedCalculator();` in `src/lib/scoring.ts`.

---

## Security Highlights

1. **Server-Side Scoring Guard**: The backend never accepts raw score values from the browser. It cross-references option IDs against the database.
2. **Encrypted Authentication**: Admin sessions use HTTP-only, SameSite, Secure JWT cookies with bcrypt-hashed passwords.
3. **Data Immutability**: Survey submissions store full snapshots of questions, selected option texts, and scores. Modifying questions later will never corrupt historical respondent records.
# financial-readiness
