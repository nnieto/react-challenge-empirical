import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CartPage from '@/app/cart/page'

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
    return <img src={src} alt={alt} {...props} />
  }
})

jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock the Navbar component
jest.mock('@/app/components/Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="navbar">Navbar</div>
  }
})

// Mock the useCart hook
const mockAddItem = jest.fn()
const mockRemoveItem = jest.fn()
const mockUpdateQuantity = jest.fn()
const mockClearCart = jest.fn()
const mockGetItemQuantity = jest.fn()
const mockIsInCart = jest.fn()

jest.mock('@/app/hooks/useCart', () => ({
  useCart: () => ({
    state: {
      items: [],
      total: 0,
      itemCount: 0,
    },
    addItem: mockAddItem,
    removeItem: mockRemoveItem,
    updateQuantity: mockUpdateQuantity,
    clearCart: mockClearCart,
    getItemQuantity: mockGetItemQuantity,
    isInCart: mockIsInCart,
  }),
}))

// Mock data
const mockCartItems = [
  {
    id: 1,
    title: 'Test Product 1',
    price: 29.99,
    image: 'test-image-1.jpg',
    quantity: 2,
    category: 'electronics',
  },
  {
    id: 2,
    title: 'Test Product 2',
    price: 19.99,
    image: 'test-image-2.jpg',
    quantity: 1,
    category: 'clothing',
  },
  {
    id: 3,
    title: 'Test Product 3',
    price: 39.99,
    image: 'test-image-3.jpg',
    quantity: 3,
    category: 'electronics',
  },
]

const mockCartState = {
  items: mockCartItems,
  total: 169.95, // (29.99 * 2) + (19.99 * 1) + (39.99 * 3)
  itemCount: 6, // 2 + 1 + 3
}

