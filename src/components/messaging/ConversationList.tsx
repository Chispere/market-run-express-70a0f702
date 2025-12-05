
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User } from "lucide-react";
import { Link } from "react-router-dom";

interface Conversation {
  id: string;
  errand_id: string;
  user_id: string;
  runner_id: string;
  created_at: string;
  errands: {
    title: string;
    status: string;
  };
  user_profiles: {
    full_name: string;
  };
  runner_profiles: {
    full_name: string;
  };
  unread_count: number;
}

const ConversationList = () => {
  const { user } = useAuth();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          errands(title, status),
          user_profiles:profiles!conversations_user_id_fkey(full_name),
          runner_profiles:profiles!conversations_runner_id_fkey(full_name)
        `)
        .or(`user_id.eq.${user?.id},runner_id.eq.${user?.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get unread message counts
      const conversationsWithCounts = await Promise.all(
        data.map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user?.id)
            .is('read_at', null);

          return { ...conv, unread_count: count || 0 };
        })
      );

      return conversationsWithCounts as Conversation[];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!conversations?.length) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-gray-500">No conversations yet</p>
          <p className="text-sm text-gray-400">Messages will appear here when you have active errands</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => {
        const isRunner = user?.id === conversation.runner_id;
        const otherParty = isRunner ? conversation.user_profiles : conversation.runner_profiles;
        
        return (
          <Link key={conversation.id} to={`/messages/${conversation.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {otherParty?.full_name}
                    {conversation.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge variant="outline">
                    {isRunner ? 'Customer' : 'Runner'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Errand: {conversation.errands.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: {conversation.errands.status}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

export default ConversationList;
