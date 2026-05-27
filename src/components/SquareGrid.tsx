import type { ReactNode } from 'react';

export function SquareGrid<T>({
  items,
  columns,
  getKey,
  getLabel,
  getStatus,
  getIsEmpty,
  onPick,
}: {
  items: T[];
  columns: number;
  getKey: (item: T) => string | number;
  getLabel: (item: T) => ReactNode;
  getStatus: (item: T) => string;
  getIsEmpty?: (item: T) => boolean;
  onPick?: (item: T) => void;
}) {
  return (
    <div
      className="squareGrid"
      style={{ gridTemplateColumns: `repeat(${columns}, var(--square-size))` }}
    >
      {items.map((item) => {
        const isEmpty = getIsEmpty?.(item) || false;
        const status = getStatus(item);

        if (isEmpty) {
          return (
            <div
              className="square squareEmpty"
              data-status={status}
              aria-hidden="true"
              key={getKey(item)}
            />
          );
        }

        return (
          <button
            className="square"
            data-status={status}
            type="button"
            onClick={() => onPick?.(item)}
            key={getKey(item)}
          >
            {getLabel(item)}
          </button>
        );
      })}
    </div>
  );
}
