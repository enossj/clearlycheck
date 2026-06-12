export const taxRates = {
  US: { brackets: [[10000,0.10],[41775,0.12],[89075,0.22],[170050,0.24],[215950,0.32],[539900,0.35],[Infinity,0.37]], extra: 0.0765 },
  UK: { brackets: [[12570,0],[50270,0.20],[125140,0.40],[Infinity,0.45]], extra: 0.12 },
  IN: { brackets: [[250000,0],[500000,0.05],[750000,0.10],[1000000,0.15],[1250000,0.20],[1500000,0.25],[Infinity,0.30]], extra: 0.04 },
  EU: { flat: 0.35, label: 'Europe (avg estimate)' },
  AU: { brackets: [[18200,0],[45000,0.19],[120000,0.325],[180000,0.37],[Infinity,0.45]], extra: 0.02 },
  CA: { brackets: [[50197,0.15],[100392,0.205],[155625,0.26],[221708,0.29],[Infinity,0.33]], extra: 0.057 }
};

export function estimateTax(annual, country) {
  const t = taxRates[country];
  if (!t) return annual * 0.25;
  if (t.flat) return annual * t.flat;
  let tax = 0, prev = 0;
  for (const [limit, rate] of t.brackets) {
    if (annual <= prev) break;
    tax += (Math.min(annual, limit) - prev) * rate;
    prev = limit;
  }
  return tax + annual * (t.extra || 0);
}

export function salaryToHourly(annual, hoursPerWeek = 40, weeksPerYear = 52) {
  if (!hoursPerWeek || !weeksPerYear) return 0;
  return annual / (hoursPerWeek * weeksPerYear);
}

export function hourlyToSalary(hourly, hoursPerWeek = 40, weeksPerYear = 52) {
  return hourly * hoursPerWeek * weeksPerYear;
}
