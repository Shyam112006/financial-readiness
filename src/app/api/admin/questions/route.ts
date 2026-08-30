import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const questions = await Question.find()
      .sort({ order: 1, questionNumber: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error('Error fetching admin questions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

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

    // Determine questionNumber if not explicitly provided
    let finalNumber = Number(questionNumber);
    if (!finalNumber) {
      const highest = await Question.findOne().sort({ questionNumber: -1 }).select('questionNumber');
      finalNumber = (highest?.questionNumber || 0) + 1;
    } else {
      // Check if duplicate
      const existing = await Question.findOne({ questionNumber: finalNumber });
      if (existing) {
        return NextResponse.json(
          {
            success: false,
            message: `Question #${finalNumber} already exists. Please pick a unique question number.`,
          },
          { status: 400 }
        );
      }
    }

    // Format options with IDs if missing
    const formattedOptions = options.map((opt, idx) => ({
      optionId: opt.optionId || `opt_${Date.now()}_${idx + 1}`,
      optionText: String(opt.optionText || '').trim(),
      score: Number(opt.score || 0),
    }));

    const newQuestion = new Question({
      questionNumber: finalNumber,
      questionText: questionText.trim(),
      category: category?.trim() || 'General',
      options: formattedOptions,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      order: order !== undefined ? Number(order) : finalNumber,
    });

    await newQuestion.save();

    return NextResponse.json({
      success: true,
      message: 'Question created successfully',
      data: newQuestion,
    });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create question' },
      { status: 500 }
    );
  }
}
