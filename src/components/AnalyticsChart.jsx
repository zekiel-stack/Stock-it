// src/components/AnalyticsChart.jsx

import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSpring, animated } from '@react-spring/web';
import { supabase } from '../supabaseClient';

const useOnScreen = (options) => {
  const ref = useRef();
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [options]);

  return [ref, isIntersecting];
};

const CATEGORY_COLORS = ['#3f51b5', '#ff9800', '#4caf50', '#e91e63', '#9c27b0', '#00bcd4'];
const STATUS_COLORS = ['#4caf50', '#ffc107', '#f44336'];

const AnalyticsChart = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [valuableItemsData, setValuableItemsData] = useState([]);

  const [barChartRef, isBarChartVisible] = useOnScreen({ threshold: 0.1 });

  const barChartSpring = useSpring({
    opacity: isBarChartVisible ? 1 : 0,
    transform: isBarChartVisible ? 'translateY(0px)' : 'translateY(50px)',
    config: { tension: 180, friction: 12 },
  });

  // Fetch and process inventory data
  const fetchInventoryData = async () => {
    const { data: items, error } = await supabase.from('inventory_items').select('*');
    if (error) return console.error('Error fetching inventory:', error);

    // Category distribution
    const categoryCounts = {};
    items.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });
    setCategoryData(Object.entries(categoryCounts).map(([name, value]) => ({ name, value })));

    // Stock status
    const statusCounts = { 'In Stock': 0, 'Low Stock': 0, 'Out of Stock': 0 };
    items.forEach(item => {
      if (item.quantity === 0) statusCounts['Out of Stock']++;
      else if (item.quantity <= item.low_stock_threshold) statusCounts['Low Stock']++;
      else statusCounts['In Stock']++;
    });
    setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

    // Top 5 most valuable items
    const sortedByValue = items
      .map(item => ({ name: item.name, value: (item.quantity || 0) * (item.unit_price || 0) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    setValuableItemsData(sortedByValue);
  };

  useEffect(() => {
    fetchInventoryData();

    const subscription = supabase
      .channel('public:inventory_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        () => fetchInventoryData()
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Products by Category</h4>
          <p className="text-sm text-gray-500 mb-4">Distribution of all inventory items</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-category-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Stock Status Distribution</h4>
          <p className="text-sm text-gray-500 mb-4">Current inventory health</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={5}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-status-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      <animated.div
        ref={barChartRef}
        style={barChartSpring}
        className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
      >
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Most Valuable Items</h4>
        <p className="text-sm text-gray-500 mb-4">Based on total inventory value (price × stock)</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={valuableItemsData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Total Value']} />
            <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </animated.div>

    </div>
  );
};

export default AnalyticsChart;
