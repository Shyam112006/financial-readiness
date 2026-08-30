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
 * Builds the official Shree Capital — Financial Readiness Assessment HTML Email Template
 */
export function generateSurveyResultEmailHtml(params: SendSurveyResultEmailParams): string {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const level = params.readinessLevel || params.interpretation?.level || 'Financial Starter';

  const waMessage = `How financially ready are you?\nI just took the Financial Readiness Assessment by Shree Capital to evaluate my personal finance readiness across five key dimensions.\nTake the free assessment and find out where you stand:\n${appUrl}/survey`;
  const waText = encodeURIComponent(waMessage);
  const waUrl = `https://api.whatsapp.com/send?text=${waText}`;

  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${appUrl}/survey`)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Financial Readiness Assessment Report — Shree Capital</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f1e3a;
      margin: 0;
      padding: 24px 12px;
      color: #334e68;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 620px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
      border: 1px solid #eef2f6;
    }
    .header {
      background-color: #0f1e3a;
      padding: 36px 30px;
      text-align: center;
      border-bottom: 4px solid #c9a44c;
    }
    .header-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      color: #c9a44c;
      background-color: #102a43;
      border: 1px solid #243b53;
      padding: 4px 14px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    .header-title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin: 6px 0 2px 0;
      text-transform: uppercase;
    }
    .header-sub {
      color: #bcccdc;
      font-size: 14px;
      font-style: italic;
      margin: 4px 0 0 0;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 16px;
      color: #0f1e3a;
      line-height: 1.6;
      margin-top: 0;
    }
    .body-text {
      font-size: 14px;
      color: #334e68;
      line-height: 1.65;
      margin: 14px 0;
    }
    .quote-box {
      margin: 22px 0;
      padding: 14px 18px;
      background-color: #f8fafc;
      border-left: 3px solid #c9a44c;
      font-style: italic;
      color: #243b53;
      font-size: 13.5px;
      border-radius: 0 8px 8px 0;
    }
    .score-card {
      background-color: #fdf8ee;
      border: 2px solid #c9a44c;
      border-radius: 16px;
      padding: 26px 20px;
      text-align: center;
      margin: 28px 0;
    }
    .score-header {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.8px;
      color: #0f1e3a;
    }
    .score-main {
      font-size: 52px;
      font-weight: 900;
      color: #0f1e3a;
      line-height: 1;
      margin: 10px 0 4px 0;
    }
    .score-total {
      font-size: 20px;
      color: #627d98;
      font-weight: 700;
    }
    .score-badge {
      display: inline-block;
      background-color: #c9a44c;
      color: #0f1e3a;
      font-weight: 800;
      font-size: 13px;
      padding: 4px 18px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 8px;
    }
    .score-desc {
      font-size: 12.5px;
      color: #334e68;
      line-height: 1.55;
      margin: 14px 10px 0 10px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #0f1e3a;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 32px 0 16px 0;
      padding-bottom: 6px;
      border-bottom: 1px solid #eef2f6;
    }
    .dimension-card {
      background-color: #f8fafc;
      border: 1px solid #eef2f6;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 12px;
    }
    .dimension-name {
      font-size: 14px;
      font-weight: 800;
      color: #0f1e3a;
      margin-bottom: 4px;
    }
    .dimension-desc {
      font-size: 12.5px;
      color: #627d98;
      line-height: 1.5;
      margin: 0;
    }
    .cta-box {
      background-color: #0f1e3a;
      border-radius: 16px;
      padding: 28px 24px;
      text-align: center;
      margin: 32px 0;
      border-left: 4px solid #c9a44c;
    }
    .cta-title {
      color: #ffffff;
      margin: 0 0 8px 0;
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cta-text {
      color: #bcccdc;
      font-size: 13px;
      margin: 0 0 12px 0;
      line-height: 1.55;
    }
    .cta-highlight {
      color: #c9a44c;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin: 0 0 18px 0;
    }
    .btn-gold {
      display: inline-block;
      background-color: #c9a44c;
      color: #0f1e3a !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 13px;
      padding: 13px 26px;
      border-radius: 8px;
      letter-spacing: 0.5px;
    }
    .share-box {
      background-color: #f8fafc;
      border: 1px solid #eef2f6;
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      margin: 28px 0;
    }
    .share-title {
      font-size: 13px;
      font-weight: 800;
      color: #0f1e3a;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 0 0 8px 0;
    }
    .share-desc {
      font-size: 13px;
      color: #334e68;
      line-height: 1.55;
      margin: 0 0 18px 0;
    }
    .btn-share {
      display: inline-block;
      text-decoration: none;
      font-weight: 700;
      font-size: 12.5px;
      padding: 10px 20px;
      border-radius: 8px;
      margin: 4px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 28px 24px;
      text-align: center;
      font-size: 11.5px;
      color: #627d98;
      line-height: 1.6;
      border-top: 1px solid #eef2f6;
    }
    .footer-brand {
      font-weight: 800;
      color: #0f1e3a;
      font-size: 12.5px;
      letter-spacing: 1px;
      margin: 0 0 4px 0;
    }
    .footer-links {
      color: #1f5e8c;
      margin: 0 0 12px 0;
    }
    .footer-links a {
      color: #1f5e8c;
      text-decoration: none;
    }
    .footer-disclaimer {
      font-size: 10.5px;
      color: #9fb3c8;
      margin: 0;
      line-height: 1.45;
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 10px; background-color: #0f1e3a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center">
        <div class="wrapper">
          <!-- Header -->
          <div class="header">
            <div class="header-tag">SHREE CAPITAL</div>
            <div class="header-title">FINANCIAL READINESS ASSESSMENT</div>
          </div>

          <!-- Content Body -->
          <div class="content">
            <p class="greeting">
              Dear <strong>${escapeHtml(params.toName)}</strong>,
            </p>

            <p class="body-text">
              Thank you for taking the time to complete the Financial Readiness Assessment.
            </p>

            <p class="body-text">
              Your assessment provides a snapshot of your personal finance readiness across five key dimensions and highlights areas that may benefit from greater awareness, planning, or improvement.
            </p>

            <div class="quote-box">
              &ldquo;The score is not a judgement. It is a starting point.&rdquo;
            </div>

            <!-- Score Banner -->
            <div class="score-card">
              <div class="score-header">YOUR OVERALL FINANCIAL READINESS SCORE</div>
              <div class="score-main">
                ${params.indexValue} <span class="score-total">/ 100</span>
              </div>
              <div>
                <span class="score-badge">${escapeHtml(level)}</span>
              </div>
              <p class="score-desc">
                Your score represents your current level of financial readiness based on your responses. Use it as a starting point to understand your strengths and identify areas where you can build a stronger financial foundation.
              </p>
            </div>

            <!-- 5 Dimensions of Financial Readiness -->
            <div class="section-title">YOUR FIVE DIMENSIONS OF FINANCIAL READINESS</div>

            <div class="dimension-card">
              <div class="dimension-name">Money Management</div>
              <p class="dimension-desc">
                Understanding how effectively you manage income, expenses, savings, and cash flow.
              </p>
            </div>

            <div class="dimension-card">
              <div class="dimension-name">Emergency Preparedness</div>
              <p class="dimension-desc">
                Your ability to handle unexpected financial situations without disrupting your long-term plans.
              </p>
            </div>

            <div class="dimension-card">
              <div class="dimension-name">Investing</div>
              <p class="dimension-desc">
                Your awareness and approach toward building wealth through appropriate investment strategies.
              </p>
            </div>

            <div class="dimension-card">
              <div class="dimension-name">Risk Protection</div>
              <p class="dimension-desc">
                Your preparedness to protect yourself and your finances against significant financial risks.
              </p>
            </div>

            <div class="dimension-card">
              <div class="dimension-name">Long-Term Planning</div>
              <p class="dimension-desc">
                Your readiness to plan for major financial goals and build sustainable long-term financial security.
              </p>
            </div>

            <!-- What Next? Section -->
            <div class="cta-box">
              <div class="cta-title">WHAT NEXT?</div>
              <p class="cta-text">
                Your score is only the beginning. The most valuable part of the assessment is understanding where you stand and what you can improve.
              </p>
              <p class="cta-text">
                If you would like to discuss your results or explore ways to strengthen your financial readiness, you can request a complimentary Financial Clarity Conversation with our advisory team.
              </p>
              <div class="cta-highlight">
                100% Educational &amp; Exploratory &bull; No Obligation
              </div>
              <div>
                <a href="https://calendly.com/arun_agrawal" target="_blank" class="btn-gold">
                  Request a Financial Clarity Conversation
                </a>
              </div>
            </div>

            <!-- Share Section -->
            <div class="share-box">
              <div class="share-title">MAKE FINANCIAL READINESS A CONVERSATION</div>
              <p class="share-desc">
                Personal finance is rarely discussed openly. Encourage better financial awareness by sharing the assessment with your friends, family, or colleagues.
              </p>
              <div>
                <a href="${waUrl}" target="_blank" class="btn-share" style="background-color: #25d366; color: #ffffff;">
                  Share on WhatsApp
                </a>
                <a href="${liUrl}" target="_blank" class="btn-share" style="background-color: #0077b5; color: #ffffff;">
                  Share on LinkedIn
                </a>
              </div>
            </div>

            <p style="font-size: 14px; color: #334e68; line-height: 1.6; margin-top: 28px;">
              Warm regards,<br><br>
              <strong>Team Shree Capital</strong>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-brand">SHREE CAPITAL</div>
            <div class="footer-links">
              <a href="mailto:contact@shree-capital.com">contact@shree-capital.com</a> &bull; <a href="https://www.shree-capital.com" target="_blank">www.shree-capital.com</a>
            </div>
            <p class="footer-disclaimer">
              Disclaimer: This assessment is an educational and exploratory tool. Scores and insights are indicative and do not constitute financial, investment, legal, or tax advice.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
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
SHREE CAPITAL
FINANCIAL READINESS ASSESSMENT

How financially ready are you?


Dear ${params.toName},

Thank you for taking the time to complete the Financial Readiness Assessment.

Your assessment provides a snapshot of your personal finance readiness across five key dimensions and highlights areas that may benefit from greater awareness, planning, or improvement.

“The score is not a judgement. It is a starting point.”


YOUR OVERALL FINANCIAL READINESS SCORE

${params.indexValue} / 100

${level}

Your score represents your current level of financial readiness based on your responses. Use it as a starting point to understand your strengths and identify areas where you can build a stronger financial foundation.


YOUR FIVE DIMENSIONS OF FINANCIAL READINESS

Money Management
Understanding how effectively you manage income, expenses, savings, and cash flow.

Emergency Preparedness
Your ability to handle unexpected financial situations without disrupting your long-term plans.

Investing
Your awareness and approach toward building wealth through appropriate investment strategies.

Risk Protection
Your preparedness to protect yourself and your finances against significant financial risks.

Long-Term Planning
Your readiness to plan for major financial goals and build sustainable long-term financial security.


WHAT NEXT?

Your score is only the beginning. The most valuable part of the assessment is understanding where you stand and what you can improve.

If you would like to discuss your results or explore ways to strengthen your financial readiness, you can request a complimentary Financial Clarity Conversation with our advisory team.

100% Educational & Exploratory · Zero Sales Pressure · No Obligation

[ Request a Financial Clarity Conversation: https://calendly.com/arun_agrawal ]


MAKE FINANCIAL READINESS A CONVERSATION

Personal finance is rarely discussed openly. Encourage better financial awareness by sharing the assessment with your friends, family, or colleagues.

[ Share on WhatsApp: https://api.whatsapp.com/send?text=${encodeURIComponent(`How financially ready are you?\nI just took the Financial Readiness Assessment by Shree Capital to evaluate my personal finance readiness across five key dimensions.\nTake the free assessment and find out where you stand:\n${process.env.APP_URL || 'http://localhost:3000'}/survey`)} ]

[ Share on LinkedIn: https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.APP_URL || 'http://localhost:3000'}/survey`)} ]


Warm regards,

Team Shree Capital


SHREE CAPITAL

contact@shree-capital.com · www.shree-capital.com

Disclaimer: This assessment is an educational and exploratory tool. Scores and insights are indicative and do not constitute financial, investment, legal, or tax advice.
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
