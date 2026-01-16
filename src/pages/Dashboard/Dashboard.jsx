import React from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import usersImg from "../../assets/customers.png";
import subscriptionImg from "../../assets/activesubscription.png";
import dealersImg from "../../assets/dealers.png";
import deviceImg from "../../assets/devices.png";
import { useTheme } from "../../context/ThemeContext";
import ThemeCustomizer from "../../components/ThemeCustomizer";

const Card = ({ children, className = "", isDark }) => (
  <div
    className={`${
      isDark ? "bg-card" : "bg-white"
    } rounded-xl shadow-sm p-6 ${className}`}
  >
    {children}
  </div>
);

// Metric Card Component
const MetricCard = ({ icon, label, value, iconBgColor, iconColor, isDark }) => (
  <Card isDark={isDark}>
    <div className="flex items-center gap-4">
      <div
        className={`${iconBgColor} w-12 h-12 rounded-full flex items-center justify-center`}
      >
        {typeof icon === "string" ? (
          <img src={icon} alt={label} className="w-6 h-6 object-contain" />
        ) : (
          React.createElement(icon, { className: `w-6 h-6 ${iconColor}` })
        )}
      </div>

      <div>
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {label}
        </p>
        <p
          className={`text-2xl font-bold ${
            isDark ? "text-foreground" : "text-gray-900"
          }`}
        >
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  </Card>
);

// Alert Item Component
const AlertItem = ({
  icon: Icon,
  title,
  time,
  severity,
  iconBg,
  iconColor,
  isDark,
}) => (
  <div className="flex items-start gap-3 py-3">
    <div className={`${iconBg} p-2 rounded-lg`}>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div className="flex-1">
      <p
        className={`text-sm font-medium ${
          isDark ? "text-foreground" : "text-gray-900"
        }`}
      >
        {title}
      </p>
      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        {time} · {severity}
      </p>
    </div>
  </div>
);

// Server Status Item Component
const ServerStatusItem = ({ name, status, isDark }) => (
  <div className="flex items-center justify-between py-3">
    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
      {name}
    </span>
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        status === "Operational"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status}
    </span>
  </div>
);

const Dashboard = () => {
  const { isDark } = useTheme();

  // Revenue data
  const revenueData = [
    { month: "Jan", value: 12000 },
    { month: "Feb", value: 15000 },
    { month: "Mar", value: 13000 },
    { month: "Apr", value: 18000 },
    { month: "May", value: 21000 },
    { month: "Jun", value: 24000 },
    { month: "Jul", value: 23000 },
  ];

  // Device status data
  const deviceStatusData = [
    { name: "Installed", value: 15000, color: "#6366f1" },
    { name: "Available", value: 7000, color: "#10b981" },
    { name: "Faulty", value: 2000, color: "#f59e0b" },
    { name: "Returned", value: 1480, color: "#ef4444" },
  ];

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <div className="mx-auto space-y-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              icon={usersImg}
              label="Total Customers"
              value={1250}
              iconBgColor="bg-indigo-50"
              iconColor="text-indigo-600"
              isDark={isDark}
            />
            <MetricCard
              icon={dealersImg}
              label="Dealers/Distributors"
              value={85}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
              isDark={isDark}
            />
            <MetricCard
              icon={deviceImg}
              label="Total Devices"
              value={25480}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
              isDark={isDark}
            />
            <MetricCard
              icon={subscriptionImg}
              label="Active Subscriptions"
              value={22150}
              iconBgColor="bg-yellow-50"
              iconColor="text-yellow-600"
              isDark={isDark}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Summary */}
            <Card isDark={isDark}>
              <h3
                className={`text-lg font-semibold ${
                  isDark ? "text-foreground" : "text-gray-900"
                } mb-4`}
              >
                Revenue Summary
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#f0f0f0"}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: isDark ? "#9ca3af" : "#6b7280",
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: isDark ? "#9ca3af" : "#6b7280",
                      fontSize: 12,
                    }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "white",
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                      color: isDark ? "#f9fafb" : "#111827",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Device Status */}
            <Card isDark={isDark}>
              <h3
                className={`text-lg font-semibold ${
                  isDark ? "text-foreground" : "text-gray-900"
                } mb-4`}
              >
                Device Status
              </h3>
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={deviceStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {deviceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  {deviceStatusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Alerts */}
            <Card isDark={isDark}>
              <h3
                className={`text-lg font-semibold ${
                  isDark ? "text-foreground" : "text-gray-900"
                } mb-2`}
              >
                Recent Alerts
              </h3>
              <div
                className={`divide-y ${
                  isDark ? "divide-gray-700" : "divide-gray-100"
                }`}
              >
                <AlertItem
                  icon={AlertTriangle}
                  title="High CPU Usage on Server-01"
                  time="2 mins ago"
                  severity="Critical"
                  iconBg="bg-red-50"
                  iconColor="text-red-600"
                  isDark={isDark}
                />
                <AlertItem
                  icon={AlertCircle}
                  title="Database connection limit nearing"
                  time="15 mins ago"
                  severity="Warning"
                  iconBg="bg-yellow-50"
                  iconColor="text-yellow-600"
                  isDark={isDark}
                />
                <AlertItem
                  icon={Info}
                  title="15 devices reported offline"
                  time="30 mins ago"
                  severity="Informational"
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                  isDark={isDark}
                />
              </div>
            </Card>

            {/* Server Health */}
            <Card isDark={isDark}>
              <h3
                className={`text-lg font-semibold ${
                  isDark ? "text-foreground" : "text-gray-900"
                } mb-2`}
              >
                Server Health
              </h3>
              <div
                className={`divide-y ${
                  isDark ? "divide-gray-700" : "divide-gray-100"
                }`}
              >
                <ServerStatusItem
                  name="API Server"
                  status="Operational"
                  isDark={isDark}
                />
                <ServerStatusItem
                  name="Database Cluster"
                  status="Operational"
                  isDark={isDark}
                />
                <ServerStatusItem
                  name="Telemetry Ingestion"
                  status="Operational"
                  isDark={isDark}
                />
                <ServerStatusItem
                  name="Forwarding Service"
                  status="Outage"
                  isDark={isDark}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
      <ThemeCustomizer />
    </div>
  );
};

export default Dashboard;
