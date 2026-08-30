import PDFDocument from 'pdfkit';
import { IAnswerSnapshot, SectionScoreBreakdown, FinancialReadinessLevel } from './types';
import { calculateSurveyIndex } from './scoring';

export interface GeneratePdfParams {
  respondent: { name: string; email: string; age?: number };
  submittedAt: Date | string;
  totalScore: number;
  indexValue: number;
  readinessLevel?: FinancialReadinessLevel | string;
  sectionBreakdown?: SectionScoreBreakdown[];
  strongestDimension?: { name: string; score: number; maxScore: number; percentage: number; note: string };
  opportunityDimension?: { name: string; score: number; maxScore: number; percentage: number; note: string };
  nextActions?: string[];
  interpretation?: { level: string; description: string; motivationalQuote?: string };
  answers: IAnswerSnapshot[];
  appName?: string;
}

// ── Colour palette (exact match to Shree Capital brand hex codes) ────────
const NAVY       = '#0f1e3a';
const NAVY_DARK  = '#102a43';
const NAVY_MID   = '#1f5e8c';
const NAVY_LIGHT = '#243b53';
const GOLD       = '#c9a44c';
const GOLD_PALE  = '#fdf8ee';
const GOLD_BR    = '#c9a44c';
const GREEN      = '#1f5e8c';
const GREEN_BG   = '#f8fafc';
const GREEN_BR   = '#bcccdc';
const AMBER      = '#c9a44c';
const AMBER_BG   = '#fdf8ee';
const AMBER_BR   = '#c9a44c';
const WHITE      = '#ffffff';
const OFFWHITE   = '#f8fafc';
const SLATE700   = '#243b53';
const SLATE600   = '#334e68';
const SLATE500   = '#627d98';
const SLATE400   = '#9fb3c8';
const SLATE300   = '#bcccdc';
const SLATE200   = '#bcccdc';
const SLATE100   = '#eef2f6';
const SLATE50    = '#f8fafc';

const PAGE_W = 595.28;
const PAGE_H  = 841.89;
const ML      = 40;
const CW      = PAGE_W - ML - 40;   // ≈ 515.28

