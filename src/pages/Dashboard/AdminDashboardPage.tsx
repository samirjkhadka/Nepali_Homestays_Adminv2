import React, { useEffect, useState } from "react";
import { Users, Home, BookOpen, DollarSign, IndianRupeeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import AnalyticsCharts from "../../components/AnalyticsCharts";
import { apiFetch } from "../../services/api";
import { useAdminAuth } from "../../context/AdminAuthContext";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const AdminDashboardPage: React.FC = () => {
  const { token, isAuthenticated } = useAdminAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState<any>(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch<any>(
          "/admin/dashboard",
          {},
          token || undefined
        );

        if (res?.data?.stats) {
          setStats(res.data.stats);
        } else {
          setError("Invalid response format for stats");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    const fetchActivity = async () => {
      setActivityLoading(true);
      setActivityError("");
      try {
        const res = await apiFetch<{ data: { activity: any } }>(
          "/admin/activity/recent",
          {},
          token || undefined
        );

        if (res?.data?.activity) {
          setActivity(res.data.activity);
        } else {
          setActivityError("Invalid response format for activity");
        }
      } catch (err: any) {
        setActivityError(err.message || "Failed to load recent activity");
      } finally {
        setActivityLoading(false);
      }
    };

    if (token) {
      fetchStats();
      fetchActivity();
    }
  }, [token, isAuthenticated]);

  return (
    <>
      <PageMeta
        title="Admin Dashboard | Nepali Homestay management"
        description=""
      />
      <PageBreadcrumb pageTitle="Admin Dashboard" />

      <div className="text-sm font-sans">
        {loading ? (
          <div className="text-center py-12 dark:text-gray-400">Loading dashboard...</div>
        ) : error ? (
          <div className="text-center text-danger-600 py-12">{error}</div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <Link
                to="/admin/users"
                className="border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800 rounded-2xl bg-white p-6 flex flex-col items-center hover:shadow-xl transition-all group"
              >
                <div>
                  <Users className="h-7 w-7 text-blue-600 " />
                </div>
                <div className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Total Users
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 mt-1">
                  {stats.users?.total ?? "-"}
                </div>
              </Link>
              <Link
                to="/admin/listings"
                className="border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800  rounded-2xl bg-white p-6 flex flex-col items-center hover:shadow-xl transition-all group"
              >
                <div>
                  <Home className="h-7 w-7 text-green-600 " />
                </div>
                <div className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Active Listings
                </div>
                <div className="text-2xl font-bold text-nepal-blue dark:text-gray-100 group-hover:text-nepal-red mt-1">
                  {stats.listings?.active ?? "-"}
                </div>
              </Link>
              <Link
                to="/admin/bookings"
                className="border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800  rounded-2xl bg-white p-6 p-6 flex flex-col items-center hover:shadow-xl transition-all group"
              >
                <div>
                  <BookOpen className="h-7 w-7 text-yellow-600" />
                </div>
                <div className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Bookings This Month
                </div>
                <div className="text-2xl font-bold text-nepal-blue dark:text-gray-100 group-hover:text-nepal-red mt-1">
                  {stats.bookings?.new ?? "-"}
                </div>
              </Link>
              <Link
                to="/admin/analytics"
                className="border border-gray-200 dark:bg-white/[0.03] dark:border-gray-800  rounded-2xl bg-white p-6 p-6 flex flex-col items-center hover:shadow-xl transition-all group"
              >
                <div>
                  <IndianRupeeIcon className="h-7 w-7 text-red-600" />
                </div>
                <div className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Revenue
                </div>
                <div className="text-2xl font-bold text-nepal-blue dark:text-gray-100 group-hover:text-nepal-red mt-1">
                  {stats.revenue?.currency}{" "}
                  {stats.revenue?.total?.toLocaleString() ?? "-"}
                </div>
              </Link>
            </div>
            <AnalyticsCharts />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                  Quick Links
                </h2>
                <ul className="space-y-2 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white p-6 dark:bg-white/[0.03]">
                  <li>
                    <Link
                      to="/admin/users"
                      className="text-blue-600 dark:text-blue-400 underline"
                    >
                      Manage Users
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/listings"
                      className="text-blue-600 dark:text-blue-400 underline"
                    >
                      Manage Listings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/bookings"
                      className="text-blue-600 dark:text-blue-400 underline"
                    >
                      View Bookings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/analytics"
                      className="text-blue-600 dark:text-blue-400 underline"
                    >
                      View Analytics
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/cms"
                      className="text-blue-600 dark:text-blue-400 underline"
                    >
                      Content Management
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/settings"
                      className="text-blue-600 dark:text-blue-400 underline"
                    >
                      Site Settings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/support"
                      className="text-blue-600 dark:text-blue-400 underline"
                    >
                      Support
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="card p-6 ">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                  Recent Activity
                </h2>
                {activityLoading ? (
                  <div className=" text-center py-4">Loading activity...</div>
                ) : activityError ? (
                  <div className="text-center text-nepal-red py-4">
                    {activityError}
                  </div>
                ) : activity ? (
                  <ul className="border border-gray-200 dark:border-gray-800 dark:bg-white/[0.03] rounded-2xl bg-white p-6 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {activity.users && activity.users.length > 0 && (
                      <li className="font-semibold text-gray-900 dark:text-gray-100">
                        Recent Users
                      </li>
                    )}
                    {activity.users?.map((u: any) => (
                      <li key={u.id}>
                        New user{" "}
                        <b>
                          {u.first_name || u.firstName}{" "}
                          {u.last_name || u.lastName}
                        </b>{" "}
                        registered ({u.email})
                      </li>
                    ))}
                    {activity.listings && activity.listings.length > 0 && (
                      <li className="font-semibold text-gray-900 dark:text-gray-100 mt-2">
                        Recent Listings
                      </li>
                    )}
                    {activity.listings?.map((l: any) => (
                      <li key={l.id}>
                        Listing <b>{l.title}</b> created
                      </li>
                    ))}
                    {activity.bookings && activity.bookings.length > 0 && (
                      <li className="font-semibold text-gray-900 dark:text-gray-100 mt-2">
                        Recent Bookings
                      </li>
                    )}
                    {activity.bookings?.map((b: any) => (
                      <li key={b.id}>
                        Booking <b>#{b.id}</b> for <b>{b.listing}</b> by{" "}
                        <b>{b.guest}</b>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No recent activity found.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-12">
            No stats available. Please check your API connection. Raw:{" "}
            {JSON.stringify(stats, null, 2)}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboardPage;
