import { useState } from 'react';

/**
 * Lightweight in-app navigation hook.
 * Swap for React Router when URL-based routing is needed.
 */
export function useNavigation(initialPage = 'login') {
  const [page, setPage] = useState(initialPage);
  const navigate = (destination) => setPage(destination);
  const goBack = () => setPage('login');
  return { page, navigate, goBack };
}
