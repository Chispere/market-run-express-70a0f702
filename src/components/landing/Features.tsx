
import { Clock, MapPin, Shield, User } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Clock,
      title: "Fast Delivery",
      description: "Get your groceries delivered within 15-30 minutes from your selected market."
    },
    {
      icon: MapPin,
      title: "Choose Your Market",
      description: "Select from 50+ partner markets including supermarkets, local stores, and specialty shops."
    },
    {
      icon: Shield,
      title: "Trusted Runners",
      description: "All our runners are verified and rated by the community for your peace of mind."
    },
    {
      icon: User,
      title: "Personal Service",
      description: "Chat with your runner for special requests or substitutions in real-time."
    }
  ];

  return (
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose MarketRun?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We make grocery shopping effortless with our reliable service and trusted community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow duration-300 hover-scale"
            >
              <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
