// src/components/InventoryTable.jsx

import React, { useEffect, useState } from 'react';
import { 
  HiOutlineMagnifyingGlass,
  HiOutlineAdjustmentsVertical,
  HiOutlineTrash,
  HiOutlinePlus 
} from 'react-icons/hi2';
import { supabase } from '../supabaseClient';

// Status badge generator
const getStatusBadge = (status) => {
  switch (status) {
    case 'In Stock':
      return <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">In Stock</span>;
    case 'Low Stock':
      return <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">Low Stock</span>;
    case 'Out of Stock':
      return <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Out of Stock</span>;
    default:
      return null;
  }
};

const InventoryTable = ({ onAddProductClick }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');

    if (error) {
      console.error('Error fetching inventory:', error.message);
      setProducts([]);
      setLoading(false);
      return;
    }

    // Map Supabase data to local state
    const mapped = data.map(item => ({
      id: item.id || 'N/A',
      name: item.product_name || 'Unnamed Product',
      category: item.category || 'Uncategorized',
      stock: item.stock ?? 0,
      minStock: item.minimum_stock ?? 0, // Corrected
      price: item.price ?? 0,
      status: (item.stock === 0) 
        ? 'Out of Stock' 
        : (item.stock <= (item.minimum_stock ?? 0) ? 'Low Stock' : 'In Stock')
    }));

    setProducts(mapped);
    setLoading(false);
  };

  // Fetch recent activity (latest inventory changes)
  const fetchRecentActivity = async () => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, product_name, stock, minimum_stock, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent activity:', error.message);
      setRecentActivity([]);
      return;
    }

    const mappedActivity = data.map(item => ({
      id: item.id,
      name: item.product_name,
      stock: item.stock,
      minStock: item.minimum_stock,
      updatedAt: new Date(item.updated_at).toLocaleString(),
      status: item.stock === 0
        ? 'Out of Stock'
        : (item.stock <= (item.minimum_stock ?? 0) ? 'Low Stock' : 'In Stock')
    }));

    setRecentActivity(mappedActivity);
  };

  // Delete a product
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error.message);
    } else {
      setProducts(prev => prev.filter(product => product.id !== id));
      setRecentActivity(prev => prev.filter(act => act.id !== id));
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchRecentActivity();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Inventory Management</h3>
          <p className="text-sm text-gray-500">Manage all products in your inventory</p>
        </div>
        <button 
          onClick={onAddProductClick} 
          className="flex items-center p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-150"
        >
          <HiOutlinePlus className="mr-2 text-xl" />
          Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-grow">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button className="flex items-center p-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition duration-150">
          <HiOutlineAdjustmentsVertical className="w-5 h-5 mr-2" />
          Filter
        </button>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">Loading products...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No products found</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.minStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₦{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(product.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        title="Delete" 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No recent activity</p>
          ) : (
            recentActivity.map(item => (
              <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-700">
                    {item.status === 'Out of Stock' ? `Low stock alert: ${item.name}` : `Stock updated: ${item.name} (${item.stock} units)`}
                  </p>
                  <p className="text-xs text-gray-500">{item.updatedAt}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  item.status === 'Out of Stock' ? 'text-red-600 bg-red-100' :
                  item.status === 'Low Stock' ? 'text-yellow-700 bg-yellow-100' :
                  'text-green-600 bg-green-100'
                }`}>
                  {item.status === 'Out of Stock' ? 'Alert' : item.status === 'Low Stock' ? 'Low' : 'Update'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
