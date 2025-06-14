
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProductActions } from '../useProductActions';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user123' }
  }))
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}));

describe('useProductActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addToWishlist', () => {
    it('adds product to wishlist successfully', async () => {
      const mockInsert = vi.fn(() => Promise.resolve({ error: null }));
      const mockFrom = vi.fn(() => ({ insert: mockInsert }));
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      const { result } = renderHook(() => useProductActions());

      await act(async () => {
        await result.current.addToWishlist('product123');
      });

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user123',
        product_id: 'product123'
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Added to wishlist",
        description: "Product has been added to your wishlist.",
      });
    });

    it('handles wishlist add error', async () => {
      const mockError = new Error('Duplicate entry');
      const mockInsert = vi.fn(() => Promise.resolve({ error: mockError }));
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      const { result } = renderHook(() => useProductActions());

      await act(async () => {
        await result.current.addToWishlist('product123');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to add to wishlist. It might already be added.",
        variant: "destructive",
      });
    });

    it('shows sign in message when user is not authenticated', async () => {
      // Mock useAuth to return no user
      const { useAuth } = await import('@/hooks/useAuth');
      vi.mocked(useAuth).mockReturnValue({ user: null } as any);

      const { result } = renderHook(() => useProductActions());

      await act(async () => {
        await result.current.addToWishlist('product123');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist.",
        variant: "destructive",
      });
    });
  });

  describe('addToCart', () => {
    it('adds product to cart successfully', async () => {
      const mockInsert = vi.fn(() => Promise.resolve({ error: null }));
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      const { result } = renderHook(() => useProductActions());

      await act(async () => {
        await result.current.addToCart('product123');
      });

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user123',
        product_id: 'product123',
        quantity: 1
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Added to cart",
        description: "Product has been added to your cart.",
      });
    });

    it('handles cart add error', async () => {
      const mockError = new Error('Database error');
      const mockInsert = vi.fn(() => Promise.resolve({ error: mockError }));
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any);

      const { result } = renderHook(() => useProductActions());

      await act(async () => {
        await result.current.addToCart('product123');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to add to cart.",
        variant: "destructive",
      });
    });

    it('shows sign in message when user is not authenticated', async () => {
      // Mock useAuth to return no user
      const { useAuth } = await import('@/hooks/useAuth');
      vi.mocked(useAuth).mockReturnValue({ user: null } as any);

      const { result } = renderHook(() => useProductActions());

      await act(async () => {
        await result.current.addToCart('product123');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart.",
        variant: "destructive",
      });
    });
  });
});
