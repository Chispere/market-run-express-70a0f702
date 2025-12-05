
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import PostErrandForm from "@/components/errands/PostErrandForm";

const PostErrand = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4 py-8">
          <PostErrandForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostErrand;
