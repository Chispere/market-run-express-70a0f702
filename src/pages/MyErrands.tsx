
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, DollarSign, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface Errand {
  id: string;
  title: string;
  description: string;
  estimated_cost: number;
  service_fee: number;
  total_amount: number;
  status: string;
  preferred_delivery_time: string;
  priority: string;
  created_at: string;
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
  runner_profiles: {
    full_name: string;
  } | null;
}

const MyErrands = () => {
  const { user } = useAuth();

  const { data: myErrands, isLoading } = useQuery({
    queryKey: ['my-errands', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('errands')
        .select(`
          *,
          addresses(street_address, city, state),
          markets(name, address),
          runner_profiles:profiles!errands_runner_id_fkey(full_name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Errand[];
    },
    enabled: !!user?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'assigned': return 'bg-blue-500';
      case 'shopping': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
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
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Errands</h1>
              <p className="text-gray-600">Track and manage your posted errands</p>
            </div>
            <Link to="/post-errand">
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Post New Errand
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : myErrands?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-gray-500">You haven't posted any errands yet</p>
                <p className="text-sm text-gray-400 mb-4">Start by posting your first errand!</p>
                <Link to="/post-errand">
                  <Button>Post Your First Errand</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myErrands?.map((errand) => (
                <Card key={errand.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{errand.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(errand.status)}>
                          {errand.status}
                        </Badge>
                        <Badge className={getPriorityColor(errand.priority)}>
                          {errand.priority}
                        </Badge>
                      </div>
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

                    {errand.runner_profiles && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>Runner: {errand.runner_profiles.full_name}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>₦{errand.total_amount || errand.estimated_cost}</span>
                      </div>
                      <Link to={`/errand/${errand.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>

                    <div className="text-xs text-gray-500">
                      Posted {new Date(errand.created_at).toLocaleDateString()}
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

export default MyErrands;
