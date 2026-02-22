import React, { useState, useMemo } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Country = '🇺🇸' | '🇰🇷' | '🇪🇺' | '🇯🇵' | '🇨🇳';
type Category =
  | 'monetary'
  | 'employment'
  | 'inflation'
  | 'gdp'
  | 'trade'
  | 'housing'
  | 'sentiment'
  | 'manufacturing';
type Importance = 'high' | 'medium' | 'low';

interface EconomicEvent {
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM KST
  country: Country;
  event: string;
  category: Category;
  importance: Importance;
  previous?: string;
  forecast?: string;
}

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<Category, string> = {
  monetary: '통화정책',
  employment: '고용',
  inflation: '물가',
  gdp: 'GDP/산출',
  trade: '무역',
  housing: '주택',
  sentiment: '소비심리',
  manufacturing: '제조업',
};

const COUNTRY_NAMES: Record<Country, string> = {
  '🇺🇸': '미국',
  '🇰🇷': '한국',
  '🇪🇺': 'EU',
  '🇯🇵': '일본',
  '🇨🇳': '중국',
};

const IMPORTANCE_LABELS: Record<Importance, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
};

// ---------------------------------------------------------------------------
// Comprehensive economic events 2025-2026 (60+ entries)
// ---------------------------------------------------------------------------

