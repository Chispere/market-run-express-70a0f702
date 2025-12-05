
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import NotificationsList from "@/components/notifications/NotificationsList";

const Notifications = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4 py-8">
          <NotificationsList />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
