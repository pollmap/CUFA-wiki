import React, { useState, useEffect } from 'react';
import { useQuiz } from './QuizContainer';
import styles from './QuizStyles.module.css';

interface TrueFalseProps {
  statement: string;
  answer: boolean;
  explanation: string;
}

export const TrueFalse: React.FC<TrueFalseProps> = ({
  statement,
  answer,
  explanation,
}) => {
  const { reportAnswer, resetKey } = useQuiz();
  const [selected, setSelected] = useState<boolean | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [resetKey]);

  const answered = selected !== null;
  const isCorrect = selected === answer;

  const handleSelect = (value: boolean) => {
    if (answered) return;
    setSelected(value);
    reportAnswer(value === answer);
  };

  const getTfClass = (value: boolean) => {
    const base = [styles.tfButton];
    base.push(value ? styles.tfButtonTrue : styles.tfButtonFalse);
    if (answered) {
      base.push(styles.tfDisabled);
      if (value === answer) base.push(styles.tfCorrect);
      else if (value === selected) base.push(styles.tfWrong);
    }
    return base.join(' ');
  };

  return (
    <div className={`${styles.questionBlock} ${answered ? styles.answered : ''}`}>
      <div className={styles.questionText}>{statement}</div>

      <div className={styles.tfButtonGroup}>
        <button
          className={getTfClass(true)}
          onClick={() => handleSelect(true)}
          disabled={answered}
        >
          O (참)
        </button>
        <button
          className={getTfClass(false)}
          onClick={() => handleSelect(false)}
          disabled={answered}
        >
          X (거짓)
        </button>
      </div>

      {answered && (
        <div
          className={`${styles.explanationBox} ${
            isCorrect ? styles.explanationCorrect : styles.explanationWrong
          }`}
        >
          <div className={styles.explanationLabel}>
            {isCorrect ? '정답입니다!' : `오답입니다. 정답: ${answer ? 'O (참)' : 'X (거짓)'}`}
          </div>
          {explanation}
        </div>
      )}
    </div>
  );
};
