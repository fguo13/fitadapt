/**
 * Behavioural pattern detection — lightweight localStorage-backed tracker.
 *
 * Tracks which pages the user visits most frequently so the UI can surface
 * those destinations more prominently. No PII; counts only.
 *
 * Shape: { visits: { [pageKey]: number } }
 */

const STORAGE_KEY = 'fitadapt_behavior';

function read() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? { visits: {} };
  } catch {
    return { visits: {} };
  }
}

function write(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* quota */ }
}

/** Record one visit to a page. Call on every navigation. */
export function trackPageVisit(page) {
  const data = read();
  data.visits[page] = (data.visits[page] ?? 0) + 1;
  write(data);
}

/** Raw behavior data — for reading in components. */
export function getBehaviorData() {
  return read();
}

/**
 * Returns the page key the user visits most often, excluding the provided list.
 * Returns null if no useful signal exists yet.
 */
export function getMostVisitedPage(exclude = []) {
  const { visits } = read();
  const entry = Object.entries(visits)
    .filter(([k]) => !exclude.includes(k))
    .sort(([, a], [, b]) => b - a)[0];
  return entry ? entry[0] : null;
}
