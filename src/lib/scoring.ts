import {
  FinancialReadinessLevel,
  ScoreCalculationResult,
  SectionScoreBreakdown,
} from './types';

export interface AnswerForScoring {
  questionNumber: number;
  score: number;
  category?: string;
  section?: string;
}

export interface ScoreCalculator {
  name: string;
  calculate(answers: AnswerForScoring[]): ScoreCalculationResult;
}

/**
 * Section definitions with max score capacities:
 * Section A (Q1-Q5): 5 x 4 = 20 pts
 * Section B (Q6-Q9): 4 x 4 = 16 pts
 * Section C (Q10-Q15): 6 x 4 = 24 pts
 * Section D (Q16-Q19): 4 x 4 = 16 pts
 * Section E (Q20-Q25): 6 x 4 = 24 pts
 * Total Max = 100 pts
 */
const SECTION_MAX_SCORES: Record<string, number> = {
  'Section A — Money Management': 20,
  'Section B — Emergency Preparedness': 16,
  'Section C — Investing': 24,
  'Section D — Risk Protection': 16,
  'Section E — Long-Term Financial Planning': 24,
};

const ACTION_SUGGESTIONS: Record<string, string> = {
  'Section A — Money Management':
    'Set up automated savings transfers every month before any discretionary expenses.',
  'Section B — Emergency Preparedness':
    'Build a dedicated emergency buffer equivalent to 3–6 months of essential living costs in a liquid account.',
  'Section C — Investing':
    'Map your investments to specific time horizons (short, medium, long term) rather than chasing ad hoc returns.',
  'Section D — Risk Protection':
    'Review your personal protection to ensure you have pure term life cover and independent health insurance.',
  'Section E — Long-Term Financial Planning':
    'Quantify your long-term milestones with estimated target amounts adjusted for inflation.',
};

/**
 * FinancialReadyIndexCalculator
 * Implements the official Financial Ready™ by Shree Capital scoring model.
 */
export class FinancialReadyIndexCalculator implements ScoreCalculator {
  name = 'FinancialReadyIndexCalculator';

  calculate(answers: AnswerForScoring[]): ScoreCalculationResult {
    let totalScore = 0;
    const categoryScores: Record<string, number> = {};

    // Group scores by section
    for (const ans of answers) {
      totalScore += ans.score;
      const secName = this.normalizeSectionName(
        ans.section || ans.category || 'General',
        ans.questionNumber
      );
      categoryScores[secName] = (categoryScores[secName] || 0) + ans.score;
    }

    // Build structured section breakdowns
    const sectionBreakdown: SectionScoreBreakdown[] = Object.entries(
      SECTION_MAX_SCORES
    ).map(([secName, maxScore]) => {
      const score = categoryScores[secName] || 0;
      const percentage =
        maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      return {
        sectionName: secName,
        score,
        maxScore,
        percentage,
      };
    });

    const indexValue = totalScore;
    const readinessLevel = this.getReadinessLevel(indexValue);
    const interpretation = this.getInterpretation(indexValue, readinessLevel);

    // Identify Strongest Area and Biggest Opportunity based on percentage
    const sortedByPercentage = [...sectionBreakdown].sort(
      (a, b) => b.percentage - a.percentage
    );

    const bestSection = sortedByPercentage[0] || sectionBreakdown[0];
    const weakestSection =
      sortedByPercentage[sortedByPercentage.length - 1] || sectionBreakdown[0];
    const secondWeakestSection =
      sortedByPercentage[sortedByPercentage.length - 2] || sectionBreakdown[1];

    const strongestDimension = {
      name: bestSection.sectionName.replace(/^Section [A-Z] — /, ''),
      score: bestSection.score,
      maxScore: bestSection.maxScore,
      percentage: bestSection.percentage,
      note: 'Your habits and current approach in this area provide a strong, dependable foundation.',
    };

    const opportunityDimension = {
      name: weakestSection.sectionName.replace(/^Section [A-Z] — /, ''),
      score: weakestSection.score,
      maxScore: weakestSection.maxScore,
      percentage: weakestSection.percentage,
      note: 'Your responses suggest this dimension may deserve deliberate attention to strengthen your overall resilience.',
    };

    // Formulate 3 distinct practical action steps
    const nextActions: string[] = [
      ACTION_SUGGESTIONS[weakestSection.sectionName] ||
        'Review your emergency buffer and ensure liquidity for unforeseen expenses.',
      ACTION_SUGGESTIONS[secondWeakestSection.sectionName] ||
        'Separate your short-term savings from long-term goal-aligned investments.',
      'Schedule an annual portfolio check-in to realign your asset allocation with life milestones.',
    ];

    return {
      totalScore,
      indexValue,
      readinessLevel,
      categoryScores,
      sectionBreakdown,
      strongestDimension,
      opportunityDimension,
      nextActions,
      interpretation,
    };
  }

