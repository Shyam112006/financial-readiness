import nodemailer from 'nodemailer';
import { IAnswerSnapshot, SectionScoreBreakdown, FinancialReadinessLevel } from './types';
import { generateAssessmentPdfBuffer } from './pdf';

export interface SendSurveyResultEmailParams {
  toEmail: string;
  toName: string;
  toAge?: number;
  totalScore: number;
  indexValue: number;
  readinessLevel?: FinancialReadinessLevel | string;
  sectionBreakdown?: SectionScoreBreakdown[];
  strongestDimension?: {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    note: string;
  };
  opportunityDimension?: {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    note: string;
  };
  nextActions?: string[];
  interpretation?: {
    level: string;
    description: string;
    motivationalQuote?: string;
  };
  answers?: IAnswerSnapshot[];
  pdfBuffer?: Buffer;
  submittedAt?: Date | string;
  appName?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: 'brevo-api' | 'smtp' | 'none';
  pdfAttached?: boolean;
}

/**
 * Builds the official Shree Capital — Financial Ready™ HTML Email Template
 */
export function generateSurveyResultEmailHtml(params: SendSurveyResultEmailParams): string {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const level = params.readinessLevel || params.interpretation?.level || 'Financial Starter';
  const quote =
    params.interpretation?.motivationalQuote ||
    'The score is not a judgement. It is simply your starting point.';

  const strongestName = params.strongestDimension?.name || 'Money Management';
  const strongestScore = params.strongestDimension?.percentage !== undefined ? params.strongestDimension.percentage : 80;
  const strongestNote =
    params.strongestDimension?.note ||
    'Your habits in this dimension provide a solid, dependable foundation.';

  const opportunityName = params.opportunityDimension?.name || 'Risk Protection';
  const opportunityScore = params.opportunityDimension?.percentage !== undefined ? params.opportunityDimension.percentage : 50;
  const opportunityNote =
    params.opportunityDimension?.note ||
    'Your responses suggest this dimension may deserve deliberate attention to strengthen your overall financial resilience.';

  const actions = params.nextActions && params.nextActions.length > 0
    ? params.nextActions
    : [
        'Automate monthly savings transfers before discretionary spending.',
        'Review your emergency buffer to ensure 3–6 months of essential liquidity.',
        'Align investments with clear, time-horizon goals rather than short-term returns.',
      ];

  const waText = encodeURIComponent(
    `Hey! I just took the Financial Ready™️ Assessment by Shree Capital to benchmark my personal finances across 5 dimensions. Check where you stand here (it's free): ${appUrl}/survey`
  );
  const waUrl = `https://api.whatsapp.com/send?text=${waText}`;

  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${appUrl}/survey`)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Financial Readiness Score is here</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      margin: 0;
      padding: 24px 12px;
      color: #1e293b;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      padding: 36px 32px;
      text-align: center;
      color: #ffffff;
    }
    .header-sub {
      color: #93c5fd;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .content {
      padding: 32px 28px;
    }
    .score-banner {
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      border: 2px solid #86efac;
      border-radius: 14px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .score-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #166534;
    }
    .score-number {
      font-size: 52px;
      font-weight: 900;
      color: #15803d;
      line-height: 1;
      margin: 8px 0;
    }
    .score-tier {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      font-weight: 800;
      font-size: 14px;
      padding: 4px 14px;
      border-radius: 20px;
      border: 1px solid #86efac;
      margin-top: 4px;
    }
    .insight-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .action-pill {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 10px;
      font-size: 13px;
      color: #1e3a8a;
      line-height: 1.5;
    }
    .cta-box {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      padding: 24px;
      text-align: center;
      margin: 28px 0;
    }
    .button-primary {
      display: inline-block;
      background: #1e3a8a;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 8px;
      margin-top: 12px;
    }
    .button-share {
      display: inline-block;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      border-radius: 6px;
      margin: 4px;
    }
    .footer {
      background: #0f172a;
      padding: 28px 24px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-sub">Shree Capital • Wealth Management</div>
      <h1>FINANCIAL READY™️</h1>
      <p style="margin: 6px 0 0 0; color: #cbd5e1; font-size: 13px;">How financially ready are you?</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
        Dear <strong>${escapeHtml(params.toName)}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Thank you for taking the time to complete the <strong>Financial Ready™️ Assessment</strong>. Proactively evaluating your financial foundation is one of the most positive decisions you can make for your future.
      </p>

      <blockquote style="margin: 16px 0; padding: 12px 16px; background: #f8fafc; border-left: 3px solid #64748b; font-style: italic; color: #475569; font-size: 13px;">
        &ldquo;The score is not a judgement. It is a starting point.&rdquo;
      </blockquote>

      <!-- Score Banner -->
      <div class="score-banner">
        <div class="score-label">Your Overall Financial Readiness Score</div>
        <div class="score-number">${params.indexValue} <span style="font-size: 20px; color: #166534; font-weight: 600;">/ 100</span></div>
        <div class="score-tier">${escapeHtml(level)}</div>
        <p style="font-size: 12px; color: #166534; margin: 10px 0 0 0; font-weight: 500;">
          ${escapeHtml(quote)}
        </p>
      </div>

      <!-- Key Insights -->
      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #0f172a; margin-top: 24px; margin-bottom: 12px;">
        Key Observations
      </h3>

      <div class="insight-card" style="border-left: 4px solid #10b981;">
        <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase;">★ Your Current Strength</div>
        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">
          ${escapeHtml(strongestName)} (${strongestScore}/100)
        </div>
        <p style="font-size: 12px; color: #475569; margin: 6px 0 0 0; line-height: 1.4;">
          ${escapeHtml(strongestNote)}
        </p>
      </div>

      <div class="insight-card" style="border-left: 4px solid #f59e0b;">
        <div style="font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase;">✦ Your Biggest Opportunity</div>
        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">
          ${escapeHtml(opportunityName)} (${opportunityScore}/100)
        </div>
        <p style="font-size: 12px; color: #475569; margin: 6px 0 0 0; line-height: 1.4;">
          ${escapeHtml(opportunityNote)}
        </p>
      </div>

      <!-- 3 Practical Next Steps -->
      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #0f172a; margin-top: 24px; margin-bottom: 12px;">
        3 Practical Next Steps
      </h3>

      ${actions
        .map(
          (action, i) => `
      <div class="action-pill">
        <strong>${i + 1}.</strong> ${escapeHtml(action)}
      </div>`
        )
        .join('')}

      <!-- Attached PDF Notice -->
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-top: 20px;">
        <div style="font-weight: 700; color: #1e40af; font-size: 13px;">📎 Attached: Your Full Financial Readiness Report & Certificate</div>
        <p style="font-size: 12px; color: #3b82f6; margin: 4px 0 0 0; line-height: 1.4;">
          We have attached your official PDF report containing your complete 5-dimension scorecard and question-by-question response audit.
        </p>
      </div>

      <!-- Challenge 5 Section -->
      <div style="margin: 28px 0; padding: 20px; background: #fdf4ff; border: 1px solid #f0abfc; border-radius: 14px; text-align: center;">
        <h4 style="margin: 0 0 6px 0; color: #86198f; font-size: 14px; font-weight: 800;">Challenge 5 People in Your Circle</h4>
        <p style="font-size: 12px; color: #701a75; margin: 0 0 14px 0; line-height: 1.5;">
          Personal finance is rarely discussed openly. Encourage healthy financial habits by challenging five friends or colleagues to discover their score!
        </p>
        <a href="${waUrl}" target="_blank" class="button-share" style="background: #25d366; color: #ffffff;">Share on WhatsApp</a>
        <a href="${liUrl}" target="_blank" class="button-share" style="background: #0077b5; color: #ffffff;">Share on LinkedIn</a>
      </div>

      <!-- Financial Clarity Conversation CTA -->
      <div class="cta-box">
        <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 800; color: #0f172a;">
          Want to Improve Your Financial Readiness?
        </h4>
        <p style="font-size: 12px; color: #475569; margin: 0 0 10px 0; line-height: 1.5;">
          If you would like to discuss your results or explore how to strengthen your five dimensions, we invite you to have a complimentary <strong>Financial Clarity Conversation</strong> with our advisory team.
        </p>
        <p style="font-size: 11px; color: #64748b; margin: 0 0 14px 0;">
          <em>• 100% Educational & Exploratory &bull; Zero Sales Pressure &bull; No Obligation</em>
        </p>
        <a href="mailto:contact@shree-capital.com?subject=Requesting%20Financial%20Clarity%20Conversation" class="button-primary">
          Request a Financial Clarity Conversation
        </a>
      </div>

      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-top: 24px;">
        Warm regards,<br>
        <strong>The Advisory Team</strong><br>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #e2e8f0;">SHREE CAPITAL</p>
      <p style="margin: 0 0 12px 0;">contact@shree-capital.com | www.shree-capital.com</p>
      <p style="margin: 0; font-size: 10px; color: #64748b; line-height: 1.4;">
        Disclaimer: This assessment is an educational tool. Scores and insights are indicative and do not constitute financial, investment, legal, or tax advice.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Plain text fallback
 */
export function generateSurveyResultEmailText(params: SendSurveyResultEmailParams): string {
  const level = params.readinessLevel || params.interpretation?.level || 'Financial Starter';
  return `
SHREE CAPITAL — FINANCIAL READY™ ASSESSMENT REPORT
How financially ready are you?

Dear ${params.toName},

Thank you for completing the Financial Ready™ Assessment.
"The score is not a judgement. It is a starting point."

YOUR SCORE: ${params.indexValue} / 100
READINESS LEVEL: ${level}

STRENGTH: ${params.strongestDimension?.name || 'Money Management'} (${params.strongestDimension?.percentage || 80}/100)
OPPORTUNITY: ${params.opportunityDimension?.name || 'Risk Protection'} (${params.opportunityDimension?.percentage || 50}/100)

Please find your official PDF Assessment Report and Certificate attached to this email.

Optional: To schedule a complimentary, no-obligation Financial Clarity Conversation with our advisory team, contact us at contact@shree-capital.com.

Warm regards,
The Advisory Team
Shree Capital
contact@shree-capital.com
  `.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseSender(fromStr?: string): { name: string; email: string } {
  const defaultEmail = 'contact@shree-capital.com';
  const defaultName = 'Shree Capital';

  if (!fromStr || fromStr.trim() === '') {
    return { name: defaultName, email: defaultEmail };
  }

  const emailMatch = fromStr.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1].trim() : defaultEmail;

  let name = defaultName;
  if (emailMatch) {
    const rawName = fromStr.replace(emailMatch[0], '').replace(/[<>"']/g, '').trim();
    if (rawName) {
      name = rawName;
    }
  }

  return { name, email };
}

/**
 * Dispatches email via Brevo REST API v3
 */
async function sendViaBrevoApi(
  apiKey: string,
  params: SendSurveyResultEmailParams,
  fromStr: string,
  subject: string,
  html: string,
  text: string,
  pdfBuffer?: Buffer
): Promise<EmailDispatchResult> {
  const sender = parseSender(fromStr);

  const payload: Record<string, unknown> = {
    sender: {
      name: sender.name,
      email: sender.email,
    },
    to: [
      {
        email: params.toEmail,
        name: params.toName,
      },
    ],
    subject,
    htmlContent: html,
    textContent: text,
  };

  if (pdfBuffer && pdfBuffer.length > 0) {
    const sanitizedName = params.toName.replace(/[^a-zA-Z0-9]/g, '_');
    payload.attachment = [
      {
        name: `Financial_Ready_Report_${sanitizedName}.pdf`,
        content: pdfBuffer.toString('base64'),
      },
    ];
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string;
      code?: string;
    };
    throw new Error(
      `Brevo API error (${response.status}): ${
        errorData.message || response.statusText || 'Unknown error'
      }`
    );
  }

  const result = (await response.json()) as { messageId?: string };

  return {
    success: true,
    messageId: result.messageId,
    provider: 'brevo-api',
    pdfAttached: Boolean(pdfBuffer && pdfBuffer.length > 0),
  };
}

/**
 * Dispatches email via SMTP
 */
async function sendViaSmtp(
  params: SendSurveyResultEmailParams,
  fromEmail: string,
  subject: string,
  html: string,
  text: string,
  pdfBuffer?: Buffer
): Promise<EmailDispatchResult> {
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      rejectUnauthorized: false,
    },
  });

  const attachments = [];
  if (pdfBuffer && pdfBuffer.length > 0) {
    const sanitizedName = params.toName.replace(/[^a-zA-Z0-9]/g, '_');
    attachments.push({
      filename: `Financial_Ready_Report_${sanitizedName}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    });
  }

  const info = await transporter.sendMail({
    from: fromEmail,
    to: `"${params.toName}" <${params.toEmail}>`,
    subject,
    text,
    html,
    attachments,
  });

  return {
    success: true,
    messageId: info.messageId,
    provider: 'smtp',
    pdfAttached: Boolean(pdfBuffer && pdfBuffer.length > 0),
  };
}