const LEVEL_DESC: Record<string, string> = {
  Explorer:   'You are at the very start of your financial journey. Each small, deliberate step you take from here will build real momentum over time.',
  Starter:    'You have begun laying the foundation for your financial future. A few focused improvements can meaningfully strengthen your overall preparedness.',
  Builder:    'You have solid financial habits in place. Building on these with more intentional planning can accelerate your progress significantly.',
  Planner:    'You are financially well-prepared and ahead of most peers. Reviewing a few specific areas can help you maintain and grow this advantage.',
  Strategist: 'You demonstrate strong financial readiness across all five dimensions. Continue refining your strategy to achieve lasting long-term wealth.',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function rr(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string) {
  doc.moveTo(x + r, y).lineTo(x + w - r, y).quadraticCurveTo(x + w, y, x + w, y + r)
    .lineTo(x + w, y + h - r).quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    .lineTo(x + r, y + h).quadraticCurveTo(x, y + h, x, y + h - r)
    .lineTo(x, y + r).quadraticCurveTo(x, y, x + r, y).closePath();
  stroke ? doc.fillAndStroke(fill, stroke) : doc.fill(fill);
}

function rule(doc: PDFKit.PDFDocument, x: number, y: number, w: number, color = SLATE200) {
  doc.rect(x, y, w, 0.75).fill(color);
}

function sectionHeading(doc: PDFKit.PDFDocument, text: string, x: number, y: number, width: number) {
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(SLATE500);
  doc.text(text.toUpperCase(), x, y, { lineBreak: false, characterSpacing: 0.8 });
  doc.rect(x, y + 12, width, 0.75).fill(SLATE200);
}

function drawScoreRing(doc: PDFKit.PDFDocument, cx: number, cy: number, radius: number, score: number) {
  const lw = 9;
  doc.save(); doc.lineWidth(lw).strokeColor(SLATE200); doc.circle(cx, cy, radius).stroke(); doc.restore();
  if (score > 0) {
    const startA = -Math.PI / 2;
    const endA = startA + (Math.min(score, 100) / 100) * 2 * Math.PI;
    doc.save(); doc.lineWidth(lw).strokeColor(GOLD).lineCap('round');
    (doc as any).moveTo(cx + radius * Math.cos(startA), cy + radius * Math.sin(startA))
       .arc(cx, cy, radius, startA, endA, false).stroke();
    doc.restore();
  }
}

function pageHeader(doc: PDFKit.PDFDocument, title: string, name: string, bandH = 40) {
  doc.rect(0, 0, PAGE_W, bandH).fill(NAVY);
  doc.rect(0, 0, 3, bandH).fill(GOLD);
  doc.fontSize(7).font('Helvetica').fillColor(SLATE400);
  doc.text('SHREE CAPITAL  ', ML, 8, { lineBreak: false, characterSpacing: 0.4 });
  doc.fontSize(9).font('Helvetica-Bold').fillColor(WHITE);
  doc.text(title, ML, 20, { lineBreak: false, characterSpacing: 0 });
  doc.fontSize(7).font('Helvetica').fillColor(SLATE400);
  doc.text(name, ML, 8, { align: 'right', width: CW, lineBreak: false });
}

function stampFooters(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  for (let p = 0; p < range.count; p++) {
    doc.switchToPage(p);
    rule(doc, ML, PAGE_H - 26, CW, SLATE200);
    doc.fontSize(6.5).font('Helvetica').fillColor(SLATE400);
    doc.text(
      'Financial Ready  ·  Powered by Shree Capital  ·  contact@shree-capital.com  ·  www.shree-capital.com',
      ML, PAGE_H - 20, { lineBreak: false, width: 375 }
    );
    doc.text(`Page ${p + 1} of ${range.count}`, ML, PAGE_H - 20, { align: 'right', width: CW, lineBreak: false });
  }
}

// ── Main Generation ─────────────────────────────────────────────────────────
export async function generateAssessmentPdfBuffer(params: GeneratePdfParams): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true, autoFirstPage: true });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end',  () => resolve(Buffer.concat(chunks)));
      doc.on('error',(e) => reject(e));

      // ── Self-heal missing scoring fields ──────────────────────────────────
      let breakdown   = params.sectionBreakdown;
      let strongest   = params.strongestDimension;
      let opportunity = params.opportunityDimension;
      let actions     = params.nextActions;
      let level       = params.readinessLevel || params.interpretation?.level;

      if (!breakdown?.length || !strongest || !opportunity || !actions?.length || !level) {
        const items = (params.answers || []).map((a) => ({
          questionNumber: a.questionNumber, score: a.score, category: a.category, section: a.section,
        }));
        const calc = calculateSurveyIndex(items);
        if (!breakdown?.length) breakdown   = calc.sectionBreakdown;
        if (!strongest)         strongest   = calc.strongestDimension;
        if (!opportunity)       opportunity = calc.opportunityDimension;
        if (!actions?.length)   actions     = calc.nextActions;
        if (!level)             level       = calc.readinessLevel;
      }

      const safeBreakdown: SectionScoreBreakdown[] = breakdown?.length ? breakdown : [
        { sectionName: 'Section A — Money Management',             score: 6,  maxScore: 20, percentage: 30 },
        { sectionName: 'Section B — Emergency Preparedness',       score: 7,  maxScore: 16, percentage: 44 },
        { sectionName: 'Section C — Investing',                    score: 13, maxScore: 24, percentage: 54 },
        { sectionName: 'Section D — Risk Protection',              score: 7,  maxScore: 16, percentage: 44 },
        { sectionName: 'Section E — Long-Term Financial Planning', score: 11, maxScore: 24, percentage: 46 },
      ];
      const safeActions = actions?.length ? actions : [
        'Set up automated savings transfers every month before any discretionary expenses.',
        'Review your personal protection to ensure you have pure term life cover and independent health insurance.',
        'Schedule an annual portfolio review to realign your asset allocation with your life milestones.',
      ];
      const safeLevel   = String(level || 'Starter');
      const levelDesc   = LEVEL_DESC[safeLevel] || 'Your assessment results are a meaningful starting point for deliberate financial improvement.';
      const strongName  = strongest?.name       || 'Investing';
      const strongScore = strongest?.score      ?? 13;
      const strongMax   = strongest?.maxScore   ?? 24;
      const strongPct   = strongest?.percentage ?? 54;
      const strongNote  = strongest?.note       || 'Your habits and current approach in this area provide a strong, dependable foundation.';
      const oppName     = opportunity?.name       || 'Money Management';
      const oppScore    = opportunity?.score      ?? 6;
      const oppMax      = opportunity?.maxScore   ?? 20;
      const oppPct      = opportunity?.percentage ?? 30;
      const oppNote     = opportunity?.note       || 'Your responses suggest this dimension may deserve deliberate attention.';

      const formattedDate = new Date(params.submittedAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      const certId = `FR-${new Date(params.submittedAt).getFullYear()}-${Math.abs(
        params.respondent.email.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
      ).toString(16).toUpperCase().substring(0, 6)}`;

      // ==================================================================
      // PAGE 1 — FINANCIAL SNAPSHOT (THE WOW PAGE)
      // ==================================================================
      doc.rect(0, 0, PAGE_W, 60).fill(NAVY);
      doc.rect(0, 0, 3, 60).fill(GOLD);
      doc.fontSize(6.5).font('Helvetica').fillColor(SLATE400);
      doc.text('SHREE CAPITAL  ', ML, 10, { lineBreak: false, characterSpacing: 0.5 });
      doc.fontSize(16).font('Helvetica-Bold').fillColor(WHITE);
      doc.text('FINANCIAL READY', ML, 22, { lineBreak: false, characterSpacing: 0 });
      doc.fontSize(7.5).font('Helvetica').fillColor(SLATE400);
      doc.text('HOW FINANCIALLY READY ARE YOU?', ML, 43, { lineBreak: false, characterSpacing: 0.3 });
      doc.fontSize(6.5).font('Helvetica').fillColor(SLATE400);
      doc.text(`Certificate: ${certId}`, ML, 12, { align: 'right', width: CW, lineBreak: false });
      doc.text(`Date: ${formattedDate}`, ML, 23, { align: 'right', width: CW, lineBreak: false });

      let y = 72;

      // Participant block
      doc.fontSize(18).font('Helvetica-Bold').fillColor(NAVY);
      doc.text(params.respondent.name, ML, y, { lineBreak: false });
      doc.fontSize(7.5).font('Helvetica').fillColor(SLATE500);
      const ageStr = params.respondent.age ? `  ·  Age ${params.respondent.age}` : '';
      doc.text(`Financial Readiness Assessment${ageStr}`, ML, y + 24, { lineBreak: false });
      doc.text(params.respondent.email, ML, y + 36, { lineBreak: false });
      y += 52;
      rule(doc, ML, y, CW);
      y += 16;

      // Score ring (left) + Meaning card (right)
      const ringCX = ML + 75;
      const ringCY = y + 74;
      const ringR  = 58;
      drawScoreRing(doc, ringCX, ringCY, ringR, params.indexValue);

      const scoreStr = `${params.indexValue}`;
      doc.fontSize(40).font('Helvetica-Bold').fillColor(NAVY);
      const sw = doc.widthOfString(scoreStr);
      doc.text(scoreStr, ringCX - sw / 2, ringCY - 24, { lineBreak: false });
      doc.fontSize(9.5).font('Helvetica').fillColor(SLATE500);
      const subScoreStr = 'out of 100';
      const subSw = doc.widthOfString(subScoreStr);
      doc.text(subScoreStr, ringCX - subSw / 2, ringCY + 18, { lineBreak: false });

      // Level badge below ring
      const lvlLabel = safeLevel.toUpperCase();
      doc.fontSize(7.5).font('Helvetica-Bold');
      const bW = Math.max(108, doc.widthOfString(lvlLabel) + 24);
      rr(doc, ringCX - bW / 2, ringCY + ringR + 10, bW, 19, 4, GOLD);
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(WHITE);
      doc.text(lvlLabel, ringCX - bW / 2, ringCY + ringR + 15, { width: bW, align: 'center', lineBreak: false });

      // Meaning card (right of ring)
      const mX = ML + 168;
      const mW = CW - 168;
      rr(doc, mX, y, mW, 160, 8, OFFWHITE, SLATE200);
      doc.fontSize(6.5).font('Helvetica-Bold').fillColor(GOLD);
      doc.text('YOUR FINANCIAL READINESS SCORE', mX + 14, y + 14, { lineBreak: false, characterSpacing: 0.5 });
      doc.fontSize(36).font('Helvetica-Bold').fillColor(NAVY);
      doc.text(`${params.indexValue}`, mX + 14, y + 26, { lineBreak: false });
      doc.fontSize(36).font('Helvetica-Bold');
      const scoreNumW = doc.widthOfString(`${params.indexValue}`);
      doc.fontSize(13).font('Helvetica').fillColor(SLATE500);
      doc.text('/ 100', mX + 14 + scoreNumW + 4, y + 39, { lineBreak: false });
      rule(doc, mX + 14, y + 74, mW - 26);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(NAVY_MID);
      doc.text(`${safeLevel} — What does this mean?`, mX + 14, y + 82, { lineBreak: false });
      doc.fontSize(7.5).font('Helvetica').fillColor(SLATE600);
      doc.text(levelDesc, mX + 14, y + 96, { width: mW - 26, lineGap: 2.5 });

      y += 178;

      // Reassurance pill
      rr(doc, ML, y, CW, 22, 4, GOLD_PALE, GOLD_BR);
      doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(AMBER);
      doc.text('"Your score is not a judgement. It is a starting point."', ML, y + 7, { align: 'center', width: CW, lineBreak: false });
      y += 34;

      // Five-Dimension Scorecard
      sectionHeading(doc, 'Five-Dimension Scorecard', ML, y, CW);
      y += 22;

      const PILLAR_LABELS = ['Money Management', 'Emergency Preparedness', 'Investing', 'Risk Protection', 'Long-Term Financial Planning'];
      safeBreakdown.forEach((sec, idx) => {
        const name  = PILLAR_LABELS[idx] || sec.sectionName.replace(/^Section [A-Z] — /, '');
        const rowH  = 30;
        const barX  = ML + 178; const barW = CW - 178 - 48; const barH = 7;
        const fillW = Math.max(barH, (barW * sec.percentage) / 100);
        const isStr = name === strongName; const isOpp = name === oppName;
        const barCol = isStr ? GREEN : isOpp ? AMBER : NAVY_MID;

        doc.rect(ML, y, CW, rowH).fill(idx % 2 === 0 ? WHITE : SLATE50);
        doc.rect(ML, y, 3, rowH).fill(GOLD);
        doc.fontSize(8).font('Helvetica-Bold').fillColor(NAVY_LIGHT);
        doc.text(name, ML + 12, y + 8, { lineBreak: false, width: 164 });

        doc.fontSize(7).font('Helvetica').fillColor(SLATE500);
        const scoreLabel = `${sec.score} / ${sec.maxScore} pts`;
        doc.text(scoreLabel, ML + 12, y + 19, { lineBreak: false });

        // Highlight tags without overlapping text
        if (isStr) {
          doc.fontSize(6).font('Helvetica-Bold').fillColor(GREEN);
          doc.text('  ·  STRENGTH', ML + 12 + doc.widthOfString(scoreLabel), y + 19, { lineBreak: false });
        } else if (isOpp) {
          doc.fontSize(6).font('Helvetica-Bold').fillColor(AMBER);
          doc.text('  ·  OPPORTUNITY', ML + 12 + doc.widthOfString(scoreLabel), y + 19, { lineBreak: false });
        }

        rr(doc, barX, y + 11, barW, barH, 3, SLATE200);
        if (fillW > 0) rr(doc, barX, y + 11, fillW, barH, 3, barCol);
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor(barCol);
        doc.text(`${sec.percentage}%`, barX + barW + 5, y + 9, { lineBreak: false, width: 40, align: 'right' });
        rule(doc, ML + 3, y + rowH - 0.5, CW - 3);
        y += rowH;
      });
      y += 12;

      // Strongest + Opportunity side-by-side
      sectionHeading(doc, 'Your Financial Profile', ML, y, CW);
      y += 22;
      const halfW = (CW - 10) / 2;

      rr(doc, ML, y, halfW, 90, 8, GREEN_BG, GREEN_BR);
      doc.rect(ML, y, 3, 90).fill(GREEN);
      doc.fontSize(6.5).font('Helvetica-Bold').fillColor(GREEN);
      doc.text('YOUR STRONGEST FOUNDATION', ML + 12, y + 10, { lineBreak: false, characterSpacing: 0.4 });
      doc.fontSize(11).font('Helvetica-Bold').fillColor(NAVY_LIGHT);
      doc.text(strongName, ML + 12, y + 24, { lineBreak: false, width: halfW - 20, characterSpacing: 0 });
      doc.fontSize(10).font('Helvetica-Bold').fillColor(GREEN);
      doc.text(`${strongScore} / ${strongMax}  (${strongPct}%)`, ML + 12, y + 40, { lineBreak: false });
      doc.fontSize(7.5).font('Helvetica').fillColor(SLATE600);
      doc.text(strongNote, ML + 12, y + 56, { width: halfW - 20, lineGap: 2.5 });

      const oppX = ML + halfW + 10;
      rr(doc, oppX, y, halfW, 90, 8, AMBER_BG, AMBER_BR);
      doc.rect(oppX, y, 3, 90).fill(AMBER);
      doc.fontSize(6.5).font('Helvetica-Bold').fillColor(AMBER);
      doc.text('YOUR BIGGEST OPPORTUNITY', oppX + 12, y + 10, { lineBreak: false, characterSpacing: 0.4 });
      doc.fontSize(11).font('Helvetica-Bold').fillColor(NAVY_LIGHT);
      doc.text(oppName, oppX + 12, y + 24, { lineBreak: false, width: halfW - 20, characterSpacing: 0 });
      doc.fontSize(10).font('Helvetica-Bold').fillColor(AMBER);
      doc.text(`${oppScore} / ${oppMax}  (${oppPct}%)`, oppX + 12, y + 40, { lineBreak: false });
      doc.fontSize(7.5).font('Helvetica').fillColor(SLATE600);
      doc.text('This is your biggest opportunity to strengthen your financial foundation. ' + oppNote, oppX + 12, y + 56, { width: halfW - 20, lineGap: 2.5 });

      // ==================================================================
      // PAGE 2 — ACTION PLAN & NEXT STEPS
      // ==================================================================
      doc.addPage();
      pageHeader(doc, 'YOUR ACTION PLAN & NEXT STEPS', params.respondent.name);
      y = 52;

      // Journey tracker bar
      rr(doc, ML, y, CW, 22, 5, GOLD_PALE, GOLD_BR);
      doc.fontSize(7.5).font('Helvetica').fillColor(AMBER);
      doc.text('Score Understood   >   Strength Identified   >   Opportunity Identified   >   Act This Month', ML, y + 7, { align: 'center', width: CW, lineBreak: false });
      y += 32;

      sectionHeading(doc, 'Your Next 3 Practical Actions', ML, y, CW);
      y += 20;

      const ACTION_NUM = ['01', '02', '03'];
      safeActions.forEach((act, idx) => {
        doc.fontSize(8.5).font('Helvetica-Bold');
        const textH = doc.heightOfString(act, { width: CW - 86, lineGap: 2 });
        const actH = Math.max(54, textH + 26);
        rr(doc, ML, y, CW, actH, 6, OFFWHITE, SLATE200);
        doc.rect(ML, y, 3, actH).fill(NAVY_MID);
        doc.fontSize(24).font('Helvetica-Bold').fillColor(GOLD);
        doc.text(ACTION_NUM[idx], ML + 12, y + 10, { lineBreak: false });
        doc.fontSize(5.5).font('Helvetica-Bold').fillColor(SLATE400);
        doc.text('ACTION', ML + 12, y + 36, { lineBreak: false, characterSpacing: 0.8 });
        doc.rect(ML + 56, y + 10, 0.75, actH - 20).fill(SLATE200);
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor(NAVY);
        doc.text(act, ML + 68, y + 14, { width: CW - 80, lineGap: 2, characterSpacing: 0 });
        y += actH + 6;
      });

      // Start This Month
      rr(doc, ML, y, CW, 44, 6, NAVY);
      doc.rect(ML, y, 3, 44).fill(GOLD);
      doc.fontSize(7).font('Helvetica-Bold').fillColor(GOLD);
      doc.text('START THIS MONTH', ML + 14, y + 8, { lineBreak: false, characterSpacing: 0.8 });
      doc.fontSize(7.5).font('Helvetica').fillColor(SLATE300);
      doc.text("Don't try to fix everything at once. Pick one action from this report and complete it in the next 30 days. One deliberate step, consistently repeated, compounds into lasting financial security.", ML + 14, y + 21, { width: CW - 24, lineGap: 2, characterSpacing: 0 });
      y += 54;

      // Challenge Your Circle
      sectionHeading(doc, 'Challenge 5 People in Your Circle', ML, y, CW);
      y += 18;
      doc.fontSize(10).font('Helvetica-Bold').fillColor(NAVY);
      doc.text('You know your Financial Readiness Score. Now see how your network scores.', ML, y, { lineBreak: false });
      y += 15;
      doc.fontSize(8).font('Helvetica').fillColor(SLATE600);
      doc.text('Personal finance is rarely spoken about openly. Challenge friends, family and peers to take the 10-minute assessment.', ML, y, { width: CW, lineGap: 2 });
      y += 24;

      // ── HERO HIGHLIGHT: WANT TO IMPROVE YOUR SCORE? ──────────────────────────
      sectionHeading(doc, 'Want to Improve Your Score & Strengthen Your Foundation?', ML, y, CW);
      y += 20;

      const heroH = 195;
      rr(doc, ML, y, CW, heroH, 8, NAVY, GOLD_BR);
      doc.rect(ML, y, 4, heroH).fill(GOLD);

      // Gold badge tag
      rr(doc, ML + 18, y + 14, 270, 20, 4, GOLD);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(WHITE);
      doc.text('COMPLIMENTARY FINANCIAL CLARITY CONVERSATION', ML + 18, y + 20, { width: 270, align: 'center', lineBreak: false });

      // Big Bold Headline (14pt)
      doc.fontSize(13.5).font('Helvetica-Bold').fillColor(WHITE);
      doc.text('Take the Next Step Towards Total Financial Readiness', ML + 18, y + 42, { lineBreak: false });

      // Engaging Description (9.5pt)
      doc.fontSize(9).font('Helvetica').fillColor(SLATE300);
      doc.text(
        'Your assessment revealed key strengths and strategic opportunities. Discuss your personalized score, bridge your financial gaps, and map out a goal-aligned wealth strategy with our personal finance professionals.',
        ML + 18, y + 62, { width: CW - 36, lineGap: 3.5 }
      );

      // 3 Value Pillars Badges (large & distinct)
      const guarantees = ['100% Educational & Free', 'Strictly Confidential & Fiduciary', 'Zero Sales Pitch / No Obligation'];
      let gx = ML + 18;
      guarantees.forEach((g) => {
        doc.fontSize(7.5).font('Helvetica-Bold');
        const gw = doc.widthOfString(g) + 18;
        rr(doc, gx, y + 108, gw, 20, 4, NAVY_LIGHT, GOLD_BR);
        doc.fontSize(7.5).font('Helvetica-Bold').fillColor(GOLD_BR);
        doc.text(g, gx, y + 114, { width: gw, align: 'center', lineBreak: false });
        gx += gw + 8;
      });

      // Prominent Action Button / Banner (34pt)
      rr(doc, ML + 18, y + 142, CW - 36, 34, 6, NAVY_MID, GOLD_BR);
      doc.fontSize(9.5).font('Helvetica-Bold').fillColor(WHITE);
      doc.text(
        'SCHEDULE YOUR CONVERSATION  —  contact@shree-capital.com  ·  www.shree-capital.com',
        ML + 18, y + 153, { width: CW - 36, align: 'center', lineBreak: false, characterSpacing: 0.4 }
      );

      y += heroH + 18;

      // About & Disclaimer
      doc.fontSize(7).font('Helvetica').fillColor(SLATE600);
      doc.text(
        'About Shree Capital  ·  Boutique wealth management firm built on fiduciary integrity, goal-aligned planning, and enduring client partnerships.',
        ML, y, { width: CW, lineGap: 2 }
      );
      y += 14;

      doc.fontSize(6).font('Helvetica').fillColor(SLATE400);
      doc.text(
        'Disclaimer: The Financial Readiness Assessment is an educational awareness tool. Scores and interpretations are indicative based on self-reported responses. This report does not constitute financial, investment, legal or tax advice and does not recommend any specific financial product.',
        ML, y, { width: CW, lineGap: 1.5 }
      );

      // ==================================================================
      // PAGE 3+ — RESPONSE AUDIT (auto-paginating, no truncation)
      // ==================================================================
      doc.addPage();
      pageHeader(doc, 'YOUR RESPONSE AUDIT', params.respondent.name);
      y = 52;

      doc.fontSize(11).font('Helvetica-Bold').fillColor(NAVY);
      doc.text('Question-by-Question Assessment Ledger', ML, y, { lineBreak: false, characterSpacing: 0 });
      y += 16;
      doc.fontSize(7.5).font('Helvetica').fillColor(SLATE500);
      doc.text('A transparent view of how your responses contributed to your Financial Readiness Score. Use this to reflect on your financial habits and identify where you most want to grow.', ML, y, { width: CW, lineGap: 2.5 });
      y += 28;

      const sortedAnswers = [...(params.answers || [])].sort((a, b) => a.questionNumber - b.questionNumber);
      const SEC_NAMES  = ['Section A — Money Management', 'Section B — Emergency Preparedness', 'Section C — Investing', 'Section D — Risk Protection', 'Section E — Long-Term Financial Planning'];
      const SEC_RANGES: [number, number][] = [[1,5],[6,9],[10,15],[16,19],[20,25]];
      const SEC_COLORS = [NAVY_MID, '#0d9488', '#7c3aed', AMBER, GREEN];

      let currentSec = -1;
      const SAFE_Y   = PAGE_H - 36;

      for (let i = 0; i < sortedAnswers.length; i++) {
        const ans    = sortedAnswers[i];
        const qNum   = ans.questionNumber;
        const secIdx = SEC_RANGES.findIndex(([lo, hi]) => qNum >= lo && qNum <= hi);

        // Section header row
        if (secIdx !== currentSec && secIdx >= 0) {
          currentSec = secIdx;
          if (y + 22 > SAFE_Y) { doc.addPage(); pageHeader(doc, 'YOUR RESPONSE AUDIT (continued)', params.respondent.name); y = 52; }
          doc.rect(ML, y, CW, 20).fill(NAVY_LIGHT);
          doc.fontSize(7.5).font('Helvetica-Bold').fillColor(GOLD);
          doc.text(SEC_NAMES[secIdx] ?? `Section ${secIdx + 1}`, ML + 12, y + 6, { lineBreak: false, characterSpacing: 0.3 });
          const [lo, hi] = SEC_RANGES[secIdx];
          doc.fontSize(6.5).font('Helvetica').fillColor(SLATE400);
          doc.text(`Q${lo}–Q${hi}`, ML, y + 7, { align: 'right', width: CW - 12, lineBreak: false });
          y += 22;
        }

        // Dynamic row height — full question + answer text
        doc.fontSize(8).font('Helvetica-Bold');
        const qH   = doc.heightOfString(ans.questionText,      { width: CW - 80, lineGap: 2 });
        doc.fontSize(7.5).font('Helvetica');
        const optH = doc.heightOfString(ans.selectedOptionText, { width: CW - 80, lineGap: 2 });
        const rowH = Math.max(48, qH + optH + 26);

        if (y + rowH > SAFE_Y) { doc.addPage(); pageHeader(doc, 'YOUR RESPONSE AUDIT (continued)', params.respondent.name); y = 52; }

        doc.rect(ML, y, CW, rowH).fill(i % 2 === 0 ? WHITE : SLATE50);
        doc.rect(ML, y, 3, rowH).fill(SEC_COLORS[secIdx] ?? NAVY_MID);

        // Question number circle
        const circX = ML + 20; const circY = y + 18;
        doc.circle(circX, circY, 12).fill(i % 2 === 0 ? NAVY_LIGHT : NAVY);
        doc.fontSize(8).font('Helvetica-Bold').fillColor(WHITE);
        const qLabel = qNum < 10 ? `0${qNum}` : `${qNum}`;
        doc.text(qLabel, circX - 8, circY - 5, { lineBreak: false, width: 16, align: 'center' });

        // Full question text
        doc.fontSize(8).font('Helvetica-Bold').fillColor(NAVY_LIGHT);
        doc.text(ans.questionText, ML + 40, y + 7, { width: CW - 80, lineGap: 2, characterSpacing: 0 });

        // Your response label + answer (full — no truncation)
        const respY = y + 7 + qH + 4;
        doc.fontSize(6).font('Helvetica-Bold').fillColor(SLATE400);
        doc.text('YOUR RESPONSE:', ML + 40, respY, { lineBreak: false, characterSpacing: 0.3 });
        doc.fontSize(7.5).font('Helvetica').fillColor(NAVY_MID);
        doc.text(ans.selectedOptionText, ML + 40, respY + 10, { width: CW - 80, lineGap: 2, characterSpacing: 0 });

        // Score badge
        const scoreCols: Record<number, string> = { 4: GREEN, 3: NAVY_MID, 2: AMBER, 1: '#b91c1c', 0: '#6b7280' };
        const sc = scoreCols[ans.score] ?? SLATE500;
        rr(doc, ML + CW - 40, y + rowH / 2 - 13, 34, 26, 4, sc);
        doc.fontSize(12).font('Helvetica-Bold').fillColor(WHITE);
        doc.text(`+${ans.score}`, ML + CW - 40, y + rowH / 2 - 8, { width: 34, align: 'center', lineBreak: false });
        doc.fontSize(6).font('Helvetica').fillColor(WHITE);
        doc.text('pts', ML + CW - 40, y + rowH / 2 + 6, { width: 34, align: 'center', lineBreak: false });

        rule(doc, ML + 3, y + rowH - 0.5, CW - 3);
        y += rowH;
      }

      // Total summary row
      if (y + 26 > SAFE_Y) { doc.addPage(); pageHeader(doc, 'YOUR RESPONSE AUDIT (continued)', params.respondent.name); y = 52; }
      const totalPts = sortedAnswers.reduce((s, a) => s + (a.score || 0), 0);
      doc.rect(ML, y, CW, 24).fill(NAVY_LIGHT);
      doc.fontSize(8).font('Helvetica-Bold').fillColor(WHITE);
      doc.text(`Total: ${totalPts} pts  ·  ${sortedAnswers.length} questions  ·  Financial Readiness Index: ${params.indexValue} / 100`, ML + 12, y + 8, { lineBreak: false, width: CW - 20, characterSpacing: 0 });

      stampFooters(doc);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
