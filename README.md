# 🛍️ Modern E-commerce Shopping Cart Demo

A fully-featured e-commerce application built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. This demo showcases modern e-commerce functionality with a beautiful, responsive design.

## ✨ Features

### 🏠 **Home Page (Products)**
- **Product Grid**: Responsive 3-column layout with beautiful product cards
- **Pagination**: Load 3 products initially, "Load More" button for additional products
- **Advanced Filtering**:
  - **Search Bar**: Search through loaded products by title and description
  - **Category Filter**: Filter by product categories
  - **Sorting Options**: Price (low/high), rating, name, default
- **Responsive Design**: Mobile-first approach with touch-friendly controls

### 🛒 **Shopping Cart**
- **Cart Context**: Global state management with React Context API
- **Persistent Storage**: Cart data saved to localStorage
- **Real-time Updates**: Cart count updates instantly across all pages
- **Quantity Management**: Add, remove, and update item quantities
- **Order Summary**: Subtotal, tax calculation, and total with shipping

### 📱 **Product Detail Page**
- **Product Information**: Complete product details with images
- **Rating System**: Star ratings with review counts
- **Quantity Selector**: Add multiple items with quantity controls
- **Add to Cart**: Seamless integration with cart functionality
- **Breadcrumb Navigation**: Easy site navigation

### 💳 **Checkout Process**
- **Multi-step Checkout**: Form → Payment Processing → Order Confirmation
- **Payment Simulation**: 3-second payment processing with loading animation
- **Order Summary**: Complete order details with shipping and payment info
- **Form Validation**: Required fields with proper validation
- **Success Page**: Order confirmation with next steps

### 🎨 **Modern UI/UX**
- **Professional Design**: Clean, modern e-commerce aesthetic
- **Responsive Layout**: Works perfectly on all device sizes
- **Loading States**: Smooth animations and loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopping-cart-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 How to Test

### 1. **Product Browsing & Filtering**
- **Load Products**: Visit the home page to see the first 3 products
- **Load More**: Click "Load More Products" to load additional products
- **Search**: Use the search bar to filter loaded products
- **Category Filter**: Select different categories from the dropdown
- **Sorting**: Try different sorting options (price, rating, name)

### 2. **Shopping Cart Functionality**
- **Add to Cart**: Click "Add" on any product card
- **Cart Count**: Notice the cart count updates in the navbar
- **Product Detail**: Click on a product to view details
- **Quantity Management**: Use quantity controls on product detail page
- **Cart Page**: Click the cart icon to view your cart
- **Remove Items**: Remove items or clear the entire cart

### 3. **Checkout Process**
- **Start Checkout**: From the cart page, click "Proceed to Checkout"
- **Fill Form**: Complete the checkout form with test data:
  - **Personal Info**: Any name and email
  - **Shipping Address**: Any address details
  - **Payment**: Use any test card number (e.g., "1234 5678 9012 3456")
- **Payment Processing**: Watch the 3-second payment simulation
- **Order Confirmation**: Review the order summary and confirmation

### 4. **Responsive Testing**
- **Mobile**: Test on mobile devices or browser dev tools
- **Tablet**: Test tablet layouts
- **Desktop**: Test full desktop experience
- **Navigation**: Test mobile menu and responsive navigation

### 5. **Edge Cases**
- **Empty Cart**: Try accessing checkout with an empty cart
- **Search on Loaded Pages**: Load multiple pages, then search
- **Cart Persistence**: Refresh the page to see cart data persists
- **Error Handling**: Try accessing invalid product IDs

## 🛠️ Technical Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Data**: FakeStore API for product data
- **Storage**: localStorage for cart persistence
- **Deployment**: Ready for Vercel deployment

## 📁 Project Structure

```
src/app/
├── components/           # Reusable UI components
│   ├── Navbar.tsx       # Navigation with cart count
│   ├── ProductCard.tsx  # Product display cards
│   └── FilterBar.tsx    # Search and filter controls
├── context/             # React Context providers
│   └── 00CartContext.tsx # Cart state management
├── hooks/               # Custom React hooks
│   └── useCart.ts       # Cart functionality hook
├── cart/                # Shopping cart page
├── checkout/            # Checkout process
├── products/            # Product pages
│   └── [id]/            # Individual product details
└── page.tsx             # Home page with products
```

## 🎯 Key Features Demonstrated

### **State Management**
- Global cart state with Context API
- Persistent localStorage integration
- Real-time state updates across components

### **User Experience**
- Smooth loading animations
- Responsive design patterns
- Intuitive navigation flow
- Professional e-commerce UX

### **Performance**
- Optimized image loading with Next.js Image
- Efficient pagination
- Minimal re-renders with proper state management

### **Modern Development**
- TypeScript for type safety
- Component-based architecture
- Clean, maintainable code structure

## 🚀 Deployment

This project is ready for deployment on Vercel:

1. **Push to GitHub**: Commit and push your changes
2. **Deploy on Vercel**: Connect your repository to Vercel
3. **Automatic Deployment**: Vercel will automatically deploy your app

## 🤝 Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy Shopping! 🛍️**
