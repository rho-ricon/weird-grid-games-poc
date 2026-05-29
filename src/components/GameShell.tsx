import { type ComponentType, useEffect, useState } from 'react';

export type GameDefinition = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  component: ComponentType;
};

const activeGameStorageKey = 'weird-grid-games:active-game';

export function GameShell({
  games,
  initialGameId,
}: {
  games: GameDefinition[];
  initialGameId?: string;
}) {
  const [activeGameId, setActiveGameId] = useState(
    () => readSavedActiveGameId(games) || initialGameId || games[0]?.id,
  );
  const activeGame = games.find((game) => game.id === activeGameId) || games[0];
  const ActiveGame = activeGame.component;

  useEffect(() => {
    writeSavedActiveGameId(activeGame.id);
  }, [activeGame.id]);
  const gameCountLabel = `${games.length} game${games.length === 1 ? '' : 's'} now`;

  return (
    <div className="appShell">
      <header className="suiteHeader">
        <div>
          <p className="eyebrow">tiny suite prototype</p>
          <h1>Weird Grid Games</h1>
        </div>
        <div className="suiteBadge">{gameCountLabel}</div>
      </header>

      <main className="suiteMain">
        <aside className="gameRail" aria-label="Games">
          {games.map((game) => (
            <button
              className="gameTab"
              data-active={game.id === activeGame.id ? 'true' : undefined}
              type="button"
              onClick={() => setActiveGameId(game.id)}
              key={game.id}
            >
              <span>{game.title}</span>
              <small>{game.tagline}</small>
            </button>
          ))}
          <p className="futureNote">More odd little grid games can land here later.</p>
        </aside>

        <section className="gameStage" aria-labelledby="active-game-title">
          <div className="gameStageHeader">
            <div>
              <p className="eyebrow">square toy</p>
              <h2 id="active-game-title">{activeGame.title}</h2>
            </div>
            <p>{activeGame.description}</p>
          </div>
          <ActiveGame />
        </section>
      </main>
    </div>
  );
}

function readSavedActiveGameId(games: GameDefinition[]) {
  try {
    const savedGameId = localStorage.getItem(activeGameStorageKey);

    if (!savedGameId || !games.some((game) => game.id === savedGameId)) return null;

    return savedGameId;
  } catch {
    return null;
  }
}

function writeSavedActiveGameId(gameId: string) {
  try {
    localStorage.setItem(activeGameStorageKey, gameId);
  } catch {
    // localStorage can be unavailable in private/restricted browsing; the suite still works.
  }
}
