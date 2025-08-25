import React, { useState } from 'react';
import { CheckCircle, Trash2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import Tooltip from '../../components/Tooltip';

const mockTickets = [
  { id: 1, user: 'Priya Singh', subject: 'Payment not received', status: 'open', message: 'I have not received my payout for last month.' },
  { id: 2, user: 'John Doe', subject: 'Booking issue', status: 'resolved', message: 'My booking was cancelled without notice.' },
  { id: 3, user: 'Laxmi Gurung', subject: 'Profile update', status: 'open', message: 'Unable to update my profile picture.' },
];
const PAGE_SIZE_OPTIONS = [5, 10, 20];

const AdminSupportPage: React.FC = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const [sortBy, setSortBy] = useState('user');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const handleResolve = (id: number) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
  };
  const handleDelete = (id: number) => {
    setTickets(tickets.filter(t => t.id !== id));
  };
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };
  const sorted = [...tickets].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-primary-600">Support Tickets</h1>
      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[700px] text-xs rounded-xl overflow-hidden">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('user')}>User {sortBy === 'user' && (sortDir === 'asc' ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />)}</th>
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('subject')}>Subject {sortBy === 'subject' && (sortDir === 'asc' ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />)}</th>
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('message')}>Message {sortBy === 'message' && (sortDir === 'asc' ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />)}</th>
              <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('status')}>Status {sortBy === 'status' && (sortDir === 'asc' ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />)}</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(ticket => (
              <tr key={ticket.id} className="border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                <td className="py-3 px-4">{ticket.user}</td>
                <td className="py-3 px-4 font-semibold">{ticket.subject}</td>
                <td className="py-3 px-4">{ticket.message}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{ticket.status}</span>
                </td>
                <td className="py-3 px-4 flex gap-2">
                  {ticket.status !== 'resolved' && (
                    <Tooltip content="Resolve">
                      <button className="admin-button-primary px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={() => handleResolve(ticket.id)}>
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip content="Delete">
                    <button className="btn-danger px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={() => handleDelete(ticket.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && <div className="text-center text-gray-500 py-4">No tickets found.</div>}
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
              className="admin-input w-32 text-xs"
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

export default AdminSupportPage; 