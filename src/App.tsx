import { GameShell } from './components/GameShell';
import { games } from './games/catalog';

export default function App() {
  return <GameShell games={games} initialGameId="eight" />;
}
