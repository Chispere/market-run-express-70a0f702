
export const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Busy Mom",
      content: "MarketRun has been a lifesaver! I can get fresh groceries delivered while I'm at work. The runners are always professional and careful with my orders.",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Mike Chen",
      role: "Student",
      content: "Perfect for when I'm studying and can't leave the library. The delivery is super fast and the prices are exactly what I'd pay at the market.",
      rating: 5,
      avatar: "👨‍🎓"
    },
    {
      name: "Lisa Williams",
      role: "Senior Citizen",
      content: "I love being able to shop from my favorite local market without having to carry heavy bags. The runners are so helpful and kind.",
      rating: 5,
      avatar: "👵"
    }
  ];

  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust MarketRun for their daily shopping needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{testimonial.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              
              <p className="text-gray-700 italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
