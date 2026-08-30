import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
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

    const response = await SurveyResponse.findById(id).lean();

    if (!response) {
      return NextResponse.json(
        { success: false, message: 'Survey response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching response details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve response details' },
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

    const deleted = await SurveyResponse.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Survey response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Survey response deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting survey response:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete response' },
      { status: 500 }
    );
  }
}
