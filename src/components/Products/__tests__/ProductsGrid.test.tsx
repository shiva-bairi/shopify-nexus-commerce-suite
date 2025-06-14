
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductsGrid } from '../ProductsGrid';

const mockProducts = [
  {
    id: '1',
    name: 'Product 1',
    description: 'Description 1',
    price: 99.99,
    stock: 10,
    product_images: []
  },
  {
    id: '2',
    name: 'Product 2',
    description: 'Description 2',
    price: 149.99,
    stock: 5,
    product_images: []
  }
];

describe('ProductsGrid', () => {
  const mockOnAddToWishlist = vi.fn();
  const mockOnAddToCart = vi.fn();

  beforeEach(() => {
    mockOnAddToWishlist.mockClear();
    mockOnAddToCart.mockClear();
  });

  it('renders products correctly', () => {
    render(
      <ProductsGrid
        products={mockProducts}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('displays empty state when no products are provided', () => {
    render(
      <ProductsGrid
        products={[]}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('No products found.')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria or check back later.')).toBeInTheDocument();
  });

  it('displays empty state when products is null', () => {
    render(
      <ProductsGrid
        products={null as any}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('No products found.')).toBeInTheDocument();
  });

  it('shows development tip in development environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ProductsGrid
        products={[]}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText(/Tip: You may need to add some sample products/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('does not show development tip in production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ProductsGrid
        products={[]}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.queryByText(/Tip: You may need to add some sample products/)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('renders grid layout with correct classes', () => {
    const { container } = render(
      <ProductsGrid
        products={mockProducts}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4', 'gap-6');
  });
});
