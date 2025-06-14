
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsAndConditions = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>ShopApp Terms of Service</CardTitle>
          <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using ShopApp, you accept and agree to be bound by the terms and provision 
              of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Permission is granted to temporarily download one copy of the materials on ShopApp for 
              personal, non-commercial transitory viewing only. This is the grant of a license, not a 
              transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on the website</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Account Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for safeguarding the password and for maintaining the confidentiality 
              of your account. You are fully responsible for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Products and Services</h2>
            <p className="text-gray-700 leading-relaxed">
              All products and services are subject to availability. We reserve the right to discontinue 
              any product or service at any time. Prices for our products are subject to change without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Payment Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Payment is due immediately upon purchase. We accept various payment methods as displayed 
              during checkout. All payments are processed securely through our payment partners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Shipping and Delivery</h2>
            <p className="text-gray-700 leading-relaxed">
              We will make every effort to deliver products within the estimated timeframe. However, 
              delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Returns and Refunds</h2>
            <p className="text-gray-700 leading-relaxed">
              Please refer to our <a href="/refund-policy" className="text-blue-600 hover:underline">Refund Policy</a> 
              for detailed information about returns and refunds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a> 
              to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              In no event shall ShopApp or its suppliers be liable for any damages (including, without 
              limitation, damages for loss of data or profit, or due to business interruption) arising 
              out of the use or inability to use the materials on ShopApp's website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at 
              support@shopapp.com or through our customer service portal.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsAndConditions;
