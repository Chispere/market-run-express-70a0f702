
import { ShoppingCart } from "lucide-react";

export const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">MarketRun</span>
            </div>
            <p className="text-gray-400 mb-4">
              Making grocery shopping effortless with trusted runners and fast delivery.
            </p>
            <div className="flex space-x-4">
              <span className="text-2xl cursor-pointer hover:text-primary">📱</span>
              <span className="text-2xl cursor-pointer hover:text-primary">📧</span>
              <span className="text-2xl cursor-pointer hover:text-primary">🐦</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Customers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">How it Works</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Track Order</a></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Runners</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Become a Runner</a></li>
              <li><a href="#" className="hover:text-white">Earnings</a></li>
              <li><a href="#" className="hover:text-white">Runner App</a></li>
              <li><a href="#" className="hover:text-white">Requirements</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Press</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 MarketRun. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
};
