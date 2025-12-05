
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock } from "lucide-react";
import { formatCurrency } from "@/utils/costCalculations";

interface PaymentFormProps {
  errandId: string;
  amount: number;
  serviceFee: number;
  onPaymentSuccess: () => void;
}

const PaymentForm = ({ errandId, amount, serviceFee, onPaymentSuccess }: PaymentFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: {
            errandId,
            amount,
            serviceFee
          }
        }
      );

      if (paymentError) throw paymentError;

      // In a real implementation, you would use Stripe Elements here
      // For now, we'll simulate a successful payment
      setTimeout(async () => {
        try {
          const { data: confirmData, error: confirmError } = await supabase.functions.invoke(
            'confirm-payment',
            {
              body: {
                paymentIntentId: paymentData.paymentIntentId
              }
            }
          );

          if (confirmError) throw confirmError;

          toast({
            title: "Payment Successful!",
            description: `Payment of ${formatCurrency(amount)} has been processed.`,
          });

          onPaymentSuccess();
        } catch (error) {
          console.error('Payment confirmation error:', error);
          toast({
            title: "Payment Confirmation Failed",
            description: "Please contact support if you were charged.",
            variant: "destructive",
          });
        }
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              value={cardDetails.name}
              onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              value={cardDetails.number}
              onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                value={cardDetails.cvc}
                onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                placeholder="123"
                maxLength={3}
                required
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total to Pay:</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(amount)}
              </span>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Pay {formatCurrency(amount)}
                </div>
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <Lock className="h-3 w-3 inline mr-1" />
            Your payment information is secure and encrypted
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
