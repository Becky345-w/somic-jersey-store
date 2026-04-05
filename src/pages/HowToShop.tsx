import React from 'react';
import { ShoppingBag, CreditCard, Truck, CheckCircle, Search, Shirt } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function HowToShop() {
  const steps = [
    {
      icon: Search,
      title: "1. Browse & Search",
      description: "Explore our wide collection of authentic football jerseys. Use the search bar or categories to find your favorite team's kit."
    },
    {
      icon: Shirt,
      title: "2. Select Your Size",
      description: "Found the perfect jersey? Select your preferred size and add it to your shopping cart."
    },
    {
      icon: ShoppingBag,
      title: "3. Review Your Cart",
      description: "Click on the cart icon to review your items. You can adjust quantities or remove items before proceeding to checkout."
    },
    {
      icon: CreditCard,
      title: "4. Secure Checkout",
      description: "Fill in your delivery details and proceed to payment. We accept secure bank transfers for all orders."
    },
    {
      icon: Truck,
      title: "5. Fast Waybill Delivery",
      description: "Once payment is confirmed, your order is dispatched via waybill. You'll receive the driver's contact to pick up your package at the park."
    },
    {
      icon: CheckCircle,
      title: "6. Enjoy Your Jersey!",
      description: "Pick up your package, pay the waybill fee to the driver, and rock your new authentic jersey!"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
          How to Shop
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Shopping at Somic's Jersey Store is quick, easy, and secure. Follow these simple steps to get your authentic jerseys delivered to you.
        </p>
      </div>

      <div className="relative">
        {/* Connecting line for desktop */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-100 -translate-x-1/2 z-0"></div>

        <div className="space-y-12 relative z-10">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            const Icon = step.icon;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? '' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 text-center ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                
                <div className="shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white relative z-10">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                
                <div className="flex-1 hidden md:block"></div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-20 text-center bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Browse our latest collection of authentic jerseys and find the perfect fit for you today.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          Start Shopping Now
        </Link>
      </div>
    </div>
  );
}
