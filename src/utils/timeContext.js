/**
 * Time-of-day adaptation utilities.
 *
 * Determines the current training period and returns contextually appropriate
 * copy for hints, banners, and post-session notes.
 */

export function getTimePeriod() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'MORNING';
  if (h >= 12 && h < 17) return 'AFTERNOON';
  if (h >= 17 && h < 21) return 'EVENING';
  return 'NIGHT';
}

/** Short label for display in the workout page banner. */
export function getTimeTag() {
  const labels = {
    MORNING:   'MORNING SESSION',
    AFTERNOON: 'AFTERNOON SESSION',
    EVENING:   'EVENING SESSION',
    NIGHT:     'LATE SESSION',
  };
  return labels[getTimePeriod()];
}

/**
 * Returns a one-sentence time-aware addendum for the dashboard focus card.
 * Appended after the goal-specific hint.
 */
export function getTimeFocusHint() {
  const hints = {
    MORNING:   'Morning sessions maximise neural drive and focus — a great time to push intensity.',
    AFTERNOON: 'Afternoon is peak body temperature, making it ideal for strength and power work.',
    EVENING:   'Evening training produces strong output but requires careful cool-down for recovery.',
    NIGHT:     'Late sessions can disrupt sleep — keep intensity moderate and wind down thoroughly.',
  };
  return hints[getTimePeriod()];
}

/**
 * Returns a recovery note shown in the feedback insight view for late workouts.
 * Returns null for morning/afternoon (no special note needed).
 */
export function getTimeRecoveryNote() {
  const period = getTimePeriod();
  if (period === 'EVENING') {
    return 'Evening session detected — prioritise sleep and a cool-down routine to maximise recovery from this session.';
  }
  if (period === 'NIGHT') {
    return 'Late workout noted — avoid bright screens, keep the room cool, and aim for 7–9 hours of sleep to allow full muscular adaptation.';
  }
  return null;
}
