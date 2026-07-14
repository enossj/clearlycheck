export const BMI_CATEGORIES = [
  { max: 18.5, key: 'underweight', label: 'Underweight' },
  { max: 25, key: 'normal', label: 'Normal weight' },
  { max: 30, key: 'overweight', label: 'Overweight' },
  { max: 35, key: 'obese', label: 'Obese (Class I)' },
  { max: 40, key: 'obese2', label: 'Obese (Class II)' },
  { max: Infinity, key: 'obese3', label: 'Obese (Class III)' }
];

export function calculateBMI(weightKg, heightM) {
  if (!weightKg || !heightM || heightM <= 0) return null;
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi) {
  if (bmi == null || isNaN(bmi)) return null;
  for (const cat of BMI_CATEGORIES) {
    if (bmi < cat.max) return cat;
  }
  return BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

export function kgFromLbs(lbs) { return lbs * 0.453592; }
export function mFromFtIn(ft, inches) { return (ft * 12 + inches) * 0.0254; }

export function healthyWeightRange(heightM) {
  if (!heightM || heightM <= 0) return null;
  const min = 18.5 * heightM * heightM;
  const max = 24.9 * heightM * heightM;
  return { min, max };
}
