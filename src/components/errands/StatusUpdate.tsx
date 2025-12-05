
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle, ShoppingCart, Package } from "lucide-react";

interface StatusUpdateProps {
  errandId: string;
  currentStatus: string;
  isRunner?: boolean;
}

const StatusUpdate = ({ errandId, currentStatus, isRunner = false }: StatusUpdateProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [notes, setNotes] = useState("");

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-500' },
    { value: 'assigned', label: 'Assigned', icon: CheckCircle, color: 'bg-blue-500' },
    { value: 'shopping', label: 'Shopping', icon: ShoppingCart, color: 'bg-purple-500' },
    { value: 'completed', label: 'Completed', icon: Package, color: 'bg-green-500' },
  ];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes?: string }) => {
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('errands')
        .update(updateData)
        .eq('id', errandId);

      if (error) throw error;

      // If there are notes, create a status log entry (we'll need this table later)
      if (notes) {
        console.log('Status update notes:', notes);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-errands'] });
      queryClient.invalidateQueries({ queryKey: ['my-errands'] });
      queryClient.invalidateQueries({ queryKey: ['runner-errands'] });
      toast({
        title: "Status Updated!",
        description: `Errand status changed to ${newStatus}`,
      });
      setNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = () => {
    if (newStatus !== currentStatus) {
      updateStatusMutation.mutate({ status: newStatus, notes });
    }
  };

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    if (!statusOption) return Clock;
    return statusOption.icon;
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || 'bg-gray-500';
  };

  const StatusIcon = getStatusIcon(currentStatus);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="h-5 w-5" />
          Current Status
          <Badge className={getStatusColor(currentStatus)}>
            {currentStatus}
          </Badge>
        </CardTitle>
        {isRunner && (
          <CardDescription>
            Update the errand status as you progress
          </CardDescription>
        )}
      </CardHeader>
      
      {isRunner && (
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="status">Update Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Update Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status update..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleStatusUpdate}
            disabled={newStatus === currentStatus || updateStatusMutation.isPending}
            className="w-full"
          >
            {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default StatusUpdate;
