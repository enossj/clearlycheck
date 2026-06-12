export function calculateAge(birthDate, asOfDate = new Date()) {
  if (!birthDate || isNaN(birthDate.getTime())) return null;
  if (birthDate > asOfDate) return { error: 'future' };

  let years = asOfDate.getFullYear() - birthDate.getFullYear();
  let months = asOfDate.getMonth() - birthDate.getMonth();
  let days = asOfDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((asOfDate - birthDate) / (1000 * 60 * 60 * 24));

  return { years, months, days, totalDays };
}

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
