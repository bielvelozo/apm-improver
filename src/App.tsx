import { useState } from 'react';
import Menu from './components/menu';
import Table from './components/table';
import type { GameState } from './types/game';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [lastApm, setLastApm] = useState(0);

  function handleStart() {
    setScore(0);
    setGameState('playing');
  }

  function handleScore() {
    setScore((prev) => prev + 1);
  }

  function handleBackToMenu(apm: number) {
    setLastApm(apm);
    setGameState('menu');
  }

  return (
    <>
      {gameState === 'menu' ? (
        <Menu score={score} apm={lastApm} onStart={handleStart} />
      ) : (
        <Table score={score} onScore={handleScore} onBackToMenu={handleBackToMenu} />
      )}
    </>
  );
}

export default App;
