import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import SurveyResponse from '@/models/SurveyResponse';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
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

    // Find the question either by MongoDB _id or questionNumber
    const isNumeric = !isNaN(Number(id));
    const question = isNumeric
      ? await Question.findOne({ questionNumber: Number(id) }).lean()
      : await Question.findById(id).lean();

    if (!question) {
      return NextResponse.json(
        { success: false, message: 'Question not found' },
        { status: 404 }
      );
    }

    const questionIdStr = question._id.toString();
    const questionNum = question.questionNumber;

    // Aggregate answers matching this question
    const answerCounts = await SurveyResponse.aggregate([
      { $unwind: '$answers' },
      {
        $match: {
          $or: [
            { 'answers.questionId': questionIdStr },
            { 'answers.questionNumber': questionNum },
          ],
        },
      },
      {
        $group: {
          _id: '$answers.selectedOptionId',
          count: { $sum: 1 },
          optionText: { $first: '$answers.selectedOptionText' },
          score: { $first: '$answers.score' },
        },
      },
    ]);

    const totalQuestionResponses = answerCounts.reduce((sum, item) => sum + item.count, 0);

    // Map each of the question's defined options with response count and percentage
    const optionStats = question.options.map((opt, index) => {
      const match = answerCounts.find((a) => a._id === opt.optionId);
      const count = match ? match.count : 0;
      const percentage =
        totalQuestionResponses > 0
          ? Math.round((count / totalQuestionResponses) * 1000) / 10
          : 0;

      // Option label: A, B, C, D, E...
      const optionLetter = String.fromCharCode(65 + index);

      return {
        optionId: opt.optionId,
        optionLetter,
        optionText: opt.optionText,
        score: opt.score,
        count,
        percentage,
        formatted: `${optionLetter}: ${count} (${percentage}%)`,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        questionId: questionIdStr,
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        category: question.category,
        totalResponses: totalQuestionResponses,
        options: optionStats,
      },
    });
  } catch (error) {
    console.error('Error fetching question analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve question analytics' },
      { status: 500 }
    );
  }
}
