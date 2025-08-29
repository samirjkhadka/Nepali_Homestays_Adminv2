import React, { useEffect, useState } from "react";
import {
  Edit,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Ban,
  X,
  Eye,
} from "lucide-react";
import Tooltip from "../../components/Tooltip";
import { apiFetch } from "../../services/api";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useToast } from "../../components/ToastContainer";
import { Dialog, DialogTitle, Label } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const FACILITY_CATEGORIES = [
  {
    category: "Water",
    options: ["Hot", "Cold"],
  },
  {
    category: "Food",
    options: ["Veg", "Non-Veg"],
  },
  {
    category: "Bathroom",
    options: ["Common", "Attached"],
  },
  {
    category: "Internet",
    options: ["Available", "Not Available"],
  },
  {
    category: "Electricity",
    options: ["Available", "Not Available"],
  },
  {
    category: "Parking",
    options: ["Available", "Not Available"],
  },
];

const initialForm = {
  type: "",
  name: "",
  registration_office: "",
  registration_place: "",
  facilities: {}, // { Water: ['Hot'], Food: ['Veg'], ... }
};

const AdminListingsPage: React.FC = () => {
  const { token } = useAdminAuth();
  const { showSuccess, showError } = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<any>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const openAddModal = () => {
    setModalMode("add");
    setForm(initialForm);
    setEditingId(null);
    setShowModal(true);
  };
  const openEditModal = (listing: any) => {
    setModalMode("edit");
    setEditingId(listing._id || listing.id);
    setForm({
      type: listing.type || "",
      name: listing.name || listing.title || "",
      registration_office: listing.registration_office || "",
      registration_place: listing.registration_place || "",
      facilities: listing.facilities || {},
    });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setEditingId(null);
  };
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFacilityChange = (category: string, option: string) => {
    setForm((prev: any) => {
      const selected = prev.facilities?.[category] || [];
      const exists = selected.includes(option);
      return {
        ...prev,
        facilities: {
          ...prev.facilities,
          [category]: exists
            ? selected.filter((o: string) => o !== option)
            : [...selected, option],
        },
      };
    });
  };
  const handleModalSave = () => {
    if (modalMode === "add") {
      setListings([
        {
          id: Date.now().toString(),
          ...form,
        },
        ...listings,
      ]);
    } else if (modalMode === "edit" && editingId) {
      setListings(
        listings.map((l) =>
          l._id === editingId || l.id === editingId ? { ...l, ...form } : l
        )
      );
    }
    closeModal();
  };

  // Fetch listings from backend
  const fetchListings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ data: { listings: any[] } }>(
        `/admin/listings`,
        {},
        token || undefined
      );
      setListings((res.data && res.data.listings) || []);
    } catch (err: any) {
      setError(err.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchListings();
    // eslint-disable-next-line
  }, [token]);

  const handleModerate = async (
    id: string,
    action: "approve" | "reject" | "suspend"
  ) => {
    setActionLoading(id + action);
    try {
      await apiFetch(
        `/listings/${id}/${action}`,
        { method: "PUT" },
        token || ""
      );
      showSuccess(
        `Listing ${
          action === "approve"
            ? "Approved"
            : action === "reject"
            ? "Rejected"
            : "Suspended"
        }`,
        `The listing has been ${
          action === "approve"
            ? "approved"
            : action === "reject"
            ? "rejected"
            : "suspended"
        } successfully.`
      );
      fetchListings(); // Refresh the list
    } catch (error: any) {
      showError(
        `Failed to ${action} listing`,
        error.message || `Unable to ${action} the listing. Please try again.`
      );
    } finally {
      setActionLoading(null);
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
  const sorted = [...listings].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <div className="text-sm font-sans">
      <h1 className="text-2xl font-bold mb-8 text-nepal-blue font-heading">
        Listings
      </h1>
      {loading ? (
        <div className="text-center py-12">Loading listings...</div>
      ) : error ? (
        <div className="text-center text-nepal-red py-12">{error}</div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2 items-center"></div>
            <Tooltip content="Add Listing">
              <button
                className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-xs dark:text-white/90 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                onClick={() => navigate("/listings/add")}
              >
                <Plus className="h-4 w-4" /> Add Listing
              </button>
            </Tooltip>
          </div>
          <div className="card p-6 overflow-x-auto rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <table className="w-full min-w-[700px] text-xs rounded-xl overflow-hidden">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <th className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    Title
                  </th>
                  <th className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    Host
                  </th>
                  <th className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    Location
                  </th>
                  <th className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    Price/Night
                  </th>
                  <th className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    Status
                  </th>
                  <th className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    Date Added
                  </th>
                  <th className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((listing) => (
                  <tr
                    key={listing.HomestayID || listing.HomestayID}
                    className="border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-gray-700 dark:text-gray-200"
                  >
                    <td className="py-3 px-4">{listing.HomestayName}</td>
                    <td className="py-3 px-4">
                      {`${listing.host_first_name || ""} ${
                        listing.host_last_name || ""
                      }`.trim() || "-"}
                    </td>
                    <td className="py-3 px-4">
                      {[
                        listing.District,
                        listing.Province,
                        listing.country || "NP",
                      ]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </td>
                    <td className="py-3 px-4">
                      {listing.NormalPackageCost || 0
                        ? `NPR ${listing.NormalPackageCost}`
                        : "0"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          listing.Status === "Y"
                            ? "bg-green-100 text-green-800"
                            : listing.Status === "P"
                            ? "bg-yellow-100 text-yellow-800"
                            : listing.Status === "R"
                            ? "bg-red-100 text-red-800"
                            : listing.Status === "S"
                            ? "bg-gray-200 text-gray-700"
                            : ""
                        }`}
                      >
                        {listing.Status === "Y"
                          ? "Active"
                          : listing.Status === "R"
                          ? "Rejected"
                          : listing.Status === "S"
                          ? "Suspended"
                          : "Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {listing.CreatedLocalDate
                        ? new Date(listing.CreatedLocalDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "-"}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      {listing.status !== "approved" && (
                        <Tooltip content="Approve">
                          <button
                            className="btn-primary px-2 py-1 text-xs rounded-lg flex items-center justify-center disabled:opacity-50"
                            disabled={
                              actionLoading ===
                              (listing._id || listing.HomestayID) + "approve"
                            }
                            onClick={() =>
                              handleModerate(
                                listing._id || listing.HomestayID,
                                "approve"
                              )
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      )}
                      {listing.status !== "rejected" && (
                        <Tooltip content="Reject">
                          <button
                            className="btn-danger px-2 py-1 text-xs rounded-lg flex items-center justify-center disabled:opacity-50"
                            disabled={
                              actionLoading ===
                              (listing._id || listing.HomestayID) + "reject"
                            }
                            onClick={() =>
                              handleModerate(
                                listing._id || listing.HomestayID,
                                "reject"
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      )}
                      {listing.status !== "suspended" && (
                        <Tooltip content="Suspend">
                          <button
                            className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center disabled:opacity-50"
                            disabled={
                              actionLoading ===
                              (listing._id || listing.HomestayID) + "suspend"
                            }
                            onClick={() =>
                              handleModerate(
                                listing._id || listing.HomestayID,
                                "suspend"
                              )
                            }
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip content="View Listing">
                        <button
                          className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center"
                          onClick={() =>
                            navigate(
                              `/admin/listings/view/${
                                listing._id || listing.HomestayID
                              }`
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Edit Listing">
                        <button
                          className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center"
                          onClick={() =>
                            navigate(
                              `/admin/listings/edit/${
                                listing._id || listing.HomestayID
                              }`
                            )
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paginated.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No listings found.
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
                <label className="mr-2 text-xs text-gray-600">
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
          </div>
        </>
      )}
      {/* Add/Edit Listing Modal */}
      <Dialog
        open={showModal}
        onClose={closeModal}
        className="max-w-[500px] m-4"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-lg mx-auto z-10">
            <DialogTitle className="text-lg font-bold mb-4 text-nepal-blue">
              {modalMode === "add" ? "Add Listing" : "Edit Listing"}
            </DialogTitle>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleModalSave();
              }}
              className="space-y-4"
            >
              <div>
                <Label className="block text-xs font-medium mb-1">
                  Homestay Type
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="type"
                      value="individual"
                      checked={form.type === "individual"}
                      onChange={handleFormChange}
                      required
                    />{" "}
                    Individual
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="type"
                      value="community"
                      checked={form.type === "community"}
                      onChange={handleFormChange}
                      required
                    />{" "}
                    Community
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Homestay Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Office of Registration
                </label>
                <input
                  name="registration_office"
                  value={form.registration_office}
                  onChange={handleFormChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Place of Registration
                </label>
                <input
                  name="registration_place"
                  value={form.registration_place}
                  onChange={handleFormChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Facilities
                </label>
                <div className="space-y-2">
                  {FACILITY_CATEGORIES.map((cat) => (
                    <div key={cat.category}>
                      <div className="font-semibold text-xs mb-1">
                        {cat.category}
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        {cat.options.map((opt) => (
                          <label key={opt} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={
                                form.facilities?.[cat.category]?.includes(
                                  opt
                                ) || false
                              }
                              onChange={() =>
                                handleFacilityChange(cat.category, opt)
                              }
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminListingsPage;
