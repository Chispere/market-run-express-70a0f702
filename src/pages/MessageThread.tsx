
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import MessageThreadComponent from "@/components/messaging/MessageThread";

const MessageThread = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-8">
          <div className="container mx-auto px-4 py-8">
            <p>Conversation not found</p>
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
          <MessageThreadComponent conversationId={id} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MessageThread;
