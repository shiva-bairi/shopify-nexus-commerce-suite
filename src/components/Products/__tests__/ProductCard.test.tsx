
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductCard } from '../ProductCard';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'Test description',
  price: 99.99,
  discount_price: 79.99,
  stock: 10,
  avg_rating: 4.5,
  product_images: [
    { image_url: '/test-image.jpg', is_primary: true }
  ]
};

const mockProductWithoutDiscount = {
  id: '2',
  name: 'Regular Product',
  description: 'Regular description',
  price: 50.00,
  stock: 5,
  avg_rating: 0,
  product_images: []
};

const mockOutOfStockProduct = {
  id: '3',
  name: 'Out of Stock Product',
  description: 'Out of stock description',
  price: 30.00,
  stock: 0,
  avg_rating: 3.0,
  product_images: []
};

describe('ProductCard', () => {
  const mockOnAddToWishlist = vi.fn();
  const mockOnAddToCart = vi.fn();

  beforeEach(() => {
    mockOnAddToWishlist.mockClear();
    mockOnAddToCart.mockClear();
  });

  it('renders product information correctly', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('$79.99')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('Sale')).toBeInTheDocument();
  });

  it('renders product without discount correctly', () => {
    render(
      <ProductCard
        product={mockProductWithoutDiscount}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('Regular Product')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.queryByText('Sale')).not.toBeInTheDocument();
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });

  it('shows out of stock state correctly', () => {
    render(
      <ProductCard
        product={mockOutOfStockProduct}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    const addToCartButton = screen.getByRole('button', { name: /out of stock/i });
    expect(addToCartButton).toBeDisabled();
    expect(addToCartButton).toHaveTextContent('Out of Stock');
  });

  it('calls onAddToCart when add to cart button is clicked', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    expect(mockOnAddToCart).toHaveBeenCalledWith('1');
  });

  it('calls onAddToWishlist when wishlist button is clicked', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    // Hover over the card to show the wishlist button
    const card = screen.getByRole('img', { name: 'Test Product' }).closest('.group');
    fireEvent.mouseEnter(card!);

    const wishlistButton = screen.getByRole('button', { name: '' }); // Heart icon button
    fireEvent.click(wishlistButton);

    expect(mockOnAddToWishlist).toHaveBeenCalledWith('1');
  });

  it('uses placeholder image when no product image is available', () => {
    render(
      <ProductCard
        product={mockProductWithoutDiscount}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    const image = screen.getByRole('img', { name: 'Regular Product' });
    expect(image).toHaveAttribute('src', '/placeholder.svg');
  });

  it('displays primary image when available', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToWishlist={mockOnAddToWishlist}
        onAddToCart={mockOnAddToCart}
      />
    );

    const image = screen.getByRole('img', { name: 'Test Product' });
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });
});
