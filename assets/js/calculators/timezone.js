export function getLocalHour(tz, referenceDate) {
  const str = referenceDate.toLocaleString('en-US', { timeZone: tz, hour: 'numeric', hour12: false });
  return parseInt(str.replace('24', '0'), 10);
}

export function findOverlapHours(timezones, workStart, workEnd, referenceDate = new Date()) {
  const baseDate = new Date(Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate()
  ));

  const overlapHours = [];
  for (let utcH = 0; utcH < 24; utcH++) {
    const refDate = new Date(baseDate.getTime() + utcH * 3600000);
    const allWorking = timezones.every(tz => {
      const localH = getLocalHour(tz, refDate);
      return localH >= workStart && localH < workEnd;
    });
    if (allWorking) overlapHours.push(utcH);
  }
  return overlapHours;
}

export function groupConsecutiveHours(hours) {
  const slots = [];
  let slotStart = null;
  hours.forEach((h, i) => {
    if (slotStart === null) slotStart = h;
    if (i === hours.length - 1 || hours[i + 1] !== h + 1) {
      slots.push({ utcStart: slotStart, utcEnd: h + 1 });
      slotStart = null;
    }
  });
  return slots;
}
