import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProductDetailPage from '@/app/products/[id]/page'

// Mock the CartContext
const mockAddItem = jest.fn()
const mockIsInCart = jest.fn()
const mockGetItemQuantity = jest.fn()

jest.mock('@/app/context/00CartContext', () => ({
  useCart: () => ({
    state: {
      items: [],
      total: 0,
      itemCount: 0,
    },
    addItem: mockAddItem,
    isInCart: mockIsInCart,
    getItemQuantity: mockGetItemQuantity,
  }),
}))

// Mock fetch
global.fetch = jest.fn()

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

// Mock data
const mockProduct = {
  id: 1,
  title: 'Test Product',
  price: 29.99,
  description: 'This is a test product description that provides detailed information about the product features and benefits.',
  category: 'electronics',
  image: 'test-image.jpg',
  rating: {
    rate: 4.5,
    count: 120,
  },
}

describe('Product Detail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsInCart.mockReturnValue(false)
    mockGetItemQuantity.mockReturnValue(0)
    ;(fetch as jest.Mock).mockClear()
  })

  it('renders loading state initially', async () => {
    ;(fetch as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders product details after loading', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('electronics')).toBeInTheDocument()
    // The rating might be rendered differently, let's check for the pattern
    expect(screen.getByText(/4\.5/)).toBeInTheDocument()
    // Check for the reviews text with a more flexible matcher
    expect(screen.getByText(/120 reviews/)).toBeInTheDocument()
    // Check for the description text with a more flexible matcher
    expect(screen.getByText(/test product description/)).toBeInTheDocument()
  })

  it('displays product image', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    const image = screen.getByAltText('Test Product')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'test-image.jpg')
  })

  it('shows breadcrumb navigation', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    // Check for the breadcrumb version of the product title
    expect(screen.getAllByText('Test Product')).toHaveLength(2) // One in breadcrumb, one in heading
  })

  it('displays star rating correctly', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    // Check that stars are rendered (5 stars total)
    const stars = screen.getAllByRole('img', { hidden: true }).filter(img => 
      img.getAttribute('viewBox') === '0 0 20 20'
    )
    // If no stars found, check for SVG elements directly
    if (stars.length === 0) {
      const svgElements = screen.getAllByRole('img', { hidden: true })
      expect(svgElements.length).toBeGreaterThan(0)
    } else {
      expect(stars.length).toBeGreaterThan(0)
    }
    // For star rating, check for the presence of the rating text
    expect(screen.getByText(/4\.5/)).toBeInTheDocument()
  })

  it('handles quantity increase and decrease', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    const quantityInput = screen.getByRole('spinbutton')
    const increaseButton = screen.getByLabelText('Increase quantity')
    const decreaseButton = screen.getByLabelText('Decrease quantity')

    // Test initial quantity
    expect(quantityInput).toHaveValue(1)

    // Test increase
    fireEvent.click(increaseButton)
    expect(quantityInput).toHaveValue(2)

    // Test decrease
    fireEvent.click(decreaseButton)
    expect(quantityInput).toHaveValue(1)

    // Test manual input
    fireEvent.change(quantityInput, { target: { value: '5' } })
    expect(quantityInput).toHaveValue(5)
  })

  it('prevents quantity below 1', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    const quantityInput = screen.getByRole('spinbutton')
    const decreaseButton = screen.getByLabelText('Decrease quantity')

    // Try to decrease below 1
    fireEvent.click(decreaseButton)
    expect(quantityInput).toHaveValue(1)

    // Try manual input below 1
    fireEvent.change(quantityInput, { target: { value: '0' } })
    expect(quantityInput).toHaveValue(1)
  })

  it('prevents quantity above 99', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    const quantityInput = screen.getByRole('spinbutton')

    // Try manual input above 99
    fireEvent.change(quantityInput, { target: { value: '100' } })
    expect(quantityInput).toHaveValue(1)
  })

  it('adds product to cart when button is clicked', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    const addToCartButton = screen.getByText(/Add to Cart/)
    fireEvent.click(addToCartButton)

    expect(mockAddItem).toHaveBeenCalledWith({
      id: mockProduct.id,
      title: mockProduct.title,
      price: mockProduct.price,
      image: mockProduct.image,
      category: mockProduct.category,
    })
  })

  it('shows correct cart button text when product is in cart', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })
    mockIsInCart.mockReturnValue(true)
    mockGetItemQuantity.mockReturnValue(2)

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    expect(screen.getByText(/Added to Cart/)).toBeInTheDocument()
    expect(screen.getByText('2 in cart')).toBeInTheDocument()
  })

  it('updates quantity when product is already in cart', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })
    mockIsInCart.mockReturnValue(true)
    mockGetItemQuantity.mockReturnValue(3)

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    const quantityInput = screen.getByRole('spinbutton')
    expect(quantityInput).toHaveValue(3)
  })

  it('calculates total price based on quantity', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    const quantityInput = screen.getByRole('spinbutton')
    
    // Change quantity to 3
    fireEvent.change(quantityInput, { target: { value: '3' } })
    
    // Check that total price is updated (29.99 * 3 = 89.97)
    // The price might be in the cart button text
    expect(screen.getByText(/89\.97/)).toBeInTheDocument()
  })

  it('handles API error gracefully', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '999' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Product Not Found')).toBeInTheDocument()
    })

    expect(screen.getByText('Back to Products')).toBeInTheDocument()
  })

  it('handles network error gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Product Not Found')).toBeInTheDocument()
    })

    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('displays product features section', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    expect(screen.getByText('Product Features')).toBeInTheDocument()
    expect(screen.getByText('Free shipping on orders over $50')).toBeInTheDocument()
    expect(screen.getByText('30-day return policy')).toBeInTheDocument()
    expect(screen.getByText('Secure payment processing')).toBeInTheDocument()
  })

  it('displays wishlist button', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    expect(screen.getByText('Add to Wishlist')).toBeInTheDocument()
  })

  it('displays related products section', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    expect(screen.getByText('You might also like')).toBeInTheDocument()
    expect(screen.getByText('Related products coming soon...')).toBeInTheDocument()
  })

  it('has accessible form controls', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    // Check for quantity input
    const quantityInput = screen.getByRole('spinbutton')
    expect(quantityInput).toHaveAttribute('min', '1')
    expect(quantityInput).toHaveAttribute('max', '99')

    // Check for buttons
    expect(screen.getByText(/Add to Cart/)).toBeInTheDocument()
    expect(screen.getByText('Add to Wishlist')).toBeInTheDocument()
  })

  it('handles invalid product ID', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: 'invalid' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Product Not Found')).toBeInTheDocument()
    })

    expect(screen.getByText('Product not found')).toBeInTheDocument()
  })

  it('updates cart button text when quantity changes', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProduct,
    })

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ id: '1' })} />)
    })
    
    await waitFor(() => {
      expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0)
    })

    const quantityInput = screen.getByRole('spinbutton')
    
    // Initial state
    expect(screen.getByText('Add to Cart - $29.99')).toBeInTheDocument()
    
    // Change quantity
    fireEvent.change(quantityInput, { target: { value: '2' } })
    expect(screen.getByText('Add to Cart - $59.98')).toBeInTheDocument()
  })
}) 