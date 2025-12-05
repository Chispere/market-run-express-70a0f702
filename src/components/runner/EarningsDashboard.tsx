
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";

interface Earning {
  id: string;
  base_amount: number;
  service_fee: number;
  platform_fee: number;
  net_earnings: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  errand: {
    title: string;
  };
}

const EarningsDashboard = () => {
  const { user } = useAuth();

  const { data: earnings, isLoading } = useQuery({
    queryKey: ['runner-earnings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('runner_earnings')
        .select(`
          *,
          errand:errands(title)
        `)
        .eq('runner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Earning[];
    },
    enabled: !!user?.id,
  });

  const totalEarnings = earnings?.reduce((sum, earning) => sum + earning.net_earnings, 0) || 0;
  const pendingEarnings = earnings?.filter(e => e.status === 'pending').reduce((sum, earning) => sum + earning.net_earnings, 0) || 0;
  const paidEarnings = earnings?.filter(e => e.status === 'paid').reduce((sum, earning) => sum + earning.net_earnings, 0) || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paidEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {!earnings?.length ? (
            <p className="text-center text-gray-500 py-8">No earnings yet</p>
          ) : (
            <div className="space-y-4">
              {earnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{earning.errand.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(earning.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +${earning.net_earnings.toFixed(2)}
                    </p>
                    <Badge variant={earning.status === 'paid' ? 'default' : 'secondary'}>
                      {earning.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsDashboard;
