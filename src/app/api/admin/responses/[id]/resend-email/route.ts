import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SurveyResponse from '@/models/SurveyResponse';
import { verifyAdminAuth } from '@/lib/auth';
import { sendSurveyResultEmail } from '@/lib/email';
import { calculateSurveyIndex } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const response = await SurveyResponse.findById(id);

    if (!response) {
      return NextResponse.json(
        { success: false, message: 'Survey response not found' },
        { status: 404 }
      );
    }

    // Compute score & dimension breakdown
    const scoringItems = (response.answers || []).map((a) => ({
      questionNumber: a.questionNumber,
      score: a.score,
      category: a.category,
      section: a.section,
    }));
    const calculation = calculateSurveyIndex(scoringItems);

    // Dispatch email
    const emailResult = await sendSurveyResultEmail({
      toEmail: response.respondent.email,
      toName: response.respondent.name,
      toAge: response.respondent.age,
      totalScore: response.totalScore,
      indexValue: response.indexValue,
      readinessLevel: calculation.readinessLevel,
      sectionBreakdown: calculation.sectionBreakdown,
      strongestDimension: calculation.strongestDimension,
      opportunityDimension: calculation.opportunityDimension,
      nextActions: calculation.nextActions,
      interpretation: calculation.interpretation,
      answers: response.answers,
      submittedAt: response.submittedAt,
      appName: 'Financial Ready™ by Shree Capital',
    });

    if (emailResult.success) {
      response.emailSent = true;
      response.emailSentAt = new Date();
      response.emailError = undefined;
      await response.save();

      return NextResponse.json({
        success: true,
        message: `Email successfully sent to ${response.respondent.email}`,
      });
    } else {
      response.emailError = emailResult.error || 'Email dispatch failed';
      await response.save();

      return NextResponse.json(
        {
          success: false,
          message: `Email delivery failed: ${emailResult.error || 'Check SMTP/Mailchimp settings'}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error resending survey email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process email dispatch' },
      { status: 500 }
    );
  }
}
