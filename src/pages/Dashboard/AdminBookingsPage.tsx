import React, { useState } from 'react';
import { Edit, XCircle, Save, ArrowLeft, ArrowRight} from 'lucide-react';
import Tooltip from '../../components/Tooltip';

const mockBookings = [
  { id: 1, guest: 'Priya Singh', property: 'Pokhara Lake House', dates: 'Jun 1-3, 2024', status: 'confirmed', total: 'NPR 3500' },
  { id: 2, guest: 'John Doe', property: 'Kathmandu Heritage Stay', dates: 'May 28-30, 2024', status: 'pending', total: 'NPR 3200' },
  { id: 3, guest: 'Laxmi Gurung', property: 'Everest View Lodge', dates: 'May 20-22, 2024', status: 'cancelled', total: 'NPR 0' },
];
const statusOptions = ['confirmed', 'pending', 'cancelled'];
const PAGE_SIZE_OPTIONS = [5, 10, 20];

interface Booking {
  id: number;
  guest: string;
  property: string;
  dates: string;
  status: string;
  total: string;
}
const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState(mockBookings);
  const [filter, setFilter] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [sortBy, setSortBy] = useState<keyof Booking>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const handleEdit = (booking: any) => {
    setEditingId(booking.id);
    setEditForm({ ...booking });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleSave = () => {
    setBookings(bookings.map(b => b.id === editingId ? { ...b, ...editForm } : b));
    setEditingId(null);
    setEditForm({});
  };
  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };
  const handleBookingCancel = (id: number) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
  };
  // const handleSort = (field: string) => {
  //   if (sortBy === field) {
  //     setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
  //   } else {
  //     setSortBy(field);
  //     setSortDir('asc');
  //   }
  // };
  // const filteredBookings = filter
  //   ? bookings.filter(b => b.guest.toLowerCase().includes(filter.toLowerCase()) || b.property.toLowerCase().includes(filter.toLowerCase()))
  //   : bookings;
  // const sorted = [...filteredBookings].sort((a, b) => {
  //   let aVal = a[sortBy];
  //   let bVal = b[sortBy];
  //   if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
  //   if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
  //   return 0;
  // });
const filteredBookings = filter
    ? bookings.filter(b => 
        b.guest.toLowerCase().includes(filter.toLowerCase()) || 
        b.property.toLowerCase().includes(filter.toLowerCase())
      )
    : bookings;

  const sorted = [...filteredBookings].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (typeof aVal === "string" && typeof bVal === "string") {
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    }
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <div className="text-sm font-sans">
      <h1 className="text-2xl font-bold mb-8 text-nepal-blue font-heading">Bookings</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by guest or property..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="input-field w-full max-w-xs"
        />
      </div>
      <div className="card p-6 overflow-x-auto rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <table className="w-full min-w-[700px] text-xs rounded-xl overflow-hidden">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <th className="py-3 px-4 text-gray-900 dark:text-gray-100">Guest</th>
              <th className="py-3 px-4 text-gray-900 dark:text-gray-100">Property</th>
              <th className="py-3 px-4 text-gray-900 dark:text-gray-100">Dates</th>
              <th className="py-3 px-4 text-gray-900 dark:text-gray-100">Status</th>
              <th className="py-3 px-4 text-gray-900 dark:text-gray-100">Total</th>
              <th className="py-3 px-4 text-gray-900 dark:text-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(booking => (
              <tr key={booking.id} className="border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-gray-700 dark:text-gray-200">
                <td className="py-3 px-4">{booking.guest}</td>
                <td className="py-3 px-4">{booking.property}</td>
                <td className="py-3 px-4">
                  {editingId === booking.id ? (
                    <input name="dates" value={editForm.dates} onChange={handleEditChange} className="input-field w-full" />
                  ) : booking.dates}
                </td>
                <td className="py-3 px-4">
                  {editingId === booking.id ? (
                    <select name="status" value={editForm.status} onChange={handleEditChange} className="input-field w-full">
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{booking.status}</span>
                  )}
                </td>
                <td className="py-3 px-4">{booking.total}</td>
                <td className="py-3 px-4 flex gap-2">
                  {editingId === booking.id ? (
                    <>
                      <Tooltip content="Save">
                        <button className="btn-primary px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={handleSave}>
                          <Save className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Cancel">
                        <button className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={handleCancel}>
                          <XCircle className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip content="Edit">
                        <button className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={() => handleEdit(booking)}>
                          <Edit className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      {booking.status !== 'cancelled' && (
                        <Tooltip content="Cancel Booking">
                          <button className="btn-danger px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={() => handleBookingCancel(booking.id)}>
                            <XCircle className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && <div className="text-center text-gray-500 dark:text-gray-400 py-4">No bookings found.</div>}
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
            <span>Page {page} of {totalPages}</span>
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
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="input-field w-32 text-xs"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsPage; 