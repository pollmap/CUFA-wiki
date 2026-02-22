import React, { useState, useMemo } from 'react';

interface OptionInputs {
  spotPrice: number;
  strikePrice: number;
  timeToMaturity: number;
  volatility: number;
  riskFreeRate: number;
  dividendYield: number;
}

interface GreeksResult {
  callPrice: number;
  putPrice: number;
  callDelta: number;
  putDelta: number;
  gamma: number;
  callTheta: number;
  putTheta: number;
  vega: number;
  callRho: number;
  putRho: number;
  d1: number;
  d2: number;
}

// Standard normal cumulative distribution function
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

// Standard normal probability density function
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export default function OptionGreeksCalculator() {
  const [inputs, setInputs] = useState<OptionInputs>({
    spotPrice: 100,
    strikePrice: 100,
    timeToMaturity: 0.5,
    volatility: 20,
    riskFreeRate: 3,
    dividendYield: 0,
  });

  const result = useMemo<GreeksResult | null>(() => {
    const { spotPrice, strikePrice, timeToMaturity, volatility, riskFreeRate, dividendYield } = inputs;

    if (spotPrice <= 0 || strikePrice <= 0 || timeToMaturity <= 0 || volatility <= 0) {
      return null;
    }

    const S = spotPrice;
    const K = strikePrice;
    const T = timeToMaturity;
    const sigma = volatility / 100;
    const r = riskFreeRate / 100;
    const q = dividendYield / 100;

    // Calculate d1 and d2
    const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    // Option prices
    const callPrice = S * Math.exp(-q * T) * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
    const putPrice = K * Math.exp(-r * T) * normalCDF(-d2) - S * Math.exp(-q * T) * normalCDF(-d1);

    // Greeks
    const callDelta = Math.exp(-q * T) * normalCDF(d1);
    const putDelta = Math.exp(-q * T) * (normalCDF(d1) - 1);

    const gamma = (Math.exp(-q * T) * normalPDF(d1)) / (S * sigma * Math.sqrt(T));

    const callTheta =
      ((-S * normalPDF(d1) * sigma * Math.exp(-q * T)) / (2 * Math.sqrt(T)) -
        r * K * Math.exp(-r * T) * normalCDF(d2) +
        q * S * Math.exp(-q * T) * normalCDF(d1)) /
      365;

    const putTheta =
      ((-S * normalPDF(d1) * sigma * Math.exp(-q * T)) / (2 * Math.sqrt(T)) +
        r * K * Math.exp(-r * T) * normalCDF(-d2) -
        q * S * Math.exp(-q * T) * normalCDF(-d1)) /
      365;

    const vega = (S * Math.exp(-q * T) * normalPDF(d1) * Math.sqrt(T)) / 100;

    const callRho = (K * T * Math.exp(-r * T) * normalCDF(d2)) / 100;
    const putRho = (-K * T * Math.exp(-r * T) * normalCDF(-d2)) / 100;

    return {
      callPrice,
      putPrice,
      callDelta,
      putDelta,
      gamma,
      callTheta,
      putTheta,
      vega,
      callRho,
      putRho,
      d1,
      d2,
    };
  }, [inputs]);

  const handleInputChange = (field: keyof OptionInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs((prev) => ({ ...prev, [field]: numValue }));
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#e0e0e0',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
    color: '#a0a0a0',
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const resultCardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '16px',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  };

  const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '2px solid rgba(255,255,255,0.08)',
    color: '#a0a0a0',
    fontWeight: 600,
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  };

  const valueStyle: React.CSSProperties = {
    fontWeight: 600,
    color: '#e0e0e0',
  };

  const positiveStyle: React.CSSProperties = {
    ...valueStyle,
    color: '#10b981',
  };

  const negativeStyle: React.CSSProperties = {
    ...valueStyle,
    color: '#ef4444',
  };

  const moneyness = inputs.spotPrice > inputs.strikePrice ? 'ITM' : inputs.spotPrice < inputs.strikePrice ? 'OTM' : 'ATM';

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: '0 0 8px', fontSize: '24px' }}>옵션 그릭스 계산기</h2>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Black-Scholes 모형 기반</p>
      </div>

      <div style={gridStyle}>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>기초자산 가격 (S)</label>
          <input
            type="number"
            value={inputs.spotPrice}
            onChange={(e) => handleInputChange('spotPrice', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>행사가격 (K)</label>
          <input
            type="number"
            value={inputs.strikePrice}
            onChange={(e) => handleInputChange('strikePrice', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>잔존만기 (년)</label>
          <input
            type="number"
            step="0.1"
            value={inputs.timeToMaturity}
            onChange={(e) => handleInputChange('timeToMaturity', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>변동성 σ (%)</label>
          <input
            type="number"
            value={inputs.volatility}
            onChange={(e) => handleInputChange('volatility', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>무위험이자율 (%)</label>
          <input
            type="number"
            step="0.1"
            value={inputs.riskFreeRate}
            onChange={(e) => handleInputChange('riskFreeRate', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle}>배당수익률 (%)</label>
          <input
            type="number"
            step="0.1"
            value={inputs.dividendYield}
            onChange={(e) => handleInputChange('dividendYield', e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {result && (
        <>
          <div style={resultCardStyle}>
            <h3 style={{ margin: '0 0 16px', color: '#a0a0a0', fontSize: '16px' }}>옵션 가격</h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>구분</th>
                  <th style={thStyle}>콜옵션</th>
                  <th style={thStyle}>풋옵션</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>옵션가격</td>
                  <td style={{ ...tdStyle, ...valueStyle }}>{result.callPrice.toFixed(4)}</td>
                  <td style={{ ...tdStyle, ...valueStyle }}>{result.putPrice.toFixed(4)}</td>
                </tr>
                <tr>
                  <td style={tdStyle}>내재가치</td>
                  <td style={tdStyle}>{Math.max(inputs.spotPrice - inputs.strikePrice, 0).toFixed(2)}</td>
                  <td style={tdStyle}>{Math.max(inputs.strikePrice - inputs.spotPrice, 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={tdStyle}>시간가치</td>
                  <td style={tdStyle}>
                    {(result.callPrice - Math.max(inputs.spotPrice - inputs.strikePrice, 0)).toFixed(4)}
                  </td>
                  <td style={tdStyle}>
                    {(result.putPrice - Math.max(inputs.strikePrice - inputs.spotPrice, 0)).toFixed(4)}
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>상태</td>
                  <td style={tdStyle}>{moneyness}</td>
                  <td style={tdStyle}>{moneyness === 'ITM' ? 'OTM' : moneyness === 'OTM' ? 'ITM' : 'ATM'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={resultCardStyle}>
            <h3 style={{ margin: '0 0 16px', color: '#a0a0a0', fontSize: '16px' }}>그릭스 (Greeks)</h3>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>그릭</th>
                  <th style={thStyle}>콜옵션</th>
                  <th style={thStyle}>풋옵션</th>
                  <th style={thStyle}>의미</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>
                    <strong>델타 (Δ)</strong>
                  </td>
                  <td style={{ ...tdStyle, ...positiveStyle }}>{result.callDelta.toFixed(4)}</td>
                  <td style={{ ...tdStyle, ...negativeStyle }}>{result.putDelta.toFixed(4)}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#6b7280' }}>기초자산 $1 변동 시 옵션가 변동</td>
                </tr>
                <tr>
                  <td style={tdStyle}>
                    <strong>감마 (Γ)</strong>
                  </td>
                  <td style={{ ...tdStyle, ...valueStyle }}>{result.gamma.toFixed(4)}</td>
                  <td style={{ ...tdStyle, ...valueStyle }}>{result.gamma.toFixed(4)}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#6b7280' }}>델타의 변화율</td>
                </tr>
                <tr>
                  <td style={tdStyle}>
                    <strong>세타 (Θ)</strong>
                  </td>
                  <td style={{ ...tdStyle, ...negativeStyle }}>{result.callTheta.toFixed(4)}</td>
                  <td style={{ ...tdStyle, ...negativeStyle }}>{result.putTheta.toFixed(4)}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#6b7280' }}>일일 시간가치 소멸</td>
                </tr>
                <tr>
                  <td style={tdStyle}>
                    <strong>베가 (ν)</strong>
                  </td>
                  <td style={{ ...tdStyle, ...valueStyle }}>{result.vega.toFixed(4)}</td>
                  <td style={{ ...tdStyle, ...valueStyle }}>{result.vega.toFixed(4)}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#6b7280' }}>변동성 1%p 변동 시 옵션가 변동</td>
                </tr>
                <tr>
                  <td style={tdStyle}>
                    <strong>로 (ρ)</strong>
                  </td>
                  <td style={{ ...tdStyle, ...positiveStyle }}>{result.callRho.toFixed(4)}</td>
                  <td style={{ ...tdStyle, ...negativeStyle }}>{result.putRho.toFixed(4)}</td>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#6b7280' }}>금리 1%p 변동 시 옵션가 변동</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={resultCardStyle}>
            <h3 style={{ margin: '0 0 16px', color: '#a0a0a0', fontSize: '16px' }}>Black-Scholes 파라미터</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>d1</span>
                <div style={valueStyle}>{result.d1.toFixed(4)}</div>
              </div>
              <div>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>d2</span>
                <div style={valueStyle}>{result.d2.toFixed(4)}</div>
              </div>
              <div>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>N(d1)</span>
                <div style={valueStyle}>{normalCDF(result.d1).toFixed(4)}</div>
              </div>
              <div>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>N(d2)</span>
                <div style={valueStyle}>{normalCDF(result.d2).toFixed(4)}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
