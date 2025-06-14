import { useState, useEffect } from 'react';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Heart, User, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import OrderDetails from '@/components/OrderDetails';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: Array<{
    quantity: number;
    price_at_purchase: number;
    products: {
      name: string;
      product_images: Array<{ image_url: string; is_primary: boolean }>;
    };
  }>;
}

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

interface WishlistItem {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    discount_price?: number;
    product_images: Array<{ image_url: string; is_primary: boolean }>;
  };
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

const Account = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('orders');
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user
  });

  // Set profile data when loaded
  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user!.id,
          ...data,
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setEditingProfile(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  });

  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price_at_purchase,
            products (
              name,
              product_images (image_url, is_primary)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user
  });

  // Fetch user addresses
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      if (error) throw error;
      return data as Address[];
    },
    enabled: !!user
  });

  // Fetch wishlist
  const { data: wishlist, isLoading: wishlistLoading } = useQuery({
    queryKey: ['user-wishlist'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          products (
            id, name, price, discount_price,
            product_images (image_url, is_primary)
          )
        `)
        .eq('user_id', user.id);
      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user
  });

  // Handle navigation after auth check
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Don't render if no user
  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate('/');
  };

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['user-wishlist'] });
      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist.",
        variant: "destructive",
      });
    }
  };

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleBackToOrders = () => {
    setSelectedOrderId(null);
  };

  // If viewing order details, show OrderDetails component
  if (selectedOrderId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <OrderDetails orderId={selectedOrderId} onBack={handleBackToOrders} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Orders</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Addresses</span>
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Wishlist</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div>Loading orders...</div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleOrderClick(order.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <p className="text-lg font-bold mt-1">${order.total_amount}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.order_items.map((item, index) => {
                          const image = item.products.product_images?.find(img => img.is_primary)?.image_url || 
                                       item.products.product_images?.[0]?.image_url || '/placeholder.svg';
                          
                          return (
                            <div key={index} className="flex items-center space-x-3">
                              <img src={image} alt={item.products.name} className="w-12 h-12 object-cover rounded" />
                              <div className="flex-1">
                                <p className="font-medium">{item.products.name}</p>
                                <p className="text-sm text-gray-600">
                                  Quantity: {item.quantity} × ${item.price_at_purchase}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-3 text-sm text-blue-600 font-medium">
                        Click to view details →
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No orders yet</p>
                  <Button className="mt-4" onClick={() => navigate('/products')}>
                    Start Shopping
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Saved Addresses
                <Button onClick={() => navigate('/checkout')}>
                  Add New Address
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {addressesLoading ? (
                <div>Loading addresses...</div>
              ) : addresses && addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium flex items-center">
                            {address.first_name} {address.last_name}
                            {address.is_default && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                Default
                              </span>
                            )}
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                              {address.type}
                            </span>
                          </div>
                          {address.company && <p className="text-sm text-gray-600">{address.company}</p>}
                          <p className="text-sm text-gray-600">{address.address_line_1}</p>
                          {address.address_line_2 && <p className="text-sm text-gray-600">{address.address_line_2}</p>}
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                          {address.phone && <p className="text-sm text-gray-600">{address.phone}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No addresses saved</p>
                  <Button className="mt-4" onClick={() => navigate('/checkout')}>
                    Add Your First Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle>My Wishlist</CardTitle>
            </CardHeader>
            <CardContent>
              {wishlistLoading ? (
                <div>Loading wishlist...</div>
              ) : wishlist && wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map((item) => {
                    const image = item.products.product_images?.find(img => img.is_primary)?.image_url || 
                                 item.products.product_images?.[0]?.image_url || '/placeholder.svg';
                    const price = item.products.discount_price || item.products.price;
                    
                    return (
                      <div key={item.id} className="border rounded-lg p-4">
                        <img src={image} alt={item.products.name} className="w-full h-48 object-cover rounded mb-3" />
                        <h3 className="font-medium mb-2">{item.products.name}</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold">${price}</span>
                            {item.products.discount_price && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ${item.products.price}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromWishlist(item.product_id)}
                          >
                            Remove
                          </Button>
                        </div>
                        <Button
                          className="w-full mt-3"
                          onClick={() => navigate(`/products/${item.product_id}`)}
                        >
                          View Product
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Your wishlist is empty</p>
                  <Button className="mt-4" onClick={() => navigate('/products')}>
                    Browse Products
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Profile Information
                <Button 
                  variant="outline" 
                  onClick={() => editingProfile ? handleProfileSave() : setEditingProfile(true)}
                  disabled={updateProfileMutation.isPending}
                >
                  {editingProfile ? 'Save' : 'Edit'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                </div>
                
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    disabled={!editingProfile}
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                    disabled={!editingProfile}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!editingProfile}
                  />
                </div>

                <div>
                  <Label>User ID</Label>
                  <p className="text-gray-900 font-mono text-sm">{user.id}</p>
                </div>
                
                <div>
                  <Label>Account Created</Label>
                  <p className="text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                
                {editingProfile && (
                  <Button variant="outline" onClick={() => setEditingProfile(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Account;
