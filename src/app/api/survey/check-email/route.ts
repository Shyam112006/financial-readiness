import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SurveyResponse from '@/models/SurveyResponse';
import { isValidEmail } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ success: false, message: 'Valid email is required' }, { status: 400 });
    }

    await connectToDatabase();
    const existing = await SurveyResponse.findOne({ 'respondent.email': email }).select('_id submittedAt totalScore indexValue').lean();

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
        message: 'This email address has already completed the assessment. Each participant is permitted to take the survey only once.',
        responseId: existing._id.toString(),
        submittedAt: existing.submittedAt,
      });
    }

    return NextResponse.json({
      success: true,
      alreadySubmitted: false,
    });
  } catch (error) {
    console.error('Error checking email submission status:', error);
    return NextResponse.json({ success: false, message: 'Server error checking email' }, { status: 500 });
  }
}
