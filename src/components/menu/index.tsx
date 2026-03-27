import styles from './styles.module.scss';

interface MenuProps {
  score: number;
  apm: number;
  onStart: () => void;
}

export default function Menu({ score, apm, onStart }: MenuProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>APM Trainer</h1>

      <p className={styles.subtitle}>
        Test your Actions Per Minute
      </p>

      {score > 0 && (
        <div className={styles.statsSection}>
          <div className={styles.stat}>
            <p className={styles.statLabel}>Last Score</p>
            <p className={styles.statValue}>{score}</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>APM</p>
            <p className={styles.statValue}>{apm}</p>
          </div>
        </div>
      )}

      <button className={styles.startButton} onClick={onStart}>
        {score > 0 ? 'Play Again' : 'Start'}
      </button>
    </div>
  );
}
