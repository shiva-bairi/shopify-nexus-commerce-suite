
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useProductsData } from '../useProductsData';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        ilike: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const mockProducts = [
  {
    id: '1',
    name: 'Test Product 1',
    description: 'Description 1',
    price: 99.99,
    category_id: 'cat1',
    stock: 10,
    product_images: []
  },
  {
    id: '2',
    name: 'Test Product 2',
    description: 'Description 2',
    price: 149.99,
    category_id: 'cat2',
    stock: 5,
    product_images: []
  }
];

const mockCategories = [
  { id: 'cat1', name: 'Electronics' },
  { id: 'cat2', name: 'Clothing' }
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('useProductsData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useProductsData(), {
      wrapper: createWrapper(),
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.selectedCategory).toBe('all');
    expect(result.current.sortBy).toBe('name');
  });

  it('fetches products successfully', async () => {
    const mockSupabaseChain = {
      select: vi.fn(() => ({
        ilike: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockProducts, error: null }))
          })),
          order: vi.fn(() => Promise.resolve({ data: mockProducts, error: null }))
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockProducts, error: null }))
        })),
        order: vi.fn(() => Promise.resolve({ data: mockProducts, error: null }))
      }))
    };

    vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain as any);

    const { result } = renderHook(() => useProductsData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.productsLoading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
  });

  it('fetches categories successfully', async () => {
    const mockSupabaseChain = {
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockCategories, error: null }))
      }))
    };

    vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain as any);

    const { result } = renderHook(() => useProductsData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.categoriesLoading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
  });

  it('handles products fetch error', async () => {
    const mockError = new Error('Failed to fetch products');
    const mockSupabaseChain = {
      select: vi.fn(() => ({
        ilike: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error: mockError }))
          })),
          order: vi.fn(() => Promise.resolve({ data: null, error: mockError }))
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: null, error: mockError }))
        })),
        order: vi.fn(() => Promise.resolve({ data: null, error: mockError }))
      }))
    };

    vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain as any);

    const { result } = renderHook(() => useProductsData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.productsError).toBeTruthy();
    });

    expect(result.current.productsError).toBeDefined();
  });

  it('updates search query', () => {
    const { result } = renderHook(() => useProductsData(), {
      wrapper: createWrapper(),
    });

    result.current.setSearchQuery('test search');
    expect(result.current.searchQuery).toBe('test search');
  });

  it('updates selected category', () => {
    const { result } = renderHook(() => useProductsData(), {
      wrapper: createWrapper(),
    });

    result.current.setSelectedCategory('cat1');
    expect(result.current.selectedCategory).toBe('cat1');
  });

  it('updates sort by', () => {
    const { result } = renderHook(() => useProductsData(), {
      wrapper: createWrapper(),
    });

    result.current.setSortBy('price_low');
    expect(result.current.sortBy).toBe('price_low');
  });
});
