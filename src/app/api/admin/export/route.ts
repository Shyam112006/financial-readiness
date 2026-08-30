import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SurveyResponse from '@/models/SurveyResponse';
import Question from '@/models/Question';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  // If field contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Fetch all questions to determine total questions and header columns
    const questions = await Question.find()
      .sort({ order: 1, questionNumber: 1 })
      .lean();

    const maxQuestionNumber = questions.length > 0
      ? Math.max(...questions.map((q) => q.questionNumber))
      : 25;

    // 2. Build CSV Headers
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Age',
      'Submission Date',
    ];

    for (let i = 1; i <= maxQuestionNumber; i++) {
      headers.push(`Q${i} Answer`);
      headers.push(`Q${i} Score`);
    }

    headers.push('Total Score', 'Index Value', 'Email Status', 'Email Sent At');

    const csvRows: string[] = [headers.map(escapeCsvField).join(',')];

    // 3. Fetch all responses
    const responses = await SurveyResponse.find()
      .sort({ submittedAt: -1 })
      .lean();

    for (const resp of responses) {
      const row: (string | number | undefined)[] = [
        resp.respondent?.name || '',
        resp.respondent?.email || '',
        resp.respondent?.phone || '',
        resp.respondent?.age || '',
        resp.submittedAt ? new Date(resp.submittedAt).toISOString() : '',
      ];

      // Map answers by questionNumber
      const answerMap = new Map();
      if (resp.answers && Array.isArray(resp.answers)) {
        resp.answers.forEach((ans) => {
          answerMap.set(ans.questionNumber, ans);
        });
      }

      for (let i = 1; i <= maxQuestionNumber; i++) {
        const answer = answerMap.get(i);
        if (answer) {
          row.push(answer.selectedOptionText || '');
          row.push(answer.score !== undefined ? answer.score : 0);
        } else {
          row.push('N/A');
          row.push(0);
        }
      }

      row.push(resp.totalScore || 0);
      row.push(resp.indexValue || 0);
      row.push(resp.emailSent ? 'Sent' : 'Failed/Pending');
      row.push(resp.emailSentAt ? new Date(resp.emailSentAt).toISOString() : '');

      csvRows.push(row.map(escapeCsvField).join(','));
    }

    const csvContent = csvRows.join('\r\n');
    const filename = `survey_responses_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate CSV export' },
      { status: 500 }
    );
  }
}
