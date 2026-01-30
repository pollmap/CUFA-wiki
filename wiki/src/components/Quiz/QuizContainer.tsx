import React, { useState, createContext, useContext, useCallback } from 'react';
import styles from './QuizStyles.module.css';

interface QuizState {
  answered: number;
  correct: number;
  total: number;
  reportAnswer: (isCorrect: boolean) => void;
  resetKey: number;
}

export const QuizContext = createContext<QuizState>({
  answered: 0,
  correct: 0,
  total: 0,
  reportAnswer: () => {},
  resetKey: 0,
});

export const useQuiz = () => useContext(QuizContext);

interface QuizContainerProps {
  title: string;
  totalQuestions: number;
  children: React.ReactNode;
}

export const QuizContainer: React.FC<QuizContainerProps> = ({
  title,
  totalQuestions,
  children,
}) => {
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const reportAnswer = useCallback((isCorrect: boolean) => {
    setAnswered((a) => a + 1);
    if (isCorrect) setCorrect((c) => c + 1);
  }, []);

  const handleRetry = () => {
    setAnswered(0);
    setCorrect(0);
    setResetKey((k) => k + 1);
  };

  const progress = totalQuestions > 0 ? (answered / totalQuestions) * 100 : 0;
  const allDone = answered >= totalQuestions;

  const getGrade = () => {
    const pct = (correct / totalQuestions) * 100;
    if (pct >= 90) return '탁월';
    if (pct >= 70) return '우수';
    if (pct >= 50) return '보통';
    return '재도전 권장';
  };

  return (
    <QuizContext.Provider
      value={{ answered, correct, total: totalQuestions, reportAnswer, resetKey }}
    >
      <div className={styles.quizContainer}>
        <div className={styles.quizHeader}>
          <h3 className={styles.quizTitle}>{title}</h3>
          <span className={styles.scoreDisplay}>
            {correct} / {totalQuestions} 정답
          </span>
        </div>

        <div className={styles.progressBarWrapper}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${progress}%` }}
          />
        </div>

        {children}

        {allDone && (
          <div className={styles.scoreSummary}>
            <div className={styles.scoreSummaryTitle}>학습 결과</div>
            <div className={styles.scoreSummaryValue}>
              {Math.round((correct / totalQuestions) * 100)}%
            </div>
            <div className={styles.scoreSummaryLabel}>
              {totalQuestions}문제 중 {correct}문제 정답 — {getGrade()}
            </div>
            <button className={styles.retryButton} onClick={handleRetry}>
              다시 풀기
            </button>
          </div>
        )}
      </div>
    </QuizContext.Provider>
  );
};
