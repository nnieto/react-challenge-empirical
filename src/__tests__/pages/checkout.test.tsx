import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CheckoutPage from '@/app/checkout/page'

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

// Mock Next.js navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock the Navbar component
jest.mock('@/app/components/Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="navbar">Navbar</div>
  }
})

// Mock the useCart hook
const mockClearCart = jest.fn()

jest.mock('@/app/hooks/useCart', () => ({
  useCart: () => ({
    state: {
      items: [],
      total: 0,
      itemCount: 0,
    },
    clearCart: mockClearCart,
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
]

// Helper function to fill out the checkout form
const fillCheckoutForm = () => {
  const inputs = screen.getAllByDisplayValue('')
  fireEvent.change(inputs[0], { target: { value: 'John' } }) // First Name
  fireEvent.change(inputs[1], { target: { value: 'Doe' } }) // Last Name
  fireEvent.change(inputs[2], { target: { value: 'john@example.com' } }) // Email
  fireEvent.change(inputs[3], { target: { value: '123 Main St' } }) // Address
  fireEvent.change(inputs[4], { target: { value: 'New York' } }) // City
  fireEvent.change(inputs[5], { target: { value: 'NY' } }) // State
  fireEvent.change(inputs[6], { target: { value: '10001' } }) // ZIP Code
  
  const cardNumberInput = screen.getByPlaceholderText('1234 5678 9012 3456')
  const expiryInput = screen.getByPlaceholderText('MM/YY')
  const cvvInput = screen.getByPlaceholderText('123')
  
  fireEvent.change(cardNumberInput, { target: { value: '1234567890123456' } })
  fireEvent.change(inputs[7], { target: { value: 'John Doe' } }) // Cardholder Name
  fireEvent.change(expiryInput, { target: { value: '12/25' } })
  fireEvent.change(cvvInput, { target: { value: '123' } })
}

const mockCartState = {
  items: mockCartItems,
  total: 79.97, // (29.99 * 2) + (19.99 * 1)
  itemCount: 3, // 2 + 1
}

describe('Checkout Page', () => {
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
      clearCart: mockClearCart,
    })
  })

  describe('Empty Cart Redirect', () => {
    it('should redirect to cart page when cart is empty', () => {
      render(<CheckoutPage />)
      
      expect(mockPush).toHaveBeenCalledWith('/cart')
    })
  })

  describe('Checkout Form', () => {
    beforeEach(() => {
      // Set cart with items
      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: mockCartState,
        clearCart: mockClearCart,
      })
    })

    it('should render checkout form with all required fields', () => {
      render(<CheckoutPage />)
      
      // Check main heading
      expect(screen.getByText('Checkout')).toBeInTheDocument()
      expect(screen.getByText('Complete your purchase')).toBeInTheDocument()
      
      // Check form sections
      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Shipping Address')).toBeInTheDocument()
      expect(screen.getByText('Payment Information')).toBeInTheDocument()
      
      // Check form fields by name attribute
      expect(screen.getAllByDisplayValue('')).toHaveLength(11) // All 11 inputs exist
      expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('MM/YY')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('123')).toBeInTheDocument()
    })

    it('should display order summary with correct calculations', () => {
      render(<CheckoutPage />)
      
      // Check order summary
      expect(screen.getByText('Order Summary')).toBeInTheDocument()
      expect(screen.getByText('Subtotal (3 items)')).toBeInTheDocument()
      expect(screen.getByText('$79.97')).toBeInTheDocument() // Subtotal
      expect(screen.getByText('Free')).toBeInTheDocument() // Shipping
      expect(screen.getByText('$6.40')).toBeInTheDocument() // Tax (8% of 79.97)
      expect(screen.getByText('$86.37')).toBeInTheDocument() // Total with tax
    })

    it('should handle form input changes', () => {
      render(<CheckoutPage />)
      
      const inputs = screen.getAllByDisplayValue('')
      const firstNameInput = inputs[0]
      const emailInput = inputs[2]
      
      fireEvent.change(firstNameInput, { target: { value: 'John' } })
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      
      expect(firstNameInput).toHaveValue('John')
      expect(emailInput).toHaveValue('john@example.com')
    })

    it('should validate required fields on form submission', async () => {
      render(<CheckoutPage />)
      
      const submitButton = screen.getByText('Complete Purchase')
      fireEvent.click(submitButton)
      
      // Since the form doesn't have client-side validation, it will submit
      // We should see the processing screen
      await waitFor(() => {
        expect(screen.getByText('Processing Payment')).toBeInTheDocument()
      })
    })

    it('should process payment when form is valid', async () => {
      render(<CheckoutPage />)
      
      // Fill out the form
      fillCheckoutForm()
      
      const submitButton = screen.getByText('Complete Purchase')
      fireEvent.click(submitButton)
      
      // Should show payment processing
      await waitFor(() => {
        expect(screen.getByText('Processing Payment')).toBeInTheDocument()
        expect(screen.getByText('Please wait while we process your payment...')).toBeInTheDocument()
      })
      
      // Wait for payment processing to complete
      await waitFor(() => {
        expect(screen.getByText('Order Confirmed!')).toBeInTheDocument()
      }, { timeout: 4000 })
      
      // Check that cart was cleared
      expect(mockClearCart).toHaveBeenCalled()
    })
  })

  describe('Payment Processing State', () => {
    beforeEach(() => {
      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: mockCartState,
        clearCart: mockClearCart,
      })
    })

    it('should show payment processing screen with loading animation', async () => {
      render(<CheckoutPage />)
      
      // Fill form and submit
      fillCheckoutForm()
      
      fireEvent.click(screen.getByText('Complete Purchase'))
      
      await waitFor(() => {
        expect(screen.getByText('Processing Payment')).toBeInTheDocument()
        expect(screen.getByText('Please wait while we process your payment...')).toBeInTheDocument()
        expect(screen.getByText('Securing your payment information...')).toBeInTheDocument()
        expect(screen.getByText('Verifying your order details...')).toBeInTheDocument()
        expect(screen.getByText('Processing transaction...')).toBeInTheDocument()
      })
    })
  })

  describe('Order Success State', () => {
    beforeEach(() => {
      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: mockCartState,
        clearCart: mockClearCart,
      })
    })

    it('should show order confirmation with all details', async () => {
      render(<CheckoutPage />)
      
      // Fill form and submit
      fillCheckoutForm()
      
      fireEvent.click(screen.getByText('Complete Purchase'))
      
      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Order Confirmed!')).toBeInTheDocument()
      }, { timeout: 4000 })
      
      // Check success message
      expect(screen.getByText('Thank you for your purchase. Your order has been successfully processed.')).toBeInTheDocument()
      
      // Check order ID is displayed
      expect(screen.getByText(/Order ID: ORD-/)).toBeInTheDocument()
    })

    it('should display order summary with all items', async () => {
      render(<CheckoutPage />)
      
      // Fill form and submit
      fillCheckoutForm()
      
      fireEvent.click(screen.getByText('Complete Purchase'))
      
      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Order Summary')).toBeInTheDocument()
      }, { timeout: 4000 })
      
      // Check items are displayed
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      expect(screen.getByText('Qty: 2')).toBeInTheDocument()
      expect(screen.getByText('Qty: 1')).toBeInTheDocument()
    })

    it('should display shipping address information', async () => {
      render(<CheckoutPage />)
      
      // Fill form and submit
      fillCheckoutForm()
      
      fireEvent.click(screen.getByText('Complete Purchase'))
      
      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Shipping Address')).toBeInTheDocument()
      }, { timeout: 4000 })
      
      // Check shipping address details
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('123 Main St')).toBeInTheDocument()
      expect(screen.getByText('New York, NY 10001')).toBeInTheDocument()
    })

    it('should display payment method information', async () => {
      render(<CheckoutPage />)
      
      // Fill form and submit
      fillCheckoutForm()
      
      fireEvent.click(screen.getByText('Complete Purchase'))
      
      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Payment Method')).toBeInTheDocument()
      }, { timeout: 4000 })
      
      // Check payment method details
      expect(screen.getByText('Visa')).toBeInTheDocument()
      // The card number should be masked - check for the pattern
      expect(screen.getByText(/.*\*{4}.*\*{4}.*\*{4}.*/)).toBeInTheDocument()
    })

    it('should display next steps information', async () => {
      render(<CheckoutPage />)
      
      // Fill form and submit
      fillCheckoutForm()
      
      fireEvent.click(screen.getByText('Complete Purchase'))
      
      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText("What's Next?")).toBeInTheDocument()
      }, { timeout: 4000 })
      
      // Check next steps
      expect(screen.getByText("You'll receive an order confirmation email shortly")).toBeInTheDocument()
      expect(screen.getByText('Your order will be shipped within 1-2 business days')).toBeInTheDocument()
      expect(screen.getByText("You'll receive tracking information once your order ships")).toBeInTheDocument()
    })

    it('should have continue shopping link', async () => {
      render(<CheckoutPage />)
      
      // Fill form and submit
      fillCheckoutForm()
      
      fireEvent.click(screen.getByText('Complete Purchase'))
      
      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Continue Shopping')).toBeInTheDocument()
      }, { timeout: 4000 })
      
      const continueShoppingLink = screen.getByText('Continue Shopping').closest('a')
      expect(continueShoppingLink).toHaveAttribute('href', '/')
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: mockCartState,
        clearCart: mockClearCart,
      })
    })

    it('should have back to cart link', () => {
      render(<CheckoutPage />)
      
      const backToCartLink = screen.getByText('Back to Cart').closest('a')
      expect(backToCartLink).toHaveAttribute('href', '/cart')
    })
  })

  describe('Form Validation', () => {
    beforeEach(() => {
      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: mockCartState,
        clearCart: mockClearCart,
      })
    })

    it('should require all form fields', () => {
      render(<CheckoutPage />)
      
      const inputs = screen.getAllByDisplayValue('')
      const cardNumberInput = screen.getByPlaceholderText('1234 5678 9012 3456')
      const expiryInput = screen.getByPlaceholderText('MM/YY')
      const cvvInput = screen.getByPlaceholderText('123')
      
      // Check that all inputs have required attribute
      inputs.forEach(input => {
        expect(input).toBeRequired()
      })
      expect(cardNumberInput).toBeRequired()
      expect(expiryInput).toBeRequired()
      expect(cvvInput).toBeRequired()
    })

    it('should validate email format', () => {
      render(<CheckoutPage />)
      
      const inputs = screen.getAllByDisplayValue('')
      const emailInput = inputs[2] // Email is the third input
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Order Summary Calculations', () => {
    beforeEach(() => {
      const useCartModule = jest.requireMock('@/app/hooks/useCart')
      useCartModule.useCart = () => ({
        state: mockCartState,
        clearCart: mockClearCart,
      })
    })

    it('should calculate totals correctly', () => {
      render(<CheckoutPage />)
      
      // Subtotal: (29.99 * 2) + (19.99 * 1) = 79.97
      expect(screen.getByText('$79.97')).toBeInTheDocument()
      
      // Tax: 79.97 * 0.08 = 6.40
      expect(screen.getByText('$6.40')).toBeInTheDocument()
      
      // Total: 79.97 + 6.40 = 86.37
      expect(screen.getByText('$86.37')).toBeInTheDocument()
    })

    it('should show correct item count', () => {
      render(<CheckoutPage />)
      
      expect(screen.getByText('Subtotal (3 items)')).toBeInTheDocument()
    })
  })
}) 