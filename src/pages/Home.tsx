import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, STORE_PHONE_NUMBER } from '../utils/constants';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft, FilterX, ShieldCheck, Clock, Layers, Phone, ShoppingBag, Loader2 } from 'lucide-react';
import { supabase, mockProducts, mockCategories, Product, Category } from '../lib/supabase';

export default function Home() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  const categoryParam = searchParams.get('cat');
  const searchQuery = searchParams.get('search') || '';
  
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(true);

  const isProductsPage = location.pathname === '/products';
  const whatsappLink = `https://wa.me/${STORE_PHONE_NUMBER}?text=Hi%20Somic,%20I%20have%20a%20question%20about...`;

  // Reset scroll to top when switching categories
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryParam]);

  // Fetch Data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Fetch Categories
      if (!supabase) {
        setCategories(mockCategories);
      } else {
        try {
          const { data, error } = await supabase.from('categories').select('*').order('name');
          if (error) throw error;
          if (data && data.length > 0) {
            setCategories(data);
          } else {
            // If table is empty, use mock categories
            setCategories(mockCategories);
          }
        } catch (err) {
          console.error('Error fetching categories:', err);
          // On error, use mock categories
          setCategories(mockCategories);
        }
      }

      // Fetch Products
      if (!supabase) {
        setProducts(mockProducts);
      } else {
        try {
          const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          
          if (data) {
            // Ensure price is treated as a number
            const formattedData = data.map(product => ({
              ...product,
              price: Number(product.price) || 0
            }));
            setProducts(formattedData);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          setProducts(mockProducts);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const pName = (p.name || '').toLowerCase();
    const pCategory = (p.category || '').toLowerCase();
    const search = searchQuery.toLowerCase();
    
    const matchesSearch = pName.includes(search) || pCategory.includes(search);
    
    const activeCategory = categories.find(c => c.id === categoryParam);
    const matchesCategory = !categoryParam || 
                           pCategory === categoryParam.toLowerCase() ||
                           (activeCategory && activeCategory.name.toLowerCase() === pCategory);
                           
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  const activeCategoryName = categoryParam 
    ? categories.find(c => c.id === categoryParam)?.name 
    : null;

  return (
    <div className="space-y-4 md:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* PREMIUM STYLE HERO SECTION: Sidebar + Slider + Right Promo */}
      {!searchQuery && !categoryParam && !isProductsPage && (
        <div className="grid grid-cols-12 gap-4 h-auto md:h-[380px]">
           {/* Left Sidebar: Categories (Desktop Only) */}
           <div className="hidden md:flex col-span-3 lg:col-span-2 bg-white rounded shadow-sm overflow-hidden border border-gray-200 flex-col h-full">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                  <Layers className="w-4 h-4 text-gray-500" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-gray-700">Categories</h3>
              </div>
              <div className="flex-1 py-2 overflow-y-auto">
                 {categories.map(cat => (
                    <Link 
                       key={cat.id} 
                       to={`/?cat=${cat.id}`}
                       className="flex items-center gap-3 px-4 py-3 hover:text-blue-600 transition-colors text-sm text-gray-600 group"
                    >
                       {cat.image_url && <img src={cat.image_url} alt={cat.name} loading="lazy" className="w-5 h-5 object-contain rounded-full" referrerPolicy="no-referrer" />}
                       <span className="font-medium text-xs lg:text-sm truncate">{cat.name}</span>
                       <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                 ))}
              </div>
              <div className="border-t border-gray-100 p-2">
                <Link to="/?cat=all" className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-600 hover:text-white transition-colors text-xs uppercase font-bold text-gray-500 rounded-md">
                   View All
                </Link>
              </div>
           </div>

            {/* Center: Hero Banner */}
           <div className="col-span-12 md:col-span-9 lg:col-span-8 h-[180px] md:h-full">
              <div className="relative rounded md:rounded-lg overflow-hidden bg-slate-900 text-white h-full shadow-sm group">
                 <img 
                    src="https://fastly.picsum.photos/id/694/1200/600.jpg?hmac=0Hv_xR-nhR0FwpcIe06vHD8mSN4iuM3vDqD4ZIF4t40" 
                    alt="Hero" 
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                 />
                 <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent flex items-center">
                    <div className="px-6 md:px-12 max-w-lg animate-fade-in">
                       <span className="bg-blue-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded uppercase mb-3 inline-block shadow-sm">Official Store</span>
                       <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-4 leading-tight italic">ALL PREMIUM SPORTS <br/>SEASON KITS</h1>
                       <p className="text-gray-200 text-xs md:text-sm lg:text-base mb-4 md:mb-6 max-w-sm leading-relaxed hidden md:block">Authentic quality jerseys for the Premier League, La Liga, and more. Delivered to your park.</p>
                       <a href="#products" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 md:py-3 rounded font-bold transition-colors inline-block text-sm md:text-base shadow-lg">
                          Shop Now
                       </a>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right: Promo Boxes (Desktop Only - Large Screens) */}
           <div className="hidden lg:flex col-span-2 flex-col gap-4 h-full">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
                 <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                 </div>
                 <h3 className="font-bold text-slate-900 leading-tight mb-1 text-sm">Authentic</h3>
                 <p className="text-xs text-gray-500">100% Original</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
                 <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-green-600" />
                 </div>
                 <h3 className="font-bold text-slate-900 leading-tight mb-1 text-sm">Fast Delivery</h3>
                 <p className="text-xs text-gray-500">To all states</p>
              </div>
           </div>
        </div>
      )}

      {/* Mobile Categories (Horizontal Scroll / Grid) */}
      {!searchQuery && (
        <section className="md:hidden bg-white p-3 rounded shadow-sm">
          <div className="grid grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link to={`/?cat=${cat.id}`} key={cat.id} className="group flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full bg-gray-50 p-1 overflow-hidden border ${categoryParam === cat.id ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-gray-100'}`}>
                  {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-full h-full object-contain rounded-full" referrerPolicy="no-referrer" />}
                </div>
                <span className={`text-[10px] font-medium text-center leading-tight truncate w-full ${categoryParam === cat.id ? 'text-blue-600' : 'text-slate-700'}`}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Product Feed */}
      <section id="products" className="bg-white md:bg-transparent rounded-lg p-2 md:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 bg-white md:bg-blue-50/50 md:p-3 md:rounded-lg md:border md:border-blue-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
               {searchQuery ? `Results for "${searchQuery}"` : 
                activeCategoryName ? activeCategoryName : 
                isProductsPage ? "All Products" : 
                "Top Selling Jerseys"}
            </h2>
            {categoryParam && (
               <Link to="/" className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full flex items-center hover:bg-blue-100 border border-blue-100 transition-colors font-medium shadow-sm ml-2">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to All Categories
               </Link>
            )}
          </div>
          
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-sm text-gray-500 hidden md:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded focus:ring-blue-600 focus:border-blue-600 p-2 shadow-sm cursor-pointer outline-none"
            >
              <option value="default">Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FilterX className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">No jerseys found matching your selection.</p>
            {(categoryParam || isProductsPage || searchQuery) && (
               <Link to="/" className="text-blue-600 font-bold mt-2 inline-block text-sm hover:underline">Back to Home</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
            {sortedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Join Somic Section (For new users) */}
      {!user && !searchQuery && !categoryParam && !isProductsPage && (
        <section className="bg-slate-900 rounded-xl p-8 text-center text-white shadow-xl relative overflow-hidden group mt-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 italic tracking-tight">READY TO SHOP AT SJS?</h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto text-sm md:text-base">Create an account to track your orders, save your favorite kits, and get exclusive season updates.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95">
                CREATE ACCOUNT
              </Link>
              <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 rounded-xl font-bold transition-all backdrop-blur-sm">
                SIGN IN
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges - Footer style info */}
      {!searchQuery && !categoryParam && !isProductsPage && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 py-6 mt-8">
          {[
            { title: "Nationwide Delivery", sub: "To your park", icon: Clock },
            { title: "Payment validates delivery", sub: "Bank Transfer", icon: ShieldCheck },
            { title: "Quality Guarantee", sub: "Authentic Kits", icon: ShoppingBag },
            { title: "24/7 Support", sub: "WhatsApp Us", icon: Phone }
          ].map((item, i) => {
              const Icon = item.icon;
              return (
                <a 
                   key={i} 
                   href={whatsappLink}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center gap-3 p-3 bg-white rounded shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
                >
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-xs md:text-sm group-hover:text-blue-600 transition-colors">{item.title}</h4>
                    <p className="text-[10px] text-gray-500">{item.sub}</p>
                </div>
                </a>
              )
          })}
        </section>
      )}
    </div>
  );
}
