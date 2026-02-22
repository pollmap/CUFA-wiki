import React, { useState, useCallback, useMemo, useRef } from 'react';
import type { AssetClass, AssetAllocation, Scenario, RoundResult, Ranking } from './types';
import { ASSET_CLASSES, ASSET_LABELS, ASSET_COLORS, INITIAL_CAPITAL, ROUNDS_PER_GAME } from './types';
import { rankings, selectRandomScenarios } from './scenarios';

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatKRW(value: number): string {
  if (value < 0) return `-${formatKRW(-value)}`;
  if (value >= 100_000_000) {
    const eok = Math.floor(value / 100_000_000);
    const remainder = value % 100_000_000;
    if (remainder === 0) return `${eok}억원`;
    const man = Math.floor(remainder / 10_000);
    return `${eok}억 ${man.toLocaleString()}만원`;
  }
  if (value >= 10_000) {
    const man = Math.floor(value / 10_000);
    return `${man.toLocaleString()}만원`;
  }
  return `${value.toLocaleString()}원`;
}

function calculatePortfolioReturn(allocation: AssetAllocation, returns: AssetAllocation): number {
  let totalReturn = 0;
  for (const asset of ASSET_CLASSES) {
    totalReturn += (allocation[asset] / 100) * returns[asset];
  }
  return totalReturn;
}

