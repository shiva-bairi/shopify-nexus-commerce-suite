
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Database, Cookie, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            ShopApp Privacy Policy
          </CardTitle>
          <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              At ShopApp, we are committed to protecting your privacy and ensuring the security of your 
              personal information. This Privacy Policy explains how we collect, use, disclose, and 
              safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Information We Collect
            </h2>
            
            <h3 className="text-lg font-medium mb-2">Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may collect personally identifiable information, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>Name, email address, and phone number</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information (processed securely by our payment partners)</li>
              <li>Account preferences and settings</li>
              <li>Purchase history and product preferences</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>IP address and browser information</li>
              <li>Device information and operating system</li>
              <li>Usage data and site navigation patterns</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-green-600" />
              How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Processing and fulfilling your orders</li>
              <li>Providing customer support and responding to inquiries</li>
              <li>Personalizing your shopping experience</li>
              <li>Sending promotional materials and updates (with your consent)</li>
              <li>Improving our website and services</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Information Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              except in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>With your explicit consent</li>
              <li>To trusted service providers who assist in operating our website</li>
              <li>To comply with legal requirements or protect our rights</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Cookie className="h-5 w-5 text-amber-600" />
              Cookies and Tracking
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>Remember your preferences and settings</li>
              <li>Analyze site usage and improve performance</li>
              <li>Provide personalized content and advertisements</li>
              <li>Enable social media features</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You can control cookies through your browser settings, but disabling cookies may affect 
              site functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Security</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction. 
                This includes encryption, secure servers, and regular security assessments.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Access and review your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability (receive your data in a structured format)</li>
              <li>Withdraw consent for marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Marketing Communications
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may send you promotional emails about our products, special offers, and updates. 
              You can unsubscribe from these communications at any time by clicking the unsubscribe 
              link in our emails or by contacting us directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you become aware that a child 
              has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">International Users</h2>
            <p className="text-gray-700 leading-relaxed">
              If you are accessing our service from outside the United States, please note that your 
              information may be transferred to, stored, and processed in the United States or other 
              countries where our service providers are located.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <ul className="text-gray-700 space-y-1">
                <li><strong>Email:</strong> privacy@shopapp.com</li>
                <li><strong>Phone:</strong> 1-800-SHOPAPP</li>
                <li><strong>Address:</strong> 123 Commerce Street, Business City, BC 12345</li>
              </ul>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
