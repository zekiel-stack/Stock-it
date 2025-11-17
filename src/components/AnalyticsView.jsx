import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// Removed : AnalyticsViewProps from function arguments
export function AnalyticsView({ inventory }) {
  // Category distribution
  const categoryData = inventory.reduce((acc, item) => {
    // Removed the type assertion (d: any)
    const existing = acc.find((d) => d.name === item.category);
    if (existing) {
      existing.value += 1;
      existing.totalValue += item.price * item.stock;
    } else {
      acc.push({
        name: item.category,
        value: 1,
        totalValue: item.price * item.stock,
      });
    }
    // Removed the 'as any[]' type assertion
    return acc;
  }, []);

  // Stock level distribution
  const stockData = [
    { name: 'Out of Stock', value: inventory.filter(i => i.stock === 0).length },
    { name: 'Low Stock', value: inventory.filter(i => i.stock > 0 && i.stock <= i.minStock).length },
    { name: 'In Stock', value: inventory.filter(i => i.stock > i.minStock).length },
  ];

  // Top 5 most valuable items
  const topItems = [...inventory]
      .map(item => ({
        name: item.name,
        value: item.price * item.stock,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

  // Mock monthly trend data
  const trendData = [
    { month: 'Jan', items: 45, value: 12500 },
    { month: 'Feb', items: 52, value: 15200 },
    { month: 'Mar', items: 48, value: 14100 },
    { month: 'Apr', items: 61, value: 18300 },
    { month: 'May', items: 55, value: 16800 },
    { month: 'Jun', items: inventory.length, value: inventory.reduce((sum, i) => sum + i.price * i.stock, 0) },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
              <CardDescription>Distribution of inventory items</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stock Status */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Status Distribution</CardTitle>
              <CardDescription>Current inventory health</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                      data={stockData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Items by Value */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Most Valuable Items</CardTitle>
            <CardDescription>Based on total inventory value (price × stock)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Total Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Trends</CardTitle>
            <CardDescription>6-month overview of inventory growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="items" stroke="#8884d8" name="Total Items" />
                <Line yAxisId="right" type="monotone" dataKey="value" stroke="#82ca9d" name="Total Value ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Value Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Value Analysis</CardTitle>
            <CardDescription>Total inventory value by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="totalValue" fill="#0088FE" name="Total Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
  );
}