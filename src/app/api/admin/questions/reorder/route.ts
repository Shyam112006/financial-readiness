import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await request.json(); // Array of { id: string, order: number, questionNumber?: number }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, message: 'Items array is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Update in bulk
    const updatePromises = items.map(async (item) => {
      const updateFields: Record<string, number> = { order: item.order };
      if (item.questionNumber !== undefined) {
        updateFields.questionNumber = item.questionNumber;
      }
      return Question.findByIdAndUpdate(item.id, updateFields);
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Questions reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering questions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reorder questions' },
      { status: 500 }
    );
  }
}
