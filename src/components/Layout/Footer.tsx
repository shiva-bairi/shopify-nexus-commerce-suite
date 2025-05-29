
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ShopNexus</h3>
            <p className="text-gray-400 text-sm">
              Your one-stop destination for quality products at great prices.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-gray-400 hover:text-white">All Products</Link></li>
              <li><Link to="/categories" className="text-gray-400 hover:text-white">Categories</Link></li>
              <li><Link to="/deals" className="text-gray-400 hover:text-white">Deals</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="text-gray-400 hover:text-white">My Account</Link></li>
              <li><Link to="/orders" className="text-gray-400 hover:text-white">Order History</Link></li>
              <li><Link to="/wishlist" className="text-gray-400 hover:text-white">Wishlist</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              <li><Link to="/shipping" className="text-gray-400 hover:text-white">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-white">Returns</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 ShopNexus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
