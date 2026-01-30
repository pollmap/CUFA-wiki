import React, { useState, useEffect, useMemo } from 'react';
import { useQuiz } from './QuizContainer';
import styles from './QuizStyles.module.css';

interface Pair {
  left: string;
  right: string;
}

interface MatchingGameProps {
  pairs: Pair[];
  title?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ pairs, title }) => {
  const { reportAnswer, resetKey } = useQuiz();

  const shuffledLeft = useMemo(() => shuffle(pairs.map((p) => p.left)), [resetKey, pairs]);
  const shuffledRight = useMemo(() => shuffle(pairs.map((p) => p.right)), [resetKey, pairs]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    setSelectedLeft(null);
    setMatched({});
    setWrongFlash(null);
    setDragItem(null);
    setReported(false);
  }, [resetKey]);

  const pairMap = useMemo(() => {
    const m: Record<string, string> = {};
    pairs.forEach((p) => { m[p.left] = p.right; });
    return m;
  }, [pairs]);

  const matchedLeftSet = new Set(Object.keys(matched));
  const matchedRightSet = new Set(Object.values(matched));

  const allMatched = Object.keys(matched).length === pairs.length;

  useEffect(() => {
    if (allMatched && !reported) {
      setReported(true);
      reportAnswer(true);
    }
  }, [allMatched, reported, reportAnswer]);

  const tryMatch = (left: string, right: string) => {
    if (pairMap[left] === right) {
      setMatched((prev) => ({ ...prev, [left]: right }));
      setSelectedLeft(null);
    } else {
      setWrongFlash(right);
      setTimeout(() => setWrongFlash(null), 500);
    }
  };

  const handleLeftClick = (item: string) => {
    if (matchedLeftSet.has(item)) return;
    setSelectedLeft(item === selectedLeft ? null : item);
  };

  const handleRightClick = (item: string) => {
    if (matchedRightSet.has(item) || !selectedLeft) return;
    tryMatch(selectedLeft, item);
  };

  // drag-and-drop
  const handleDragStart = (item: string) => {
    setDragItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (rightItem: string) => {
    if (dragItem && !matchedRightSet.has(rightItem)) {
      tryMatch(dragItem, rightItem);
    }
    setDragItem(null);
  };

  const leftItemClass = (item: string) => {
    const classes = [styles.matchingItem];
    if (matchedLeftSet.has(item)) classes.push(styles.matchedItem, styles.matchingItemDisabled);
    else if (item === selectedLeft) classes.push(styles.matchingItemSelected);
    if (item === dragItem) classes.push(styles.matchingItemDragging);
    return classes.join(' ');
  };

  const rightItemClass = (item: string) => {
    const classes = [styles.matchingTarget];
    if (matchedRightSet.has(item)) classes.push(styles.matchedItem, styles.matchingItemDisabled);
    if (wrongFlash === item) classes.push(styles.matchedWrong);
    if (selectedLeft && !matchedRightSet.has(item)) classes.push(styles.matchingTargetActive);
    return classes.join(' ');
  };

  return (
    <div className={`${styles.questionBlock} ${allMatched ? styles.answered : ''}`}>
      {title && <div className={styles.matchingTitle}>{title}</div>}

      <div className={styles.matchingBoard}>
        <div className={styles.matchingColumn}>
          <div className={styles.matchingColumnLabel}>용어</div>
          {shuffledLeft.map((item) => (
            <div
              key={item}
              className={leftItemClass(item)}
              draggable={!matchedLeftSet.has(item)}
              onDragStart={() => handleDragStart(item)}
              onClick={() => handleLeftClick(item)}
            >
              {item}
            </div>
          ))}
        </div>

        <div className={styles.matchingColumn}>
          <div className={styles.matchingColumnLabel}>정의</div>
          {shuffledRight.map((item) => (
            <div
              key={item}
              className={rightItemClass(item)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(item)}
              onClick={() => handleRightClick(item)}
            >
              {matchedRightSet.has(item) ? item : selectedLeft ? '여기에 놓기' : item}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.matchingScore}>
        {Object.keys(matched).length} / {pairs.length} 매칭 완료
      </div>
    </div>
  );
};
