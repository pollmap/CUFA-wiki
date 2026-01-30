import React, { useState, useEffect } from 'react';
import { useQuiz } from './QuizContainer';
import styles from './QuizStyles.module.css';

interface CalculationExerciseProps {
  question: string;
  answer: number;
  tolerance?: number;
  unit?: string;
  hint?: string;
  explanation: string;
}

export const CalculationExercise: React.FC<CalculationExerciseProps> = ({
  question,
  answer,
  tolerance = 0.01,
  unit,
  hint,
  explanation,
}) => {
  const { reportAnswer, resetKey } = useQuiz();
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setInput('');
    setSubmitted(false);
    setShowHint(false);
  }, [resetKey]);

  const numValue = parseFloat(input);
  const isCorrect = submitted && !isNaN(numValue) && Math.abs(numValue - answer) <= Math.abs(answer * tolerance);

  const handleSubmit = () => {
    if (submitted || input.trim() === '') return;
    setSubmitted(true);
    const val = parseFloat(input);
    reportAnswer(!isNaN(val) && Math.abs(val - answer) <= Math.abs(answer * tolerance));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const inputClass = [styles.calcInput];
  if (submitted) {
    inputClass.push(styles.calcInputDisabled);
    inputClass.push(isCorrect ? styles.calcCorrect : styles.calcWrong);
  }

  return (
    <div className={`${styles.questionBlock} ${submitted ? styles.answered : ''}`}>
      <div className={styles.questionText}>{question}</div>

      {hint && !submitted && !showHint && (
        <button className={styles.hintButton} onClick={() => setShowHint(true)}>
          힌트 보기
        </button>
      )}
      {showHint && !submitted && (
        <div className={styles.hintBox}>{hint}</div>
      )}

      <div className={styles.calcInputRow}>
        <input
          className={inputClass.join(' ')}
          type="number"
          step="any"
          value={input}
          onChange={(e) => !submitted && setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="답을 입력하십시오"
          disabled={submitted}
        />
        {unit && <span className={styles.calcUnit}>{unit}</span>}
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={submitted || input.trim() === ''}
        >
          제출
        </button>
      </div>

      {submitted && (
        <div
          className={`${styles.explanationBox} ${
            isCorrect ? styles.explanationCorrect : styles.explanationWrong
          }`}
        >
          <div className={styles.explanationLabel}>
            {isCorrect
              ? '정답입니다!'
              : `오답입니다. 정답: ${answer.toLocaleString()}${unit ? ` ${unit}` : ''}`}
          </div>
          {explanation}
        </div>
      )}
    </div>
  );
};