function getRanking(returnPercent: number): Ranking {
  for (const rank of rankings) {
    if (returnPercent >= rank.minReturn) return rank;
  }
  return rankings[rankings.length - 1];
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 900, margin: '0 auto', fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif" },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: 'none' },
  title: { fontSize: 24, fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#a0a0a0', margin: 0 },
  portfolioBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px 20px', marginBottom: 16, flexWrap: 'wrap' as const, gap: 8 },
  roundBadge: { display: 'inline-block', background: '#ffffff', color: '#000000', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600 },
  yearBadge: { display: 'inline-block', background: 'rgba(255,255,255,0.06)', color: '#cccccc', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, marginLeft: 8 },
  scenarioTitle: { fontSize: 20, fontWeight: 700, margin: '8px 0' },
  headline: { fontSize: 15, fontWeight: 600, color: '#ef4444', margin: '12px 0 8px 0', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, borderLeft: '4px solid #ef4444' },
  descriptionText: { fontSize: 14, lineHeight: 1.7, margin: '12px 0' },
  sectionLabel: { fontSize: 14, fontWeight: 700, color: '#cccccc', marginBottom: 10, marginTop: 16 },
  confirmButton: { width: '100%', padding: '14px', border: 'none', borderRadius: 10, background: '#ffffff', color: '#000000', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  confirmButtonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  nextButton: { width: '100%', padding: '14px', border: 'none', borderRadius: 10, background: 'rgba(255,255,255,0.9)', color: '#000000', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 12 },
  restartButton: { display: 'block', width: '100%', padding: '14px', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 10, background: 'transparent', color: '#ffffff', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 16 },
  startButton: { display: 'block', width: '100%', padding: '16px', border: 'none', borderRadius: 12, background: '#ffffff', color: '#000000', fontSize: 17, fontWeight: 700, cursor: 'pointer', marginTop: 20 },
  progressBar: { width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 16, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#ffffff', borderRadius: 3, transition: 'width 0.3s ease' },
  divider: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '16px 0' },
  chartContainer: { background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 16, marginBottom: 16 },
  sliderContainer: { marginBottom: 12 },
  slider: { width: '100%', cursor: 'pointer' },
  allocationGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 },
  allocationItem: { padding: '12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' },
  resultBox: { borderRadius: 10, padding: 16, marginTop: 16, marginBottom: 16 },
  resultPositive: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' },
  resultNegative: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' },
};

// ─── PortfolioChart ──────────────────────────────────────────────────────────

interface PortfolioChartProps {
  portfolioHistory: number[];
  totalReturn: number;
  currentRound: number;
  totalRounds: number;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ portfolioHistory, totalReturn, currentRound, totalRounds }) => {
  const maxValue = Math.max(...portfolioHistory, INITIAL_CAPITAL);
  const minValue = Math.min(...portfolioHistory, 0);
  const range = maxValue - minValue || 1;
  const height = 120;
  const width = 100;

  const points = portfolioHistory.map((value, index) => {
    const x = (index / Math.max(portfolioHistory.length - 1, 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={styles.chartContainer}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>포트폴리오 가치 변화</div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 120 }}>
        {/* Grid lines */}
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="0" y1="0" x2={width} y2="0" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
        <line x1="0" y1={height} x2={width} y2={height} stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />

        {/* Initial capital line */}
        <line x1="0" y1={height - ((INITIAL_CAPITAL - minValue) / range) * height} x2={width} y2={height - ((INITIAL_CAPITAL - minValue) / range) * height} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" strokeDasharray="4,2" />

        {/* Portfolio line */}
        <polyline fill="none" stroke={totalReturn >= 0 ? '#10b981' : '#ef4444'} strokeWidth="2" points={points} />

        {/* Current point */}
        {portfolioHistory.length > 0 && (
          <circle
            cx={(portfolioHistory.length - 1) / Math.max(portfolioHistory.length - 1, 1) * width}
            cy={height - ((portfolioHistory[portfolioHistory.length - 1] - minValue) / range) * height}
            r="3"
            fill={totalReturn >= 0 ? '#10b981' : '#ef4444'}
          />
        )}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#a0a0a0', marginTop: 4 }}>
        <span>시작</span>
        <span>현재 (R{currentRound + 1}/{totalRounds})</span>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

type GamePhase = 'intro' | 'playing' | 'result' | 'summary';

export default function MarketSurvivor(): JSX.Element {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [portfolio, setPortfolio] = useState(INITIAL_CAPITAL);
  const [allocation, setAllocation] = useState<AssetAllocation>({ stocks: 60, bonds: 20, gold: 10, cash: 10, realestate: 0 });
  const [results, setResults] = useState<RoundResult[]>([]);
  const [showingResult, setShowingResult] = useState(false);
  const [currentChange, setCurrentChange] = useState(0);
  const [portfolioHistory, setPortfolioHistory] = useState<number[]>([INITIAL_CAPITAL]);
  const activeScenarios = useRef<Scenario[]>(selectRandomScenarios(ROUNDS_PER_GAME));

  const totalAllocation = useMemo(() => {
    return allocation.stocks + allocation.bonds + allocation.gold + allocation.cash + allocation.realestate;
  }, [allocation]);

  const resetGame = useCallback(() => {
    activeScenarios.current = selectRandomScenarios(ROUNDS_PER_GAME);
    setPhase('intro');
    setCurrentRound(0);
    setPortfolio(INITIAL_CAPITAL);
    setAllocation({ stocks: 60, bonds: 20, gold: 10, cash: 10, realestate: 0 });
    setResults([]);
    setShowingResult(false);
    setCurrentChange(0);
    setPortfolioHistory([INITIAL_CAPITAL]);
  }, []);

  const startGame = useCallback(() => {
    setPhase('playing');
    setCurrentRound(0);
    setPortfolio(INITIAL_CAPITAL);
    setResults([]);
    setPortfolioHistory([INITIAL_CAPITAL]);
  }, []);

  const handleAllocationChange = (asset: AssetClass, value: number) => {
    const currentOthers = totalAllocation - allocation[asset];
    const maxAllowed = 100 - currentOthers;
    const newValue = Math.min(value, maxAllowed);
    setAllocation(prev => ({ ...prev, [asset]: newValue }));
  };

  const submitDecision = useCallback(() => {
    if (totalAllocation !== 100) return;

    const scenario = activeScenarios.current[currentRound];
    const returnPercent = calculatePortfolioReturn(allocation, scenario.returns);
    const changeAmount = Math.round(portfolio * (returnPercent / 100));
    const newPortfolio = Math.max(0, portfolio + changeAmount);

    setCurrentChange(changeAmount);
    setPortfolio(newPortfolio);
    setPortfolioHistory(prev => [...prev, newPortfolio]);
    setResults(prev => [...prev, {
      scenarioId: scenario.id,
      allocation: { ...allocation },
      portfolioChange: changeAmount,
      portfolioAfter: newPortfolio,
      returns: scenario.returns,
    }]);
    setShowingResult(true);
  }, [allocation, currentRound, portfolio, totalAllocation]);

  const nextRound = useCallback(() => {
    if (currentRound + 1 >= activeScenarios.current.length) {
      setPhase('summary');
    } else {
      setCurrentRound(prev => prev + 1);
      setShowingResult(false);
    }
  }, [currentRound]);

  const totalReturn = ((portfolio - INITIAL_CAPITAL) / INITIAL_CAPITAL) * 100;

  // Intro Screen
  if (phase === 'intro') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={styles.title}>Market Survivor</h2>
            <p style={styles.subtitle}>100년 투자 시뮬레이션 - 1929~2024</p>
          </div>

          <p style={styles.descriptionText}>
            1929년 대공황부터 2024년까지, 100년간 금융 역사의 결정적 순간 50개 중 무작위로 10개를 시간순으로 경험합니다.
            플레이할 때마다 다른 시나리오가 선택되어 매번 새로운 도전이 됩니다.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>게임 정보</div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
              <li><strong>시작 자본:</strong> 1억원</li>
              <li><strong>총 라운드:</strong> 10라운드 (50개 중 랜덤 선택, 시간순 진행)</li>
              <li><strong>자산군:</strong> 주식, 채권, 금, 현금, 부동산</li>
              <li><strong>목표:</strong> 최대 수익률 달성</li>
            </ul>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
            {ASSET_CLASSES.map(asset => (
              <div key={asset} style={{ textAlign: 'center', padding: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: ASSET_COLORS[asset], margin: '0 auto 4px' }} />
                <div style={{ fontSize: 12, fontWeight: 600 }}>{ASSET_LABELS[asset]}</div>
              </div>
            ))}
          </div>

          <button style={styles.startButton} onClick={startGame}>
            게임 시작하기
          </button>
        </div>
      </div>
    );
  }

  // Summary Screen
  if (phase === 'summary') {
    const ranking = getRanking(totalReturn);

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={styles.title}>게임 결과</h2>
          </div>

          <div style={{ textAlign: 'center', padding: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 12, marginBottom: 20, border: '2px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 32, fontWeight: 800 }}>{ranking.grade}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#e5e5e5' }}>{ranking.title}</div>
            <p style={{ fontSize: 14, color: '#cccccc', margin: '8px 0 0' }}>{ranking.description}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontSize: 24, fontWeight: 800, margin: 0, color: totalReturn >= 0 ? '#10b981' : '#ef4444' }}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
              </p>
              <p style={{ fontSize: 12, color: '#a0a0a0', margin: '4px 0 0' }}>총 수익률</p>
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{formatKRW(portfolio)}</p>
              <p style={{ fontSize: 12, color: '#a0a0a0', margin: '4px 0 0' }}>최종 자산</p>
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{activeScenarios.current.length}R</p>
              <p style={{ fontSize: 12, color: '#a0a0a0', margin: '4px 0 0' }}>총 라운드</p>
            </div>
          </div>

          <PortfolioChart
            portfolioHistory={portfolioHistory}
            totalReturn={totalReturn}
            currentRound={currentRound}
            totalRounds={activeScenarios.current.length}
          />

          <button style={styles.restartButton} onClick={resetGame}>
            다시 도전하기
          </button>
        </div>
      </div>
    );
  }

  // Playing Screen
  const scenario = activeScenarios.current[currentRound];

  return (
    <div style={styles.container}>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${((currentRound + (showingResult ? 1 : 0)) / activeScenarios.current.length) * 100}%` }} />
      </div>

      <div style={styles.portfolioBar}>
        <div>
          <div style={{ fontSize: 12, color: '#a0a0a0' }}>현재 자산</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: portfolio >= INITIAL_CAPITAL ? '#10b981' : '#ef4444' }}>
            {formatKRW(portfolio)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#a0a0a0' }}>수익률</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: totalReturn >= 0 ? '#10b981' : '#ef4444' }}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
          </div>
        </div>
      </div>

      <PortfolioChart
        portfolioHistory={portfolioHistory}
        totalReturn={totalReturn}
        currentRound={currentRound}
        totalRounds={activeScenarios.current.length}
      />

      <div style={styles.card}>
        <div>
          <span style={styles.roundBadge}>Round {currentRound + 1} / {activeScenarios.current.length}</span>
          <span style={styles.yearBadge}>{scenario.year}</span>
        </div>

        <h3 style={styles.scenarioTitle}>{scenario.title}</h3>
        <div style={styles.headline}>{scenario.headline}</div>
        <p style={styles.descriptionText}>{scenario.description}</p>
        <div style={{ fontSize: 13, color: '#a0a0a0', marginBottom: 16 }}>{scenario.marketContext}</div>

        {!showingResult ? (
          <>
            <hr style={styles.divider} />
            <p style={styles.sectionLabel}>자산 배분 결정 (합계 100%)</p>

            <div style={styles.allocationGrid}>
              {ASSET_CLASSES.map(asset => (
                <div key={asset} style={styles.allocationItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: ASSET_COLORS[asset] }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{ASSET_LABELS[asset]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={allocation[asset]}
                    onChange={(e) => handleAllocationChange(asset, parseInt(e.target.value))}
                    style={styles.slider}
                  />
                  <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
                    {allocation[asset]}%
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', margin: '16px 0', padding: '10px', background: totalAllocation === 100 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', borderRadius: 8 }}>
              <span style={{ fontWeight: 600 }}>총 배분: {totalAllocation}%</span>
              {totalAllocation !== 100 && <span style={{ color: '#f59e0b', marginLeft: 8 }}>(100%가 되어야 합니다)</span>}
            </div>

            <button
              style={{ ...styles.confirmButton, ...(totalAllocation !== 100 ? styles.confirmButtonDisabled : {}) }}
              onClick={submitDecision}
              disabled={totalAllocation !== 100}
            >
              결정 확정
            </button>
          </>
        ) : (
          <>
            <hr style={styles.divider} />
            <div style={{ ...styles.resultBox, ...(currentChange >= 0 ? styles.resultPositive : styles.resultNegative) }}>
              <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>
                {currentChange >= 0 ? '수익 발생!' : '손실 발생'}
              </p>
              <p style={{ fontSize: 14, margin: '4px 0' }}>
                <strong>포트폴리오 변동:</strong>{' '}
                <span style={{ fontWeight: 700, color: currentChange >= 0 ? '#10b981' : '#ef4444' }}>
                  {currentChange >= 0 ? '+' : ''}{formatKRW(currentChange)} ({currentChange >= 0 ? '+' : ''}{(portfolio - currentChange) !== 0 ? ((currentChange / (portfolio - currentChange)) * 100).toFixed(1) : '0.0'}%)
                </span>
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>자산별 수익률</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, fontSize: 12 }}>
                {ASSET_CLASSES.map(asset => (
                  <div key={asset} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{ASSET_LABELS[asset]}</div>
                    <div style={{ color: scenario.returns[asset] >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                      {scenario.returns[asset] >= 0 ? '+' : ''}{scenario.returns[asset]}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 6px' }}>실제 결과</p>
              <p style={{ fontSize: 13, margin: '0 0 8px' }}>{scenario.actualOutcome}</p>
              <p style={{ fontSize: 12, color: '#a0a0a0', margin: 0 }}>{scenario.explanation}</p>
            </div>

            <button style={styles.nextButton} onClick={nextRound}>
              {currentRound + 1 < activeScenarios.current.length ? `다음 라운드 (Round ${currentRound + 2})` : '최종 결과 보기'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
