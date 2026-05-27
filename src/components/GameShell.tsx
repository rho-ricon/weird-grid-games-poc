import type { ComponentType } from 'react';

export type GameDefinition = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  component: ComponentType;
};

export function GameShell({
  games,
  activeGameId,
}: {
  games: GameDefinition[];
  activeGameId: string;
}) {
  const activeGame = games.find((game) => game.id === activeGameId) || games[0];
  const ActiveGame = activeGame.component;

  return (
    <div className="appShell">
      <header className="suiteHeader">
        <div>
          <p className="eyebrow">tiny suite prototype</p>
          <h1>Weird Grid Games</h1>
        </div>
        <div className="suiteBadge">{games.length} game for now</div>
      </header>

      <main className="suiteMain">
        <aside className="gameRail" aria-label="Games">
          {games.map((game) => (
            <button
              className="gameTab"
              data-active={game.id === activeGame.id ? 'true' : undefined}
              type="button"
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
              <p className="eyebrow">first square toy</p>
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
