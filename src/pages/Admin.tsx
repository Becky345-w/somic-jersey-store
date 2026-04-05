import React, { useState, useEffect } from 'react';
import { supabase, Category, mockCategories } from '../lib/supabase';
import { Upload, Plus, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Users, ShieldAlert, X, Lock, LogOut, Trophy, Medal, Shield, Star, Clock, Trash2, LayoutGrid, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'manage_products' | 'admins' | 'orders' | 'categories'>('products');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinError, setPinError] = useState('');
  
  // Change PIN State
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmNewPin, setShowConfirmNewPin] = useState(false);
  const [changePinMsg, setChangePinMsg] = useState({ type: '', text: '' });
  
  // Manage Products State
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Product Filters
  const [productFilters, setProductFilters] = useState({
    categories: [] as string[],
    inStock: null as boolean | null,
    seasons: [] as string[]
  });
  
  // Bulk Actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // Order Sorting
  const [orderSort, setOrderSort] = useState({ key: 'date', direction: 'desc' as 'asc' | 'desc' });

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', icon_name: 'Trophy', image: null as File | null });
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const [categoryMsg, setCategoryMsg] = useState({ type: '', text: '' });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  // Master Admin Mock State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminList, setAdminList] = useState(() => {
    const savedAdmins = localStorage.getItem('somic_admins');
    return savedAdmins ? JSON.parse(savedAdmins) : [
      { id: '1', email: 'delimabethel@gmail.com', role: 'master' },
      { id: '2', email: 'admin1@somic.com', role: 'admin' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('somic_admins', JSON.stringify(adminList));
  }, [adminList]);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    season: '',
    sizes: 'S, M, L, XL, XXL',
    colors: 'Standard',
    in_stock: true,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is admin
    const savedAdmins = JSON.parse(localStorage.getItem('somic_admins') || '[]');
    const masterAdmin = { email: 'delimabethel@gmail.com' };
    const allAdmins = [...savedAdmins, masterAdmin, { email: 'admin1@somic.com' }];
    const isAdmin = allAdmins.some(admin => admin.email.toLowerCase() === user?.email?.toLowerCase());

    if (!isAdmin) {
      toast.error('Access denied. Admins only.');
      navigate('/account');
      return;
    }

    if (!supabase) {
      setIsConfigured(false);
      setCategories(mockCategories);
      setFormData(prev => ({ ...prev, category: mockCategories[0]?.name || '' }));
    } else {
      fetchCategories();
    }
    // Load orders from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('somic_orders') || '[]');
    setOrders(savedOrders);
    
    // Check if already authenticated in this session
    if (sessionStorage.getItem('somic_admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, [user, navigate]);

  const fetchCategories = async () => {
    if (!supabase) return;
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      if (data && data.length > 0) {
        setCategories(data);
        if (!formData.category) {
          setFormData(prev => ({ ...prev, category: data[0].name }));
        }
      } else {
        setCategories(mockCategories);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
      setCategories(mockCategories);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;

    setIsAddingCategory(true);
    let imageUrl = '';

    try {
      if (newCategory.image && supabase) {
        const fileExt = newCategory.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `categories/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, newCategory.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }

      if (!supabase) {
        const cat: Category = {
          id: Date.now().toString(),
          name: newCategory.name,
          icon_name: newCategory.icon_name,
          image_url: categoryImagePreview || undefined,
          created_at: new Date().toISOString()
        };
        setCategories([...categories, cat]);
        setNewCategory({ name: '', icon_name: 'Trophy', image: null });
        setCategoryImagePreview(null);
        setCategoryMsg({ type: 'success', text: 'Category added locally!' });
        setTimeout(() => setCategoryMsg({ type: '', text: '' }), 3000);
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([{ 
          name: newCategory.name, 
          icon_name: newCategory.icon_name,
          image_url: imageUrl || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        setCategories([...categories, data]);
        setNewCategory({ name: '', icon_name: 'Trophy', image: null });
        setCategoryImagePreview(null);
        setCategoryMsg({ type: 'success', text: 'Category added successfully!' });
        setTimeout(() => setCategoryMsg({ type: '', text: '' }), 3000);
      }
    } catch (err: any) {
      console.error('Error adding category:', err);
      // Show the actual error message AND the URL we are trying to connect to
      const url = import.meta.env.VITE_SUPABASE_URL || 'Unknown URL';
      setCategoryMsg({ type: 'error', text: `Error: ${err.message}. Connected to: ${url}` });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!supabase) {
      setCategories(categories.filter(c => c.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'manage_products') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    if (!supabase) return;
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setStoreProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDeleteProduct = async (id: string, imageUrl: string) => {
    if (!supabase) return;
    try {
      // Delete from database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update state
      setStoreProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPin = localStorage.getItem('somic_admin_pin') || '1234';
    if (pinInput === currentPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('somic_admin_auth', 'true');
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Invalid PIN');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('somic_admin_auth');
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setChangePinMsg({ type: 'error', text: 'PIN must be at least 4 digits' });
      return;
    }
    if (newPin !== confirmNewPin) {
      setChangePinMsg({ type: 'error', text: 'PINs do not match' });
      return;
    }
    localStorage.setItem('somic_admin_pin', newPin);
    setChangePinMsg({ type: 'success', text: 'PIN changed successfully' });
    setNewPin('');
    setConfirmNewPin('');
    setTimeout(() => setChangePinMsg({ type: '', text: '' }), 3000);
  };

  // Waybill Modal State
  const [waybillModalOpen, setWaybillModalOpen] = useState(false);
  const [selectedOrderForWaybill, setSelectedOrderForWaybill] = useState<any>(null);
  const [waybillData, setWaybillData] = useState({ driverName: '', driverPhone: '', price: '' });

  // Admin Msg State
  const [addAdminMsg, setAddAdminMsg] = useState({ type: '', text: '' });

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const handleClearOrders = () => {
    confirmAction(
      'Clear All Orders',
      'Are you sure you want to delete ALL orders? This cannot be undone.',
      () => {
        localStorage.removeItem('somic_orders');
        setOrders([]);
      }
    );
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('somic_orders', JSON.stringify(updatedOrders));
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) return;
    
    if (adminList.find((admin: any) => admin.email.toLowerCase() === adminEmail.toLowerCase())) {
      setAddAdminMsg({ type: 'error', text: 'Admin already exists' });
      toast.error('Admin already exists');
      return;
    }

    const newAdmin = {
      id: Math.random().toString(36).substr(2, 9),
      email: adminEmail,
      role: 'admin'
    };
    
    const updatedList = [...adminList, newAdmin];
    setAdminList(updatedList);
    localStorage.setItem('somic_admins', JSON.stringify(updatedList));
    setAdminEmail('');
    setAddAdminMsg({ type: 'success', text: 'Admin added successfully' });
    toast.success('Admin added successfully');
    setTimeout(() => setAddAdminMsg({ type: '', text: '' }), 3000);
  };

  const openWaybillModal = (order: any) => {
    setSelectedOrderForWaybill(order);
    setWaybillData({ driverName: '', driverPhone: '', price: '' });
    setWaybillModalOpen(true);
  };

  const handleSendWaybill = (type: 'sms' | 'whatsapp') => {
    if (!selectedOrderForWaybill) return;
    
    const { driverName, driverPhone, price } = waybillData;
    const order = selectedOrderForWaybill;

    const message = `Hello ${order.customer}, your order ${order.id} has been waybilled to ${order.park}, ${order.state}. Driver: ${driverName}, Phone: ${driverPhone}. Waybill Price: ₦${price}. Please pay the driver on delivery. Thank you for shopping with Somic's Jersey Store!`;
    
    if (type === 'sms') {
      // Open SMS app
      window.open(`sms:${order.phone}?body=${encodeURIComponent(message)}`, '_blank');
    } else {
      // Open WhatsApp
      const cleanPhone = order.phone.replace(/\D/g, '');
      const waPhone = cleanPhone.startsWith('0') ? `234${cleanPhone.slice(1)}` : cleanPhone;
      window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
    
    // Update status to Waybilled
    handleUpdateOrderStatus(order.id, 'Waybilled');
    setWaybillModalOpen(false);
  };

  // Extract unique months from orders for filter dropdown
  const orderMonths = Array.from(new Set(orders.map(order => {
    const date = new Date(order.date);
    return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
  })));

  const filteredOrders = orders.filter(order => {
    const statusMatch = filterStatus === 'All' || order.status === filterStatus;
    
    const orderDate = new Date(order.date);
    const monthString = `${orderDate.toLocaleString('default', { month: 'long' })} ${orderDate.getFullYear()}`;
    const monthMatch = filterMonth === 'All' || monthString === filterMonth;
    
    // Assuming payment method is always Bank Transfer for now, but we can filter if it exists
    const paymentMatch = filterPayment === 'All' || filterPayment === 'Bank Transfer';
    
    const searchMatch = !orderSearch || 
      order.customer.toLowerCase().includes(orderSearch.toLowerCase()) || 
      order.phone.includes(orderSearch) ||
      order.id.toLowerCase().includes(orderSearch.toLowerCase());

    return statusMatch && monthMatch && paymentMatch && searchMatch;
  });

  // Filtered Products
  const filteredProducts = storeProducts.filter(product => {
    const categoryMatch = productFilters.categories.length === 0 || productFilters.categories.includes(product.category);
    const inStockMatch = productFilters.inStock === null || product.in_stock === productFilters.inStock;
    const seasonMatch = productFilters.seasons.length === 0 || productFilters.seasons.includes(product.season);
    return categoryMatch && inStockMatch && seasonMatch;
  });

  // Sorted Orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    if (orderSort.key === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (orderSort.key === 'total') {
      comparison = a.total - b.total;
    } else if (orderSort.key === 'status') {
      comparison = a.status.localeCompare(b.status);
    }
    return orderSort.direction === 'asc' ? comparison : -comparison;
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file as Blob));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    // If we're editing, we need to be careful about which index we're removing
    // imagePreviews contains both old URLs and new local blobs
    // imageFiles only contains new local files
    
    const previewToRemove = imagePreviews[index];
    const isLocalBlob = previewToRemove.startsWith('blob:');
    
    if (isLocalBlob) {
      // Find the index in imageFiles. This is tricky since we don't store the blob URL in imageFiles.
      // But we know that imageFiles are added in order.
      // Let's find how many blobs are before this one.
      let blobIndex = 0;
      for (let i = 0; i < index; i++) {
        if (imagePreviews[i].startsWith('blob:')) {
          blobIndex++;
        }
      }
      setImageFiles(prev => prev.filter((_, i) => i !== blobIndex));
    }
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      season: product.season || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors || '',
      in_stock: product.in_stock,
    });
    
    // For previews, we use the existing URLs
    const previews = [product.image_url];
    if (product.additional_images && Array.isArray(product.additional_images)) {
      previews.push(...product.additional_images);
    }
    setImagePreviews(previews);
    setImageFiles([]); // Reset files as we're using existing URLs unless new ones are picked
    
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearProducts = async () => {
    confirmAction(
      'Clear All Products',
      'Are you sure you want to delete ALL products? This cannot be undone.',
      async () => {
        if (!supabase) {
          setStoreProducts([]);
          return;
        }

        setLoadingProducts(true);
        try {
          const { error } = await supabase
            .from('products')
            .delete()
            .neq('id', '0'); // Delete all
            
          if (error) throw error;
          setStoreProducts([]);
          toast.success('All products deleted');
        } catch (err) {
          console.error('Error clearing products:', err);
          toast.error('Failed to clear products');
        } finally {
          setLoadingProducts(false);
        }
      }
    );
  };

  const handleBulkDelete = async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedProductIds);
        
      if (error) throw error;
      
      setStoreProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)));
      setSelectedProductIds([]);
      toast.success('Selected products deleted');
    } catch (err) {
      console.error('Error bulk deleting:', err);
      toast.error('Failed to delete products');
    }
  };

  const handleBulkUpdateStock = async () => {
    if (!supabase) return;
    try {
      const productsToUpdate = storeProducts.filter(p => selectedProductIds.includes(p.id));
      
      for (const p of productsToUpdate) {
        const { error } = await supabase
          .from('products')
          .update({ in_stock: !p.in_stock })
          .eq('id', p.id);
        if (error) throw error;
      }
      
      setStoreProducts(prev => prev.map(p => 
        selectedProductIds.includes(p.id) ? { ...p, in_stock: !p.in_stock } : p
      ));
      setSelectedProductIds([]);
      toast.success('Stock status updated');
    } catch (err) {
      console.error('Error bulk updating stock:', err);
      toast.error('Failed to update stock');
    }
  };

  const handleRemoveAdmin = (id: string) => {
    const updatedAdmins = adminList.filter((admin: any) => admin.id !== id);
    setAdminList(updatedAdmins);
    localStorage.setItem('somic_admins', JSON.stringify(updatedAdmins));
    toast.success('Admin access revoked');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (imagePreviews.length === 0) {
      setError('Please select at least one image for the jersey');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!supabase) {
        // Local fallback
        const mainImageUrl = imagePreviews[0];
        const additionalImages = imagePreviews.slice(1);
        
        const productData = {
          id: editingProduct ? editingProduct.id : Date.now().toString(),
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          season: formData.season,
          sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
          colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
          in_stock: formData.in_stock,
          image_url: mainImageUrl,
          additional_images: additionalImages.length > 0 ? additionalImages : undefined,
          created_at: editingProduct ? editingProduct.created_at : new Date().toISOString()
        };
        
        if (editingProduct) {
          setStoreProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p));
          toast.success('Product updated locally!');
        } else {
          setStoreProducts([productData, ...storeProducts]);
          toast.success('Product added locally!');
        }
        
        setFormData({
          name: '',
          description: '',
          price: '',
          category: categories[0]?.name || '',
          season: '',
          sizes: 'S, M, L, XL, XXL',
          colors: 'Standard',
          in_stock: true,
        });
        setImageFiles([]);
        setImagePreviews([]);
        setEditingProduct(null);
        setLoading(false);
        return;
      }

      // 1. Upload new images to Supabase Storage
      // We need to know which previews are new local blobs and which are old URLs
      const finalImageUrls: string[] = [];
      
      for (const preview of imagePreviews) {
        if (preview.startsWith('blob:')) {
          // This is a new file, find it in imageFiles
          // We need to match the blob URL back to the file.
          // Let's find the file that matches this blob URL.
          // Actually, it's easier if we just upload all imageFiles and replace the blobs in finalImageUrls.
          // But we need to maintain the order.
        } else {
          finalImageUrls.push(preview);
        }
      }

      // Let's simplify: upload all imageFiles and then replace blobs in imagePreviews with the new URLs.
      const uploadPromises = imageFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `jerseys/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
          
        return { file, publicUrl };
      });

      const uploadedResults = await Promise.all(uploadPromises);
      
      // Now replace blobs in imagePreviews with the new publicUrls
      let uploadedIdx = 0;
      const finalUrls = imagePreviews.map(preview => {
        if (preview.startsWith('blob:')) {
          return uploadedResults[uploadedIdx++].publicUrl;
        }
        return preview;
      });

      const mainImageUrl = finalUrls[0];
      const additionalImages = finalUrls.slice(1);

      // 2. Insert or Update product in database
      const productPayload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        season: formData.season,
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
        in_stock: formData.in_stock,
        image_url: mainImageUrl,
        additional_images: additionalImages.length > 0 ? additionalImages : null,
      };

      if (editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);
        if (updateError) throw updateError;
        toast.success('Product updated successfully!');
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productPayload]);
        if (insertError) throw insertError;
        toast.success('Product uploaded successfully!');
      }

      setFormData({
        name: '',
        description: '',
        price: '',
        category: categories[0]?.name || '',
        season: '',
        sizes: 'S, M, L, XL, XXL',
        colors: 'Standard',
        in_stock: true,
      });
      setImageFiles([]);
      setImagePreviews([]);
      setEditingProduct(null);
      
      if (editingProduct) {
        setActiveTab('manage_products');
        fetchProducts();
      }
      
    } catch (err: any) {
      console.error('Error saving product:', err);
      toast.error(err.message || 'An error occurred while saving the product');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
          <p className="text-gray-500 mb-8">Please enter your PIN to access the dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <input 
                  type={showPinInput ? "text" : "password"} 
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full px-4 py-3 text-center text-xl tracking-[0.5em] rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 pr-12"
                  maxLength={8}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPinInput(!showPinInput)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPinInput ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {pinError && <p className="text-red-500 text-sm font-medium">{pinError}</p>}
            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-bold transition-colors"
            >
              Unlock Dashboard
            </motion.button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-gray-500">Manage your store catalog and administrators.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Store
          </button>
          <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg w-full sm:w-fit gap-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('products')}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Add Products
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('manage_products')}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'manage_products' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Manage Products
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Categories
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'orders' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Orders
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('admins')}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'admins' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Admins
            </motion.button>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 uppercase">
                Customer Orders
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search customer or phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  {orderSearch && (
                    <button 
                      onClick={() => setOrderSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {orders.length > 0 && (
                  <button
                    onClick={handleClearOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-bold transition-colors border border-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Orders
                  </button>
                )}
                <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Sort:</label>
                  <select 
                    value={`${orderSort.key}-${orderSort.direction}`}
                    onChange={(e) => {
                      const [key, direction] = e.target.value.split('-');
                      setOrderSort({ key: key as any, direction: direction as any });
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="total-desc">Total (High-Low)</option>
                    <option value="total-asc">Total (Low-High)</option>
                    <option value="status-asc">Status (A-Z)</option>
                    <option value="status-desc">Status (Z-A)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Month:</label>
                  <select 
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="All">All Months</option>
                    {orderMonths.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Payment:</label>
                  <select 
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="All">All Methods</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Placed">Placed</option>
                    <option value="Processing">Processing</option>
                    <option value="Waybilled">Waybilled</option>
                    <option value="Received">Received</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No orders found.
              </div>
            ) : (
              <div className="space-y-6">
                {sortedOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
                    <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">{order.id}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                            order.status === 'Placed' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Waybilled' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-start">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                        >
                          <option value="Placed">Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Waybilled">Waybilled</option>
                          <option value="Received">Received</option>
                        </select>
                        <button
                          onClick={() => openWaybillModal(order)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                        >
                          Send Waybill
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Customer Details</h4>
                        <p className="text-sm text-gray-900"><span className="font-medium">Name:</span> {order.customer}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">Phone:</span> {order.phone}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">Destination:</span> {order.park}, {order.state}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Order Summary</h4>
                        <p className="text-sm text-gray-900"><span className="font-medium">Total Amount:</span> ₦{order.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">Items:</span> {order.items.length}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.quantity}x {item.product.name} (Size: {item.size})</span>
                            <span className="font-medium text-gray-900">₦{(item.product.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center uppercase border-b border-gray-100 pb-4">
              <LayoutGrid className="mr-2 h-5 w-5 text-blue-600" />
              Manage Categories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category Name</label>
                    <input 
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="e.g. Serie A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { name: 'Trophy', icon: Trophy },
                        { name: 'Medal', icon: Medal },
                        { name: 'Shield', icon: Shield },
                        { name: 'Star', icon: Star },
                        { name: 'Clock', icon: Clock },
                      ].map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setNewCategory({ ...newCategory, icon_name: item.name })}
                          className={`p-2 rounded-md border transition-all flex items-center justify-center ${newCategory.icon_name === item.name ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                          title={item.name}
                        >
                          <item.icon className="h-5 w-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category Image</label>
                    <div className="mt-1 flex justify-center px-4 py-4 border-2 border-gray-300 border-dashed rounded-md relative hover:border-blue-600 transition-colors bg-gray-50">
                      {categoryImagePreview ? (
                        <div className="relative w-full aspect-video">
                          <img src={categoryImagePreview} alt="Category preview" className="w-full h-full object-cover rounded-md" />
                          <button 
                            type="button"
                            onClick={() => {
                              setNewCategory({ ...newCategory, image: null });
                              setCategoryImagePreview(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-6 w-6 text-gray-400" />
                          <p className="text-[10px] text-gray-500 mt-1">Click to upload image</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setNewCategory({ ...newCategory, image: file });
                            setCategoryImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </div>
                  </div>
                  {categoryMsg.text && (
                    <p className={`text-xs font-medium ${categoryMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {categoryMsg.text}
                    </p>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isAddingCategory}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-bold text-sm transition-colors uppercase flex items-center justify-center disabled:opacity-70"
                  >
                    {isAddingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Category'}
                  </motion.button>
                </form>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Existing Categories</h3>
                {loadingCategories ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map((cat) => {
                      const IconComponent = {
                        Trophy, Medal, Shield, Star, Clock
                      }[cat.icon_name || 'Trophy'] || Trophy;

                      return (
                        <div key={cat.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50 group">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-md shadow-sm overflow-hidden flex items-center justify-center border border-gray-100">
                              {cat.image_url ? (
                                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                <IconComponent className="h-6 w-6 text-blue-600" />
                              )}
                            </div>
                            <span className="font-bold text-gray-900">{cat.name}</span>
                          </div>
                          <button 
                            onClick={() => {
                              confirmAction(
                                'Delete Category',
                                `Are you sure you want to delete category "${cat.name}"?`,
                                () => handleDeleteCategory(cat.id)
                              );
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manage_products' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center uppercase">
                <ImageIcon className="mr-2 h-5 w-5 text-blue-600" />
                Manage Products
              </h2>
              <div className="flex items-center gap-2">
                {selectedProductIds.length > 0 && (
                  <>
                    <button
                      onClick={() => {
                        confirmAction(
                          'Delete Selected Products',
                          `Are you sure you want to delete ${selectedProductIds.length} products?`,
                          handleBulkDelete
                        );
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700"
                    >
                      Delete Selected
                    </button>
                    <button
                      onClick={() => {
                        handleBulkUpdateStock();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-bold hover:bg-blue-700"
                    >
                      Toggle Stock
                    </button>
                  </>
                )}
                {storeProducts.length > 0 && (
                  <button
                    onClick={handleClearProducts}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-bold transition-colors border border-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
              <select 
                multiple
                className="p-2 border rounded-md text-sm"
                onChange={(e) => setProductFilters({...productFilters, categories: Array.from(e.target.selectedOptions as any as HTMLOptionElement[]).map(option => option.value)})}
              >
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
              <select 
                className="p-2 border rounded-md text-sm"
                onChange={(e) => setProductFilters({...productFilters, inStock: e.target.value === 'true' ? true : e.target.value === 'false' ? false : null})}
              >
                <option value="">All Stock</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>
            
            {loadingProducts ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : storeProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                    <div className="aspect-square bg-gray-100 relative">
                      <input 
                        type="checkbox"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIds([...selectedProductIds, product.id]);
                          } else {
                            setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                          }
                        }}
                        className="absolute top-2 left-2 z-10 w-5 h-5"
                      />
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="absolute top-2 right-12 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-colors"
                        title="Edit Product"
                      >
                        <Plus className="h-4 w-4 rotate-45" /> {/* Using Plus rotated as a pencil-like icon or just an edit icon */}
                      </button>
                      <button
                        onClick={() => {
                          confirmAction(
                            'Delete Product',
                            'Are you sure you want to delete this product?',
                            () => handleDeleteProduct(product.id, product.image_url)
                          );
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-colors"
                        title="Delete Product"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold">{product.season}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                      <p className="text-[10px] text-gray-400 line-clamp-2 mb-3 h-6">{product.description}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="font-black text-blue-600">₦{product.price.toLocaleString()}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center uppercase">
                {editingProduct ? <Plus className="mr-2 h-5 w-5 text-blue-600 rotate-45" /> : <Plus className="mr-2 h-5 w-5 text-blue-600" />}
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              {editingProduct && (
                <button 
                  onClick={() => {
                    setEditingProduct(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      category: categories[0]?.name || '',
                      season: '',
                      sizes: 'S, M, L, XL, XXL',
                      colors: 'Standard',
                      in_stock: true,
                    });
                    setImageFiles([]);
                    setImagePreviews([]);
                  }}
                  className="text-sm font-bold text-red-600 hover:text-red-700 uppercase flex items-center"
                >
                  <X className="h-4 w-4 mr-1" /> Cancel Edit
                </button>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h3 className="font-bold text-red-800">Upload failed</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                      Jersey Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                      placeholder="e.g. Arsenal Home Jersey 23/24"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-bold text-gray-900 mb-2">
                        Price (₦)
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-bold text-gray-900 mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all bg-white"
                      >
                        <option value="" disabled>Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="season" className="block text-sm font-bold text-gray-900 mb-2">
                        Season
                      </label>
                      <input
                        type="text"
                        id="season"
                        name="season"
                        value={formData.season}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                        placeholder="e.g. 23/24"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sizes" className="block text-sm font-bold text-gray-900 mb-2">
                        Available Sizes (comma separated)
                      </label>
                      <input
                        type="text"
                        id="sizes"
                        name="sizes"
                        value={formData.sizes}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                        placeholder="S, M, L, XL, XXL"
                      />
                    </div>
                    <div>
                      <label htmlFor="colors" className="block text-sm font-bold text-gray-900 mb-2">
                        Available Colours (comma separated)
                      </label>
                      <input
                        type="text"
                        id="colors"
                        name="colors"
                        value={formData.colors}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                        placeholder="Home, Away, Third"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="in_stock" className="block text-sm font-bold text-gray-900 mb-2">
                        Stock Status
                      </label>
                      <select
                        id="in_stock"
                        name="in_stock"
                        required
                        value={formData.in_stock ? 'true' : 'false'}
                        onChange={(e) => setFormData(prev => ({ ...prev, in_stock: e.target.value === 'true' }))}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all bg-white"
                      >
                        <option value="true">In Stock</option>
                        <option value="false">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all resize-none"
                      placeholder="Describe the jersey, fit, material..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Product Images (Front, Back, Details)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative overflow-hidden group hover:border-blue-600 transition-colors bg-gray-50 min-h-[200px]">
                    <div className="space-y-2 text-center flex flex-col items-center justify-center w-full">
                      <div className="bg-white p-4 rounded-full mb-2 shadow-sm">
                        <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-700 focus-within:outline-none">
                          <span>Upload files</span>
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WEBP up to 5MB (Select multiple)
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                    />
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group rounded-md overflow-hidden border border-gray-200 aspect-square">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-20"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] font-bold text-center py-0.5">
                              MAIN
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      {editingProduct ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      {editingProduct ? <CheckCircle2 className="-ml-1 mr-2 h-5 w-5" /> : <Upload className="-ml-1 mr-2 h-5 w-5" />}
                      {editingProduct ? 'Update Product' : 'Publish Product'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase border-b border-gray-100 pb-4 flex items-center">
                <ShieldAlert className="mr-2 h-5 w-5 text-blue-600" />
                Add New Admin
              </h2>
              {addAdminMsg.text && (
                <div className={`mb-4 p-3 rounded-md text-sm font-medium ${addAdminMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {addAdminMsg.text}
                </div>
              )}
              <form onSubmit={handleAddAdmin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                  <input 
                    type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="delimabethel@gmail.com"
                  />
                </div>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-md font-bold transition-colors uppercase text-sm"
                >
                  Grant Access
                </motion.button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase border-b border-gray-100 pb-4 flex items-center">
                <Lock className="mr-2 h-5 w-5 text-blue-600" />
                Change Access PIN
              </h2>
              {changePinMsg.text && (
                <div className={`mb-4 p-3 rounded-md text-sm font-medium ${changePinMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {changePinMsg.text}
                </div>
              )}
              <form onSubmit={handleChangePin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">New PIN</label>
                  <div className="relative">
                    <input 
                      type={showNewPin ? "text" : "password"} required value={newPin} onChange={(e) => setNewPin(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 tracking-[0.5em] pr-12"
                      maxLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New PIN</label>
                  <div className="relative">
                    <input 
                      type={showConfirmNewPin ? "text" : "password"} required value={confirmNewPin} onChange={(e) => setConfirmNewPin(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 tracking-[0.5em] pr-12"
                      maxLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPin(!showConfirmNewPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmNewPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-bold transition-colors uppercase text-sm"
                >
                  Update PIN
                </motion.button>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase border-b border-gray-100 pb-4 flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-600" />
                Current Administrators
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase">
                      <th className="py-3 font-medium">Email</th>
                      <th className="py-3 font-medium">Role</th>
                      <th className="py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adminList.map((admin) => (
                      <tr key={admin.id}>
                        <td className="py-4 font-medium text-gray-900">{admin.email}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${admin.role === 'master' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {admin.role}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          {admin.role !== 'master' && (
                            <button 
                              onClick={() => handleRemoveAdmin(admin.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waybill SMS Modal */}
      {waybillModalOpen && selectedOrderForWaybill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Send Waybill Details</h3>
              <button 
                onClick={() => setWaybillModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver's Name</label>
                <input 
                  type="text" 
                  required 
                  value={waybillData.driverName} 
                  onChange={(e) => setWaybillData({...waybillData, driverName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver's Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={waybillData.driverPhone} 
                  onChange={(e) => setWaybillData({...waybillData, driverPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waybill Price (₦)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={waybillData.price} 
                  onChange={(e) => setWaybillData({...waybillData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => handleSendWaybill('sms')}
                    disabled={!waybillData.driverName || !waybillData.driverPhone || !waybillData.price}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send SMS
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSendWaybill('whatsapp')}
                    disabled={!waybillData.driverName || !waybillData.driverPhone || !waybillData.price}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    WhatsApp
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => setWaybillModalOpen(false)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
            <p className="text-gray-600 mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
