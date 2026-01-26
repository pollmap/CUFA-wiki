import React, { useState, useMemo } from 'react';

interface BondInputs {
  faceValue: number;
  couponRate: number;
  yearsToMaturity: number;
  marketRate: number;
  paymentFrequency: number;
}

interface BondResult {
  price: number;
  ytm: number;
  currentYield: number;
  macaulayDuration: number;
  modifiedDuration: number;
  convexity: number;
  accruedInterest: number;
  cleanPrice: number;
  dirtyPrice: number;
}

export default function BondCalculator() {
  const [inputs, setInputs] = useState<BondInputs>({
    faceValue: 10000,
    couponRate: 3,
    yearsToMaturity: 5,
    marketRate: 4,
    paymentFrequency: 2,
  });

  const [calcMode, setCalcMode] = useState<'price' | 'ytm'>('price');
  const [targetPrice, setTargetPrice] = useState<number>(9500);

  const result = useMemo<BondResult | null>(() => {
    const { faceValue, couponRate, yearsToMaturity, marketRate, paymentFrequency } = inputs;

    if (faceValue <= 0 || yearsToMaturity <= 0) {
      return null;
    }

    const F = faceValue;
    const c = couponRate / 100;
    const n = yearsToMaturity;
    const r = marketRate / 100;
    const m = paymentFrequency;

    const couponPerPeriod = (F * c) / m;
    const periodsTotal = n * m;
    const ratePerPeriod = r / m;

    // Calculate bond price
    let price = 0;
    let weightedTime = 0;
    let convexitySum = 0;

    for (let t = 1; t <= periodsTotal; t++) {
      const cf = t === periodsTotal ? couponPerPeriod + F : couponPerPeriod;
      const pv = cf / Math.pow(1 + ratePerPeriod, t);
      price += pv;

      const timeInYears = t / m;
      weightedTime += (timeInYears * pv);
      convexitySum += ((t * (t + 1) * pv) / Math.pow(1 + ratePerPeriod, 2));
    }

    // Macaulay Duration
    const macaulayDuration = weightedTime / price;

    // Modified Duration
    const modifiedDuration = macaulayDuration / (1 + ratePerPeriod);

    // Convexity
    const convexity = convexitySum / (price * m * m);

    // Current Yield
    const annualCoupon = F * c;
    const currentYield = (annualCoupon / price) * 100;

    // YTM calculation using Newton-Raphson (for ytm mode)
    let ytm = r;
    if (calcMode === 'ytm' && targetPrice > 0) {
      let guess = r;
      for (let i = 0; i < 100; i++) {
        let priceAtGuess = 0;
        let derivative = 0;
        const guessPerPeriod = guess / m;

        for (let t = 1; t <= periodsTotal; t++) {
          const cf = t === periodsTotal ? couponPerPeriod + F : couponPerPeriod;
          priceAtGuess += cf / Math.pow(1 + guessPerPeriod, t);
          derivative -= (t / m) * cf / Math.pow(1 + guessPerPeriod, t + 1);
        }

        const diff = priceAtGuess - targetPrice;
        if (Math.abs(diff) < 0.0001) break;

        guess = guess - diff / derivative;
        if (guess < 0) guess = 0.001;
      }
      ytm = guess;
    }

    // Accrued interest (assuming we're at period start)
    const accruedInterest = 0;
    const cleanPrice = price;
    const dirtyPrice = price + accruedInterest;

    return {
      price,
      ytm: ytm * 100,
      currentYield,
      macaulayDuration,
      modifiedDuration,
      convexity,
      accruedInterest,
      cleanPrice,
      dirtyPrice,
    };
  }, [inputs, calcMode, targetPrice]);

  const handleInputChange = (field: keyof BondInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs((prev) => ({ ...prev, [field]: numValue }));
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#1a365d',
  };

  const modeToggleStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
  };

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
    backgroundColor: active ? '#1a365d' : '#e2e8f0',
    color: active ? '#ffffff' : '#4a5568',
    transition: 'all 0.2s',
  });

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  };

  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: '#4a5568',
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const resultCardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '16px',
  };

  const priceBoxStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '24px',
    backgroundColor: '#1a365d',
    borderRadius: '12px',
    color: '#ffffff',
    marginBottom: '16px',
  };

  const metricGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  };

  const metricStyle: React.CSSProperties = {
    padding: '16px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    textAlign: 'center',
  };

  const bondStatus =
    result && inputs.marketRate > inputs.couponRate
      ? '할인채 (Discount)'
      : result && inputs.marketRate < inputs.couponRate
        ? '할증채 (Premium)'
        : '액면채 (Par)';

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: '0 0 8px', fontSize: '24px' }}>채권 가치평가 계산기</h2>
        <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>채권 가격, YTM, 듀레이션 계산</p>
      </div>

      <div style={modeToggleStyle}>
        <button style={toggleBtnStyle(calcMode === 'price')} onClick={() => setCalcMode('price')}>
          가격 계산
        </button>
        <button style={toggleBtnStyle(calcMode === 'ytm')} onClick={() => setCalcMode('ytm')}>
          YTM 계산
        </button>
      </div>

      <div style={gridStyle}>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>액면가</label>
          <input
            type="number"
            value={inputs.faceValue}
            onChange={(e) => handleInputChange('faceValue', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>표면금리 (%)</label>
          <input
            type="number"
            step="0.1"
            value={inputs.couponRate}
            onChange={(e) => handleInputChange('couponRate', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>잔존만기 (년)</label>
          <input
            type="number"
            step="0.5"
            value={inputs.yearsToMaturity}
            onChange={(e) => handleInputChange('yearsToMaturity', e.target.value)}
            style={inputStyle}
          />
        </div>
        {calcMode === 'price' ? (
          <div style={inputGroupStyle}>
            <label style={labelStyle}>시장금리 (%)</label>
            <input
              type="number"
              step="0.1"
              value={inputs.marketRate}
              onChange={(e) => handleInputChange('marketRate', e.target.value)}
              style={inputStyle}
            />
          </div>
        ) : (
          <div style={inputGroupStyle}>
            <label style={labelStyle}>시장가격</label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
              style={inputStyle}
            />
          </div>
        )}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>이자지급 빈도</label>
          <select
            value={inputs.paymentFrequency}
            onChange={(e) => handleInputChange('paymentFrequency', e.target.value)}
            style={selectStyle}
          >
            <option value={1}>연 1회</option>
            <option value={2}>반기 (연 2회)</option>
            <option value={4}>분기 (연 4회)</option>
            <option value={12}>월 (연 12회)</option>
          </select>
        </div>
      </div>

      {result && (
        <>
          <div style={priceBoxStyle}>
            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>
              {calcMode === 'price' ? '채권 가격' : '만기수익률 (YTM)'}
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700 }}>
              {calcMode === 'price'
                ? result.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : `${result.ytm.toFixed(2)}%`}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>{bondStatus}</div>
          </div>

          <div style={resultCardStyle}>
            <h3 style={{ margin: '0 0 16px', color: '#2d3748', fontSize: '16px' }}>수익률 지표</h3>
            <div style={metricGridStyle}>
              <div style={metricStyle}>
                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>만기수익률 (YTM)</div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#1a365d' }}>{result.ytm.toFixed(2)}%</div>
              </div>
              <div style={metricStyle}>
                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>경상수익률</div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#1a365d' }}>{result.currentYield.toFixed(2)}%</div>
              </div>
              <div style={metricStyle}>
                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>표면금리</div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#1a365d' }}>{inputs.couponRate.toFixed(2)}%</div>
              </div>
            </div>
          </div>

          <div style={resultCardStyle}>
            <h3 style={{ margin: '0 0 16px', color: '#2d3748', fontSize: '16px' }}>위험 지표 (듀레이션)</h3>
            <div style={metricGridStyle}>
              <div style={metricStyle}>
                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>맥컬리 듀레이션</div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#1a365d' }}>{result.macaulayDuration.toFixed(2)}년</div>
              </div>
              <div style={metricStyle}>
                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>수정 듀레이션</div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#1a365d' }}>{result.modifiedDuration.toFixed(2)}</div>
              </div>
              <div style={metricStyle}>
                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>볼록성 (Convexity)</div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#1a365d' }}>{result.convexity.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div style={resultCardStyle}>
            <h3 style={{ margin: '0 0 16px', color: '#2d3748', fontSize: '16px' }}>금리 민감도 분석</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>금리 변동</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>예상 가격</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>변동률</th>
                </tr>
              </thead>
              <tbody>
                {[-1, -0.5, 0, 0.5, 1].map((change) => {
                  const priceChange = -result.modifiedDuration * change + 0.5 * result.convexity * change * change;
                  const newPrice = result.price * (1 + priceChange / 100);
                  return (
                    <tr key={change}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>
                        {change >= 0 ? '+' : ''}
                        {change}%
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 500 }}>
                        {newPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td
                        style={{
                          padding: '10px',
                          borderBottom: '1px solid #f1f5f9',
                          textAlign: 'right',
                          color: priceChange >= 0 ? '#22543d' : '#c53030',
                          fontWeight: 500,
                        }}
                      >
                        {priceChange >= 0 ? '+' : ''}
                        {priceChange.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
