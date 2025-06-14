
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, MapPin, Package } from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Shipping Policy</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            ShopApp Shipping Information
          </CardTitle>
          <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Shipping Locations
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We currently ship to all 50 United States and several international locations:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Domestic Shipping</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>All 50 United States</li>
                  <li>Washington D.C.</li>
                  <li>Puerto Rico</li>
                  <li>US Virgin Islands</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">International Shipping</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>Canada</li>
                  <li>United Kingdom</li>
                  <li>European Union</li>
                  <li>Australia</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Processing Time
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Orders are typically processed within:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Standard Items:</strong> 1-2 business days</li>
              <li><strong>Custom/Personalized Items:</strong> 3-5 business days</li>
              <li><strong>Pre-order Items:</strong> Ships on or before release date</li>
            </ul>
            <div className="bg-amber-50 p-4 rounded-lg mt-4">
              <p className="text-gray-700">
                <strong>Note:</strong> Processing time excludes weekends and holidays. Orders placed 
                after 2 PM EST will be processed the next business day.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Shipping Methods & Rates</h2>
            
            <h3 className="text-lg font-medium mb-3">Domestic Shipping</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">Method</th>
                    <th className="border border-gray-300 p-3 text-left">Delivery Time</th>
                    <th className="border border-gray-300 p-3 text-left">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Standard Shipping</td>
                    <td className="border border-gray-300 p-3">5-7 business days</td>
                    <td className="border border-gray-300 p-3">$5.99 (Free on orders $50+)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Express Shipping</td>
                    <td className="border border-gray-300 p-3">2-3 business days</td>
                    <td className="border border-gray-300 p-3">$12.99</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Overnight Shipping</td>
                    <td className="border border-gray-300 p-3">1 business day</td>
                    <td className="border border-gray-300 p-3">$24.99</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium mb-3 mt-6">International Shipping</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">Destination</th>
                    <th className="border border-gray-300 p-3 text-left">Delivery Time</th>
                    <th className="border border-gray-300 p-3 text-left">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Canada</td>
                    <td className="border border-gray-300 p-3">7-14 business days</td>
                    <td className="border border-gray-300 p-3">$15.99</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">United Kingdom</td>
                    <td className="border border-gray-300 p-3">10-21 business days</td>
                    <td className="border border-gray-300 p-3">$19.99</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">European Union</td>
                    <td className="border border-gray-300 p-3">10-21 business days</td>
                    <td className="border border-gray-300 p-3">$22.99</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3">Australia</td>
                    <td className="border border-gray-300 p-3">14-28 business days</td>
                    <td className="border border-gray-300 p-3">$25.99</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Order Tracking
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Once your order ships, you will receive:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Email confirmation with tracking number</li>
              <li>SMS updates (if enabled)</li>
              <li>Real-time tracking through your account</li>
              <li>Delivery confirmation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Special Shipping Considerations</h2>
            
            <h3 className="text-lg font-medium mb-2">Large Items</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Furniture and large appliances require special handling and may have extended delivery times. 
              White glove delivery service is available for an additional fee.
            </p>

            <h3 className="text-lg font-medium mb-2">Hazardous Materials</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Items containing batteries, liquids, or other hazardous materials may have shipping 
              restrictions and can only be shipped via ground service.
            </p>

            <h3 className="text-lg font-medium mb-2">Holiday Shipping</h3>
            <p className="text-gray-700 leading-relaxed">
              During peak holiday seasons, processing and delivery times may be extended. We recommend 
              placing orders early to ensure timely delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Shipping Issues</h2>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Lost or Damaged Packages</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                If your package is lost or damaged during shipping, please contact us within 7 days 
                of the expected delivery date. We will work with the shipping carrier to resolve the issue.
              </p>
              
              <h3 className="font-semibold mb-2">Incorrect Address</h3>
              <p className="text-gray-700 leading-relaxed">
                Please ensure your shipping address is correct before placing your order. Address 
                changes after shipment may result in additional fees or delivery delays.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">International Customers</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Important information for international orders:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Customs duties and taxes are the responsibility of the recipient</li>
              <li>Delivery times may be affected by customs processing</li>
              <li>Some products may be restricted in certain countries</li>
              <li>All prices are shown in USD</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about shipping or need assistance with your order:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mt-3">
              <ul className="text-gray-700 space-y-1">
                <li><strong>Email:</strong> shipping@shopapp.com</li>
                <li><strong>Phone:</strong> 1-800-SHOPAPP</li>
                <li><strong>Hours:</strong> Monday-Friday, 8 AM - 8 PM EST</li>
              </ul>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingPolicy;
