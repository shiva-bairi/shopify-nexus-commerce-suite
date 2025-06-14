
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Plus, FilePlus, ArrowDown, ArrowUp, Users, Package, ShoppingCart } from "lucide-react"
import { useNavigate } from "react-router-dom"

const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <Card className="mb-6 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button variant="secondary" onClick={() => navigate("/admin/products")}>
          <Package className="mr-2 h-4 w-4" /> View Products
        </Button>
        <Button variant="secondary" onClick={() => navigate("/admin/orders")}>
          <ShoppingCart className="mr-2 h-4 w-4" /> View Orders
        </Button>
        <Button variant="secondary" onClick={() => navigate("/admin/users")}>
          <Users className="mr-2 h-4 w-4" /> View Users
        </Button>
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
          <FilePlus className="mr-2 h-4 w-4" /> Add Product
        </Button>
        <Button variant="outline" onClick={() => navigate("/admin/orders")}>
          <Plus className="mr-2 h-4 w-4" /> Create Order
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