const ECONOMIC_EVENTS: EconomicEvent[] = [
  // ===== 2025 ================================================================

  // --- January 2025 ---
  { date: '2025-01-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (12월)', category: 'trade', importance: 'medium', previous: '+7.8%', forecast: '+6.5%' },
  { date: '2025-01-02', time: '10:45', country: '🇨🇳', event: 'Caixin 제조업 PMI (12월)', category: 'manufacturing', importance: 'medium', previous: '51.5', forecast: '51.7' },
  { date: '2025-01-03', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (12월)', category: 'manufacturing', importance: 'high', previous: '48.4', forecast: '48.2' },
  { date: '2025-01-10', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (12월)', category: 'employment', importance: 'high', previous: '227K', forecast: '160K' },
  { date: '2025-01-15', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (12월)', category: 'inflation', importance: 'high', previous: '2.7%', forecast: '2.8%' },
  { date: '2025-01-16', time: '09:00', country: '🇰🇷', event: '한국은행 금통위 (1월)', category: 'monetary', importance: 'high', previous: '3.00%', forecast: '3.00%' },
  { date: '2025-01-20', time: '09:00', country: '🇨🇳', event: 'PBOC 대출우대금리 (LPR)', category: 'monetary', importance: 'medium', previous: '3.10%', forecast: '3.10%' },
  { date: '2025-01-24', time: '18:00', country: '🇪🇺', event: '유로존 종합 PMI (1월 예비)', category: 'manufacturing', importance: 'medium', previous: '49.6', forecast: '49.8' },
  { date: '2025-01-28', time: '00:00', country: '🇺🇸', event: '소비자신뢰지수 (1월)', category: 'sentiment', importance: 'medium', previous: '104.7', forecast: '106.0' },
  { date: '2025-01-29', time: '04:00', country: '🇺🇸', event: 'FOMC 금리 결정 (1월)', category: 'monetary', importance: 'high', previous: '4.50%', forecast: '4.50%' },
  { date: '2025-01-30', time: '19:00', country: '🇪🇺', event: 'ECB 금리 결정 (1월)', category: 'monetary', importance: 'high', previous: '3.15%', forecast: '2.90%' },
  { date: '2025-01-31', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (12월)', category: 'inflation', importance: 'high', previous: '2.4%', forecast: '2.5%' },

  // --- February 2025 ---
  { date: '2025-02-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (1월)', category: 'trade', importance: 'medium', previous: '+6.5%', forecast: '+5.2%' },
  { date: '2025-02-03', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (1월)', category: 'manufacturing', importance: 'high', previous: '49.3', forecast: '49.5' },
  { date: '2025-02-07', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (1월)', category: 'employment', importance: 'high', previous: '256K', forecast: '170K' },
  { date: '2025-02-12', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (1월)', category: 'inflation', importance: 'high', previous: '2.9%', forecast: '2.9%' },
  { date: '2025-02-14', time: '00:00', country: '🇺🇸', event: '미시간 소비자심리지수 (2월 예비)', category: 'sentiment', importance: 'medium', previous: '71.1', forecast: '70.0' },
  { date: '2025-02-17', time: '08:50', country: '🇯🇵', event: 'GDP 속보치 (Q4)', category: 'gdp', importance: 'high', previous: '0.9%', forecast: '1.0%' },
  { date: '2025-02-20', time: '10:45', country: '🇨🇳', event: 'PBOC 대출우대금리 (LPR)', category: 'monetary', importance: 'medium', previous: '3.10%', forecast: '3.10%' },
  { date: '2025-02-25', time: '00:00', country: '🇺🇸', event: 'S&P/케이스-쉴러 주택가격 (12월)', category: 'housing', importance: 'medium', previous: '+4.3%', forecast: '+4.1%' },
  { date: '2025-02-25', time: '00:00', country: '🇺🇸', event: '소비자신뢰지수 (2월)', category: 'sentiment', importance: 'medium', previous: '104.1', forecast: '103.0' },
  { date: '2025-02-27', time: '09:00', country: '🇰🇷', event: '한국은행 금통위 (2월)', category: 'monetary', importance: 'high', previous: '3.00%', forecast: '2.75%' },
  { date: '2025-02-28', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (1월)', category: 'inflation', importance: 'high', previous: '2.6%', forecast: '2.5%' },

  // --- March 2025 ---
  { date: '2025-03-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (2월)', category: 'trade', importance: 'medium', previous: '+5.2%', forecast: '+4.8%' },
  { date: '2025-03-03', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (2월)', category: 'manufacturing', importance: 'high', previous: '50.9', forecast: '50.5' },
  { date: '2025-03-03', time: '10:45', country: '🇨🇳', event: 'Caixin 제조업 PMI (2월)', category: 'manufacturing', importance: 'medium', previous: '50.1', forecast: '50.3' },
  { date: '2025-03-05', time: '09:00', country: '🇰🇷', event: 'CPI 소비자물가 (2월)', category: 'inflation', importance: 'high', previous: '2.2%', forecast: '2.0%' },
  { date: '2025-03-06', time: '19:45', country: '🇪🇺', event: 'ECB 금리 결정 (3월)', category: 'monetary', importance: 'high', previous: '2.90%', forecast: '2.65%' },
  { date: '2025-03-07', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (2월)', category: 'employment', importance: 'high', previous: '143K', forecast: '160K' },
  { date: '2025-03-12', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (2월)', category: 'inflation', importance: 'high', previous: '3.0%', forecast: '2.9%' },
  { date: '2025-03-14', time: '08:50', country: '🇯🇵', event: 'BOJ 금리 결정 (3월)', category: 'monetary', importance: 'high', previous: '0.50%', forecast: '0.50%' },
  { date: '2025-03-19', time: '03:00', country: '🇺🇸', event: 'FOMC 금리 결정 + 점도표 (3월)', category: 'monetary', importance: 'high', previous: '4.50%', forecast: '4.50%' },
  { date: '2025-03-25', time: '00:00', country: '🇺🇸', event: '소비자신뢰지수 (3월)', category: 'sentiment', importance: 'medium', previous: '98.3', forecast: '95.0' },
  { date: '2025-03-25', time: '09:00', country: '🇰🇷', event: '소비자심리지수 (3월)', category: 'sentiment', importance: 'low', previous: '88.4', forecast: '89.0' },
  { date: '2025-03-27', time: '22:30', country: '🇺🇸', event: 'GDP 확정치 (Q4)', category: 'gdp', importance: 'high', previous: '3.1%', forecast: '2.3%' },
  { date: '2025-03-28', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (2월)', category: 'inflation', importance: 'high', previous: '2.5%', forecast: '2.5%' },

  // --- April 2025 ---
  { date: '2025-04-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (3월)', category: 'trade', importance: 'medium', previous: '+4.8%', forecast: '+3.1%' },
  { date: '2025-04-01', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (3월)', category: 'manufacturing', importance: 'high', previous: '50.3', forecast: '49.8' },
  { date: '2025-04-01', time: '10:45', country: '🇨🇳', event: 'Caixin 제조업 PMI (3월)', category: 'manufacturing', importance: 'medium', previous: '50.8', forecast: '51.0' },
  { date: '2025-04-04', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (3월)', category: 'employment', importance: 'high', previous: '151K', forecast: '140K' },
  { date: '2025-04-10', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (3월)', category: 'inflation', importance: 'high', previous: '2.8%', forecast: '2.5%' },
  { date: '2025-04-10', time: '09:00', country: '🇰🇷', event: '한국은행 금통위 (4월)', category: 'monetary', importance: 'high', previous: '2.75%', forecast: '2.75%' },
  { date: '2025-04-17', time: '19:45', country: '🇪🇺', event: 'ECB 금리 결정 (4월)', category: 'monetary', importance: 'high', previous: '2.65%', forecast: '2.40%' },
  { date: '2025-04-24', time: '09:00', country: '🇰🇷', event: 'GDP 속보치 (Q1)', category: 'gdp', importance: 'high', previous: '1.2%', forecast: '1.5%' },
  { date: '2025-04-25', time: '00:00', country: '🇺🇸', event: '미시간 소비자심리지수 (4월 최종)', category: 'sentiment', importance: 'medium', previous: '57.0', forecast: '52.2' },
  { date: '2025-04-29', time: '00:00', country: '🇺🇸', event: '소비자신뢰지수 (4월)', category: 'sentiment', importance: 'medium', previous: '93.9', forecast: '88.0' },
  { date: '2025-04-30', time: '22:30', country: '🇺🇸', event: 'GDP 속보치 (Q1)', category: 'gdp', importance: 'high', previous: '2.4%', forecast: '0.4%' },
  { date: '2025-04-30', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (3월)', category: 'inflation', importance: 'high', previous: '2.5%', forecast: '2.3%' },

  // --- May 2025 ---
  { date: '2025-05-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (4월)', category: 'trade', importance: 'medium', previous: '+3.1%', forecast: '+4.5%' },
  { date: '2025-05-01', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (4월)', category: 'manufacturing', importance: 'high', previous: '49.0', forecast: '48.0' },
  { date: '2025-05-01', time: '08:50', country: '🇯🇵', event: 'BOJ 금리 결정 (5월)', category: 'monetary', importance: 'high', previous: '0.50%', forecast: '0.50%' },
  { date: '2025-05-02', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (4월)', category: 'employment', importance: 'high', previous: '228K', forecast: '138K' },
  { date: '2025-05-07', time: '03:00', country: '🇺🇸', event: 'FOMC 금리 결정 (5월)', category: 'monetary', importance: 'high', previous: '4.50%', forecast: '4.50%' },
  { date: '2025-05-13', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (4월)', category: 'inflation', importance: 'high', previous: '2.4%', forecast: '2.3%' },
  { date: '2025-05-15', time: '22:30', country: '🇺🇸', event: '주택착공 건수 (4월)', category: 'housing', importance: 'low', previous: '1.32M', forecast: '1.35M' },
  { date: '2025-05-22', time: '09:00', country: '🇰🇷', event: '한국은행 금통위 (5월)', category: 'monetary', importance: 'high', previous: '2.75%', forecast: '2.50%' },
  { date: '2025-05-27', time: '00:00', country: '🇺🇸', event: 'S&P/케이스-쉴러 주택가격 (3월)', category: 'housing', importance: 'medium', previous: '+3.9%', forecast: '+3.7%' },
  { date: '2025-05-27', time: '00:00', country: '🇺🇸', event: '소비자신뢰지수 (5월)', category: 'sentiment', importance: 'medium', previous: '86.0', forecast: '88.0' },
  { date: '2025-05-29', time: '09:00', country: '🇰🇷', event: '기업경기실사지수 (BSI) (6월)', category: 'sentiment', importance: 'low', previous: '68', forecast: '70' },
  { date: '2025-05-30', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (4월)', category: 'inflation', importance: 'high', previous: '2.3%', forecast: '2.2%' },

  // --- June 2025 ---
  { date: '2025-06-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (5월)', category: 'trade', importance: 'medium', previous: '+4.5%', forecast: '+5.8%' },
  { date: '2025-06-02', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (5월)', category: 'manufacturing', importance: 'high', previous: '48.7', forecast: '49.0' },
  { date: '2025-06-02', time: '10:45', country: '🇨🇳', event: 'Caixin 제조업 PMI (5월)', category: 'manufacturing', importance: 'medium', previous: '50.4', forecast: '50.6' },
  { date: '2025-06-05', time: '09:00', country: '🇰🇷', event: 'CPI 소비자물가 (5월)', category: 'inflation', importance: 'high', previous: '2.0%', forecast: '1.9%' },
  { date: '2025-06-05', time: '19:45', country: '🇪🇺', event: 'ECB 금리 결정 (6월)', category: 'monetary', importance: 'high', previous: '2.40%', forecast: '2.25%' },
  { date: '2025-06-06', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (5월)', category: 'employment', importance: 'high', previous: '177K', forecast: '165K' },
  { date: '2025-06-11', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (5월)', category: 'inflation', importance: 'high', previous: '2.3%', forecast: '2.2%' },
  { date: '2025-06-17', time: '22:30', country: '🇺🇸', event: '주택착공 건수 (5월)', category: 'housing', importance: 'low', previous: '1.36M', forecast: '1.38M' },
  { date: '2025-06-18', time: '03:00', country: '🇺🇸', event: 'FOMC 금리 결정 + 점도표 (6월)', category: 'monetary', importance: 'high', previous: '4.50%', forecast: '4.25%' },
  { date: '2025-06-20', time: '08:50', country: '🇯🇵', event: 'BOJ 금리 결정 (6월)', category: 'monetary', importance: 'high', previous: '0.50%', forecast: '0.75%' },
  { date: '2025-06-24', time: '00:00', country: '🇺🇸', event: '소비자신뢰지수 (6월)', category: 'sentiment', importance: 'medium', previous: '88.0', forecast: '90.0' },
  { date: '2025-06-25', time: '09:00', country: '🇰🇷', event: '소비자심리지수 (6월)', category: 'sentiment', importance: 'low', previous: '90.0', forecast: '91.0' },
  { date: '2025-06-26', time: '22:30', country: '🇺🇸', event: 'GDP 확정치 (Q1)', category: 'gdp', importance: 'high', previous: '-0.3%', forecast: '-0.2%' },
  { date: '2025-06-27', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (5월)', category: 'inflation', importance: 'high', previous: '2.2%', forecast: '2.1%' },

  // --- July 2025 ---
  { date: '2025-07-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (6월)', category: 'trade', importance: 'medium', previous: '+5.8%', forecast: '+6.0%' },
  { date: '2025-07-01', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (6월)', category: 'manufacturing', importance: 'high', previous: '48.7', forecast: '49.5' },
  { date: '2025-07-01', time: '10:45', country: '🇨🇳', event: 'Caixin 제조업 PMI (6월)', category: 'manufacturing', importance: 'medium', previous: '51.2', forecast: '51.0' },
  { date: '2025-07-03', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (6월)', category: 'employment', importance: 'high', previous: '165K', forecast: '155K' },
  { date: '2025-07-10', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (6월)', category: 'inflation', importance: 'high', previous: '2.2%', forecast: '2.1%' },
  { date: '2025-07-10', time: '09:00', country: '🇰🇷', event: '한국은행 금통위 (7월)', category: 'monetary', importance: 'high', previous: '2.50%', forecast: '2.50%' },
  { date: '2025-07-17', time: '19:45', country: '🇪🇺', event: 'ECB 금리 결정 (7월)', category: 'monetary', importance: 'high', previous: '2.25%', forecast: '2.25%' },
  { date: '2025-07-24', time: '09:00', country: '🇰🇷', event: 'GDP 속보치 (Q2)', category: 'gdp', importance: 'high', previous: '-0.1%', forecast: '+0.5%' },
  { date: '2025-07-25', time: '00:00', country: '🇺🇸', event: '미시간 소비자심리지수 (7월 최종)', category: 'sentiment', importance: 'medium', previous: '65.5', forecast: '66.0' },
  { date: '2025-07-29', time: '00:00', country: '🇺🇸', event: '소비자신뢰지수 (7월)', category: 'sentiment', importance: 'medium', previous: '90.0', forecast: '92.0' },
  { date: '2025-07-30', time: '03:00', country: '🇺🇸', event: 'FOMC 금리 결정 (7월)', category: 'monetary', importance: 'high', previous: '4.25%', forecast: '4.00%' },
  { date: '2025-07-30', time: '22:30', country: '🇺🇸', event: 'GDP 속보치 (Q2)', category: 'gdp', importance: 'high', previous: '-0.3%', forecast: '1.5%' },
  { date: '2025-07-31', time: '08:50', country: '🇯🇵', event: 'BOJ 금리 결정 (7월)', category: 'monetary', importance: 'high', previous: '0.75%', forecast: '0.75%' },
  { date: '2025-07-31', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (6월)', category: 'inflation', importance: 'high', previous: '2.1%', forecast: '2.0%' },

  // --- August 2025 ---
  { date: '2025-08-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (7월)', category: 'trade', importance: 'medium', previous: '+6.0%', forecast: '+5.5%' },
  { date: '2025-08-01', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (7월)', category: 'manufacturing', importance: 'high', previous: '48.5', forecast: '49.0' },
  { date: '2025-08-01', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (7월)', category: 'employment', importance: 'high', previous: '155K', forecast: '160K' },
  { date: '2025-08-05', time: '09:00', country: '🇰🇷', event: 'CPI 소비자물가 (7월)', category: 'inflation', importance: 'high', previous: '1.8%', forecast: '1.7%' },
  { date: '2025-08-12', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (7월)', category: 'inflation', importance: 'high', previous: '2.1%', forecast: '2.0%' },
  { date: '2025-08-21', time: '09:00', country: '🇰🇷', event: '한국은행 금통위 (8월)', category: 'monetary', importance: 'high', previous: '2.50%', forecast: '2.25%' },
  { date: '2025-08-26', time: '00:00', country: '🇺🇸', event: 'S&P/케이스-쉴러 주택가격 (6월)', category: 'housing', importance: 'medium', previous: '+3.5%', forecast: '+3.3%' },
  { date: '2025-08-26', time: '00:00', country: '🇺🇸', event: '소비자신뢰지수 (8월)', category: 'sentiment', importance: 'medium', previous: '92.0', forecast: '93.0' },
  { date: '2025-08-28', time: '09:00', country: '🇰🇷', event: '기업경기실사지수 (BSI) (9월)', category: 'sentiment', importance: 'low', previous: '72', forecast: '73' },
  { date: '2025-08-29', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (7월)', category: 'inflation', importance: 'high', previous: '2.0%', forecast: '1.9%' },

  // --- September 2025 ---
  { date: '2025-09-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (8월)', category: 'trade', importance: 'medium', previous: '+5.5%', forecast: '+6.2%' },
  { date: '2025-09-02', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (8월)', category: 'manufacturing', importance: 'high', previous: '46.8', forecast: '47.5' },
  { date: '2025-09-02', time: '10:45', country: '🇨🇳', event: 'Caixin 제조업 PMI (8월)', category: 'manufacturing', importance: 'medium', previous: '49.8', forecast: '50.0' },
  { date: '2025-09-05', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (8월)', category: 'employment', importance: 'high', previous: '160K', forecast: '150K' },
  { date: '2025-09-10', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (8월)', category: 'inflation', importance: 'high', previous: '2.0%', forecast: '1.9%' },
  { date: '2025-09-11', time: '19:45', country: '🇪🇺', event: 'ECB 금리 결정 (9월)', category: 'monetary', importance: 'high', previous: '2.25%', forecast: '2.15%' },
  { date: '2025-09-17', time: '03:00', country: '🇺🇸', event: 'FOMC 금리 결정 + 점도표 (9월)', category: 'monetary', importance: 'high', previous: '4.00%', forecast: '3.75%' },
  { date: '2025-09-19', time: '08:50', country: '🇯🇵', event: 'BOJ 금리 결정 (9월)', category: 'monetary', importance: 'high', previous: '0.75%', forecast: '0.75%' },
  { date: '2025-09-25', time: '09:00', country: '🇰🇷', event: '소비자심리지수 (9월)', category: 'sentiment', importance: 'low', previous: '91.5', forecast: '92.0' },
  { date: '2025-09-26', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (8월)', category: 'inflation', importance: 'high', previous: '1.9%', forecast: '1.8%' },

  // --- October 2025 ---
  { date: '2025-10-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (9월)', category: 'trade', importance: 'medium', previous: '+6.2%', forecast: '+5.0%' },
  { date: '2025-10-01', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (9월)', category: 'manufacturing', importance: 'high', previous: '47.2', forecast: '47.8' },
  { date: '2025-10-01', time: '10:45', country: '🇨🇳', event: 'Caixin 제조업 PMI (9월)', category: 'manufacturing', importance: 'medium', previous: '50.4', forecast: '50.5' },
  { date: '2025-10-03', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (9월)', category: 'employment', importance: 'high', previous: '150K', forecast: '145K' },
  { date: '2025-10-10', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (9월)', category: 'inflation', importance: 'high', previous: '1.9%', forecast: '1.8%' },
  { date: '2025-10-16', time: '09:00', country: '🇰🇷', event: '한국은행 금통위 (10월)', category: 'monetary', importance: 'high', previous: '2.25%', forecast: '2.25%' },
  { date: '2025-10-23', time: '09:00', country: '🇰🇷', event: 'GDP 속보치 (Q3)', category: 'gdp', importance: 'high', previous: '+0.5%', forecast: '+0.6%' },
  { date: '2025-10-28', time: '00:00', country: '🇺🇸', event: '소비자신뢰지수 (10월)', category: 'sentiment', importance: 'medium', previous: '93.0', forecast: '94.0' },
  { date: '2025-10-29', time: '22:30', country: '🇺🇸', event: 'GDP 속보치 (Q3)', category: 'gdp', importance: 'high', previous: '1.5%', forecast: '2.0%' },
  { date: '2025-10-30', time: '19:45', country: '🇪🇺', event: 'ECB 금리 결정 (10월)', category: 'monetary', importance: 'high', previous: '2.15%', forecast: '2.00%' },
  { date: '2025-10-31', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (9월)', category: 'inflation', importance: 'high', previous: '1.8%', forecast: '1.7%' },

  // --- November 2025 ---
  { date: '2025-11-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (10월)', category: 'trade', importance: 'medium', previous: '+5.0%', forecast: '+5.5%' },
  { date: '2025-11-03', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (10월)', category: 'manufacturing', importance: 'high', previous: '47.8', forecast: '48.0' },
  { date: '2025-11-05', time: '09:00', country: '🇰🇷', event: 'CPI 소비자물가 (10월)', category: 'inflation', importance: 'high', previous: '1.6%', forecast: '1.5%' },
  { date: '2025-11-07', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (10월)', category: 'employment', importance: 'high', previous: '145K', forecast: '150K' },
  { date: '2025-11-12', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (10월)', category: 'inflation', importance: 'high', previous: '1.8%', forecast: '1.7%' },
  { date: '2025-11-18', time: '08:50', country: '🇯🇵', event: 'GDP 속보치 (Q3)', category: 'gdp', importance: 'high', previous: '+0.7%', forecast: '+0.5%' },
  { date: '2025-11-20', time: '22:30', country: '🇺🇸', event: '주택착공 건수 (10월)', category: 'housing', importance: 'low', previous: '1.35M', forecast: '1.37M' },
  { date: '2025-11-25', time: '00:00', country: '🇺🇸', event: 'S&P/케이스-쉴러 주택가격 (9월)', category: 'housing', importance: 'medium', previous: '+3.0%', forecast: '+2.8%' },
  { date: '2025-11-25', time: '00:00', country: '🇺🇸', event: '소비자신뢰지수 (11월)', category: 'sentiment', importance: 'medium', previous: '94.0', forecast: '95.0' },
  { date: '2025-11-27', time: '09:00', country: '🇰🇷', event: '한국은행 금통위 (11월)', category: 'monetary', importance: 'high', previous: '2.25%', forecast: '2.00%' },
  { date: '2025-11-28', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (10월)', category: 'inflation', importance: 'high', previous: '1.7%', forecast: '1.6%' },

  // --- December 2025 ---
  { date: '2025-12-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (11월)', category: 'trade', importance: 'medium', previous: '+5.5%', forecast: '+4.8%' },
  { date: '2025-12-01', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (11월)', category: 'manufacturing', importance: 'high', previous: '48.0', forecast: '48.5' },
  { date: '2025-12-01', time: '10:45', country: '🇨🇳', event: 'Caixin 제조업 PMI (11월)', category: 'manufacturing', importance: 'medium', previous: '50.3', forecast: '50.5' },
  { date: '2025-12-05', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (11월)', category: 'employment', importance: 'high', previous: '150K', forecast: '155K' },
  { date: '2025-12-10', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (11월)', category: 'inflation', importance: 'high', previous: '1.7%', forecast: '1.6%' },
  { date: '2025-12-11', time: '19:45', country: '🇪🇺', event: 'ECB 금리 결정 (12월)', category: 'monetary', importance: 'high', previous: '2.00%', forecast: '1.90%' },
  { date: '2025-12-17', time: '03:00', country: '🇺🇸', event: 'FOMC 금리 결정 + 점도표 (12월)', category: 'monetary', importance: 'high', previous: '3.75%', forecast: '3.50%' },
  { date: '2025-12-19', time: '08:50', country: '🇯🇵', event: 'BOJ 금리 결정 (12월)', category: 'monetary', importance: 'high', previous: '0.75%', forecast: '1.00%' },
  { date: '2025-12-23', time: '00:00', country: '🇺🇸', event: '소비자신뢰지수 (12월)', category: 'sentiment', importance: 'medium', previous: '95.0', forecast: '96.0' },
  { date: '2025-12-23', time: '09:00', country: '🇰🇷', event: '소비자심리지수 (12월)', category: 'sentiment', importance: 'low', previous: '93.0', forecast: '93.5' },
  { date: '2025-12-24', time: '22:30', country: '🇺🇸', event: 'GDP 확정치 (Q3)', category: 'gdp', importance: 'high', previous: '2.0%', forecast: '2.1%' },
  { date: '2025-12-26', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (11월)', category: 'inflation', importance: 'high', previous: '1.6%', forecast: '1.5%' },

  // ===== 2026 ================================================================

  // --- January 2026 ---
  { date: '2026-01-02', time: '10:00', country: '🇰🇷', event: '수출입 동향 (12월)', category: 'trade', importance: 'medium', previous: '+4.8%', forecast: '+5.0%' },
  { date: '2026-01-02', time: '10:45', country: '🇨🇳', event: 'Caixin 제조업 PMI (12월)', category: 'manufacturing', importance: 'medium', previous: '51.0', forecast: '51.2' },
  { date: '2026-01-05', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (12월)', category: 'manufacturing', importance: 'high', previous: '48.5', forecast: '49.0' },
  { date: '2026-01-09', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (12월)', category: 'employment', importance: 'high', previous: '155K', forecast: '150K' },
  { date: '2026-01-14', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (12월)', category: 'inflation', importance: 'high', previous: '1.6%', forecast: '1.5%' },
  { date: '2026-01-15', time: '09:00', country: '🇰🇷', event: '한국은행 금통위 (1월)', category: 'monetary', importance: 'high', previous: '2.00%', forecast: '2.00%' },
  { date: '2026-01-22', time: '19:45', country: '🇪🇺', event: 'ECB 금리 결정 (1월)', category: 'monetary', importance: 'high', previous: '1.90%', forecast: '1.80%' },
  { date: '2026-01-27', time: '00:00', country: '🇺🇸', event: '소비자신뢰지수 (1월)', category: 'sentiment', importance: 'medium', previous: '96.0', forecast: '97.0' },
  { date: '2026-01-28', time: '03:00', country: '🇺🇸', event: 'FOMC 금리 결정 (1월)', category: 'monetary', importance: 'high', previous: '3.50%', forecast: '3.50%' },
  { date: '2026-01-29', time: '22:30', country: '🇺🇸', event: 'GDP 속보치 (Q4 2025)', category: 'gdp', importance: 'high', previous: '2.1%', forecast: '2.3%' },
  { date: '2026-01-30', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (12월)', category: 'inflation', importance: 'high', previous: '1.5%', forecast: '1.5%' },

  // --- February 2026 ---
  { date: '2026-02-02', time: '10:00', country: '🇰🇷', event: '수출입 동향 (1월)', category: 'trade', importance: 'medium', previous: '+5.0%', forecast: '+4.2%' },
  { date: '2026-02-02', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (1월)', category: 'manufacturing', importance: 'high', previous: '49.0', forecast: '49.3' },
  { date: '2026-02-06', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (1월)', category: 'employment', importance: 'high', previous: '150K', forecast: '155K' },
  { date: '2026-02-11', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (1월)', category: 'inflation', importance: 'high', previous: '1.5%', forecast: '1.5%' },
  { date: '2026-02-16', time: '08:50', country: '🇯🇵', event: 'GDP 속보치 (Q4 2025)', category: 'gdp', importance: 'high', previous: '+0.5%', forecast: '+0.6%' },
  { date: '2026-02-26', time: '09:00', country: '🇰🇷', event: '한국은행 금통위 (2월)', category: 'monetary', importance: 'high', previous: '2.00%', forecast: '1.75%' },
  { date: '2026-02-27', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (1월)', category: 'inflation', importance: 'high', previous: '1.5%', forecast: '1.4%' },

  // --- March 2026 ---
  { date: '2026-03-02', time: '10:00', country: '🇰🇷', event: '수출입 동향 (2월)', category: 'trade', importance: 'medium', previous: '+4.2%', forecast: '+4.5%' },
  { date: '2026-03-02', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (2월)', category: 'manufacturing', importance: 'high', previous: '49.3', forecast: '49.5' },
  { date: '2026-03-05', time: '19:45', country: '🇪🇺', event: 'ECB 금리 결정 (3월)', category: 'monetary', importance: 'high', previous: '1.80%', forecast: '1.65%' },
  { date: '2026-03-06', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (2월)', category: 'employment', importance: 'high', previous: '155K', forecast: '150K' },
  { date: '2026-03-11', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (2월)', category: 'inflation', importance: 'high', previous: '1.5%', forecast: '1.4%' },
  { date: '2026-03-13', time: '08:50', country: '🇯🇵', event: 'BOJ 금리 결정 (3월)', category: 'monetary', importance: 'high', previous: '1.00%', forecast: '1.00%' },
  { date: '2026-03-18', time: '03:00', country: '🇺🇸', event: 'FOMC 금리 결정 + 점도표 (3월)', category: 'monetary', importance: 'high', previous: '3.50%', forecast: '3.25%' },
  { date: '2026-03-26', time: '22:30', country: '🇺🇸', event: 'GDP 확정치 (Q4 2025)', category: 'gdp', importance: 'high', previous: '2.3%', forecast: '2.4%' },
  { date: '2026-03-27', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (2월)', category: 'inflation', importance: 'high', previous: '1.4%', forecast: '1.4%' },

  // --- April 2026 ---
  { date: '2026-04-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (3월)', category: 'trade', importance: 'medium', previous: '+4.5%', forecast: '+5.0%' },
  { date: '2026-04-01', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (3월)', category: 'manufacturing', importance: 'high', previous: '49.5', forecast: '50.0' },
  { date: '2026-04-03', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (3월)', category: 'employment', importance: 'high', previous: '150K', forecast: '155K' },
  { date: '2026-04-09', time: '09:00', country: '🇰🇷', event: '한국은행 금통위 (4월)', category: 'monetary', importance: 'high', previous: '1.75%', forecast: '1.75%' },
  { date: '2026-04-14', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (3월)', category: 'inflation', importance: 'high', previous: '1.4%', forecast: '1.4%' },
  { date: '2026-04-16', time: '19:45', country: '🇪🇺', event: 'ECB 금리 결정 (4월)', category: 'monetary', importance: 'high', previous: '1.65%', forecast: '1.50%' },
  { date: '2026-04-23', time: '09:00', country: '🇰🇷', event: 'GDP 속보치 (Q1)', category: 'gdp', importance: 'high', previous: '+0.6%', forecast: '+0.7%' },
  { date: '2026-04-29', time: '22:30', country: '🇺🇸', event: 'GDP 속보치 (Q1)', category: 'gdp', importance: 'high', previous: '2.4%', forecast: '2.5%' },
  { date: '2026-04-30', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (3월)', category: 'inflation', importance: 'high', previous: '1.4%', forecast: '1.3%' },

  // --- May 2026 ---
  { date: '2026-05-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (4월)', category: 'trade', importance: 'medium', previous: '+5.0%', forecast: '+5.3%' },
  { date: '2026-05-01', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (4월)', category: 'manufacturing', importance: 'high', previous: '50.0', forecast: '50.2' },
  { date: '2026-05-06', time: '03:00', country: '🇺🇸', event: 'FOMC 금리 결정 (5월)', category: 'monetary', importance: 'high', previous: '3.25%', forecast: '3.00%' },
  { date: '2026-05-08', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (4월)', category: 'employment', importance: 'high', previous: '155K', forecast: '158K' },
  { date: '2026-05-12', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (4월)', category: 'inflation', importance: 'high', previous: '1.4%', forecast: '1.3%' },
  { date: '2026-05-21', time: '09:00', country: '🇰🇷', event: '한국은행 금통위 (5월)', category: 'monetary', importance: 'high', previous: '1.75%', forecast: '1.75%' },
  { date: '2026-05-29', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (4월)', category: 'inflation', importance: 'high', previous: '1.3%', forecast: '1.3%' },

  // --- June 2026 ---
  { date: '2026-06-01', time: '10:00', country: '🇰🇷', event: '수출입 동향 (5월)', category: 'trade', importance: 'medium', previous: '+5.3%', forecast: '+5.5%' },
  { date: '2026-06-01', time: '00:00', country: '🇺🇸', event: 'ISM 제조업 PMI (5월)', category: 'manufacturing', importance: 'high', previous: '50.2', forecast: '50.5' },
  { date: '2026-06-04', time: '19:45', country: '🇪🇺', event: 'ECB 금리 결정 (6월)', category: 'monetary', importance: 'high', previous: '1.50%', forecast: '1.40%' },
  { date: '2026-06-05', time: '22:30', country: '🇺🇸', event: '비농업 고용지표 (5월)', category: 'employment', importance: 'high', previous: '158K', forecast: '160K' },
  { date: '2026-06-10', time: '22:30', country: '🇺🇸', event: 'CPI 소비자물가 (5월)', category: 'inflation', importance: 'high', previous: '1.3%', forecast: '1.3%' },
  { date: '2026-06-17', time: '03:00', country: '🇺🇸', event: 'FOMC 금리 결정 + 점도표 (6월)', category: 'monetary', importance: 'high', previous: '3.00%', forecast: '2.75%' },
  { date: '2026-06-19', time: '08:50', country: '🇯🇵', event: 'BOJ 금리 결정 (6월)', category: 'monetary', importance: 'high', previous: '1.00%', forecast: '1.00%' },
  { date: '2026-06-25', time: '22:30', country: '🇺🇸', event: 'GDP 확정치 (Q1)', category: 'gdp', importance: 'high', previous: '2.5%', forecast: '2.6%' },
  { date: '2026-06-26', time: '22:30', country: '🇺🇸', event: 'PCE 물가지수 (5월)', category: 'inflation', importance: 'high', previous: '1.3%', forecast: '1.2%' },
];

// ---------------------------------------------------------------------------
// Styles (CSS-in-JS using CSS variables for theme support)
// ---------------------------------------------------------------------------

const styles = {
  container: {
    padding: '1.25rem',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  } as React.CSSProperties,

  title: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: 700,
  } as React.CSSProperties,

  statsRow: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.82rem',
    color: '#a0a0a0',
  } as React.CSSProperties,

  filtersRow: {
    display: 'flex',
    gap: '0.6rem',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  select: {
    padding: '0.45rem 0.7rem',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'var(--ifm-background-color)',
    color: 'var(--ifm-font-color-base)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    outline: 'none',
  } as React.CSSProperties,

  tableWrapper: {
    overflowX: 'auto' as const,
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
  } as React.CSSProperties,

  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.85rem',
  } as React.CSSProperties,

  th: {
    padding: '0.65rem 0.75rem',
    textAlign: 'left' as const,
    borderBottom: '2px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap' as const,
    color: '#cccccc',
  } as React.CSSProperties,

  thCenter: {
    textAlign: 'center' as const,
  } as React.CSSProperties,

  thRight: {
    textAlign: 'right' as const,
  } as React.CSSProperties,

  td: {
    padding: '0.6rem 0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,

  mono: {
    fontFamily: 'var(--ifm-font-family-monospace)',
    fontSize: '0.82rem',
    textAlign: 'right' as const,
  } as React.CSSProperties,

  badge: {
    display: 'inline-block',
    padding: '0.15rem 0.55rem',
    borderRadius: '10px',
    fontSize: '0.72rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  } as React.CSSProperties,

  upcomingBadge: {
    display: 'inline-block',
    marginLeft: '0.4rem',
    padding: '0.1rem 0.4rem',
    borderRadius: '8px',
    fontSize: '0.68rem',
    fontWeight: 600,
    backgroundColor: 'rgba(96,165,250,0.15)',
    color: '#60a5fa',
    border: '1px solid rgba(96,165,250,0.3)',
  } as React.CSSProperties,

  footer: {
    fontSize: '0.78rem',
    color: 'var(--ifm-color-emphasis-500)',
    marginTop: '0.75rem',
    lineHeight: 1.6,
  } as React.CSSProperties,

  empty: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: 'var(--ifm-color-emphasis-500)',
    fontSize: '0.9rem',
  } as React.CSSProperties,

  monthNav: {
    display: 'flex',
    gap: '0.25rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  monthBtn: (active: boolean) => ({
    padding: '0.3rem 0.55rem',
    borderRadius: '6px',
    border: active ? '1px solid var(--ifm-color-primary)' : '1px solid rgba(255,255,255,0.08)',
    backgroundColor: active ? 'var(--ifm-color-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--ifm-font-color-base)',
    fontSize: '0.78rem',
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
  } as React.CSSProperties),
};

const IMPORTANCE_COLORS: Record<Importance, { bg: string; color: string }> = {
  high: { bg: '#ff4d4f', color: '#fff' },
  medium: { bg: '#faad14', color: '#fff' },
  low: { bg: '#52c41a', color: '#fff' },
};

// ---------------------------------------------------------------------------
// Month options
// ---------------------------------------------------------------------------

interface MonthOption {
  label: string;
  year: number;
  month: number; // 1-12
}

function buildMonthOptions(): MonthOption[] {
  const months: MonthOption[] = [];
  // 2025-01 through 2026-06
  for (let y = 2025; y <= 2026; y++) {
    const endM = y === 2026 ? 6 : 12;
    for (let m = 1; m <= endM; m++) {
      months.push({ label: `${y}.${String(m).padStart(2, '0')}`, year: y, month: m });
    }
  }
  return months;
}

const MONTH_OPTIONS = buildMonthOptions();

// ---------------------------------------------------------------------------
// Inner component (client-only)
// ---------------------------------------------------------------------------

const EconomicCalendarInner: React.FC = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Find the closest valid month option for initial state
  const initialMonth = MONTH_OPTIONS.find(
    (m) => m.year === currentYear && m.month === currentMonth,
  ) || MONTH_OPTIONS[0];

  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<MonthOption>(initialMonth);

  // Compute upcoming threshold (7 days from now)
  const upcomingThreshold = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }, []);

  const isUpcoming = (dateStr: string) => {
    const d = new Date(dateStr);
    return d >= now && d <= upcomingThreshold;
  };

  const isPast = (dateStr: string) => new Date(dateStr) < now;

  // Filter + sort
  const filteredEvents = useMemo(() => {
    return ECONOMIC_EVENTS
      .filter((ev) => {
        const d = new Date(ev.date);
        if (d.getFullYear() !== selectedMonth.year || d.getMonth() + 1 !== selectedMonth.month) return false;
        if (selectedCountry !== 'all' && ev.country !== selectedCountry) return false;
        if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
        if (selectedImportance !== 'all' && ev.importance !== selectedImportance) return false;
        return true;
      })
      .sort((a, b) => {
        // Upcoming events first, then chronological
        const aUp = isUpcoming(a.date) ? 0 : 1;
        const bUp = isUpcoming(b.date) ? 0 : 1;
        if (aUp !== bUp) return aUp - bUp;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [selectedMonth, selectedCountry, selectedCategory, selectedImportance]);

  const totalEventsInMonth = ECONOMIC_EVENTS.filter((ev) => {
    const d = new Date(ev.date);
    return d.getFullYear() === selectedMonth.year && d.getMonth() + 1 === selectedMonth.month;
  }).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${m}/${d} (${weekday})`;
  };

  const getRowStyle = (ev: EconomicEvent): React.CSSProperties => {
    if (isUpcoming(ev.date)) {
      return {
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(22, 119, 255, 0.06)',
      };
    }
    if (isPast(ev.date)) {
      return {
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        opacity: 0.55,
      };
    }
    return { borderBottom: '1px solid rgba(255,255,255,0.08)' };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Economic Calendar</h3>
        <div style={styles.statsRow}>
          <span>
            {selectedMonth.label} | {filteredEvents.length}/{totalEventsInMonth} events
          </span>
        </div>
      </div>

      {/* Month selector */}
      <div style={styles.monthNav}>
        {MONTH_OPTIONS.map((m) => (
          <button
            key={m.label}
            style={styles.monthBtn(m.label === selectedMonth.label)}
            onClick={() => setSelectedMonth(m)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ height: '0.75rem' }} />

      {/* Filters */}
      <div style={styles.filtersRow}>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Countries</option>
          {(Object.entries(COUNTRY_NAMES) as [Country, string][]).map(([flag, name]) => (
            <option key={flag} value={flag}>
              {flag} {name}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Categories</option>
          {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={selectedImportance}
          onChange={(e) => setSelectedImportance(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Importance</option>
          {(Object.entries(IMPORTANCE_LABELS) as [Importance, string][]).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Time (KST)</th>
              <th style={styles.th}>Country</th>
              <th style={styles.th}>Event</th>
              <th style={{ ...styles.th, ...styles.thCenter }}>Category</th>
              <th style={{ ...styles.th, ...styles.thCenter }}>Importance</th>
              <th style={{ ...styles.th, ...styles.thRight }}>Previous</th>
              <th style={{ ...styles.th, ...styles.thRight }}>Forecast</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={8} style={styles.empty}>
                  No events matching the current filters.
                </td>
              </tr>
            ) : (
              filteredEvents.map((ev, idx) => {
                const impColor = IMPORTANCE_COLORS[ev.importance];
                return (
                  <tr key={`${ev.date}-${ev.event}-${idx}`} style={getRowStyle(ev)}>
                    <td style={styles.td}>
                      {formatDate(ev.date)}
                      {isUpcoming(ev.date) && <span style={styles.upcomingBadge}>D-day</span>}
                    </td>
                    <td style={styles.td}>{ev.time}</td>
                    <td style={styles.td}>
                      {ev.country}{' '}
                      <span style={{ fontSize: '0.78rem', color: '#a0a0a0' }}>
                        {COUNTRY_NAMES[ev.country]}
                      </span>
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: ev.importance === 'high' ? 600 : 400,
                        whiteSpace: 'normal',
                        minWidth: '180px',
                      }}
                    >
                      {ev.event}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#a0a0a0',
                        }}
                      >
                        {CATEGORY_LABELS[ev.category]}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: impColor.bg,
                          color: impColor.color,
                        }}
                      >
                        {IMPORTANCE_LABELS[ev.importance]}
                      </span>
                    </td>
                    <td style={{ ...styles.td, ...styles.mono }}>{ev.previous || '-'}</td>
                    <td style={{ ...styles.td, ...styles.mono }}>{ev.forecast || '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div>* Times are in KST (Korea Standard Time). Actual release times may vary.</div>
        <div>* Blue-highlighted rows are events within the next 7 days. Past events are dimmed.</div>
        <div>* Forecast values are consensus estimates and subject to revision.</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Exported wrapper with BrowserOnly for SSR compatibility
// ---------------------------------------------------------------------------

export default function EconomicCalendar() {
  return (
    <BrowserOnly fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading Economic Calendar...</div>}>
      {() => <EconomicCalendarInner />}
    </BrowserOnly>
  );
}
