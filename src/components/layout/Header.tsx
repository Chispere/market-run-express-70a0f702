
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Menu, MessageCircle, Bell } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  // Get unread notifications count
  const { data: unreadNotifications } = useQuery({
    queryKey: ['unread-notifications', user?.id],
    queryFn: async () => {
      if (!supabase) return 0;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .is('read_at', null);
      
      return count || 0;
    },
    enabled: !!user?.id && isSupabaseConfigured(),
  });

  // Get unread messages count
  const { data: unreadMessages } = useQuery({
    queryKey: ['unread-messages', user?.id],
    queryFn: async () => {
      if (!supabase) return 0;
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`user_id.eq.${user?.id},runner_id.eq.${user?.id}`);

      if (!conversations?.length) return 0;

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversations.map(c => c.id))
        .neq('sender_id', user?.id)
        .is('read_at', null);

      return count || 0;
    },
    enabled: !!user?.id && isSupabaseConfigured(),
  });

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">MarketRun</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-primary transition-colors">
            Features
          </a>
          <a href="#markets" className="text-gray-600 hover:text-primary transition-colors">
            Markets
          </a>
          <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors">
            Testimonials
          </a>
          <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">
            Contact
          </a>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/messages" className="relative">
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4" />
                  {unreadMessages && unreadMessages > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 text-xs flex items-center justify-center">
                      {unreadMessages}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link to="/notifications" className="relative">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications && unreadNotifications > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 text-xs flex items-center justify-center">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <a href="#features" className="block text-gray-600 hover:text-primary">
              Features
            </a>
            <a href="#markets" className="block text-gray-600 hover:text-primary">
              Markets
            </a>
            <a href="#testimonials" className="block text-gray-600 hover:text-primary">
              Testimonials
            </a>
            <a href="#contact" className="block text-gray-600 hover:text-primary">
              Contact
            </a>
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Link to="/messages" className="relative">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                      {unreadMessages && unreadMessages > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {unreadMessages}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  <Link to="/notifications" className="relative">
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                      {unreadNotifications && unreadNotifications > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button className="w-full">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
