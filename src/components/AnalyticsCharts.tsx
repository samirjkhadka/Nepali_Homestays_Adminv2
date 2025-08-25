import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { apiFetch } from "../services/api";
import { useAdminAuth } from "../context/AdminAuthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

const AnalyticsCharts: React.FC = () => {
  const { token } = useAdminAuth();
  const [trend, setTrend] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [trendRes, revenueRes] = await Promise.all([
          apiFetch<{ trends: any[] }>(
            "/admin/analytics/bookings-trend",
            {},
            token || undefined
          ),
          apiFetch<{ revenue: any[] }>(
            "/admin/analytics/revenue-by-province",
            {},
            token || undefined
          ),
        ]);
        setTrend(trendRes.trends);
        setRevenue(revenueRes.revenue);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  // Prepare chart data
  const bookingsTrendData = {
    labels: (trend || []).map((t: any) => t.date),
    datasets: [
      {
        label: "Bookings",
        data: (trend || []).map((t: any) => t.count),
        backgroundColor: "rgba(30, 64, 175, 0.7)",
        borderColor: "rgba(30, 64, 175, 1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const revenueByStateData = {
    labels: (revenue || []).map((r: any) => r.state),
    datasets: [
      {
        label: "Revenue (NPR)",
        data: (revenue || []).map((r: any) => r.revenue),
        backgroundColor: [
          "rgba(30, 64, 175, 0.7)",
          "rgba(5, 150, 105, 0.7)",
          "rgba(220, 38, 38, 0.7)",
          "rgba(234, 88, 12, 0.7)",
          "rgba(250, 204, 21, 0.7)",
          "rgba(16, 185, 129, 0.7)",
        ],
        borderColor: [
          "rgba(30, 64, 175, 1)",
          "rgba(5, 150, 105, 1)",
          "rgba(220, 38, 38, 1)",
          "rgba(234, 88, 12, 1)",
          "rgba(250, 204, 21, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading)
    return <div className="text-center py-8">Loading analytics...</div>;
  if (error)
    return <div className="text-center text-red-600 py-8">{error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <h4 className="font-semibold text-gray-900 mb-4 text-nepal-blue dark:text-white">
          Booking Trends
        </h4>
        <Line
          data={bookingsTrendData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: false },
            },
          }}
          height={250}
          className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white p-6 dark:bg-white/[0.03]"
        />
      </div>
      <div className="card p-6">
        <h4 className="font-semibold text-gray-900 mb-4 text-nepal-blue dark:text-white">
          Revenue by State
        </h4>
        <Bar
          data={revenueByStateData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: false },
            },
          }}
          height={250}
          className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white p-6 dark:bg-white/[0.03]"
        />
      </div>
    </div>
  );
};

export default AnalyticsCharts;
