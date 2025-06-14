
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useProductsData = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const { toast } = useToast();

  // Handle URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (searchParam === 'true') {
      // Focus on search input when coming from search nav
      const searchInput = document.querySelector('input[placeholder="Search products..."]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [searchParams]);

  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', searchQuery, selectedCategory, sortBy],
    queryFn: async () => {
      console.log('🔍 Starting products query with params:', { searchQuery, selectedCategory, sortBy });
      
      try {
        // Use the same pattern as the working Home page query
        let query = supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            price,
            discount_price,
            category_id,
            stock,
            avg_rating,
            is_featured,
            brand,
            sku,
            created_at,
            updated_at,
            product_images(image_url, is_primary)
          `);

        // Apply filters
        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        if (selectedCategory !== 'all') {
          query = query.eq('category_id', selectedCategory);
        }

        // Apply sorting
        if (sortBy === 'name') {
          query = query.order('name');
        } else if (sortBy === 'price_low') {
          query = query.order('price', { ascending: true });
        } else if (sortBy === 'price_high') {
          query = query.order('price', { ascending: false });
        } else if (sortBy === 'rating') {
          query = query.order('avg_rating', { ascending: false });
        }

        console.log('📤 Executing products query...');
        const { data, error, status, statusText } = await query;
        
        console.log('📥 Products query response:', { 
          data: data?.length ? `${data.length} products` : 'No data', 
          error, 
          status, 
          statusText 
        });
        
        if (error) {
          console.error('❌ Products fetch error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        
        console.log('✅ Products loaded successfully:', data?.length || 0);
        return data || [];
      } catch (err) {
        console.error('💥 Unexpected error in products query:', err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('🏷️ Starting categories query...');
      
      try {
        const { data, error, status, statusText } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');
        
        console.log('📥 Categories query response:', { 
          data: data?.length ? `${data.length} categories` : 'No data', 
          error, 
          status, 
          statusText 
        });
        
        if (error) {
          console.error('❌ Categories fetch error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        
        console.log('✅ Categories loaded successfully:', data?.length || 0);
        return data || [];
      } catch (err) {
        console.error('💥 Unexpected error in categories query:', err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Enhanced error logging
  useEffect(() => {
    if (productsError) {
      console.error('🚨 Products error state:', productsError);
      toast({
        title: "Error loading products",
        description: `Failed to load products: ${productsError.message}`,
        variant: "destructive",
      });
    }
    if (categoriesError) {
      console.error('🚨 Categories error state:', categoriesError);
      toast({
        title: "Error loading categories", 
        description: `Failed to load categories: ${categoriesError.message}`,
        variant: "destructive",
      });
    }
  }, [productsError, categoriesError, toast]);

  // Log current state
  useEffect(() => {
    console.log('📊 Current component state:', { 
      productsLoading, 
      categoriesLoading,
      productsError: productsError?.message,
      categoriesError: categoriesError?.message,
      productsCount: products?.length,
      categoriesCount: categories?.length 
    });
  }, [productsLoading, categoriesLoading, productsError, categoriesError, products, categories]);

  return {
    products,
    categories,
    productsLoading,
    categoriesLoading,
    productsError,
    categoriesError,
    searchQuery,
    selectedCategory,
    sortBy,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
  };
};
