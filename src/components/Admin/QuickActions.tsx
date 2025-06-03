
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const handleAddProduct = () => {
    // In a real app, this would navigate to a product creation form
    console.log('Navigate to add product');
  };

  const handleViewOrders = () => {
    // This would show the orders tab in the admin panel
    console.log('Switch to orders tab');
  };

  const handleManageUsers = () => {
    // This would show the users tab in the admin panel
    console.log('Switch to users tab');
  };

  const handleAnalytics = () => {
    // This would show the analytics tab in the admin panel
    console.log('Switch to analytics tab');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={handleAddProduct}
          >
            <Package className="h-6 w-6" />
            <span className="text-sm">Add Product</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={handleViewOrders}
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="text-sm">View Orders</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={handleManageUsers}
          >
            <Users className="h-6 w-6" />
            <span className="text-sm">Manage Users</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={handleAnalytics}
          >
            <TrendingUp className="h-6 w-6" />
            <span className="text-sm">Analytics</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
