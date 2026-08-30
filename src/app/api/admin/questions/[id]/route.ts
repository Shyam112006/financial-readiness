import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { questionNumber, questionText, category, options, isActive, order } = body;

    if (!questionText || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: 'Question text and at least 2 options are required',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const question = await Question.findById(id);
    if (!question) {
      return NextResponse.json(
        { success: false, message: 'Question not found' },
        { status: 404 }
      );
    }

    // Check if questionNumber is being changed and if it collides with another question
    if (questionNumber !== undefined && questionNumber !== question.questionNumber) {
      const collision = await Question.findOne({
        questionNumber: Number(questionNumber),
        _id: { $ne: id },
      });
      if (collision) {
        return NextResponse.json(
          {
            success: false,
            message: `Question #${questionNumber} already exists. Please choose a different number.`,
          },
          { status: 400 }
        );
      }
      question.questionNumber = Number(questionNumber);
    }

    question.questionText = questionText.trim();
    if (category !== undefined) question.category = category.trim() || 'General';
    if (isActive !== undefined) question.isActive = Boolean(isActive);
    if (order !== undefined) question.order = Number(order);

    // Format options
    question.options = options.map((opt, idx) => ({
      optionId: opt.optionId || `opt_${Date.now()}_${idx + 1}`,
      optionText: String(opt.optionText || '').trim(),
      score: Number(opt.score || 0),
    }));

    await question.save();

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully',
      data: question,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update question' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const deleted = await Question.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
