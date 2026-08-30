import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SurveyResponse from '@/models/SurveyResponse';
import { verifyAdminAuth } from '@/lib/auth';
import { generateAssessmentPdfBuffer } from '@/lib/pdf';
import { calculateSurveyIndex } from '@/lib/scoring';

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
        { success: false, message: 'Response record not found' },
        { status: 404 }
      );
    }

    // Compute section breakdown
    const scoringItems = response.answers.map((a: { questionNumber: number; score: number; category?: string }) => ({
      questionNumber: a.questionNumber,
      score: a.score,
      category: a.category,
    }));
    const calculation = calculateSurveyIndex(scoringItems);

    const pdfBuffer = await generateAssessmentPdfBuffer({
      respondent: {
        name: response.respondent.name,
        email: response.respondent.email,
        age: response.respondent.age,
      },
      submittedAt: response.submittedAt,
      totalScore: response.totalScore,
      indexValue: response.indexValue,
      readinessLevel: calculation.readinessLevel,
      sectionBreakdown: calculation.sectionBreakdown,
      strongestDimension: calculation.strongestDimension,
      opportunityDimension: calculation.opportunityDimension,
      nextActions: calculation.nextActions,
      interpretation: calculation.interpretation,
      answers: response.answers,
      appName: 'Financial Ready™ by Shree Capital',
    });

    const sanitizedName = response.respondent.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Financial_Ready_Report_${sanitizedName}_${id.substring(id.length - 6)}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating admin PDF report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate PDF report' },
      { status: 500 }
    );
  }
}
