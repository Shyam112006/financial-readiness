import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    const questions = await Question.find({ isActive: true })
      .sort({ order: 1, questionNumber: 1 })
      .select('questionNumber questionText category section options.optionId options.optionText')
      .lean();

    return NextResponse.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error('Error fetching survey questions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to load survey questions. Please try again.',
      },
      { status: 500 }
    );
  }
}
