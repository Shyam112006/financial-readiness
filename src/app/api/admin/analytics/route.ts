import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SurveyResponse from '@/models/SurveyResponse';
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

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // 1. Overall counts
    const totalResponses = await SurveyResponse.countDocuments();
    const responsesToday = await SurveyResponse.countDocuments({
      submittedAt: { $gte: todayStart },
    });
    const responsesThisWeek = await SurveyResponse.countDocuments({
      submittedAt: { $gte: weekStart },
    });
    const emailSentCount = await SurveyResponse.countDocuments({ emailSent: true });
    const totalQuestions = await Question.countDocuments({ isActive: true });

    // If no responses yet, return empty structured stats
    if (totalResponses === 0) {
      return NextResponse.json({
        success: true,
        data: {
          metrics: {
            totalResponses: 0,
            responsesToday: 0,
            responsesThisWeek: 0,
            averageIndex: 0,
            averageScore: 0,
            medianScore: 0,
            highestIndex: 0,
            lowestIndex: 0,
            emailSentCount: 0,
            emailDeliveryRate: 0,
            totalQuestions,
          },
          scoreDistribution: [],
          timeline: [],
          recentResponses: [],
        },
      });
    }

    // 2. Score Metrics (Average, Min, Max)
    const scoreStats = await SurveyResponse.aggregate([
      {
        $group: {
          _id: null,
          avgIndex: { $avg: '$indexValue' },
          avgScore: { $avg: '$totalScore' },
          minScore: { $min: '$totalScore' },
          maxScore: { $max: '$totalScore' },
          minRank: { $min: '$indexValue' },
          maxRank: { $max: '$indexValue' },
        },
      },
    ]);

    const stat = scoreStats[0] || {};
    const averageIndex = Math.round((stat.avgIndex || 0) * 10) / 10;
    const averageScore = Math.round((stat.avgScore || 0) * 10) / 10;
    const highestIndex = stat.maxRank || 0;
    const lowestIndex = stat.minRank || 0;

    // 3. Median calculation
    const sortedScores = await SurveyResponse.find()
      .sort({ totalScore: 1 })
      .select('totalScore')
      .lean();

    let medianScore = 0;
    if (sortedScores.length > 0) {
      const mid = Math.floor(sortedScores.length / 2);
      medianScore =
        sortedScores.length % 2 !== 0
          ? sortedScores[mid].totalScore
          : Math.round(((sortedScores[mid - 1].totalScore + sortedScores[mid].totalScore) / 2) * 10) / 10;
    }

    // 4. Score distribution histogram intervals (e.g. 0-20, 21-40, 41-60, 61-80, 81-100+)
    const scoreDistribution = [
      { range: '0-20', count: 0, min: 0, max: 20 },
      { range: '21-40', count: 0, min: 21, max: 40 },
      { range: '41-60', count: 0, min: 41, max: 60 },
      { range: '61-80', count: 0, min: 61, max: 80 },
      { range: '81-100', count: 0, min: 81, max: 100 },
      { range: '100+', count: 0, min: 101, max: 999999 },
    ];

    const allIndexValues = await SurveyResponse.find().select('indexValue').lean();
    allIndexValues.forEach((item) => {
      const val = item.indexValue;
      const bucket = scoreDistribution.find((b) => val >= b.min && val <= b.max);
      if (bucket) bucket.count++;
    });

    // 5. Timeline of responses (last 14 days)
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const timelineData = await SurveyResponse.aggregate([
      {
        $match: {
          submittedAt: { $gte: fourteenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' },
          },
          count: { $sum: 1 },
          avgIndex: { $avg: '$indexValue' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days so the chart looks continuous
    const timelineMap = new Map(timelineData.map((d) => [d._id, { count: d.count, avgIndex: Math.round(d.avgIndex || 0) }]));
    const continuousTimeline = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = timelineMap.get(dateStr);
      continuousTimeline.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        responses: entry ? entry.count : 0,
        averageIndex: entry ? entry.avgIndex : 0,
      });
    }

    // 6. Recent responses
    const recentResponses = await SurveyResponse.find()
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('respondent totalScore indexValue submittedAt emailSent')
      .lean();

    const emailDeliveryRate = totalResponses > 0 ? Math.round((emailSentCount / totalResponses) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalResponses,
          responsesToday,
          responsesThisWeek,
          averageIndex,
          averageScore,
          medianScore,
          highestIndex,
          lowestIndex,
          emailSentCount,
          emailDeliveryRate,
          totalQuestions,
        },
        scoreDistribution,
        timeline: continuousTimeline,
        recentResponses,
      },
    });
  } catch (error) {
    console.error('Error calculating analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}
