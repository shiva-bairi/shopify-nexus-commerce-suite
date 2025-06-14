
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductsFilters } from '../ProductsFilters';

const mockCategories = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Clothing' },
  { id: '3', name: 'Books' }
];

describe('ProductsFilters', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnCategoryChange = vi.fn();
  const mockOnSortChange = vi.fn();

  const defaultProps = {
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'name',
    categories: mockCategories,
    onSearchChange: mockOnSearchChange,
    onCategoryChange: mockOnCategoryChange,
    onSortChange: mockOnSortChange
  };

  beforeEach(() => {
    mockOnSearchChange.mockClear();
    mockOnCategoryChange.mockClear();
    mockOnSortChange.mockClear();
  });

  it('renders all filter components', () => {
    render(<ProductsFilters {...defaultProps} />);

    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    expect(screen.getByText('Select category')).toBeInTheDocument();
    expect(screen.getByText('Sort by')).toBeInTheDocument();
  });

  it('displays search query correctly', () => {
    render(<ProductsFilters {...defaultProps} searchQuery="test query" />);

    const searchInput = screen.getByPlaceholderText('Search products...');
    expect(searchInput).toHaveValue('test query');
  });

  it('calls onSearchChange when search input changes', () => {
    render(<ProductsFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'new search' } });

    expect(mockOnSearchChange).toHaveBeenCalledWith('new search');
  });

  it('renders categories in dropdown', () => {
    render(<ProductsFilters {...defaultProps} />);

    // Click the category select to open it
    const categorySelect = screen.getByText('Select category');
    fireEvent.click(categorySelect);

    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
  });

  it('renders sort options in dropdown', () => {
    render(<ProductsFilters {...defaultProps} />);

    // Click the sort select to open it
    const sortSelect = screen.getByText('Sort by');
    fireEvent.click(sortSelect);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Price: Low to High')).toBeInTheDocument();
    expect(screen.getByText('Price: High to Low')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
  });

  it('displays selected category correctly', () => {
    render(<ProductsFilters {...defaultProps} selectedCategory="1" />);

    // The select should show the selected category
    expect(screen.getByDisplayValue('Electronics')).toBeInTheDocument();
  });

  it('displays selected sort option correctly', () => {
    render(<ProductsFilters {...defaultProps} sortBy="price_low" />);

    // The select should show the selected sort option
    expect(screen.getByDisplayValue('Price: Low to High')).toBeInTheDocument();
  });

  it('handles empty categories array', () => {
    render(<ProductsFilters {...defaultProps} categories={[]} />);

    const categorySelect = screen.getByText('Select category');
    fireEvent.click(categorySelect);

    expect(screen.getByText('All Categories')).toBeInTheDocument();
    // Should not have any other category options
    expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
  });

  it('has correct responsive grid layout', () => {
    const { container } = render(<ProductsFilters {...defaultProps} />);

    const filtersContainer = container.firstChild;
    expect(filtersContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-4', 'mb-8');
  });

  it('search input has search icon', () => {
    render(<ProductsFilters {...defaultProps} />);

    const searchIcon = screen.getByTestId('search-icon') || document.querySelector('[data-testid="search-icon"]');
    // The search icon should be present (from lucide-react)
    expect(document.querySelector('.lucide-search')).toBeInTheDocument();
  });
});
