
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, DollarSign, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Errand {
  id: string;
  title: string;
  description: string;
  estimated_cost: number;
  service_fee: number;
  total_amount: number;
  preferred_delivery_time: string;
  priority: string;
  shopping_list: any[];
  addresses: {
    street_address: string;
    city: string;
    state: string;
  };
  markets: {
    name: string;
    address: string;
  };
  profiles: {
    full_name: string;
  };
}

const RunnerMarketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: availableErrands, isLoading, refetch } = useQuery({
    queryKey: ['available-errands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('errands')
        .select(`
          *,
          addresses(street_address, city, state),
          markets(name, address),
          profiles(full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Errand[];
    },
  });

  const acceptErrand = async (errandId: string) => {
    try {
      const { error } = await supabase
        .from('errands')
        .update({ 
          runner_id: user?.id,
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .eq('id', errandId);

      if (error) throw error;

      toast({
        title: "Errand Accepted!",
        description: "You've successfully accepted this errand.",
      });

      refetch();
    } catch (error) {
      console.error('Error accepting errand:', error);
      toast({
        title: "Error", 
        description: "Failed to accept errand. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Errands</h1>
            <p className="text-gray-600">Accept errands and start earning</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : availableErrands?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-gray-500">No available errands at the moment</p>
                <p className="text-sm text-gray-400">Check back later for new opportunities!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableErrands?.map((errand) => (
                <Card key={errand.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{errand.title}</CardTitle>
                      <Badge className={getPriorityColor(errand.priority)}>
                        {errand.priority}
                      </Badge>
                    </div>
                    <CardDescription>{errand.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{errand.addresses?.city}, {errand.addresses?.state}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      <span>{errand.shopping_list?.length || 0} items</span>
                    </div>

                    {errand.preferred_delivery_time && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(errand.preferred_delivery_time).toLocaleDateString()} at{' '}
                          {new Date(errand.preferred_delivery_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>₦{errand.service_fee}</span>
                      </div>
                      <Button 
                        onClick={() => acceptErrand(errand.id)}
                        size="sm"
                      >
                        Accept Errand
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500">
                      Posted by {errand.profiles?.full_name}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RunnerMarketplace;