  private normalizeSectionName(raw: string, qNum: number): string {
    if (raw.includes('Money Management') || (qNum >= 1 && qNum <= 5)) {
      return 'Section A — Money Management';
    }
    if (raw.includes('Emergency Preparedness') || (qNum >= 6 && qNum <= 9)) {
      return 'Section B — Emergency Preparedness';
    }
    if (raw.includes('Investing') || (qNum >= 10 && qNum <= 15)) {
      return 'Section C — Investing';
    }
    if (raw.includes('Risk Protection') || (qNum >= 16 && qNum <= 19)) {
      return 'Section D — Risk Protection';
    }
    if (
      raw.includes('Long-Term Financial Planning') ||
      (qNum >= 20 && qNum <= 25)
    ) {
      return 'Section E — Long-Term Financial Planning';
    }
    return raw;
  }

  private getReadinessLevel(score: number): FinancialReadinessLevel {
    if (score >= 90) return 'Financial Strategist';
    if (score >= 75) return 'Financial Planner';
    if (score >= 60) return 'Financial Builder';
    if (score >= 40) return 'Financial Starter';
    return 'Financial Explorer';
  }

  private getInterpretation(
    score: number,
    level: FinancialReadinessLevel
  ): NonNullable<ScoreCalculationResult['interpretation']> {
    switch (level) {
      case 'Financial Strategist':
        return {
          level,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          description:
            'You demonstrate an exemplary, holistic grasp of personal finance across protection, growth, and long-term planning.',
          motivationalQuote:
            'You have mastered the foundational pillars. Your focus is maintaining agility and compounding peace of mind.',
        };
      case 'Financial Planner':
        return {
          level,
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
          description:
            'You exhibit high financial discipline, thoughtful risk management, and intentional investing habits.',
          motivationalQuote:
            'Your intentionality with money sets you apart. Continuing this disciplined approach ensures enduring financial freedom.',
        };
      case 'Financial Builder':
        return {
          level,
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          description:
            'You have solid financial instincts and active management habits with room to optimize goal-mapping and risk buffers.',
          motivationalQuote:
            'You are actively constructing your financial independence. Consistent refinement today will accelerate your milestones.',
        };
      case 'Financial Starter':
        return {
          level,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          description:
            'You have established regular saving routines and early financial awareness. Introducing structure will accelerate your progress.',
          motivationalQuote:
            'You have built the engine. Now it is time to steer it toward clear, defined life milestones.',
        };
      case 'Financial Explorer':
      default:
        return {
          level: 'Financial Explorer',
          badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
          description:
            'You are taking intentional first steps toward personal financial clarity. With a few fundamentals in place, your confidence will grow rapidly.',
          motivationalQuote:
            'Every seasoned investor once started as an explorer. The score is not a judgement—it is your starting point.',
        };
    }
  }
}

export const defaultCalculator: ScoreCalculator =
  new FinancialReadyIndexCalculator();

export function calculateSurveyIndex(
  answers: AnswerForScoring[],
  calculator: ScoreCalculator = defaultCalculator
): ScoreCalculationResult {
  return calculator.calculate(answers);
}
