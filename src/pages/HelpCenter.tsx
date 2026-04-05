import React from 'react';
import { HelpCircle, Mail, Phone, MessageCircle, FileText, Truck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function HelpCenter() {
  const faqs = [
    {
      question: "How long does delivery take?",
      answer: "Delivery typically takes 1-3 business days depending on your location. We use reliable waybill services to ensure your jerseys get to you as quickly as possible."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is dispatched, you will receive a tracking number and the driver's contact details via email/SMS. You can also track your order status on our 'Track Order' page."
    },
    {
      question: "Do you sell authentic jerseys?",
      answer: "Yes! We pride ourselves on selling 100% authentic, premium quality football jerseys."
    },
    {
      question: "What is your return policy?",
      answer: "Our return policy is no return policy. All sales are final."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4 flex items-center justify-center">
          <HelpCircle className="mr-3 h-8 w-8 text-blue-600" />
          Help Center
        </h1>
        <p className="text-lg text-gray-500">How can we help you today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">WhatsApp Support</h3>
          <p className="text-sm text-gray-500 mb-4">Fastest way to reach us</p>
          <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium text-sm hover:underline">Chat with us</a>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
          <p className="text-sm text-gray-500 mb-4">Mon-Sat, 9am - 6pm</p>
          <a href="tel:+2348000000000" className="text-blue-600 font-medium text-sm hover:underline">+234 800 000 0000</a>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
          <p className="text-sm text-gray-500 mb-4">Get a reply within 24hrs</p>
          <a href="mailto:support@somicsjerseys.com" className="text-blue-600 font-medium text-sm hover:underline">support@somicsjerseys.com</a>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12">
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FileText className="mr-2 h-6 w-6 text-blue-600" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center">
            <Truck className="mr-2 h-5 w-5 text-blue-600" />
            Shipping Information
          </h3>
          <p className="text-sm text-blue-800">
            We offer nationwide shipping via trusted waybill services. Waybill fees are paid by the customer upon delivery at the designated park.
          </p>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center">
            <RefreshCw className="mr-2 h-5 w-5 text-gray-600" />
            Returns & Exchanges
          </h3>
          <p className="text-sm text-gray-600">
            Our return policy is no return policy. Please ensure you select the correct size and item before completing your purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
