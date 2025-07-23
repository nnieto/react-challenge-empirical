'use client';

import { useState, useEffect } from 'react';
import { getProducts } from './products/api';
import Navbar from '@/app/components/Navbar';
import ProductCard from '@/app/components/ProductCard';
import FilterBar from '@/app/components/FilterBar';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const productsPerPage = 3;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filteredProducts = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category === selectedCategory
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProducts = [...filteredProducts].sort((a, b) => b.rating.rate - a.rating.rate);
        break;
      case 'name':
        filteredProducts = [...filteredProducts].sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    // Get all products up to current page (all loaded products)
    const startIndex = 0;
    const endIndex = currentPage * productsPerPage;
    const allLoadedProducts = filteredProducts.slice(startIndex, endIndex);

    // Filter by search query on ALL loaded products
    if (searchQuery) {
      const searchFiltered = allLoadedProducts.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedProducts(searchFiltered);
    } else {
      setDisplayedProducts(allLoadedProducts);
    }
  }, [products, currentPage, selectedCategory, sortBy, searchQuery]);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Don't reset current page when searching - let search work on all loaded products
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-gray-600">Discover amazing products at great prices</p>
        </div>

        {/* Filter Bar */}
        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          searchQuery={searchQuery}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          onSearch={handleSearch}
        />

        {/* Products Grid */}
        {displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Button */}
            {(() => {
              const totalFilteredProducts = products.filter(p => 
                selectedCategory === 'all' ? true : p.category === selectedCategory
              );
              const totalLoadedProducts = currentPage * productsPerPage;
              const hasMoreProducts = totalLoadedProducts < totalFilteredProducts.length;
              
              return hasMoreProducts && !searchQuery;
            })() && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Load More Products
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