/**
 * Main Email Dispatch Function
 */
export async function sendSurveyResultEmail(
  params: SendSurveyResultEmailParams
): Promise<EmailDispatchResult> {
  const subject = 'Your Financial Readiness Score is here';
  const html = generateSurveyResultEmailHtml(params);
  const text = generateSurveyResultEmailText(params);
  const fromEmail = process.env.SMTP_FROM || 'contact@shree-capital.com';

  const brevoApiKey = process.env.BREVO_API_KEY;
  const smtpHost = process.env.SMTP_HOST;

  // Generate PDF attachment buffer if answers are present and not already provided
  let pdfBuffer = params.pdfBuffer;
  if (!pdfBuffer && params.answers && params.answers.length > 0) {
    try {
      pdfBuffer = await generateAssessmentPdfBuffer({
        respondent: { name: params.toName, email: params.toEmail, age: params.toAge },
        submittedAt: params.submittedAt || new Date(),
        totalScore: params.totalScore,
        indexValue: params.indexValue,
        readinessLevel: params.readinessLevel,
        sectionBreakdown: params.sectionBreakdown,
        strongestDimension: params.strongestDimension,
        opportunityDimension: params.opportunityDimension,
        nextActions: params.nextActions,
        interpretation: params.interpretation,
        answers: params.answers,
        appName: 'Financial Ready™ by Shree Capital',
      });
    } catch (pdfErr) {
      console.error('[Email Service] Failed to generate PDF attachment buffer:', pdfErr);
    }
  }

  try {
    // Strategy 1: Brevo Transactional REST API v3
    if (brevoApiKey && brevoApiKey.trim() !== '') {
      return await sendViaBrevoApi(brevoApiKey.trim(), params, fromEmail, subject, html, text, pdfBuffer);
    }

    // Strategy 2: SMTP Relay
    if (smtpHost && smtpHost.trim() !== '') {
      return await sendViaSmtp(params, fromEmail, subject, html, text, pdfBuffer);
    }

    console.warn(
      `[Email Service] Neither BREVO_API_KEY nor SMTP_HOST is configured. Email skipped for ${params.toEmail}.`
    );

    return {
      success: false,
      error: 'Email provider not configured (BREVO_API_KEY or SMTP_HOST missing)',
      provider: 'none',
      pdfAttached: Boolean(pdfBuffer),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown email dispatch error';
    console.error(`[Email Service] Failed to send email to ${params.toEmail}:`, errorMsg);
    return {
      success: false,
      error: errorMsg,
      pdfAttached: Boolean(pdfBuffer),
    };
  }
}
