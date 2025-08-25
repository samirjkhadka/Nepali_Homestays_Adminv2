import React, { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,

  ArrowLeft,
  ArrowRight,
  Plus,
} from "lucide-react";
import Tooltip from "../../components/Tooltip";
import { apiFetch } from "../../services/api";
import { useAdminAuth } from "../../context/AdminAuthContext";

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const getAllRoles = () => [
  { id: 1, name: "Admin" },
  { id: 2, name: "Host" },
  { id: 3, name: "Guest" },
];
const allRoles = getAllRoles();

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  avatar: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  gender: string;
  date_of_birth: string;
  status: string;
  [key: string]: any; // Allow additional properties
}

const AdminUsersPage: React.FC = () => {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<keyof User>("first_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [roles] = useState(allRoles);
  const [roleModal, setRoleModal] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        search: filter,
        sortBy,
        sortOrder: sortDir,
      } as any);
      const res = await apiFetch<{data:{ users: User[]; pagination: any }}>(
        `/admin/users?${params.toString()}`,
        {},
        token || undefined
      );

      const mappedUsers = res.data.users.map(user => ({
        id: user._id || user.id,
        email: user.email,
        first_name: user.first_Name || user.first_name,
        last_name: user.last_Name || user.last_name,
        role: user.role || "guest",
        is_active: user.isActive || user.is_active,
        created_at: user.createdAt || user.created_at,
        updated_at: user.updatedAt || user.updated_at,
        avatar: user.avatar || "",
        phone: user.phone || "",
        address: user.address || "",
        country: user.country || "",
        city: user.city || "",
        gender: user.gender || "",
        date_of_birth: user.date_of_birth || "",
        isactive: user.is_active || "",
      }) as any);
      setUsers(mappedUsers);
 
      setTotalPages((res.data.pagination && res.data.pagination.pages) || 1);
      setTotalUsers((res.data.pagination && res.data.pagination.total) || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
    // eslint-disable-next-line
  }, [token, page, pageSize, filter, sortBy, sortDir]);

  const openRoleModal = (user: any) => {
    setRoleModal({ open: true, userId: user._id || user.id });
    setSelectedRole(user.role);
  };
  const closeRoleModal = () => {
    setRoleModal({ open: false, userId: null });
    setSelectedRole("");
  };
  const handleRoleSave = async () => {
    if (!roleModal.userId) return;
    setLoading(true);
    try {
      await apiFetch(
        `/admin/users/${roleModal.userId}/role`,
        {
          method: "PUT",
          body: JSON.stringify({ role: selectedRole }),
        },
        token || undefined
      );
      fetchUsers();
      closeRoleModal();
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditingId(user._id || user.id);
    setEditForm({ ...user });
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
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      // If DELETE not implemented, block user instead
      await apiFetch(
        `/admin/users/${id}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status: "blocked" }),
        },
        token || undefined
      );
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to block user");
    } finally {
      setLoading(false);
    }
  };
  const handleBlock = async (id: string, currentStatus: string) => {
    setLoading(true);
    try {
      const newStatus = currentStatus === "active" ? "blocked" : "active";
      await apiFetch(
        `/admin/users/${id}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status: newStatus }),
        },
        token || undefined
      );
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update user status");
    } finally {
      setLoading(false);
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

  // Pagination helpers
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <div className="text-sm font-sans p-4 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-900 dark:text-gray-100 font-heading">
        Admin Users
      </h1>
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by name, email, role, status..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full max-w-xs border-gray-300 border-2 dark:border-gray-700"
          />
        </div>
        <Tooltip content="Add User">
          <button
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-xs"
            disabled
          >
            <Plus className="h-4 w-4" /> Add User
          </button>
        </Tooltip>
      </div>
      {loading && <div className="text-center py-8 text-gray-900 dark:text-gray-100">Loading users...</div>}
      {error && <div className="text-center text-nepal-red py-4">{error}</div>}
      <div className="card p-6 overflow-x-auto rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <table className="w-full min-w-[700px] text-xs rounded-xl overflow-hidden">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <th className="py-3 px-4 text-gray-900 dark:text-gray-100" onClick={() => handleSort("first_name")}>
                Name
              </th>
              <th className="py-3 px-4 text-gray-900 dark:text-gray-100">
                Email
              </th>
              <th className="py-3 px-4 text-gray-900 dark:text-gray-100">
                Role
              </th>
              <th className="py-3 px-4 text-gray-900 dark:text-gray-100">
                Status
              </th>
              <th className="py-3 px-4 text-gray-900 dark:text-gray-100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id || user.id}
                className="border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-gray-700 dark:text-gray-200"
              >
                <td className="py-3 px-4">
                  {editingId === (user._id || user.id) ? (
                    <input
                      name="name"
                      value={editForm.name || ""}
                      onChange={handleEditChange}
                      className="input-field w-full"
                    />
                  ) : (
                    `${user.first_name} ${user.last_name}`
                  )}
                </td>
                <td className="py-3 px-4">
                  {editingId === (user._id || user.id) ? (
                    <input
                      name="email"
                      value={editForm.email || ""}
                      onChange={handleEditChange}
                      className="input-field w-full"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="py-3 px-4">
                  {editingId === (user._id || user.id) ? (
                    <select
                      name="role"
                      value={editForm.role}
                      onChange={handleEditChange}
                      className="input-field w-full"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.name.toLowerCase()}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="capitalize font-semibold">
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4 flex gap-2">
                  {editingId === (user._id || user.id) ? (
                    <>
                      <Tooltip content="Save">
                        <button
                          className="btn-primary px-2 py-1 text-xs rounded-lg flex items-center justify-center"
                          onClick={handleSave}
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Cancel">
                        <button
                          className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center"
                          onClick={handleCancel}
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip content="Edit">
                        <button
                          className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <button
                          className="btn-danger px-2 py-1 text-xs rounded-lg flex items-center justify-center"
                          onClick={() => handleDelete(user._id || user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip
                        content={user.status === "active" ? "Block" : "Unblock"}
                      >
                        <button
                          className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center"
                          onClick={() =>
                            handleBlock(user._id || user.id, user.status)
                          }
                        >
                          {user.status === "active" ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      </Tooltip>
                      <Tooltip content="Edit Role">
                        <button
                          className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center"
                          onClick={() => openRoleModal(user)}
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
        {users.length === 0 && !loading && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            No users found.
          </div>
        )}
        <div className="flex flex-col md:flex-row md:justify-between items-center mt-4 gap-2 text-xs">
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
            <label className="mr-2 text-xs text-gray-600">Rows per page:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="input-field text-xs"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="ml-2 text-gray-500">Total: {totalUsers}</span>
          </div>
        </div>
      </div>
      {/* Role Modal */}
      {roleModal.open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl w-full max-w-xs">
            <h3 className="text-lg font-bold mb-4">Edit Role</h3>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field w-full mb-4"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.name.toLowerCase()}>
                  {r.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2 justify-end">
              <button
                className="btn-secondary px-4 py-2 rounded-lg"
                onClick={closeRoleModal}
              >
                Cancel
              </button>
              <button
                className="btn-primary px-4 py-2 rounded-lg"
                onClick={handleRoleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
