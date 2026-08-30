import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SurveyResponse from '@/models/SurveyResponse';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const emailStatus = searchParams.get('emailStatus'); // 'all', 'sent', 'failed'
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'submittedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build filter query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { 'respondent.name': { $regex: search, $options: 'i' } },
        { 'respondent.email': { $regex: search, $options: 'i' } },
      ];
    }

    if (emailStatus === 'sent') {
      filter.emailSent = true;
    } else if (emailStatus === 'failed') {
      filter.emailSent = false;
    }

    if (minScore || maxScore) {
      filter.indexValue = {};
      if (minScore) filter.indexValue.$gte = Number(minScore);
      if (maxScore) filter.indexValue.$lte = Number(maxScore);
    }

    if (startDate || endDate) {
      filter.submittedAt = {};
      if (startDate) filter.submittedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.submittedAt.$lte = end;
      }
    }

    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const totalCount = await SurveyResponse.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const responses = await SurveyResponse.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('respondent totalScore indexValue submittedAt emailSent emailSentAt emailError')
      .lean();

    return NextResponse.json({
      success: true,
      data: responses,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve responses' },
      { status: 500 }
    );
  }
}
