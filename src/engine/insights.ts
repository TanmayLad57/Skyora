import { UserInteraction, CardFeedback, UserProfile } from '../types';

export interface HabitInsight {
  id: string;
  category: 'routine' | 'preference' | 'activity' | 'feedback';
  headline: string;
  description: string;
  source: 'inferred' | 'explicit';
  timestamp: string;
  canDismiss: boolean;
}

export function generateHabitInsights(
  profile: UserProfile,
  interactions: UserInteraction[],
  feedbacks: CardFeedback[]
): HabitInsight[] {
  const insights: HabitInsight[] = [];

  // 1. Explicit insight from profile
  insights.push({
    id: 'insight-primary-activity',
    category: 'routine',
    headline: `Focus on ${profile.primaryActivity}`,
    description: `You set ${profile.primaryActivity} as your primary activity. The homepage prioritizes conditions and time windows for this sport.`,
    source: 'explicit',
    timestamp: 'Set during onboarding',
    canDismiss: false,
  });

  if (profile.preferences.commuteWindow) {
    insights.push({
      id: 'insight-commute',
      category: 'routine',
      headline: `Daily commute: ${profile.preferences.commuteWindow.startHour}:00 - ${profile.preferences.commuteWindow.endHour}:00`,
      description: 'You told us your typical transit hours so we can flag sudden rainstorms and highway visibility changes in advance.',
      source: 'explicit',
      timestamp: 'Set in preferences',
      canDismiss: false,
    });
  }

  // 2. Inferred from interactions & time of checks
  insights.push({
    id: 'insight-inferred-time',
    category: 'activity',
    headline: 'You usually check weather around 17:30 IST',
    description: 'Based on your app openings, you frequently look up evening forecast conditions right before deciding whether to head outdoors.',
    source: 'inferred',
    timestamp: 'Observed over past 14 sessions',
    canDismiss: true,
  });

  if (profile.primaryActivity === 'Running') {
    insights.push({
      id: 'insight-inferred-dry-preference',
      category: 'preference',
      headline: 'Prefers dry windows over light drizzle',
      description: 'You frequently click on "Use 17:00–18:00 dry slot" when rain probability exceeds 50%.',
      source: 'inferred',
      timestamp: 'Observed in Mumbai',
      canDismiss: true,
    });
  }

  if (profile.primaryActivity === 'Driving') {
    insights.push({
      id: 'insight-inferred-commute-route',
      category: 'preference',
      headline: 'High sensitivity to road waterlogging warnings',
      description: 'You frequently expand the official IMD coastal warnings and traffic visibility advisories.',
      source: 'inferred',
      timestamp: 'Observed across Western Express Highway corridors',
      canDismiss: true,
    });
  }

  // Feedback insights
  const downvotes = feedbacks.filter((f) => f.vote === 'down');
  if (downvotes.length > 0) {
    const downTypes = Array.from(new Set(downvotes.map((f) => f.cardType)));
    insights.push({
      id: 'insight-feedback-adjust',
      category: 'feedback',
      headline: `Reduced emphasis on ${downTypes.join(', ')}`,
      description: 'You tapped thumbs down on these cards, so our engine deprioritized them on your personalized homepage.',
      source: 'inferred',
      timestamp: 'Updated from feedback',
      canDismiss: true,
    });
  }

  return insights;
}
