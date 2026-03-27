import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';
import type { Row, ActiveKey } from '../../types/game';

const INITIAL_ROWS: Row[] = [
  {
    id: 1,
    cells: { 1: '', 2: '', 3: '', 4: '' },
  },
  {
    id: 2,
    cells: { 1: '', 2: '', 3: '', 4: '' },
  },
  {
    id: 3,
    cells: { 1: '', 2: '', 3: '', 4: '' },
  },
  {
    id: 4,
    cells: { 1: '', 2: '', 3: '', 4: '' },
  },
];

const KEY_LETTERS = ['E', 'W', 'Q', 'R', 'D', 'F'];
const GAME_DURATION = 30; // seconds

interface TableProps {
  score: number;
  onScore: () => void;
  onBackToMenu: (apm: number) => void;
}

export default function Table({ score, onScore, onBackToMenu }: TableProps) {
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const [actualKeys, setActualKeys] = useState<ActiveKey[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [correctCells, setCorrectCells] = useState<Set<string>>(new Set());
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const startTime = useRef<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [apm, setApm] = useState(0);
  const gameOverRef = useRef(false);

  // Derived values
  const timeLeft = Math.max(0, GAME_DURATION - elapsedSeconds);
  const gameOver = elapsedSeconds >= GAME_DURATION;
  gameOverRef.current = gameOver;

  // Track elapsed time and calculate APM
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      if (elapsed >= GAME_DURATION) {
        setElapsedSeconds(GAME_DURATION);
        clearInterval(interval);
      } else {
        setElapsedSeconds(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate APM based on score and elapsed time
  useEffect(() => {
    if (elapsedSeconds === 0 || gameOver) return;
    setApm(Math.round((score / elapsedSeconds) * 60));
  }, [score, elapsedSeconds, gameOver]);

  // Generate new key avoiding duplicates
  const generateNewKey = useCallback((keysToCheck: ActiveKey[]): ActiveKey | null => {
    const occupiedCells = new Set(
      keysToCheck.map((k) => `${k.row}-${k.cell}`)
    );

    const availableCells: { row: number; cell: number }[] = [];
    INITIAL_ROWS.forEach((row) => {
      Object.keys(row.cells).forEach((cellKey) => {
        const cellId = `${row.id}-${cellKey}`;
        if (!occupiedCells.has(cellId)) {
          availableCells.push({
            row: row.id,
            cell: parseInt(cellKey),
          });
        }
      });
    });

    if (availableCells.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const { row, cell } = availableCells[randomIndex];
    const randomLetter =
      KEY_LETTERS[Math.floor(Math.random() * KEY_LETTERS.length)];

    return { letter: randomLetter, row, cell };
  }, []);

  // Initialize keys on mount
  useEffect(() => {
    const keys: ActiveKey[] = [];

    for (let i = 0; i < 3; i++) {
      const newKey = generateNewKey(keys);
      if (newKey) {
        keys.push(newKey);
      }
    }

    setActualKeys(keys);
  }, [generateNewKey]);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameOverRef.current) return;

      const keyPressed = event.key.toUpperCase();

      // Find all cells with this letter and check which are under mouse
      const cellsWithLetter: Array<{
        cellId: string;
        rowId: number;
        cellKey: string;
        isMouseOver: boolean;
      }> = [];

      rows.forEach((row) => {
        Object.entries(row.cells).forEach(([cellKey, value]) => {
          if (value === keyPressed) {
            const cellId = `${row.id}-${cellKey}`;
            const element = document.getElementById(cellId);
            const rect = element?.getBoundingClientRect();

            if (rect) {
              const isMouseOver =
                mousePos.x >= rect.left &&
                mousePos.x <= rect.right &&
                mousePos.y >= rect.top &&
                mousePos.y <= rect.bottom;

              cellsWithLetter.push({
                cellId,
                rowId: row.id,
                cellKey,
                isMouseOver,
              });
            }
          }
        });
      });

      // Process only cells under mouse
      const cellsUnderMouse = cellsWithLetter.filter((c) => c.isMouseOver);

      if (cellsUnderMouse.length > 0) {
        // Correct: at least one cell with this letter under mouse
        cellsUnderMouse.forEach((cell) => {
          setCorrectCells((prev) => new Set(prev).add(cell.cellId));
          onScore();

          // Remove feedback and replace key after 100ms
          setTimeout(() => {
            setCorrectCells((prev) => {
              const next = new Set(prev);
              next.delete(cell.cellId);
              return next;
            });

            setActualKeys((prev) => {
              const filtered = prev.filter(
                (k) => !(k.row === cell.rowId && k.cell === parseInt(cell.cellKey))
              );
              const newKey = generateNewKey(filtered);
              return newKey ? [...filtered, newKey] : filtered;
            });
          }, 100);
        });
      } else if (cellsWithLetter.length > 0) {
        // Wrong: letter exists but not under mouse
        cellsWithLetter.forEach((cell) => {
          setWrongCells((prev) => new Set(prev).add(cell.cellId));

          setTimeout(() => {
            setWrongCells((prev) => {
              const next = new Set(prev);
              next.delete(cell.cellId);
              return next;
            });
          }, 150);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rows, mousePos, onScore, generateNewKey]);

  // Update rows based on actualKeys
  useEffect(() => {
    const newRows = INITIAL_ROWS.map((row) => ({
      ...row,
      cells: { ...row.cells },
    }));

    actualKeys.forEach(({ letter, row, cell }) => {
      newRows[row - 1].cells[cell as keyof (typeof newRows)[0]['cells']] =
        letter;
    });

    setRows(newRows);
  }, [actualKeys]);

  const renderRows = useCallback(() => {
    return rows.map((row) => {
      return (
        <div className={styles.row} key={row.id}>
          {Object.entries(row.cells).map(([cellKey, value]) => {
            const cellId = `${row.id}-${cellKey}`;
            const isCorrect = correctCells.has(cellId);
            const isWrong = wrongCells.has(cellId);

            return (
              <div
                className={`${styles.cell} ${isCorrect ? styles.correct : ''} ${isWrong ? styles.wrong : ''}`}
                key={cellKey}
                id={cellId}
              >
                {value}
              </div>
            );
          })}
        </div>
      );
    });
  }, [rows, correctCells, wrongCells]);

  return (
    <div className={styles.gameContainer}>
      <div className={styles.header}>
        <div className={styles.scoreDisplay}>
          <span className={styles.scoreLabel}>Score:</span>
          <span className={styles.scoreValue}>{score}</span>
          <span className={styles.separator}>|</span>
          <span className={styles.scoreLabel}>APM:</span>
          <span className={styles.apmValue}>{apm}</span>
        </div>
        <span className={`${styles.timer} ${timeLeft <= 5 ? styles.timerWarning : ''}`}>
          {timeLeft}s
        </span>
        <button className={styles.backButton} onClick={() => onBackToMenu(apm)} disabled={gameOver}>
          Back to Menu
        </button>
      </div>
      <div className={styles.container}>
        {renderRows()}
        {gameOver && (
          <div className={styles.overlay}>
            <h2 className={styles.overlayTitle}>Time's up!</h2>
            <div className={styles.overlayStats}>
              <div className={styles.overlayStat}>
                <span className={styles.overlayLabel}>APM</span>
                <span className={styles.overlayValue}>{apm}</span>
              </div>
              <div className={styles.overlayStat}>
                <span className={styles.overlayLabel}>Score</span>
                <span className={styles.overlayValue}>{score}</span>
              </div>
            </div>
            <button className={styles.overlayButton} onClick={() => onBackToMenu(apm)}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
