
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle, RotateCcw, Package } from 'lucide-react';

const Returns = () => {
  const returnSteps = [
    {
      step: 1,
      title: "Initiate Return",
      description: "Log into your account and find the order you want to return"
    },
    {
      step: 2,
      title: "Print Label",
      description: "Download and print the prepaid return shipping label"
    },
    {
      step: 3,
      title: "Pack & Ship",
      description: "Package your item securely and attach the return label"
    },
    {
      step: 4,
      title: "Processing",
      description: "We'll process your return within 3-5 business days"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Returns & Exchanges</h1>
      
      {/* Return Policy Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            30-Day Return Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed mb-4">
            We want you to be completely satisfied with your purchase. If you're not happy with your order, 
            you can return most items within 30 days of delivery for a full refund or exchange.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-medium">
              Free returns on all orders! We provide prepaid return labels for your convenience.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Return Process */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How to Return an Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {returnSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">{step.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button size="lg">
              Start a Return
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Return Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Returnable Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Items in original condition
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Unworn and unused items
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Items with original tags
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Items in original packaging
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Items with receipt/proof of purchase
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Non-Returnable Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Personalized or custom items
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Health and personal care items
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Perishable goods
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Digital downloads
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Gift cards
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Processing Times */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Processing Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <h3 className="font-semibold mb-1">Return Received</h3>
              <p className="text-sm text-gray-600">We'll email you when we receive your return</p>
            </div>
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <h3 className="font-semibold mb-1">Processing</h3>
              <p className="text-sm text-gray-600">3-5 business days to inspect and process</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">Refund Issued</h3>
              <p className="text-sm text-gray-600">5-10 business days to appear in your account</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchanges */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Exchanges</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            Need a different size or color? We currently process exchanges as returns and new orders:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>Return your original item following our return process</li>
            <li>Place a new order for the item you want</li>
            <li>We'll process your refund once we receive the returned item</li>
          </ol>
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <p className="text-amber-800">
                <strong>Tip:</strong> To ensure the item you want is still in stock, consider placing your new order first, 
                then initiating the return for the original item.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Defective Items */}
      <Card>
        <CardHeader>
          <CardTitle>Defective or Damaged Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            If you receive a defective or damaged item, we'll make it right immediately:
          </p>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li>• Contact us within 48 hours of delivery</li>
            <li>• Provide photos of the damage or defect</li>
            <li>• We'll send a replacement or full refund</li>
            <li>• No need to return the defective item unless requested</li>
          </ul>
          <Button variant="outline">
            Report a Problem
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Returns;
