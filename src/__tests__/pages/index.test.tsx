import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '@/app/page'

// Mock the API module
jest.mock('@/app/products/api', () => ({
  getProducts: jest.fn(),
}))

// Mock the CartContext
const mockAddItem = jest.fn()
const mockRemoveItem = jest.fn()
const mockUpdateQuantity = jest.fn()
const mockClearCart = jest.fn()
const mockGetItemQuantity = jest.fn()
const mockIsInCart = jest.fn()

jest.mock('@/app/context/00CartContext', () => ({
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
const mockProducts = [
  {
    id: 1,
    title: 'Test Product 1',
    price: 29.99,
    description: 'Test description 1',
    category: 'electronics',
    image: 'test-image-1.jpg',
    rating: { rate: 4.5, count: 100 },
  },
  {
    id: 2,
    title: 'Test Product 2',
    price: 19.99,
    description: 'Test description 2',
    category: 'clothing',
    image: 'test-image-2.jpg',
    rating: { rate: 4.0, count: 50 },
  },
  {
    id: 3,
    title: 'Test Product 3',
    price: 39.99,
    description: 'Test description 3',
    category: 'electronics',
    image: 'test-image-3.jpg',
    rating: { rate: 4.8, count: 200 },
  },
]

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful API response
    const apiModule = jest.requireMock('@/app/products/api')
    apiModule.getProducts.mockResolvedValue(mockProducts)
    
    // Reset cart state
    mockAddItem.mockClear()
    mockRemoveItem.mockClear()
    mockUpdateQuantity.mockClear()
    mockClearCart.mockClear()
    mockGetItemQuantity.mockReturnValue(0)
    mockIsInCart.mockReturnValue(false)
  })

  it('renders loading state initially', () => {
    render(<Home />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders products after loading', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      expect(screen.getByText('Test Product 3')).toBeInTheDocument()
    })
  })

  it('displays product information correctly', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('$29.99')).toBeInTheDocument()
      expect(screen.getByText('$19.99')).toBeInTheDocument()
      expect(screen.getByText('$39.99')).toBeInTheDocument()
    })
  })

  it('filters products by category', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const categoryFilter = screen.getByDisplayValue('All Categories')
    fireEvent.change(categoryFilter, { target: { value: 'electronics' } })

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 3')).toBeInTheDocument()
      expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument()
    })
  })

  it('sorts products by price', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const sortSelect = screen.getByDisplayValue('Default')
    fireEvent.change(sortSelect, { target: { value: 'price-low' } })

    await waitFor(() => {
      const products = screen.getAllByTestId('product-card')
      expect(products[0]).toHaveTextContent('$19.99')
      expect(products[1]).toHaveTextContent('$29.99')
      expect(products[2]).toHaveTextContent('$39.99')
    })
  })

  it('searches products by title', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search products...')
    fireEvent.change(searchInput, { target: { value: 'Product 1' } })

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Test Product 3')).not.toBeInTheDocument()
    })
  })

  it('loads more products when "Load More" is clicked', async () => {
    const extendedMockProducts = [
      ...mockProducts,
      {
        id: 4,
        title: 'Test Product 4',
        price: 49.99,
        description: 'Test description 4',
        category: 'jewelery',
        image: 'test-image-4.jpg',
        rating: { rate: 4.2, count: 75 },
      },
    ]

    const apiModule = jest.requireMock('@/app/products/api')
    apiModule.getProducts.mockResolvedValue(extendedMockProducts)

    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const loadMoreButton = screen.getByText('Load More Products')
    fireEvent.click(loadMoreButton)

    await waitFor(() => {
      expect(screen.getByText('Test Product 4')).toBeInTheDocument()
    })
  })

  it('adds product to cart when "Add to Cart" is clicked', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const addToCartButtons = screen.getAllByText('Add')
    fireEvent.click(addToCartButtons[0])

    expect(mockAddItem).toHaveBeenCalledWith({
      id: mockProducts[0].id,
      title: mockProducts[0].title,
      price: mockProducts[0].price,
      image: mockProducts[0].image,
      category: mockProducts[0].category,
    })
  })

  it('handles API error gracefully', async () => {
    const apiModule = jest.requireMock('@/app/products/api')
    apiModule.getProducts.mockRejectedValue(new Error('API Error'))

    render(<Home />)
    
    await waitFor(() => {
      // When API fails, no products are loaded, so we should see "No products found"
      expect(screen.getByText('No products found')).toBeInTheDocument()
    })
  })

  it('displays correct number of products initially', async () => {
    render(<Home />)
    
    await waitFor(() => {
      const productCards = screen.getAllByTestId('product-card')
      expect(productCards).toHaveLength(3)
    })
  })

  it('updates search results when typing', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search products...')
    fireEvent.change(searchInput, { target: { value: 'Test Product 1' } })

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument()
      expect(screen.queryByText('Test Product 3')).not.toBeInTheDocument()
    })
  })

  it('clears search when input is cleared', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search products...')
    fireEvent.change(searchInput, { target: { value: 'Product 1' } })

    await waitFor(() => {
      expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument()
    })

    fireEvent.change(searchInput, { target: { value: '' } })

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      expect(screen.getByText('Test Product 3')).toBeInTheDocument()
    })
  })

  it('has accessible form controls', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    expect(screen.getAllByRole('combobox')).toHaveLength(2)
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Default')).toBeInTheDocument()
  })

  it('displays product images', async () => {
    render(<Home />)
    
    await waitFor(() => {
      const images = screen.getAllByAltText(/Test Product/)
      expect(images).toHaveLength(3)
    })
  })

  it('shows product ratings', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const ratings = screen.getAllByTestId('product-rating')
    expect(ratings).toHaveLength(3)
    expect(ratings[0]).toHaveTextContent('4.5')
    expect(ratings[1]).toHaveTextContent('4')
    expect(ratings[2]).toHaveTextContent('4.8')
  })
}) 