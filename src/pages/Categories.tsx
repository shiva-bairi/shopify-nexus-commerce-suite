
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select(`
          *,
          products(count)
        `);

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      query = query.order('name');

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      
      {/* Search */}
      <div className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories?.map((category) => (
          <Card key={category.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-500 to-purple-600 h-32 flex items-center justify-center">
                <h3 className="text-white text-xl font-bold text-center px-4">
                  {category.name}
                </h3>
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2">{category.name}</CardTitle>
              {category.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {category.description}
                </p>
              )}
              <p className="text-sm text-gray-500">
                {category.products?.[0]?.count || 0} products
              </p>
              <Link 
                to={`/products?category=${category.id}`}
                className="inline-block mt-3 text-blue-600 hover:text-blue-800 font-medium"
              >
                View Products →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No categories found.</p>
        </div>
      )}
    </div>
  );
};

export default Categories;
