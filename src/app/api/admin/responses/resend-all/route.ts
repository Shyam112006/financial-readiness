import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SurveyResponse from '@/models/SurveyResponse';
import { verifyAdminAuth } from '@/lib/auth';
import { sendSurveyResultEmail } from '@/lib/email';
import { calculateSurveyIndex } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const unsentResponses = await SurveyResponse.find({ emailSent: false });

    if (unsentResponses.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending or unsent emails found.',
        sentCount: 0,
        failedCount: 0,
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const resp of unsentResponses) {
      const scoringItems = (resp.answers || []).map((a) => ({
        questionNumber: a.questionNumber,
        score: a.score,
        category: a.category,
        section: a.section,
      }));
      const calculation = calculateSurveyIndex(scoringItems);

      const emailResult = await sendSurveyResultEmail({
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

      if (emailResult.success) {
        resp.emailSent = true;
        resp.emailSentAt = new Date();
        resp.emailError = undefined;
        await resp.save();
        sentCount++;
      } else {
        resp.emailError = emailResult.error;
        await resp.save();
        failedCount++;
        if (emailResult.error && !errors.includes(emailResult.error)) {
          errors.push(emailResult.error);
        }
      }
    }

    return NextResponse.json({
      success: sentCount > 0,
      message: `Processed ${unsentResponses.length} emails: ${sentCount} sent, ${failedCount} failed.`,
      sentCount,
      failedCount,
      errors,
    });
  } catch (error) {
    console.error('Error in bulk email resend:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process bulk email resend' },
      { status: 500 }
    );
  }
}
