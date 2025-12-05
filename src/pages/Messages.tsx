
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ConversationList from "@/components/messaging/ConversationList";

const Messages = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">Communicate with customers and runners</p>
          </div>
          <ConversationList />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
