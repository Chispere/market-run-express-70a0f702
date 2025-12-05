
export const Markets = () => {
  const markets = [
    { name: "Fresh Market", logo: "🥬", category: "Organic Produce" },
    { name: "City Supermarket", logo: "🛒", category: "General Groceries" },
    { name: "Ocean Fresh", logo: "🐟", category: "Seafood & Fish" },
    { name: "Bakery Corner", logo: "🥖", category: "Fresh Bread & Pastries" },
    { name: "Spice World", logo: "🌶️", category: "Spices & Condiments" },
    { name: "Dairy Farm", logo: "🥛", category: "Milk & Dairy Products" }
  ];

  return (
    <section id="markets" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Partner Markets
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Shop from your favorite local markets and supermarkets all in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {markets.map((market, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300 hover-scale"
            >
              <div className="text-4xl mb-3">{market.logo}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{market.name}</h3>
              <p className="text-sm text-gray-600">{market.category}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Can't find your favorite market?</p>
          <button className="text-primary font-semibold hover:underline">
            Request a new market →
          </button>
        </div>
      </div>
    </section>
  );
};
