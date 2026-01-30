import React, { useState, useEffect } from 'react';
import { useQuiz } from './QuizContainer';
import styles from './QuizStyles.module.css';

interface MultipleChoiceProps {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  hint?: string;
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  question,
  options,
  answer,
  explanation,
  hint,
}) => {
  const { reportAnswer, resetKey } = useQuiz();
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setSelected(null);
    setShowHint(false);
  }, [resetKey]);

  const answered = selected !== null;
  const isCorrect = selected === answer;

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    reportAnswer(idx === answer);
  };

  const getOptionClass = (idx: number) => {
    const base = styles.optionButton;
    if (!answered) return base;
    const classes = [base, styles.optionDisabled];
    if (idx === answer) classes.push(styles.optionCorrect);
    else if (idx === selected) classes.push(styles.optionWrong);
    return classes.join(' ');
  };

  return (
    <div className={`${styles.questionBlock} ${answered ? styles.answered : ''}`}>
      <div className={styles.questionText}>{question}</div>

      {hint && !answered && !showHint && (
        <button className={styles.hintButton} onClick={() => setShowHint(true)}>
          힌트 보기
        </button>
      )}
      {showHint && !answered && (
        <div className={styles.hintBox}>{hint}</div>
      )}

      <div className={styles.optionsGrid}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            className={getOptionClass(idx)}
            onClick={() => handleSelect(idx)}
            disabled={answered}
          >
            <span className={styles.optionIndex}>{LABELS[idx]}</span>
            <span>{opt}</span>
          </button>
        ))}
      </div>

      {answered && (
        <div
          className={`${styles.explanationBox} ${
            isCorrect ? styles.explanationCorrect : styles.explanationWrong
          }`}
        >
          <div className={styles.explanationLabel}>
            {isCorrect ? '정답입니다!' : `오답입니다. 정답: ${LABELS[answer]}`}
          </div>
          {explanation}
        </div>
      )}
    </div>
  );
};
