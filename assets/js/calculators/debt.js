export function amortize(principal, monthlyRate, payment) {
  let bal = principal;
  let totalInterest = 0;
  let months = 0;

  while (bal > 0.01 && months < 1200) {
    const interest = bal * monthlyRate;
    if (payment <= interest) {
      return { months: Infinity, totalInterest: Infinity, payoffPossible: false };
    }
    const principalPaid = Math.min(payment - interest, bal);
    totalInterest += interest;
    bal -= principalPaid;
    months++;
  }

  return {
    months,
    totalInterest,
    totalPaid: principal + totalInterest,
    payoffPossible: true
  };
}

export function isPaymentSufficient(balance, monthlyRate, payment) {
  return payment > balance * monthlyRate;
}
