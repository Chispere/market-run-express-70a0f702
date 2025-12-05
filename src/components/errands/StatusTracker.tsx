
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Package, Truck, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StatusTrackerProps {
  errandId: string;
  currentStatus: string;
  isRunner: boolean;
  trackingNotes?: string[];
  pickupTime?: string;
  deliveryTime?: string;
  estimatedDelivery?: string;
}

const StatusTracker = ({ 
  errandId, 
  currentStatus, 
  isRunner, 
  trackingNotes = [],
  pickupTime,
  deliveryTime,
  estimatedDelivery 
}: StatusTrackerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, note, time }: { status: string; note?: string; time?: string }) => {
      const updates: any = { status };
      
      if (note) {
        const updatedNotes = [...trackingNotes, `${new Date().toLocaleString()}: ${note}`];
        updates.tracking_notes = updatedNotes;
      }
      
      if (time) {
        if (status === 'in_progress') {
          updates.pickup_time = new Date().toISOString();
        } else if (status === 'delivered') {
          updates.delivery_time = new Date().toISOString();
        }
        updates.estimated_delivery = time;
      }

      const { error } = await supabase
        .from('errands')
        .update(updates)
        .eq('id', errandId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Errand status has been updated successfully.",
      });
      setNewNote("");
      setEstimatedTime("");
      queryClient.invalidateQueries({ queryKey: ['errand'] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'assigned':
        return <Package className="h-4 w-4" />;
      case 'in_progress':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-500';
      case 'assigned':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'delivered':
        return 'bg-green-500';
      case 'completed':
        return 'bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  const statuses = [
    { key: 'pending', label: 'Pending', description: 'Waiting for runner assignment' },
    { key: 'assigned', label: 'Assigned', description: 'Runner has been assigned' },
    { key: 'in_progress', label: 'In Progress', description: 'Runner is working on your errand' },
    { key: 'delivered', label: 'Delivered', description: 'Items have been delivered' },
    { key: 'completed', label: 'Completed', description: 'Errand is complete' },
  ];

  const currentStatusIndex = statuses.findIndex(s => s.key === currentStatus);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Errand Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Timeline */}
        <div className="space-y-4">
          {statuses.map((status, index) => {
            const isActive = index <= currentStatusIndex;
            const isCurrent = status.key === currentStatus;
            
            return (
              <div key={status.key} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? getStatusColor(status.key) : 'bg-gray-200'
                } text-white`}>
                  {getStatusIcon(status.key)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                      {status.label}
                    </h4>
                    {isCurrent && <Badge>Current</Badge>}
                  </div>
                  <p className="text-sm text-gray-600">{status.description}</p>
                  {status.key === 'in_progress' && pickupTime && (
                    <p className="text-xs text-gray-500">
                      Picked up: {new Date(pickupTime).toLocaleString()}
                    </p>
                  )}
                  {status.key === 'delivered' && deliveryTime && (
                    <p className="text-xs text-gray-500">
                      Delivered: {new Date(deliveryTime).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Estimated Delivery */}
        {estimatedDelivery && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Estimated Delivery</p>
            <p className="text-blue-600">{new Date(estimatedDelivery).toLocaleString()}</p>
          </div>
        )}

        {/* Tracking Notes */}
        {trackingNotes.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Updates</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {trackingNotes.map((note, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Runner Controls */}
        {isRunner && currentStatus !== 'completed' && currentStatus !== 'delivered' && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Update Status</h4>
            
            {currentStatus === 'assigned' && (
              <div className="space-y-3">
                <Input
                  type="datetime-local"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="Estimated delivery time"
                />
                <Button 
                  onClick={() => updateStatusMutation.mutate({ 
                    status: 'in_progress', 
                    note: 'Started working on errand',
                    time: estimatedTime 
                  })}
                  disabled={updateStatusMutation.isPending}
                  className="w-full"
                >
                  Start Errand
                </Button>
              </div>
            )}

            {currentStatus === 'in_progress' && (
              <Button 
                onClick={() => updateStatusMutation.mutate({ 
                  status: 'delivered',
                  note: 'Items delivered successfully'
                })}
                disabled={updateStatusMutation.isPending}
                className="w-full"
              >
                Mark as Delivered
              </Button>
            )}

            <div className="space-y-2">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a tracking update..."
                rows={2}
              />
              <Button 
                variant="outline"
                onClick={() => updateStatusMutation.mutate({ 
                  status: currentStatus,
                  note: newNote 
                })}
                disabled={!newNote.trim() || updateStatusMutation.isPending}
              >
                Add Update
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusTracker;
