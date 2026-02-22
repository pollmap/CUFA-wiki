import React, { useState, useMemo } from 'react';

interface WACCInputs {
  riskFreeRate: number;
  beta: number;
  marketRiskPremium: number;
  costOfDebt: number;
  taxRate: number;
  equityValue: number;
  debtValue: number;
}

const DEFAULT_INPUTS: WACCInputs = {
  riskFreeRate: 3.5,
  beta: 1.2,
  marketRiskPremium: 6.0,
  costOfDebt: 5.0,
  taxRate: 22,
  equityValue: 10000,
  debtValue: 5000,
};

export const WACCCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<WACCInputs>(DEFAULT_INPUTS);

  const result = useMemo(() => {
    const {
      riskFreeRate, beta, marketRiskPremium,
      costOfDebt, taxRate,
      equityValue, debtValue
    } = inputs;

    // CAPM으로 자기자본비용 계산
    const costOfEquity = riskFreeRate + beta * marketRiskPremium;

    // 세후 부채비용
    const afterTaxCostOfDebt = costOfDebt * (1 - taxRate / 100);

    // 자본구조 비중
    const totalValue = equityValue + debtValue;
    const equityWeight = totalValue > 0 ? equityValue / totalValue : 0;
    const debtWeight = totalValue > 0 ? debtValue / totalValue : 0;

    // WACC 계산
    const wacc = equityWeight * costOfEquity + debtWeight * afterTaxCostOfDebt;

    return {
      costOfEquity,
      afterTaxCostOfDebt,
      equityWeight,
      debtWeight,
      wacc,
      totalValue,
    };
  }, [inputs]);

  const handleChange = (field: keyof WACCInputs, value: string) => {
    setInputs({ ...inputs, [field]: parseFloat(value) || 0 });
  };

  return (
    <div className="calculator-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🧮</span>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>WACC 계산기</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* 입력 섹션 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* CAPM 입력 */}
          <div style={{ backgroundColor: 'rgba(96,165,250,0.08)', padding: '1rem', borderRadius: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#60a5fa', marginBottom: '0.75rem' }}>
              자기자본비용 (CAPM)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#60a5fa', marginBottom: '0.25rem' }}>무위험이자율 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.riskFreeRate}
                  onChange={(e) => handleChange('riskFreeRate', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '0.5rem' }}
                />
                <p style={{ fontSize: '0.625rem', color: '#60a5fa', marginTop: '0.25rem' }}>국고채 10년물</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#60a5fa', marginBottom: '0.25rem' }}>베타 (β)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.beta}
                  onChange={(e) => handleChange('beta', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '0.5rem' }}
                />
                <p style={{ fontSize: '0.625rem', color: '#60a5fa', marginTop: '0.25rem' }}>시장 대비 변동성</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#60a5fa', marginBottom: '0.25rem' }}>ERP (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.marketRiskPremium}
                  onChange={(e) => handleChange('marketRiskPremium', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '0.5rem' }}
                />
                <p style={{ fontSize: '0.625rem', color: '#60a5fa', marginTop: '0.25rem' }}>시장위험프리미엄</p>
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '0.25rem', border: '1px solid rgba(96,165,250,0.2)' }}>
              <span style={{ fontSize: '0.875rem', color: '#60a5fa' }}>
                Re = {inputs.riskFreeRate}% + {inputs.beta} × {inputs.marketRiskPremium}% =
                <strong style={{ marginLeft: '0.25rem' }}>{result.costOfEquity.toFixed(2)}%</strong>
              </span>
            </div>
          </div>

          {/* 부채비용 입력 */}
          <div style={{ backgroundColor: 'rgba(245,158,11,0.08)', padding: '1rem', borderRadius: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#f59e0b', marginBottom: '0.75rem' }}>부채비용</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#f59e0b', marginBottom: '0.25rem' }}>세전 부채비용 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.costOfDebt}
                  onChange={(e) => handleChange('costOfDebt', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '0.5rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#f59e0b', marginBottom: '0.25rem' }}>법인세율 (%)</label>
                <input
                  type="number"
                  step="1"
                  value={inputs.taxRate}
                  onChange={(e) => handleChange('taxRate', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '0.5rem' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '0.25rem', border: '1px solid rgba(245,158,11,0.2)' }}>
              <span style={{ fontSize: '0.875rem', color: '#f59e0b' }}>
                Rd(세후) = {inputs.costOfDebt}% × (1 - {inputs.taxRate}%) =
                <strong style={{ marginLeft: '0.25rem' }}>{result.afterTaxCostOfDebt.toFixed(2)}%</strong>
              </span>
            </div>
          </div>

          {/* 자본구조 입력 */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#a0a0a0', marginBottom: '0.75rem' }}>자본구조</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0a0', marginBottom: '0.25rem' }}>시가총액 (억원)</label>
                <input
                  type="number"
                  value={inputs.equityValue}
                  onChange={(e) => handleChange('equityValue', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0a0', marginBottom: '0.25rem' }}>이자부부채 (억원)</label>
                <input
                  type="number"
                  value={inputs.debtValue}
                  onChange={(e) => handleChange('debtValue', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#6b7280' }}>
                E/V = {(result.equityWeight * 100).toFixed(1)}%
              </span>
              <span style={{ color: '#6b7280' }}>
                D/V = {(result.debtWeight * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* WACC 결과 */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: 'white'
          }}>
            <p style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '0.25rem' }}>WACC (가중평균자본비용)</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{result.wacc.toFixed(2)}%</p>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(16,185,129,0.3)', fontSize: '0.875rem' }}>
              <p style={{ color: '#10b981' }}>
                = ({(result.equityWeight * 100).toFixed(0)}% × {result.costOfEquity.toFixed(1)}%) +
                ({(result.debtWeight * 100).toFixed(0)}% × {result.afterTaxCostOfDebt.toFixed(1)}%)
              </p>
            </div>
          </div>

          {/* 자본구조 시각화 */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#a0a0a0', marginBottom: '0.75rem' }}>자본구조</h4>
            <div style={{ height: '1.5rem', display: 'flex', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${result.equityWeight * 100}%`,
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                {result.equityWeight > 0.15 && `E ${(result.equityWeight * 100).toFixed(0)}%`}
              </div>
              <div
                style={{
                  width: `${result.debtWeight * 100}%`,
                  backgroundColor: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                {result.debtWeight > 0.15 && `D ${(result.debtWeight * 100).toFixed(0)}%`}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
              <span>🔵 자기자본</span>
              <span>🟡 부채</span>
            </div>
          </div>

          {/* 분석 요약 */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', padding: '1rem' }}>
            <table style={{ width: '100%', fontSize: '0.875rem' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '0.25rem 0', color: '#6b7280' }}>자기자본비용</td>
                  <td style={{ padding: '0.25rem 0', textAlign: 'right', fontWeight: '500' }}>{result.costOfEquity.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.25rem 0', color: '#6b7280' }}>세후 부채비용</td>
                  <td style={{ padding: '0.25rem 0', textAlign: 'right', fontWeight: '500' }}>{result.afterTaxCostOfDebt.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.25rem 0', color: '#6b7280' }}>D/E Ratio</td>
                  <td style={{ padding: '0.25rem 0', textAlign: 'right', fontWeight: '500' }}>
                    {inputs.equityValue > 0 ? (inputs.debtValue / inputs.equityValue).toFixed(2) : 'N/A'}x
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '0.25rem 0', color: '#6b7280' }}>총 기업가치</td>
                  <td style={{ padding: '0.25rem 0', textAlign: 'right', fontWeight: '500' }}>
                    {result.totalValue.toLocaleString()}억원
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 공식 설명 */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>공식</h4>
            <code style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0a0' }}>
              WACC = (E/V) × Re + (D/V) × Rd × (1-T)
            </code>
            <code style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0a0', marginTop: '0.25rem' }}>
              Re = Rf + β × (Rm - Rf)
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WACCCalculator;
