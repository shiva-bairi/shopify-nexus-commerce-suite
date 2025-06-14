
import { ProductCard } from './ProductCard';

interface ProductsGridProps {
  products: any[];
  onAddToWishlist: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

export const ProductsGrid = ({ products, onAddToWishlist, onAddToCart }: ProductsGridProps) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found.</p>
        <p className="text-sm text-gray-400 mt-2">
          Try adjusting your search criteria or check back later.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-blue-600 mt-4">
            Tip: You may need to add some sample products to the database
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToWishlist={onAddToWishlist}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};
