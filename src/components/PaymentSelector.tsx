
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone, Wallet, Banknote } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface PaymentSelectorProps {
  onPaymentMethodSelect: (method: string) => void;
  selectedMethod: string;
}

const PaymentSelector = ({ onPaymentMethodSelect, selectedMethod }: PaymentSelectorProps) => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Pay securely with your credit or debit card'
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: <Smartphone className="h-6 w-6" />,
      description: 'Pay using PhonePe UPI'
    },
    {
      id: 'paytm',
      name: 'Paytm',
      icon: <Wallet className="h-6 w-6" />,
      description: 'Pay using Paytm Wallet or UPI'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: <Banknote className="h-6 w-6" />,
      description: 'Pay with cash when your order is delivered'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {paymentMethods.map((method) => (
          <div key={method.id} className="border rounded-lg p-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => onPaymentMethodSelect(e.target.value)}
                className="w-4 h-4"
              />
              <div className="flex items-center space-x-3 flex-1">
                <div className="text-blue-600">
                  {method.icon}
                </div>
                <div>
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
              </div>
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PaymentSelector;
