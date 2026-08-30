import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Question from '@/models/Question';
import SurveyResponse from '@/models/SurveyResponse';
import { validateSurveySubmission } from '@/lib/validation';
import { calculateSurveyIndex } from '@/lib/scoring';
import { sendSurveyResultEmail } from '@/lib/email';
import { IAnswerSnapshot } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate payload structure (Name, Email, answers object)
    const validation = validateSurveySubmission(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid submission data',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const { respondent, answers: userAnswers } = validation.data;

    // 2. Connect to MongoDB
    await connectToDatabase();

    // 3. Enforce Single Attempt per Email
    const existingResponse = await SurveyResponse.findOne({
      'respondent.email': respondent.email,
    });

    if (existingResponse) {
      return NextResponse.json(
        {
          success: false,
          code: 'ALREADY_SUBMITTED',
          message: `The email address "${respondent.email}" has already completed this assessment. Each participant is allowed to take the assessment only once.`,
          existingResponseId: existingResponse._id.toString(),
        },
        { status: 409 }
      );
    }

    // 4. Fetch all active questions from DB
    const activeQuestions = await Question.find({ isActive: true })
      .sort({ order: 1, questionNumber: 1 })
      .lean();

    if (!activeQuestions || activeQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No active survey questions found on the server.',
        },
        { status: 500 }
      );
    }

    // 4. Verify all active questions are answered and options are valid
    const answerSnapshots: IAnswerSnapshot[] = [];
    const scoringItems: Array<{ questionNumber: number; score: number; category?: string }> = [];

    for (const q of activeQuestions) {
      // User may submit key as q._id.toString() or as questionNumber
      const selectedOptionId =
        userAnswers[q._id.toString()] ||
        userAnswers[String(q.questionNumber)] ||
        userAnswers[`q${q.questionNumber}`];

      if (!selectedOptionId) {
        return NextResponse.json(
          {
            success: false,
            message: `Question #${q.questionNumber} is unanswered. Please answer all questions before submitting.`,
            missingQuestion: q.questionNumber,
          },
          { status: 400 }
        );
      }

      // Verify option exists on this question
      const matchedOption = q.options.find((opt) => opt.optionId === selectedOptionId);

      if (!matchedOption) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid option selected for Question #${q.questionNumber}.`,
            questionNumber: q.questionNumber,
          },
          { status: 400 }
        );
      }

      // Record immutable snapshot
      const snapshot: IAnswerSnapshot = {
        questionId: q._id.toString(),
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        selectedOptionId: matchedOption.optionId,
        selectedOptionText: matchedOption.optionText,
        score: matchedOption.score,
        category: q.category,
      };

      answerSnapshots.push(snapshot);
      scoringItems.push({
        questionNumber: q.questionNumber,
        score: matchedOption.score,
        category: q.category,
      });
    }

    // 5. Server-Side Score & Index Calculation
    const calculation = calculateSurveyIndex(scoringItems);

    // 6. Save response in MongoDB
    const newResponse = new SurveyResponse({
      respondent: {
        name: respondent.name,
        email: respondent.email,
        age: respondent.age,
      },
      answers: answerSnapshots,
      totalScore: calculation.totalScore,
      indexValue: calculation.indexValue,
      submittedAt: new Date(),
      emailSent: false,
    });

    await newResponse.save();

    // 7. Dispatch result email (Brevo / SMTP)
    let emailStatus: { success: boolean; error?: string } = { success: false };
    try {
      emailStatus = await sendSurveyResultEmail({
        toEmail: respondent.email,
        toName: respondent.name,
        toAge: respondent.age,
        totalScore: calculation.totalScore,
        indexValue: calculation.indexValue,
        readinessLevel: calculation.readinessLevel,
        sectionBreakdown: calculation.sectionBreakdown,
        strongestDimension: calculation.strongestDimension,
        opportunityDimension: calculation.opportunityDimension,
        nextActions: calculation.nextActions,
        interpretation: calculation.interpretation,
        answers: answerSnapshots,
        submittedAt: newResponse.submittedAt,
        appName: 'Financial Ready™ by Shree Capital',
      });

      if (emailStatus.success) {
        newResponse.emailSent = true;
        newResponse.emailSentAt = new Date();
        await newResponse.save();
      } else if (emailStatus.error) {
        newResponse.emailError = emailStatus.error;
        await newResponse.save();
      }
    } catch (emailErr) {
      console.error('Email dispatch exception:', emailErr);
      newResponse.emailError = emailErr instanceof Error ? emailErr.message : 'Unknown email error';
      await newResponse.save();
    }

    // 8. Return response to respondent
    return NextResponse.json({
      success: true,
      message: 'Survey submitted successfully',
      data: {
        responseId: newResponse._id.toString(),
        respondent: {
          name: respondent.name,
          email: respondent.email,
          age: respondent.age,
        },
        totalScore: calculation.totalScore,
        indexValue: calculation.indexValue,
        readinessLevel: calculation.readinessLevel,
        categoryScores: calculation.categoryScores,
        sectionBreakdown: calculation.sectionBreakdown,
        strongestDimension: calculation.strongestDimension,
        opportunityDimension: calculation.opportunityDimension,
        nextActions: calculation.nextActions,
        interpretation: calculation.interpretation,
        emailSent: newResponse.emailSent,
        submittedAt: newResponse.submittedAt,
      },
    });
  } catch (error) {
    console.error('Survey submission error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong while submitting your response. Please try again.',
      },
      { status: 500 }
    );
  }
}
