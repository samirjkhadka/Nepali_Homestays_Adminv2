import React, { useEffect, useState } from "react";
import {
  Edit,
  Save,
  X,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Search,
  Eye,
  Lock,
  UserX,
  Shield,
} from "lucide-react";
import Tooltip from "../../components/Tooltip";
import { apiFetch } from "../../services/api";
import { useAdminAuth } from "../../context/AdminAuthContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const permissionOptions = ["all", "limited"];

const AdminAdminUsersPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    first_name: "",
    last_name: "",
    email: "",
    permissions: permissionOptions[0],
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  }>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Fetch admin users from backend
  const fetchAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        search: filter,
        sortBy,
        sortOrder: sortDir,
        role: "admin",
      });
      const res = await apiFetch<{ data: { users: any[]; pagination: any } }>(
        `/admin/users?${params.toString()}`,
        {},
        token || undefined
      );
      setAdmins((res.data && res.data.users) || []);
      setTotalPages(
        (res.data && res.data.pagination && res.data.pagination.pages) || 1
      );
      setTotalUsers(
        (res.data && res.data.pagination && res.data.pagination.total) || 0
      );
    } catch (err: any) {
      setError(err.message || "Failed to load admin users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAdmins();
    // eslint-disable-next-line
  }, [token, page, pageSize, filter, sortBy, sortDir]);

  const handleEdit = (admin: any) => {
    setEditingId(admin._id || admin.id);
    setEditForm({ ...admin });
  };
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      await apiFetch(
        `/admin/users/${editingId}`,
        {
          method: "PUT",
          body: JSON.stringify(editForm),
        },
        token || undefined
      );
      setEditingId(null);
      setEditForm({});
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || "Failed to update admin user");
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };
  const handleBlock = async (id: string, currentStatus: string) => {
    setLoading(true);
    try {
      const isActive = currentStatus === "active";
      console.log("Sending is_active:", !isActive);
      await apiFetch(
        `/admin/users/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ is_active: !isActive }),
        },
        token || undefined
      );
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || "Failed to update user status");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    setLoading(true);
    if (!window.confirm("Are you sure you want to delete this user?")) {
      try {
        await apiFetch(
          `/admin/users/${id}`,
          {
            method: "DELETE",
          },
          token || undefined
        );
        fetchAdmins();
      } catch (err: any) {
        setError(err.message || "Failed to delete user");
      } finally {
        setLoading(false);
      }
    }
  };
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  // Add new admin user
  const handleAddAdmin = async () => {
    if (
      !newAdmin.first_name.trim() ||
      !newAdmin.last_name.trim() ||
      !newAdmin.email.trim()
    )
      return;
    setLoading(true);
    setError("");
    try {
      // Use the user creation endpoint (if available) with role: 'admin'
      await apiFetch(
        "/admin/users",
        {
          method: "POST",
          body: JSON.stringify({
            email: newAdmin.email,
            first_name: newAdmin.first_name,
            last_name: newAdmin.last_name,
            role: "admin",
            permissions: newAdmin.permissions,
            status: newAdmin.status,
          }),
        },
        token || undefined
      );
      setShowAdd(false);
      setNewAdmin({
        first_name: "",
        last_name: "",
        email: "",
        permissions: permissionOptions[0],
        status: "active",
      });
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || "Failed to add admin user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Admin Users" />
      <div className="p-4 text-sm font-sans h-full overflow-y-auto">
        <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <Tooltip content="Add Admin User" position="bottom">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="h-5 w-5" /> Add Admin User
            </button>
          </Tooltip>
        </div>
        {loading && (
          <div className="text-center py-8 dark:text-gray-400">
            Loading admin users...
          </div>
        )}
        {error && <div className="text-center text-red-500 py-4">{error}</div>}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800">
              {(admins || []).map((admin) => (
                <tr
                  key={admin._id || admin.adminId}
                  className="border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-gray-700 dark:text-gray-200"
                >
                  {/* Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                    {
                      admin.full_name || admin.firstName || ""
                      // +
                      //   " " +
                      //   (admin.last_name || admin.lastName || "")}
                    }
                  </td>
                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                    {admin.email}
                  </td>
                  {/* Permissions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                    <span>{admin.phone}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                    <span>{admin.role || "No Role Specified"} </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                    <span>-</span>
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                    {editingId === (admin._id || admin.adminId) ? (
                      <select
                        name="status"
                        value={
                          editForm.status ||
                          (admin.Status ? "active" : "blocked")
                        }
                        onChange={handleEditChange}
                        className="border border-gray-300 rounded-lg w-full dark:text-gray-200"
                      >
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          admin.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {admin.is_active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingId === (admin._id || admin.adminId) ? (
                      <>
                        <Tooltip content="Save">
                          <button
                            className="btn-primary px-2 py-1 text-xs rounded-lg flex items-center justify-center "
                            onClick={handleSave}
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Cancel">
                          <button
                            className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center"
                            onClick={handleCancel}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip content="Edit">
                          <button
                            className="btn-secondary px- py-1 text-xs rounded-lg flex items-center justify-center"
                            onClick={() => handleEdit(admin)}
                          >
                            <Edit className="h-4 w-4 dark:text-gray-200" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Delete">
                          <button
                            className="btn-danger px-4 py-1 text-xs rounded-lg flex items-center justify-center ml-2 dark:text-gray-200"
                            onClick={() => handleDelete(admin._id || admin.adminId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="View">
                          <button className="">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Reset Password">
                          <button
                            className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center ml-2 dark:text-gray-200"
                            onClick={() => handleResetPassword(admin)}
                          >
                            <Lock className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Enable/Disable">
                          <button
                            className="btn-danger px-2 py-1 text-xs rounded-lg flex items-center justify-center ml-2 dark:text-gray-200"
                            onClick={() => handleDisable(admin)}
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        <Tooltip content="Edit Role">
                          <button
                            className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center ml-2 dark:text-gray-200"
                            onClick={() => handlePermissions(admin)}
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {admins.length === 0 && !loading && (
            <div className="px-6 py-8 text-center text-gray-500 text-lg">
              No admin users found.
            </div>
          )}
          <div className="flex flex-col md:flex-row md:justify-between items-center mt-4 gap-2 text-xs dark:text-gray-200">
            <div className="flex gap-2 mb-2 md:mb-0">
              <Tooltip content="Previous Page">
                <button
                  className="btn-secondary px-3 py-1 rounded-lg flex items-center gap-1"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                >
                  <ArrowLeft className="h-4 w-4" /> Prev
                </button>
              </Tooltip>
              <span>
                Page {page} of {totalPages}
              </span>
              <Tooltip content="Next Page">
                <button
                  className="btn-secondary px-3 py-1 rounded-lg flex items-center gap-1"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
            <div>
              <label className="mr-2 text-xs text-gray-600 dark:text-gray-200">
                Rows per page:
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="input-field w-32 text-xs"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pagination -- Remove if required */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(page * pagination.limit, pagination.total)}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from(
                      { length: Math.min(5, pagination.pages) },
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === page
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}
                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
        {showAdd && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 dark:bg-gray-900/50 dark:bg-blend-overlay dark:border-gray-900 dark:border">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4 text-nepal-blue flex items-center gap-2 dark:text-white">
                <Plus className="h-5 w-5 dark:text-white" /> Add Admin User
              </h2>
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1 dark:text-white">
                  First Name
                </label>
                <input
                  className="border border-gray-300 p-2 rounded w-full dark:text-white"
                  value={newAdmin.first_name}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, first_name: e.target.value })
                  }
                  placeholder="Enter first name"
                />
              </div>
              <div className="mb-4">
                <label className=" block text-xs font-medium mb-1 dark:text-white">
                  Last Name
                </label>
                <input
                  className="border border-gray-300 p-2 rounded w-full dark:text-white"
                  value={newAdmin.last_name}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, last_name: e.target.value })
                  }
                  placeholder="Enter last name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1 dark:text-white">
                  Email
                </label>
                <input
                  className="border border-gray-300 p-2 rounded w-full dark:text-white"
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, email: e.target.value })
                  }
                  placeholder="Enter email"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1 dark:text-white">
                  Permissions
                </label>
                <select
                  className="border border-gray-300 p-2 rounded w-full dark:text-white"
                  value={newAdmin.permissions}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, permissions: e.target.value })
                  }
                >
                  {permissionOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1 dark:text-white">
                  Status
                </label>
                <select
                  className="border border-gray-300 p-2 rounded w-full dark:text-white"
                  value={newAdmin.status}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-blue-300 bg-blue-500 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 shadow-theme-xs hover:bg-blue-500 hover:text-white dark:bg-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                  onClick={handleAddAdmin}
                  disabled={
                    !newAdmin.first_name.trim() ||
                    !newAdmin.last_name.trim() ||
                    !newAdmin.email.trim()
                  }
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAdminUsersPage;
