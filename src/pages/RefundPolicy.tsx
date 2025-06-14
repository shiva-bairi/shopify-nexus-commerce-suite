
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const RefundPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>ShopApp Refund & Return Policy</CardTitle>
          <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              30-Day Return Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We offer a 30-day return policy on most items. You have 30 calendar days from the date 
              of delivery to return an item and receive a full refund, provided the item meets our 
              return conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Return Conditions
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To be eligible for a return, your item must be:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>In the same condition that you received it</li>
              <li>Unworn or unused</li>
              <li>With tags and in its original packaging</li>
              <li>Accompanied by a receipt or proof of purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Non-Returnable Items
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              The following items cannot be returned:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Perishable goods (food, flowers, etc.)</li>
              <li>Custom or personalized items</li>
              <li>Health and personal care items</li>
              <li>Hazardous materials</li>
              <li>Digital downloads</li>
              <li>Gift cards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How to Initiate a Return</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Log into your account and go to "Order History"</li>
                <li>Find the order containing the item you want to return</li>
                <li>Click "Request Return" and follow the instructions</li>
                <li>Print the return shipping label provided</li>
                <li>Package the item securely with all original packaging</li>
                <li>Drop off at any authorized shipping location</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Processing Times
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Return Processing</h3>
                <p className="text-gray-700">3-5 business days after we receive your return</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Refund to Account</h3>
                <p className="text-gray-700">5-10 business days after processing</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Refund Methods</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Refunds will be issued to the original payment method used for the purchase:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
              <li><strong>PayPal:</strong> 3-5 business days</li>
              <li><strong>Bank Transfer:</strong> 7-14 business days</li>
              <li><strong>Store Credit:</strong> Immediate (for eligible returns)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Shipping Costs</h2>
            <div className="bg-amber-50 p-4 rounded-lg">
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Return shipping is free for defective or incorrect items</li>
                <li>Customer is responsible for return shipping costs for change of mind returns</li>
                <li>Original shipping costs are non-refundable (except for defective items)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Exchanges</h2>
            <p className="text-gray-700 leading-relaxed">
              We currently only process refunds for returned items. If you need a different size or 
              color, please place a new order and return the unwanted item following our return process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Damaged or Defective Items</h2>
            <p className="text-gray-700 leading-relaxed">
              If you receive a damaged or defective item, please contact us immediately at 
              support@shopapp.com with your order number and photos of the damage. We will provide 
              a prepaid return label and process your replacement or refund as quickly as possible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about our refund policy or need assistance with a return, 
              please contact our customer service team:
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mt-3">
              <ul className="text-gray-700 space-y-1">
                <li><strong>Email:</strong> support@shopapp.com</li>
                <li><strong>Phone:</strong> 1-800-SHOPAPP</li>
                <li><strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM EST</li>
              </ul>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundPolicy;
