
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, MapPin, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes: string;
}

const PostErrandForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [marketId, setMarketId] = useState("");
  const [addressId, setAddressId] = useState("");
  const [priority, setPriority] = useState("normal");
  const [preferredTime, setPreferredTime] = useState("");
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  
  // New item form state
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    unit: "pcs",
    notes: ""
  });

  // Fetch markets for selection
  const { data: markets = [] } = useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch user addresses
  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const addShoppingItem = () => {
    if (!newItem.name.trim()) return;
    
    const item: ShoppingItem = {
      id: Date.now().toString(),
      ...newItem
    };
    
    setShoppingItems([...shoppingItems, item]);
    setNewItem({ name: "", quantity: 1, unit: "pcs", notes: "" });
  };

  const removeShoppingItem = (id: string) => {
    setShoppingItems(shoppingItems.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!addressId) {
      toast({
        title: "Error",
        description: "Please select a delivery address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create the errand
      const { data: errand, error: errandError } = await supabase
        .from('errands')
        .insert({
          user_id: user.id,
          market_id: marketId,
          delivery_address_id: addressId,
          title,
          description,
          shopping_list: shoppingItems,
          priority,
          preferred_delivery_time: preferredTime ? new Date(preferredTime).toISOString() : null,
          status: 'pending'
        })
        .select()
        .single();

      if (errandError) throw errandError;

      // Create individual errand items
      if (shoppingItems.length > 0) {
        const items = shoppingItems.map(item => ({
          errand_id: errand.id,
          item_name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes
        }));

        const { error: itemsError } = await supabase
          .from('errand_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Errand Posted!",
        description: "Your errand has been posted successfully. Runners can now see and accept it.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setMarketId("");
      setAddressId("");
      setPriority("normal");
      setPreferredTime("");
      setShoppingItems([]);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Post New Errand
        </CardTitle>
        <CardDescription>
          Create a new shopping errand for runners to complete
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Errand Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekly grocery shopping"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any special instructions or preferences..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="market">Market</Label>
                <Select value={marketId} onValueChange={setMarketId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a market" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        {market.name} - {market.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Delivery Address</Label>
              <Select value={addressId} onValueChange={setAddressId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery address" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map((address) => (
                    <SelectItem key={address.id} value={address.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {address.label} - {address.street_address}, {address.city}
                        {address.is_default && <Badge variant="secondary">Default</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {addresses.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  You need to add a delivery address first. Go to your profile to add addresses.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="preferredTime">Preferred Delivery Time (Optional)</Label>
              <Input
                id="preferredTime"
                type="datetime-local"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
              />
            </div>
          </div>

          {/* Shopping List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Shopping List</h3>
              <Badge variant="secondary">{shoppingItems.length} items</Badge>
            </div>

            {/* Add new item form */}
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Item name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addShoppingItem())}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                      className="w-20"
                    />
                    <Select 
                      value={newItem.unit} 
                      onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">pcs</SelectItem>
                        <SelectItem value="lbs">lbs</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="gallons">gal</SelectItem>
                        <SelectItem value="liters">L</SelectItem>
                        <SelectItem value="boxes">box</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" onClick={addShoppingItem} className="w-full md:w-auto">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Shopping items list */}
            {shoppingItems.length > 0 && (
              <div className="space-y-2">
                {shoppingItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="outline">
                              {item.quantity} {item.unit}
                            </Badge>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeShoppingItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || shoppingItems.length === 0 || !addressId}
            >
              {isSubmitting ? "Posting..." : "Post Errand"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostErrandForm;
