// src/components/AddProductModal.jsx

import React, { useState, useEffect } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2'; 
import { supabase } from '../supabaseClient'; // Make sure path is correct

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    currentStock: 0,
    minimumStock: 0,
    price: 0,
    supplier: '',
    storageLocation: '',
  });

  const [modalClass, setModalClass] = useState('opacity-0 scale-95');
  const [renderModal, setRenderModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRenderModal(true); 
      setTimeout(() => setModalClass('opacity-100 scale-100'), 10);
    } else {
      setModalClass('opacity-0 scale-95'); 
      setTimeout(() => setRenderModal(false), 300);
    }
  }, [isOpen]);

  if (!renderModal) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('inventory_items')
      .insert([
        {
          product_name: formData.productName,
          category: formData.category,
          stock: formData.currentStock,
          minimum_stock: formData.minimumStock,
          price: formData.price,
          supplier: formData.supplier,
          storage_location: formData.storageLocation,
        }
      ]);

    setLoading(false);

    if (error) {
      console.error('Error adding product:', error.message);
      alert(`Error: ${error.message}`);
    } else {
      alert('Product added successfully!');
      setFormData({
        productName: '',
        category: '',
        currentStock: 0,
        minimumStock: 0,
        price: 0,
        supplier: '',
        storageLocation: '',
      });
      onClose();
      if (onProductAdded) onProductAdded(); // Optional callback to refresh inventory
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 p-6 transition-all duration-300 ease-out ${modalClass}`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="border-b border-gray-100 flex justify-between items-center pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <HiOutlineXMark className="w-6 h-6" /> 
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="productName" className="text-sm font-medium text-gray-600 mb-1">Product Name</label>
              <input 
                type="text" 
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="e.g., Wireless Mouse" 
                className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="category" className="text-sm font-medium text-gray-600 mb-1">Category</label>
              <select 
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                required
              >
                <option value="" disabled>Select category</option>
                <option value="electronics">Electronics</option>
                <option value="peripherals">Peripherals</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
          </div>

          {/* Stock and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="currentStock" className="text-sm font-medium text-gray-600 mb-1">Current Stock</label>
              <input 
                type="number" 
                id="currentStock"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                min="0"
                className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="minimumStock" className="text-sm font-medium text-gray-600 mb-1">Minimum Stock</label>
              <input 
                type="number" 
                id="minimumStock"
                name="minimumStock"
                value={formData.minimumStock}
                onChange={handleChange}
                min="0"
                className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                required
              />
            </div>
          </div>

          {/* Price and Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="price" className="text-sm font-medium text-gray-600 mb-1">Price</label>
              <input 
                type="number" 
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="supplier" className="text-sm font-medium text-gray-600 mb-1">Supplier</label>
              <input 
                type="text" 
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="e.g., ABC Tech" 
                className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
                required
              />
            </div>
          </div>

          {/* Storage Location */}
          <div className="flex flex-col">
            <label htmlFor="storageLocation" className="text-sm font-medium text-gray-600 mb-1">Storage Location</label>
            <input 
              type="text" 
              id="storageLocation"
              name="storageLocation"
              value={formData.storageLocation}
              onChange={handleChange}
              placeholder="e.g., Warehouse A, Shelf 12" 
              className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" 
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-150 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
