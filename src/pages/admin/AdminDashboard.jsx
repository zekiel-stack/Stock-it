import React, { useState, useEffect } from "react";
import {
  HiOutlinePlus,
  HiOutlineCloudArrowDown,
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineExclamationTriangle,
  HiOutlineBanknotes,
  HiOutlineShoppingCart,
} from "react-icons/hi2";
import AddProductModal from "../../components/AddProductModal";
import InventoryTable from "../../components/InventoryTable";
import AnalyticsChart from "../../components/AnalyticsChart";
import UserManagement from "../../components/UserManagement";
import AdminProfileModal from "../../components/AdminProfileModal";
import { supabase } from "../../supabaseClient";

// Metric Card
const MetricCard = ({ title, value, description, color, Icon, iconColor }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 relative">
    {Icon && (
      <div
        className={`absolute top-4 right-4 text-xl ${iconColor || "text-gray-400"}`}
      >
        <Icon className="w-5 h-5" />
      </div>
    )}
    <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
    <p className={`text-3xl font-bold mt-1 ${color || "text-gray-900"}`}>
      {value}
    </p>
    <div className="text-xs mt-2 text-gray-600">{description}</div>
  </div>
);

// Quick Actions with CSV Export
const QuickActions = ({ onAddClick }) => {
  const exportCSV = async () => {
    try {
      const { data, error } = await supabase.from("inventory_items").select("*");
      if (error) throw error;
      if (!data || data.length === 0) {
        alert("No data to export!");
        return;
      }

      // Convert to CSV
      const csvRows = [];
      const headers = Object.keys(data[0]);
      csvRows.push(headers.join(","));

      data.forEach((row) => {
        const values = headers.map((header) => {
          const val = row[header];
          if (val === null || val === undefined) return "";
          return `"${val.toString().replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(","));
      });

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory_items_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export CSV error:", err);
      alert("Failed to export CSV. Check console for details.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <p className="text-sm text-gray-500 mb-6">Common administrative tasks</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          className="flex items-center justify-center p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-150"
          onClick={onAddClick}
        >
          <HiOutlinePlus className="mr-2 text-xl" />
          Add New Product
        </button>

        <button
          onClick={exportCSV}
          className="flex items-center justify-center p-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition duration-150"
        >
          <HiOutlineCloudArrowDown className="mr-2 text-xl" />
          Export Report
        </button>

        <button className="flex items-center justify-center p-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition duration-150">
          <HiOutlineChartBar className="mr-2 text-xl" />
          View Analytics
        </button>
      </div>
    </div>
  );
};

// Recent Activity
const RecentActivity = ({ activities }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
    {activities.length === 0 ? (
      <p className="text-sm text-gray-500">No recent activity.</p>
    ) : (
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-b-0"
          >
            <div>
              <p className="font-medium text-gray-700">{activity.description}</p>
              <p className="text-xs text-gray-500">
                {new Date(activity.time).toLocaleString()}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                activity.type === "New"
                  ? "text-green-600 bg-green-100"
                  : activity.type === "Update"
                  ? "text-indigo-600 bg-indigo-100"
                  : "text-red-600 bg-red-100"
              }`}
            >
              {activity.type}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState("overview");
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalValue: 0,
    outOfStock: 0,
  });
  const [activities, setActivities] = useState([]);
  const [userName, setUserName] = useState("Loading...");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fetch signed-in user
  const fetchUserName = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      setUserName("Admin");
      return;
    }
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("name")
      .eq("email", user.email)
      .single();
    if (profileError || !profile) {
      setUserName("Admin");
    } else {
      setUserName(profile.name || "Admin");
    }
  };

  // Fetch metrics and activity from Supabase
  const fetchMetricsAndActivity = async () => {
    const { data, error } = await supabase.from("inventory_items").select("*");
    if (error) {
      console.error("Error fetching metrics:", error.message);
      return;
    }

    const totalProducts = data.length;
    const lowStock = data.filter(
      (item) => item.stock < (item.min_stock ?? 0) && item.stock > 0
    ).length;
    const outOfStock = data.filter((item) => item.stock === 0).length;
    const totalValue = data.reduce(
      (acc, item) => acc + (item.price ?? 0) * (item.stock ?? 0),
      0
    );

    setMetrics({ totalProducts, lowStock, outOfStock, totalValue });

    const sorted = data
      .sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
      )
      .slice(0, 10)
      .map((item) => {
        let type = "Update";
        if (item.stock === 0) type = "Alert";
        else if (item.created_at === item.updated_at) type = "New";
        return {
          id: item.id,
          description: `${item.product_name} (${item.stock} units)`,
          time: item.updated_at || item.created_at,
          type,
        };
      });
    setActivities(sorted);
  };

  useEffect(() => {
    fetchUserName();
    fetchMetricsAndActivity();
  }, []);

  const TabButton = ({ view, label }) => (
    <button
      className={`py-2 px-4 text-sm font-medium transition duration-150 ${
        currentView === view
          ? "text-indigo-600 border-b-2 border-indigo-600"
          : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
      }`}
      onClick={() => setCurrentView(view)}
    >
      {label}
    </button>
  );

  const renderContent = () => {
    switch (currentView) {
      case "inventory":
        return <InventoryTable onAddProductClick={openModal} />;
      case "analytics":
        return <AnalyticsChart />;
      case "users":
        return <UserManagement />;
      default:
        return (
          <div className="space-y-6">
            <QuickActions onAddClick={openModal} />
            <RecentActivity activities={activities} />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard: {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
              </h1>
              <p className="text-sm text-gray-500">Welcome Back, {userName}.</p>
            </div>

            {/* Profile Dropdown */}
            <AdminProfileModal />
          </header>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Products"
              value={metrics.totalProducts}
              description={`${metrics.lowStock} in low or critical inventory`}
              Icon={HiOutlineCube}
              iconColor="text-indigo-500"
            />
            <MetricCard
              title="Low Stock Items"
              value={metrics.lowStock}
              description="Time to reorder"
              color="text-yellow-600"
              Icon={HiOutlineExclamationTriangle}
              iconColor="text-red-500"
            />
            <MetricCard
              title="Total Value"
              value={`₦${metrics.totalValue.toFixed(2)}`}
              description="Inventory worth"
              Icon={HiOutlineBanknotes}
              iconColor="text-green-500"
            />
            <MetricCard
              title="Out of Stock"
              value={metrics.outOfStock}
              description="Must restock soon"
              color="text-red-600"
              Icon={HiOutlineShoppingCart}
              iconColor="text-red-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <TabButton view="overview" label="Overview" />
            <TabButton view="inventory" label="Inventory" />
            <TabButton view="analytics" label="Analytics" />
            <TabButton view="users" label="Users" />
          </div>

          {renderContent()}
        </div>
      </main>

      <AddProductModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default AdminDashboard;
