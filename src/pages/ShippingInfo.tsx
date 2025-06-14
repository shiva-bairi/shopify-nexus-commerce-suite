
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, MapPin, Package, DollarSign } from 'lucide-react';

const ShippingInfo = () => {
  const shippingMethods = [
    {
      name: "Standard Shipping",
      time: "5-7 business days",
      cost: "Free on orders over $50",
      description: "Our most popular shipping option",
      icon: Package
    },
    {
      name: "Express Shipping",
      time: "2-3 business days", 
      cost: "$9.99",
      description: "Faster delivery for urgent orders",
      icon: Truck
    },
    {
      name: "Overnight Shipping",
      time: "1 business day",
      cost: "$24.99",
      description: "Next business day delivery",
      icon: Clock
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Shipping Information</h1>
      
      {/* Shipping Methods */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">Shipping Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shippingMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <Card key={index}>
                <CardHeader className="text-center">
                  <IconComponent className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                  <CardTitle className="text-lg">{method.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary" className="mb-2">
                    {method.time}
                  </Badge>
                  <p className="font-semibold text-lg text-green-600 mb-2">
                    {method.cost}
                  </p>
                  <p className="text-sm text-gray-600">
                    {method.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Processing & Handling */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Processing & Handling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Order Processing</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Orders placed before 2 PM EST ship the same day</li>
                <li>• Orders placed after 2 PM EST ship the next business day</li>
                <li>• Weekend orders ship on Monday</li>
                <li>• Custom orders may require additional processing time</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Handling Time</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Standard items: 1-2 business days</li>
                <li>• Custom/personalized items: 3-5 business days</li>
                <li>• Pre-order items: As specified on product page</li>
                <li>• Large/oversized items: 2-3 business days</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Areas */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Domestic Shipping</h3>
              <p className="text-gray-700 mb-3">
                We ship to all 50 US states, including Alaska and Hawaii.
              </p>
              <ul className="space-y-1 text-gray-700">
                <li>• Continental US: Standard rates apply</li>
                <li>• Alaska & Hawaii: Additional charges may apply</li>
                <li>• PO Boxes: Standard and Express shipping only</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">International Shipping</h3>
              <p className="text-gray-700 mb-3">
                We ship to over 100 countries worldwide.
              </p>
              <ul className="space-y-1 text-gray-700">
                <li>• Delivery time: 7-21 business days</li>
                <li>• Customs fees may apply</li>
                <li>• Restricted items vary by country</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-700">
                Enjoy free standard shipping on all orders over $50 within the continental US.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Order Tracking</h3>
              <p className="text-gray-700">
                Once your order ships, you'll receive a tracking number via email. You can also track your order in your account dashboard.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Delivery Issues</h3>
              <p className="text-gray-700">
                If you experience any delivery issues, please contact our customer service team at support@shopnexus.com or 1-800-SHOPNEXUS.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Shipping Restrictions</h3>
              <p className="text-gray-700">
                Some items may have shipping restrictions due to size, weight, or legal requirements. These restrictions will be noted on the product page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingInfo;