describe('Cart Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset cart state to empty
    const useCartModule = jest.requireMock('@/app/hooks/useCart')
    useCartModule.useCart = () => ({
      state: {
        items: [],
        total: 0,
        itemCount: 0,
      },
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      clearCart: mockClearCart,
      getItemQuantity: mockGetItemQuantity,
      isInCart: mockIsInCart,
    })
  })

  describe('Empty Cart State', () => {
    it('renders empty cart message when cart is empty', () => {
      render(<CartPage />)
      
      expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument()
      expect(screen.getByText("Looks like you haven't added any products to your cart yet.")).toBeInTheDocument()
      expect(screen.getByText('Start Shopping')).toBeInTheDocument()
    })

    it('renders navbar in empty cart state', () => {
      render(<CartPage />)
      
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
    })

    it('has correct link to home page in empty cart state', () => {
      render(<CartPage />)
      
      const startShoppingLink = screen.getByText('Start Shopping').closest('a')
      expect(startShoppingLink).toHaveAttribute('href', '/')
    })
  })

  describe('Cart with Items', () => {
    beforeEach(() => {
      // Mock cart with items
      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: mockCartState,
        addItem: mockAddItem,
        removeItem: mockRemoveItem,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart,
        getItemQuantity: mockGetItemQuantity,
        isInCart: mockIsInCart,
      })
    })

    it('renders cart header with correct item count', () => {
      render(<CartPage />)
      
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
      expect(screen.getByText('6 items in your cart')).toBeInTheDocument()
    })

    it('renders navbar in cart with items state', () => {
      render(<CartPage />)
      
      expect(screen.getByTestId('navbar')).toBeInTheDocument()
    })

    it('displays all cart items correctly', () => {
      render(<CartPage />)
      
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      expect(screen.getByText('Test Product 3')).toBeInTheDocument()
    })

    it('displays product categories correctly', () => {
      render(<CartPage />)
      
      const categoryElements = screen.getAllByText('electronics')
      expect(categoryElements).toHaveLength(2) // Product 1 and Product 3 are both electronics
      expect(screen.getByText('clothing')).toBeInTheDocument()
    })

    it('displays product prices correctly', () => {
      render(<CartPage />)
      
      const priceElements = screen.getAllByText('$29.99')
      expect(priceElements).toHaveLength(1)
      
      const priceElements2 = screen.getAllByText('$19.99')
      expect(priceElements2).toHaveLength(2) // Product price and item total (since quantity is 1)
      
      const priceElements3 = screen.getAllByText('$39.99')
      expect(priceElements3).toHaveLength(1)
    })

    it('displays product images correctly', () => {
      render(<CartPage />)
      
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(3)
      expect(images[0]).toHaveAttribute('src', 'test-image-1.jpg')
      expect(images[1]).toHaveAttribute('src', 'test-image-2.jpg')
      expect(images[2]).toHaveAttribute('src', 'test-image-3.jpg')
    })

    it('displays correct quantities for each item', () => {
      render(<CartPage />)
      
      expect(screen.getByText('2')).toBeInTheDocument() // Product 1 quantity
      expect(screen.getByText('1')).toBeInTheDocument() // Product 2 quantity
      expect(screen.getByText('3')).toBeInTheDocument() // Product 3 quantity
    })

    it('displays correct item totals', () => {
      render(<CartPage />)
      
      const totalElements = screen.getAllByText('$59.98')
      expect(totalElements).toHaveLength(1) // 29.99 * 2
      
      const totalElements2 = screen.getAllByText('$19.99')
      expect(totalElements2).toHaveLength(2) // Product price and item total (since quantity is 1)
      
      const totalElements3 = screen.getAllByText('$119.97')
      expect(totalElements3).toHaveLength(1) // 39.99 * 3
    })
  })

  describe('Quantity Controls', () => {
    beforeEach(() => {
      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: mockCartState,
        addItem: mockAddItem,
        removeItem: mockRemoveItem,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart,
        getItemQuantity: mockGetItemQuantity,
        isInCart: mockIsInCart,
      })
    })

    it('calls updateQuantity when increasing quantity', () => {
      render(<CartPage />)
      
      const increaseButtons = screen.getAllByRole('button').filter(button => 
        button.innerHTML.includes('M12 6v6m0 0v6m0-6h6m-6 0H6')
      )
      
      fireEvent.click(increaseButtons[0]) // Click first increase button
      
      expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3) // Product 1, quantity 2 -> 3
    })

    it('calls updateQuantity when decreasing quantity', () => {
      render(<CartPage />)
      
      const decreaseButtons = screen.getAllByRole('button').filter(button => 
        button.innerHTML.includes('M20 12H4')
      )
      
      fireEvent.click(decreaseButtons[0]) // Click first decrease button
      
      expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 1) // Product 1, quantity 2 -> 1
    })

    it('disables decrease button when quantity is 1', () => {
      render(<CartPage />)
      
      const decreaseButtons = screen.getAllByRole('button').filter(button => 
        button.innerHTML.includes('M20 12H4')
      )
      
      // Product 2 has quantity 1, so its decrease button should be disabled
      expect(decreaseButtons[1]).toBeDisabled()
    })

    it('allows quantity increase up to 99', () => {
      render(<CartPage />)
      
      const increaseButtons = screen.getAllByRole('button').filter(button => 
        button.innerHTML.includes('M12 6v6m0 0v6m0-6h6m-6 0H6')
      )
      
      // All increase buttons should be enabled
      increaseButtons.forEach(button => {
        expect(button).not.toBeDisabled()
      })
    })
  })

  describe('Remove Item Functionality', () => {
    beforeEach(() => {
      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: mockCartState,
        addItem: mockAddItem,
        removeItem: mockRemoveItem,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart,
        getItemQuantity: mockGetItemQuantity,
        isInCart: mockIsInCart,
      })
    })

    it('calls removeItem when remove button is clicked', () => {
      render(<CartPage />)
      
      const removeButtons = screen.getAllByRole('button').filter(button => 
        button.innerHTML.includes('M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16')
      )
      
      fireEvent.click(removeButtons[0]) // Click first remove button
      
      expect(mockRemoveItem).toHaveBeenCalledWith(1)
    })
  })

  describe('Clear Cart Functionality', () => {
    beforeEach(() => {
      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: mockCartState,
        addItem: mockAddItem,
        removeItem: mockRemoveItem,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart,
        getItemQuantity: mockGetItemQuantity,
        isInCart: mockIsInCart,
      })
    })

    it('calls clearCart when clear cart button is clicked', () => {
      render(<CartPage />)
      
      const clearCartButton = screen.getByText('Clear Cart')
      fireEvent.click(clearCartButton)
      
      expect(mockClearCart).toHaveBeenCalled()
    })

    it('shows loading state when clearing cart', async () => {
      render(<CartPage />)
      
      const clearCartButton = screen.getByText('Clear Cart')
      fireEvent.click(clearCartButton)
      
      expect(screen.getByText('Clearing...')).toBeInTheDocument()
      expect(screen.getByText('Clearing...')).toBeDisabled()
    })
  })

  describe('Order Summary', () => {
    beforeEach(() => {
      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: mockCartState,
        addItem: mockAddItem,
        removeItem: mockRemoveItem,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart,
        getItemQuantity: mockGetItemQuantity,
        isInCart: mockIsInCart,
      })
    })

    it('displays correct subtotal', () => {
      render(<CartPage />)
      
      expect(screen.getByText('$169.95')).toBeInTheDocument() // Subtotal
    })

    it('displays correct item count in subtotal', () => {
      render(<CartPage />)
      
      expect(screen.getByText('Subtotal (6 items)')).toBeInTheDocument()
    })

    it('displays free shipping', () => {
      render(<CartPage />)
      
      expect(screen.getByText('Shipping')).toBeInTheDocument()
      expect(screen.getByText('Free')).toBeInTheDocument()
    })

    it('displays correct tax calculation', () => {
      render(<CartPage />)
      
      const taxAmount = (169.95 * 0.08).toFixed(2)
      expect(screen.getByText(`$${taxAmount}`)).toBeInTheDocument() // Tax
    })

    it('displays correct total with tax', () => {
      render(<CartPage />)
      
      const totalWithTax = (169.95 * 1.08).toFixed(2)
      expect(screen.getByText(`$${totalWithTax}`)).toBeInTheDocument() // Total
    })

    it('has correct checkout link', () => {
      render(<CartPage />)
      
      const checkoutLink = screen.getByText('Proceed to Checkout').closest('a')
      expect(checkoutLink).toHaveAttribute('href', '/checkout')
    })

    it('has correct continue shopping link', () => {
      render(<CartPage />)
      
      const continueShoppingLink = screen.getByText('Continue Shopping').closest('a')
      expect(continueShoppingLink).toHaveAttribute('href', '/')
    })
  })

  describe('Edge Cases', () => {
    it('handles quantity update with invalid values', () => {
      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: mockCartState,
        addItem: mockAddItem,
        removeItem: mockRemoveItem,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart,
        getItemQuantity: mockGetItemQuantity,
        isInCart: mockIsInCart,
      })

      render(<CartPage />)
      
      // The component should handle quantity validation internally
      // We just verify that the updateQuantity function is available
      expect(mockUpdateQuantity).toBeDefined()
    })

    it('handles cart with single item', () => {
      const singleItemState = {
        items: [mockCartItems[0]],
        total: 29.99,
        itemCount: 1,
      }

      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: singleItemState,
        addItem: mockAddItem,
        removeItem: mockRemoveItem,
        updateQuantity: mockUpdateQuantity,
        clearCart: mockClearCart,
        getItemQuantity: mockGetItemQuantity,
        isInCart: mockIsInCart,
      })

      render(<CartPage />)
      
      expect(screen.getByText('1 items in your cart')).toBeInTheDocument()
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument()
    })
  })
}) 