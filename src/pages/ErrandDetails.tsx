import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Clock, DollarSign, ShoppingCart, User } from "lucide-react";
import StatusUpdate from "@/components/errands/StatusUpdate";

interface ErrandDetails {
  id: string;
  user_id: string;
  runner_id: string | null;
  title: string;
  description: string;
  estimated_cost: number;
  service_fee: number;
  total_amount: number;
  status: string;
  priority: string;
  preferred_delivery_time: string;
  created_at: string;
  assigned_at: string | null;
  completed_at: string | null;
  shopping_list: any[];
  addresses: {
    label: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    delivery_instructions: string;
  };
  markets: {
    name: string;
    address: string;
    city: string;
  };
  profiles: {
    full_name: string;
    phone: string;
  };
  runner_profiles: {
    full_name: string;
    phone: string;
  } | null;
  errand_items: {
    id: string;
    item_name: string;
    quantity: number;
    unit: string;
    notes: string;
    found: boolean;
    actual_cost: number;
  }[];
}

const ErrandDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, userProfile } = useAuth();

  const { data: errand, isLoading } = useQuery({
    queryKey: ['errand-details', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('errands')
        .select(`
          *,
          addresses(label, street_address, city, state, zip_code, delivery_instructions),
          markets(name, address, city),
          profiles(full_name, phone),
          runner_profiles:profiles!errands_runner_id_fkey(full_name, phone),
          errand_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ErrandDetails;
    },
    enabled: !!id
  });

  const isOwner = user?.id === errand?.user_id;
  const isRunner = user?.id === errand?.runner_id;
  const canUpdateStatus = isRunner;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-8">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!errand) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-8">
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="text-center py-8">
                <p>Errand not found</p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{errand.title}</CardTitle>
                    <CardDescription className="mt-2">{errand.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(errand.status)}>
                      {errand.status}
                    </Badge>
                    <Badge className={getPriorityColor(errand.priority)}>
                      {errand.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shopping List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Shopping List ({errand.errand_items?.length || 0} items)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {errand.errand_items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{item.item_name}</div>
                            <div className="text-sm text-gray-600">
                              {item.quantity} {item.unit}
                              {item.notes && ` • ${item.notes}`}
                            </div>
                          </div>
                          {item.found && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Found
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Delivery Address</h4>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{errand.addresses.label}</p>
                        <p>{errand.addresses.street_address}</p>
                        <p>{errand.addresses.city}, {errand.addresses.state} {errand.addresses.zip_code}</p>
                        {errand.addresses.delivery_instructions && (
                          <p className="mt-2 text-blue-600">
                            Instructions: {errand.addresses.delivery_instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Shopping Location</h4>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{errand.markets.name}</p>
                        <p>{errand.markets.address}, {errand.markets.city}</p>
                      </div>
                    </div>

                    {errand.preferred_delivery_time && (
                      <div>
                        <h4 className="font-medium mb-2">Preferred Delivery Time</h4>
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status Update */}
                <StatusUpdate 
                  errandId={errand.id} 
                  currentStatus={errand.status} 
                  isRunner={canUpdateStatus}
                />

                {/* People Involved */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      People
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Customer</h4>
                      <p className="text-sm text-gray-600">{errand.profiles.full_name}</p>
                      {(isRunner || isOwner) && errand.profiles.phone && (
                        <p className="text-sm text-gray-600">{errand.profiles.phone}</p>
                      )}
                    </div>

                    {errand.runner_profiles && (
                      <div>
                        <h4 className="font-medium mb-1">Runner</h4>
                        <p className="text-sm text-gray-600">{errand.runner_profiles.full_name}</p>
                        {(isOwner || isRunner) && errand.runner_profiles.phone && (
                          <p className="text-sm text-gray-600">{errand.runner_profiles.phone}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Estimated Cost:</span>
                      <span className="text-sm">₦{errand.estimated_cost || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Service Fee:</span>
                      <span className="text-sm">₦{errand.service_fee || 0}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total:</span>
                      <span>₦{errand.total_amount || errand.estimated_cost || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      <p>Posted: {new Date(errand.created_at).toLocaleDateString()}</p>
                      {errand.assigned_at && (
                        <p>Assigned: {new Date(errand.assigned_at).toLocaleDateString()}</p>
                      )}
                      {errand.completed_at && (
                        <p>Completed: {new Date(errand.completed_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ErrandDetails;
