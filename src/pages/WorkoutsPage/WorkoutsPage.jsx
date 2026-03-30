import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import styles from './WorkoutsPage.module.scss';

const STATUS_LABEL = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };
const PAGE_SIZE = 8;

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.workouts.list(page, PAGE_SIZE)
      .then((r) => {
        setWorkouts(r.content ?? []);
        setTotalPages(r.totalPages ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.tag}>HISTORY</span>
        <h1 className={styles.heading}>Workout Sessions</h1>
        <p className={styles.sub}>Your full training history.</p>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : workouts.length === 0 ? (
        <div className={styles.empty}>No sessions yet. Generate your first workout!</div>
      ) : (
        <>
          <div className={styles.list}>
            {workouts.map((w) => (
              <div key={w.id} className={styles.row}>
                <div className={styles.rowLeft}>
                  <span className={styles.date}>
                    {new Date(w.generatedAt).toLocaleDateString('en-GB', {
                      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                  <span className={styles.exercises}>
                    {w.exercises?.length ?? 0} exercises
                  </span>
                </div>
                <span className={`${styles.status} ${styles[`status${w.status}`]}`}>
                  {STATUS_LABEL[w.status] ?? w.status}
                </span>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                type="button"
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>{page + 1} / {totalPages}</span>
              <button
                className={styles.pageBtn}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                type="button"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
