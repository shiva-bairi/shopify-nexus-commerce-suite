
import { Button } from '@/components/ui/button';
import { ProductsFilters } from '@/components/Products/ProductsFilters';
import { ProductsGrid } from '@/components/Products/ProductsGrid';
import { useProductsData } from '@/hooks/useProductsData';
import { useProductActions } from '@/hooks/useProductActions';

const Products = () => {
  const {
    products,
    categories,
    productsLoading,
    categoriesLoading,
    productsError,
    searchQuery,
    selectedCategory,
    sortBy,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
  } = useProductsData();

  const { addToWishlist, addToCart } = useProductActions();

  if (productsLoading || categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Products</h1>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading products...</p>
            <p className="text-sm text-gray-400 mt-2">
              Products: {productsLoading ? 'Loading...' : 'Done'} | 
              Categories: {categoriesLoading ? 'Loading...' : 'Done'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Products</h1>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">Error loading products</p>
            <p className="text-sm text-gray-500 mb-4">{productsError.message}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      
      <ProductsFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        categories={categories || []}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
      />

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            Debug: Found {products?.length || 0} products, {categories?.length || 0} categories
          </p>
        </div>
      )}

      <ProductsGrid
        products={products || []}
        onAddToWishlist={addToWishlist}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default Products;
