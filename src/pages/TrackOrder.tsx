import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setOrderId(idFromUrl);
      // Trigger tracking automatically if ID is provided
      performTracking(idFromUrl);
    }
  }, [searchParams]);

  const performTracking = (id: string) => {
    setSearched(true);
    setError('');
    setOrder(null);

    if (!id.trim()) {
      setError('Please enter a valid Order ID');
      return;
    }

    const savedOrders = JSON.parse(localStorage.getItem('somic_orders') || '[]');
    // Also check mock orders for demo purposes
    const mockOrders = [
      { id: 'ORD-7721', date: '2024-03-15', total: 15500, status: 'Received', customer: 'John Doe', phone: '+234 800 000 0000', state: 'Lagos', park: 'Oshodi Park' },
      { id: 'ORD-8192', date: '2024-03-28', total: 22000, status: 'Waybilled', customer: 'John Doe', phone: '+234 800 000 0000', state: 'Abuja', park: 'Jabi Park' }
    ];
    
    const allOrders = [...savedOrders, ...mockOrders];
    const foundOrder = allOrders.find((o: any) => o.id.toUpperCase() === id.toUpperCase().trim());

    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      setError('Order not found. Please check your Order ID and try again.');
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    performTracking(orderId);
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Placed': return 1;
      case 'Processing': return 2;
      case 'Waybilled': return 3;
      case 'Received': return 4;
      default: return 0;
    }
  };

  const handleMarkAsReceived = () => {
    if (!order) return;
    
    const savedOrders = JSON.parse(localStorage.getItem('somic_orders') || '[]');
    const updatedOrders = savedOrders.map((o: any) => 
      o.id === order.id ? { ...o, status: 'Received' } : o
    );
    
    localStorage.setItem('somic_orders', JSON.stringify(updatedOrders));
    setOrder({ ...order, status: 'Received' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4 uppercase">Track Your Order</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter your Order ID below to see the current status of your delivery.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. ORD-123456"
            className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 uppercase"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-bold transition-colors flex items-center justify-center whitespace-nowrap"
          >
            <Search className="h-5 w-5 mr-2" />
            Track Order
          </button>
        </form>
      </div>

      {searched && error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md text-center max-w-2xl mx-auto border border-red-100">
          {error}
        </div>
      )}

      {order && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-100 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order {order.id}</h2>
              <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${
              order.status === 'Placed' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
              order.status === 'Waybilled' ? 'bg-purple-100 text-purple-800' :
              'bg-green-100 text-green-800'
            }`}>
              {order.status}
            </span>
          </div>

          {/* Tracking Timeline */}
          <div className="relative mb-12">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 hidden sm:block"></div>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 hidden sm:block transition-all duration-500"
              style={{ width: `${(getStatusStep(order.status) - 1) * 33.33}%` }}
            ></div>
            
            <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative z-10">
              {/* Step 1 */}
              <div className="flex sm:flex-col items-center gap-4 sm:gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getStatusStep(order.status) >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                  <Clock className="h-5 w-5" />
                </div>
                <div className="sm:text-center">
                  <p className={`font-bold text-sm ${getStatusStep(order.status) >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Placed</p>
                  <p className="text-xs text-gray-500 sm:hidden">Order received and awaiting payment confirmation.</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex sm:flex-col items-center gap-4 sm:gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getStatusStep(order.status) >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                  <Package className="h-5 w-5" />
                </div>
                <div className="sm:text-center">
                  <p className={`font-bold text-sm ${getStatusStep(order.status) >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Processing</p>
                  <p className="text-xs text-gray-500 sm:hidden">Payment confirmed, preparing your items.</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex sm:flex-col items-center gap-4 sm:gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getStatusStep(order.status) >= 3 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                  <Truck className="h-5 w-5" />
                </div>
                <div className="sm:text-center">
                  <p className={`font-bold text-sm ${getStatusStep(order.status) >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Waybilled</p>
                  <p className="text-xs text-gray-500 sm:hidden">Order sent to park. You will receive driver details via SMS.</p>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="flex sm:flex-col items-center gap-4 sm:gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getStatusStep(order.status) >= 4 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="sm:text-center">
                  <p className={`font-bold text-sm ${getStatusStep(order.status) >= 4 ? 'text-gray-900' : 'text-gray-400'}`}>Received</p>
                  <p className="text-xs text-gray-500 sm:hidden">Order successfully received by you.</p>
                </div>
              </div>
            </div>
          </div>

          {order.status === 'Waybilled' && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-lg text-center">
              <p className="text-blue-800 font-medium mb-4">Have you picked up your order from the park?</p>
              <button
                onClick={handleMarkAsReceived}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-md font-bold transition-colors shadow-sm"
              >
                Yes, I have Received it
              </button>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm">Delivery Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Customer Name</p>
                <p className="font-medium text-gray-900">{order.customer}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900">{order.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Destination State</p>
                <p className="font-medium text-gray-900">{order.state}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Designated Park</p>
                <p className="font-medium text-gray-900">{order.park}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
