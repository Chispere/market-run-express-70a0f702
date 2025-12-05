export interface CostBreakdown {
  estimatedCost: number;
  serviceFee: number;
  runnerFee: number;
  platformFee: number;
  totalAmount: number;
}

export const calculateServiceFee = (estimatedCost: number): number => {
  // Base service fee: 15% of estimated cost + fixed fee
  // Minimum fee: $2.99, Maximum fee: $25.99
  const calculatedFee = (estimatedCost * 0.15) + 1.99;
  return Math.max(2.99, Math.min(25.99, calculatedFee));
};

export const calculateRunnerFee = (serviceFee: number): number => {
  // Runner gets 80% of service fee
  return serviceFee * 0.80;
};

export const calculatePlatformFee = (serviceFee: number): number => {
  // Platform keeps 20% of service fee
  return serviceFee * 0.20;
};

export const calculateCostBreakdown = (estimatedCost: number): CostBreakdown => {
  const serviceFee = calculateServiceFee(estimatedCost);
  const runnerFee = calculateRunnerFee(serviceFee);
  const platformFee = calculatePlatformFee(serviceFee);
  const totalAmount = estimatedCost + serviceFee;

  return {
    estimatedCost,
    serviceFee,
    runnerFee,
    platformFee,
    totalAmount,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);
};
