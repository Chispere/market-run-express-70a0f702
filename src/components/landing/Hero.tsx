
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export const Hero = () => {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Your Personal
            <span className="text-primary block">Market Runner</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in">
            Skip the grocery store queues. Post your shopping list, choose your favorite market, 
            and get everything delivered to your doorstep by trusted runners.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
            <Button size="lg" className="px-8 py-4 text-lg">
              Start Shopping
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
              Become a Runner
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-scale-in">
              <div className="text-3xl font-bold text-primary">15min</div>
              <div className="text-gray-600">Average Delivery</div>
            </div>
            <div className="animate-scale-in">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-gray-600">Partner Markets</div>
            </div>
            <div className="animate-scale-in">
              <div className="text-3xl font-bold text-primary">10k+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <ArrowDown className="h-6 w-6 mx-auto text-gray-400 animate-bounce" />
      </div>
    </section>
  );
};
