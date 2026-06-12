import { describe, it, expect } from 'vitest';
import { salaryToHourly, hourlyToSalary, estimateTax } from '../assets/js/calculators/salary.js';
import { amortize, isPaymentSufficient } from '../assets/js/calculators/debt.js';
import { findOverlapHours, groupConsecutiveHours, getLocalHour } from '../assets/js/calculators/timezone.js';
import { calculateBMI, getBMICategory, healthyWeightRange } from '../assets/js/calculators/bmi.js';
import { calculateAge, isLeapYear } from '../assets/js/calculators/age.js';

describe('salary', () => {
  it('converts $50,000 annual to $24.04/hr at 40h x 52 weeks', () => {
    expect(salaryToHourly(50000)).toBeCloseTo(24.04, 2);
  });

  it('converts $20/hr to $41,600 annual', () => {
    expect(hourlyToSalary(20)).toBe(41600);
  });

  it('returns 0 for zero hours', () => {
    expect(salaryToHourly(50000, 0)).toBe(0);
  });

  it('estimates US tax for mid-range salary', () => {
    const tax = estimateTax(50000, 'US');
    expect(tax).toBeGreaterThan(5000);
    expect(tax).toBeLessThan(20000);
  });
});

describe('debt', () => {
  it('flags insufficient payment when payment <= monthly interest', () => {
    expect(isPaymentSufficient(10000, 0.01, 50)).toBe(false);
    expect(isPaymentSufficient(10000, 0.01, 150)).toBe(true);
  });

  it('amortizes simple debt within 1200 months', () => {
    const result = amortize(10000, 0.01, 200);
    expect(result.payoffPossible).toBe(true);
    expect(result.months).toBeGreaterThan(0);
    expect(result.months).toBeLessThan(1200);
  });

  it('returns payoffPossible false when payment too low', () => {
    const result = amortize(10000, 0.01, 50);
    expect(result.payoffPossible).toBe(false);
  });
});

describe('timezone', () => {
  it('finds overlap between NYC and London 9-17 on a winter weekday', () => {
    const ref = new Date('2026-01-15T12:00:00Z');
    const hours = findOverlapHours(['America/New_York', 'Europe/London'], 9, 17, ref);
    expect(hours.length).toBeGreaterThan(0);
  });

  it('groups consecutive UTC hours into slots', () => {
    expect(groupConsecutiveHours([14, 15, 16, 20])).toEqual([
      { utcStart: 14, utcEnd: 17 },
      { utcStart: 20, utcEnd: 21 }
    ]);
  });

  it('reads local hour via Intl for half-hour offset zone', () => {
    const ref = new Date('2026-06-15T12:00:00Z');
    const hour = getLocalHour('Asia/Kolkata', ref);
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThan(24);
  });
});

describe('bmi', () => {
  it('calculates BMI correctly for 70kg 1.75m', () => {
    expect(calculateBMI(70, 1.75)).toBeCloseTo(22.86, 1);
  });

  it('returns null for invalid inputs', () => {
    expect(calculateBMI(0, 1.75)).toBeNull();
    expect(calculateBMI(70, 0)).toBeNull();
  });

  it('categorizes normal BMI', () => {
    expect(getBMICategory(22).label).toBe('Normal weight');
  });

  it('returns healthy weight range', () => {
    const range = healthyWeightRange(1.75);
    expect(range.min).toBeCloseTo(56.7, 0);
    expect(range.max).toBeCloseTo(76.3, 0);
  });
});

describe('age', () => {
  it('calculates age across year boundary', () => {
    const birth = new Date(1990, 5, 15);
    const asOf = new Date(2026, 5, 14);
    const age = calculateAge(birth, asOf);
    expect(age.years).toBe(35);
    expect(age.months).toBe(11);
  });

  it('rejects future birth dates', () => {
    const future = new Date(2099, 0, 1);
    expect(calculateAge(future)).toEqual({ error: 'future' });
  });

  it('detects leap years', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
  });
});
