
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { CostBreakdown as CostBreakdownType, formatCurrency } from "@/utils/costCalculations";

interface CostBreakdownProps {
  breakdown: CostBreakdownType;
  showRunnerFee?: boolean;
}

const CostBreakdown = ({ breakdown, showRunnerFee = false }: CostBreakdownProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Estimated Shopping Cost:</span>
          <span>{formatCurrency(breakdown.estimatedCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Service Fee:</span>
          <span>{formatCurrency(breakdown.serviceFee)}</span>
        </div>
        {showRunnerFee && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Your Earnings:</span>
            <span>{formatCurrency(breakdown.runnerFee)}</span>
          </div>
        )}
        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold">
            <span>Total Amount:</span>
            <span>{formatCurrency(breakdown.totalAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostBreakdown;
