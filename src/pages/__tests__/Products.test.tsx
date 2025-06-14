
import { render, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Products from '../Products';

// Mock the hooks
vi.mock('@/hooks/useProductsData', () => ({
  useProductsData: vi.fn()
}));

vi.mock('@/hooks/useProductActions', () => ({
  useProductActions: vi.fn(() => ({
    addToWishlist: vi.fn(),
    addToCart: vi.fn()
  }))
}));

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

const mockProducts = [
  {
    id: '1',
    name: 'Test Product 1',
    description: 'Description 1',
    price: 99.99,
    stock: 10,
    product_images: []
  }
];

const mockCategories = [
  { id: '1', name: 'Electronics' }
];

describe('Products Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    const { useProductsData } = require('@/hooks/useProductsData');
    useProductsData.mockReturnValue({
      products: null,
      categories: null,
      productsLoading: true,
      categoriesLoading: true,
      productsError: null,
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'name',
      setSearchQuery: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSortBy: vi.fn(),
    });

    render(<Products />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
    expect(screen.getByText(/Loading\.\.\./)).toBeInTheDocument();
  });

  it('renders error state', () => {
    const { useProductsData } = require('@/hooks/useProductsData');
    useProductsData.mockReturnValue({
      products: null,
      categories: null,
      productsLoading: false,
      categoriesLoading: false,
      productsError: new Error('Failed to load products'),
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'name',
      setSearchQuery: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSortBy: vi.fn(),
    });

    render(<Products />, { wrapper: createWrapper() });

    expect(screen.getByText('Error loading products')).toBeInTheDocument();
    expect(screen.getByText('Failed to load products')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('renders products successfully', () => {
    const { useProductsData } = require('@/hooks/useProductsData');
    useProductsData.mockReturnValue({
      products: mockProducts,
      categories: mockCategories,
      productsLoading: false,
      categoriesLoading: false,
      productsError: null,
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'name',
      setSearchQuery: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSortBy: vi.fn(),
    });

    render(<Products />, { wrapper: createWrapper() });

    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
  });

  it('shows debug info in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const { useProductsData } = require('@/hooks/useProductsData');
    useProductsData.mockReturnValue({
      products: mockProducts,
      categories: mockCategories,
      productsLoading: false,
      categoriesLoading: false,
      productsError: null,
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'name',
      setSearchQuery: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSortBy: vi.fn(),
    });

    render(<Products />, { wrapper: createWrapper() });

    expect(screen.getByText(/Debug: Found 1 products, 1 categories/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('does not show debug info in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const { useProductsData } = require('@/hooks/useProductsData');
    useProductsData.mockReturnValue({
      products: mockProducts,
      categories: mockCategories,
      productsLoading: false,
      categoriesLoading: false,
      productsError: null,
      searchQuery: '',
      selectedCategory: 'all',
      sortBy: 'name',
      setSearchQuery: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSortBy: vi.fn(),
    });

    render(<Products />, { wrapper: createWrapper() });

    expect(screen.queryByText(/Debug:/)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('renders filters and grid components', () => {
    const { useProductsData } = require('@/hooks/useProductsData');
    useProductsData.mockReturnValue({
      products: mockProducts,
      categories: mockCategories,
      productsLoading: false,
      categoriesLoading: false,
      productsError: null,
      searchQuery: 'test',
      selectedCategory: '1',
      sortBy: 'price_low',
      setSearchQuery: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSortBy: vi.fn(),
    });

    render(<Products />, { wrapper: createWrapper() });

    // Check if filters are rendered with correct props
    expect(screen.getByDisplayValue('test')).toBeInTheDocument(); // search query
    expect(screen.getByDisplayValue('Electronics')).toBeInTheDocument(); // selected category
    expect(screen.getByDisplayValue('Price: Low to High')).toBeInTheDocument(); // sort by

    // Check if products grid is rendered
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
  });
});
