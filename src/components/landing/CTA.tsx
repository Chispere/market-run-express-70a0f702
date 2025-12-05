
import { Button } from "@/components/ui/button";

export const CTA = () => {
  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Start Shopping?
        </h2>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Join thousands of happy customers and experience the convenience of personal market shopping today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
            Download App
          </Button>
          <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary">
            Get Started Online
          </Button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm opacity-75">
            Available for delivery in major cities • Free delivery on orders over $50
          </p>
        </div>
      </div>
    </section>
  );
};
