// src/pages/WorkerDashboard.jsx

import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

export default function WorkerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Loading...");
  const navigate = useNavigate();

  // Fetch logged-in user's name
  const fetchUserName = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth Error:", authError.message);
      setUserName("User");
      return;
    }

    if (!user || !user.email) {
      console.warn("No authenticated user or email found.");
      setUserName("User");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("name")
      .eq("email", user.email)
      .single();

    if (error) {
      console.error("Error fetching name:", error.message);
      setUserName("User");
    } else {
      setUserName(data?.name || "User");
    }
  };

  // Fetch inventory items
  const fetchProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("inventory_items")
      .select("*");

    if (error) {
      console.error("Error fetching products:", error.message);
      setProducts([]);
    } else {
      const mapped = data.map(item => ({
        id: item.id,
        name: item.product_name,
        category: item.category,
        stock: item.stock ?? 0,
        min: item.minimum_stock ?? 0,
        price: item.price ?? 0
      }));
      setProducts(mapped);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserName();
    fetchProducts();
  }, []);

  const getStatus = (stock, min) => {
    if (stock <= 0) return { label: "Out of Stock", color: "bg-[#D4183D] text-white" };
    if (stock < min) return { label: "Low Stock", color: "bg-[#FBBF24] text-black" };
    return { label: "In Stock", color: "bg-black text-white" };
  };

  const updateStock = async (id, change) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + change) } : p
      )
    );

    const item = products.find(p => p.id === id);
    const newStock = Math.max(0, (item?.stock || 0) + change);

    const { error } = await supabase
      .from("inventory_items")
      .update({ stock: newStock })
      .eq("id", id);

    if (error) console.error("Stock update failed:", error.message);
  };

  const priorityAlerts = products.filter(p => p.stock < p.min);

  // Log out handler
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error.message);
    } else {
      navigate("/signin"); // redirect to Signin page
    }
  };

  return (
    <div className="bg-[#F8FAFC] text-[#111827] font-['Inter',sans-serif] min-h-screen">
      {/* HEADER */}
      <header className="flex items-center justify-between bg-white border-b border-[#E5E5E5] px-4 py-3 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[#4f46e5]">Worker Dashboard</h1>
          <p className="text-sm text-[#717182]">Welcome, {userName}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-3 py-2 border rounded-md bg-white"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4"/>
          LogOut
        </button>
      </header>

      {/* MAIN */}
      <main>
        <section className="px-4">
          <div className="max-w-[1250px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">

            {/* Total Products */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex justify-between mb-4">
                <h3 className="text-base font-semibold">Total Products</h3>
                <ArchiveBoxIcon className="w-6 h-6 text-[#4f46e5]" />
              </div>
              <p className="text-2xl font-medium">{products.length}</p>
              <p className="text-sm text-[#6b7280]">Items in inventory</p>
            </div>

            {/* Low Stock */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex justify-between mb-4">
                <h3 className="text-base font-semibold">Low Stock Items</h3>
                <ExclamationTriangleIcon className="w-6 h-6 text-[#ca8a04]" />
              </div>
              <p className="text-2xl font-medium text-[#ca8a04]">
                {products.filter(p => p.stock > 0 && p.stock < p.min).length}
              </p>
              <p className="text-sm text-[#6b7280]">Items need attention</p>
            </div>

            {/* Tasks Completed */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex justify-between mb-4">
                <h3 className="text-base font-semibold">Tasks Completed</h3>
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-[#10B981]" />
              </div>
              <p className="text-2xl font-medium">12</p>
              <p className="text-sm text-[#6b7280]">This week</p>
            </div>

          </div>

          {/* Priority Alerts */}
          <div className="bg-white p-6 rounded-xl border shadow-sm mt-6">
            <h3 className="text-base font-semibold">Priority Alerts</h3>
            <p className="text-sm text-[#6b7280]">Items requiring immediate attention</p>

            <div className="mt-4 flex flex-col gap-3">
              {priorityAlerts.length > 0 ? (
                priorityAlerts.map(item => {
                  const status = getStatus(item.stock, item.min);
                  return (
                    <div key={item.id} className="flex justify-between items-center border-b py-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-[#6b7280]">
                          Current Stock: {item.stock} (min: {item.min})
                        </p>
                      </div>

                      <span className={`px-2 py-[2px] rounded-full text-xs ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="italic text-sm text-[#6b7280]">No alerts at this time.</p>
              )}
            </div>
          </div>
        </section>

        {/* Inventory Table */}
        <section className="max-w-[1250px] mx-auto px-4 py-8 mt-6 border rounded-xl bg-white shadow-sm">
          <h2 className="text-base font-semibold">Inventory</h2>
          <p className="text-sm text-[#6b7280] mb-6">View and update product stock levels</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f9fafb] border-b text-left">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Min</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                ) : (
                  products.map(item => {
                    const status = getStatus(item.stock, item.min);
                    return (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-3">{item.id}</td>
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <button onClick={() => updateStock(item.id, -1)} className="w-8 h-8 border rounded-md">−</button>
                          <span className="min-w-[32px] text-center">{item.stock}</span>
                          <button onClick={() => updateStock(item.id, 1)} className="w-8 h-8 border rounded-md">+</button>
                        </td>
                        <td className="px-4 py-3">{item.min}</td>
                        <td className="px-4 py-3">₦{item.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-[2px] text-xs rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
