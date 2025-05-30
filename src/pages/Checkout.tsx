
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Plus } from 'lucide-react';

interface Address {
  id: string;
  type: string;
  is_default: boolean;
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

interface CartItem {
  id: string;
  quantity: number;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    discount_price?: number;
    product_images: Array<{ image_url: string; is_primary: boolean }>;
  };
}

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<string>('');
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'shipping' as 'shipping' | 'billing',
    first_name: '',
    last_name: '',
    company: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: '',
    is_default: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch cart items
  const { data: cartItems, isLoading: cartLoading } = useQuery({
    queryKey: ['cart-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id, name, price, discount_price,
            product_images (image_url, is_primary)
          )
        `);
      if (error) throw error;
      return data as CartItem[];
    },
    enabled: !!user
  });

  // Fetch user addresses
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false });
      if (error) throw error;
      return data as Address[];
    },
    enabled: !!user
  });

  // Add new address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (address: typeof newAddress) => {
      const { data, error } = await supabase
        .from('addresses')
        .insert({ ...address, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowNewAddressForm(false);
      setNewAddress({
        type: 'shipping',
        first_name: '',
        last_name: '',
        company: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        phone: '',
        is_default: false
      });
      toast({
        title: "Address added",
        description: "Your new address has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add address. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (!cartItems || cartItems.length === 0) throw new Error('Cart is empty');
      if (!selectedShippingAddress) throw new Error('Please select a shipping address');
      
      const billingAddressId = useShippingForBilling ? selectedShippingAddress : selectedBillingAddress;
      if (!billingAddressId) throw new Error('Please select a billing address');

      const total = cartItems.reduce((sum, item) => {
        const price = item.products.discount_price || item.products.price;
        return sum + (price * item.quantity);
      }, 0);

      const shippingAddress = addresses?.find(addr => addr.id === selectedShippingAddress);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          total_amount: total,
          shipping_address: shippingAddress,
          shipping_address_id: selectedShippingAddress,
          billing_address_id: billingAddressId,
          payment_method: 'credit_card',
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.products.discount_price || item.products.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user!.id);

      if (clearCartError) throw clearCartError;

      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id.slice(0, 8)} has been placed.`,
      });
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Set default addresses
  useEffect(() => {
    if (addresses) {
      const defaultShipping = addresses.find(addr => addr.type === 'shipping' && addr.is_default);
      const defaultBilling = addresses.find(addr => addr.type === 'billing' && addr.is_default);
      
      if (defaultShipping) setSelectedShippingAddress(defaultShipping.id);
      if (defaultBilling) setSelectedBillingAddress(defaultBilling.id);
    }
  }, [addresses]);

  const subtotal = cartItems?.reduce((sum, item) => {
    const price = item.products.discount_price || item.products.price;
    return sum + (price * item.quantity);
  }, 0) || 0;

  const shipping = 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (cartLoading || addressesLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Forms */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Shipping Address
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewAddress(prev => ({ ...prev, type: 'shipping' }));
                    setShowNewAddressForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses?.filter(addr => addr.type === 'shipping').map((address) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={address.id}
                      checked={selectedShippingAddress === address.id}
                      onChange={(e) => setSelectedShippingAddress(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {address.first_name} {address.last_name}
                        {address.is_default && <span className="ml-2 text-sm text-blue-600">(Default)</span>}
                      </div>
                      <div className="text-sm text-gray-600">
                        {address.company && <div>{address.company}</div>}
                        <div>{address.address_line_1}</div>
                        {address.address_line_2 && <div>{address.address_line_2}</div>}
                        <div>{address.city}, {address.state} {address.postal_code}</div>
                        <div>{address.country}</div>
                        {address.phone && <div>{address.phone}</div>}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useShippingForBilling}
                  onChange={(e) => setUseShippingForBilling(e.target.checked)}
                />
                <span>Same as shipping address</span>
              </label>
              
              {!useShippingForBilling && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Select Billing Address</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewAddress(prev => ({ ...prev, type: 'billing' }));
                        setShowNewAddressForm(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New
                    </Button>
                  </div>
                  {addresses?.filter(addr => addr.type === 'billing').map((address) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <label className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="billing"
                          value={address.id}
                          checked={selectedBillingAddress === address.id}
                          onChange={(e) => setSelectedBillingAddress(e.target.value)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium">
                            {address.first_name} {address.last_name}
                            {address.is_default && <span className="ml-2 text-sm text-blue-600">(Default)</span>}
                          </div>
                          <div className="text-sm text-gray-600">
                            {address.company && <div>{address.company}</div>}
                            <div>{address.address_line_1}</div>
                            {address.address_line_2 && <div>{address.address_line_2}</div>}
                            <div>{address.city}, {address.state} {address.postal_code}</div>
                            <div>{address.country}</div>
                            {address.phone && <div>{address.phone}</div>}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          {/* New Address Form */}
          {showNewAddressForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New {newAddress.type === 'shipping' ? 'Shipping' : 'Billing'} Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newAddress.first_name}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newAddress.last_name}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={newAddress.company}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input
                    id="address1"
                    value={newAddress.address_line_1}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                  <Input
                    id="address2"
                    value={newAddress.address_line_2}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={newAddress.postal_code}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newAddress.is_default}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, is_default: e.target.checked }))}
                  />
                  <span>Set as default address</span>
                </label>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => addAddressMutation.mutate(newAddress)}
                    disabled={addAddressMutation.isPending}
                  >
                    {addAddressMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Address
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewAddressForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => {
                const image = item.products.product_images?.find(img => img.is_primary)?.image_url || 
                           item.products.product_images?.[0]?.image_url || '/placeholder.svg';
                const price = item.products.discount_price || item.products.price;
                
                return (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img src={image} alt={item.products.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.products.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(price * item.quantity).toFixed(2)}</p>
                      {item.products.discount_price && (
                        <p className="text-sm text-gray-500 line-through">
                          ${(item.products.price * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button
                className="w-full"
                size="lg"
                onClick={() => placeOrderMutation.mutate()}
                disabled={placeOrderMutation.isPending || !selectedShippingAddress}
              >
                {placeOrderMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
