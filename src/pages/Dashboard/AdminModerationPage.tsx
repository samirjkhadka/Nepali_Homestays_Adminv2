import React, { useState } from 'react';
import { CheckCircle, XCircle, Trash2, Edit, Plus, Eye, Image as ImageIcon, Youtube, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import Tooltip from '../../components/Tooltip';

const initialContent = [
  { id: 1, type: 'text', title: 'About Us', content: 'Welcome to Nepali Homestay!', status: 'approved', author: 'Admin', date: '2024-06-01' },
  { id: 2, type: 'image', title: 'Homepage Banner', image: 'https://via.placeholder.com/300x100', status: 'pending', author: 'Admin', date: '2024-06-02' },
  { id: 3, type: 'video', title: 'Welcome Video', video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', status: 'pending', author: 'Admin', date: '2024-06-03' },
];
const PAGE_SIZE_OPTIONS = [5, 10, 20];
const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'YouTube/Video' },
];
const statusOptions = ['pending', 'approved', 'rejected'];

const AdminModerationPage: React.FC = () => {
  const [content, setContent] = useState(initialContent);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'preview'>('add');
  const [modalContent, setModalContent] = useState<any>(null);

  // Filtering and sorting
  let filtered = content.filter(c =>
    (filterType === 'all' || c.type === filterType) &&
    (filterStatus === 'all' || c.status === filterStatus) &&
    (c.title.toLowerCase().includes(search.toLowerCase()) || (c.content || '').toLowerCase().includes(search.toLowerCase()))
  );
  filtered = filtered.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  // Modal handlers
  const openAddModal = () => {
    setModalMode('add');
    setModalContent({ type: 'text', title: '', content: '', image: '', video: '', status: 'pending' });
    setShowModal(true);
  };
  const openEditModal = (item: any) => {
    setModalMode('edit');
    setModalContent({ ...item });
    setShowModal(true);
  };
  const openPreviewModal = (item: any) => {
    setModalMode('preview');
    setModalContent({ ...item });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };
  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setModalContent({ ...modalContent, [e.target.name]: e.target.value });
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setModalContent({ ...modalContent, image: url });
    }
  };
  const handleSave = () => {
    if (modalMode === 'add') {
      setContent([
        { ...modalContent, id: Math.max(0, ...content.map(c => c.id)) + 1, author: 'Admin', date: new Date().toISOString().slice(0, 10) },
        ...content,
      ]);
    } else if (modalMode === 'edit') {
      setContent(content.map(c => c.id === modalContent.id ? { ...modalContent } : c));
    }
    closeModal();
  };
  const handleDelete = (id: number) => {
    setContent(content.filter(c => c.id !== id));
  };
  const handleApprove = (id: number) => {
    setContent(content.map(c => c.id === id ? { ...c, status: 'approved' } : c));
  };
  const handleReject = (id: number) => {
    setContent(content.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
  };

  return (
    <div className="text-sm font-sans">
      <h1 className="text-2xl font-bold mb-8 text-nepal-blue font-heading">Content Moderation</h1>
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <select className="input-field text-xs" value={filterType} onChange={e => setFilterType(e.target.value)}>
            {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select className="input-field text-xs" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field w-48 text-xs"
          />
        </div>
        <Tooltip content="Add Content">
          <button className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-xs" onClick={openAddModal}>
            <Plus className="h-4 w-4" /> Add Content
          </button>
        </Tooltip>
      </div>
      <div className="card p-6 overflow-x-auto rounded-2xl shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <table className="w-full min-w-[800px] text-xs rounded-xl overflow-hidden">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Title/Label</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(item => (
              <tr key={item.id} className="border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                <td className="py-3 px-4">
                  {item.type === 'text' && <FileText className="h-4 w-4 text-nepal-blue inline mr-1" />} 
                  {item.type === 'image' && <ImageIcon className="h-4 w-4 text-nepal-blue inline mr-1" />} 
                  {item.type === 'video' && <Youtube className="h-4 w-4 text-nepal-blue inline mr-1" />} 
                  <span className="capitalize">{item.type}</span>
                </td>
                <td className="py-3 px-4 font-semibold">{item.title}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'approved' ? 'bg-green-100 text-green-800' : item.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.status}</span>
                </td>
                <td className="py-3 px-4">{item.date}</td>
                <td className="py-3 px-4 flex gap-2">
                  <Tooltip content="Preview">
                    <button className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={() => openPreviewModal(item)}><Eye className="h-4 w-4" /></button>
                  </Tooltip>
                  <Tooltip content="Edit">
                    <button className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={() => openEditModal(item)}><Edit className="h-4 w-4" /></button>
                  </Tooltip>
                  {item.status !== 'approved' && (
                    <Tooltip content="Approve">
                      <button className="btn-primary px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={() => handleApprove(item.id)}><CheckCircle className="h-4 w-4" /></button>
                    </Tooltip>
                  )}
                  {item.status !== 'rejected' && (
                    <Tooltip content="Reject">
                      <button className="btn-danger px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={() => handleReject(item.id)}><XCircle className="h-4 w-4" /></button>
                    </Tooltip>
                  )}
                  <Tooltip content="Delete">
                    <button className="btn-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></button>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && <div className="text-center text-gray-500 py-4">No content found.</div>}
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
      {/* Modal for Add/Edit/Preview */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4 text-nepal-blue flex items-center gap-2">
              {modalMode === 'add' && <><Plus className="h-5 w-5" /> Add Content</>}
              {modalMode === 'edit' && <><Edit className="h-5 w-5" /> Edit Content</>}
              {modalMode === 'preview' && <><Eye className="h-5 w-5" /> Preview Content</>}
            </h2>
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1">Type</label>
              <select
                className="input-field w-full"
                name="type"
                value={modalContent.type}
                onChange={handleModalChange}
                disabled={modalMode === 'preview'}
              >
                {typeOptions.filter(t => t.value !== 'all').map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1">Title/Label</label>
              <input
                className="input-field w-full"
                name="title"
                value={modalContent.title}
                onChange={handleModalChange}
                placeholder="Enter title or label"
                disabled={modalMode === 'preview'}
              />
            </div>
            {modalContent.type === 'text' && (
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">Content</label>
                <textarea
                  className="input-field w-full min-h-[80px]"
                  name="content"
                  value={modalContent.content}
                  onChange={handleModalChange}
                  placeholder="Enter text content"
                  disabled={modalMode === 'preview'}
                />
              </div>
            )}
            {modalContent.type === 'image' && (
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">Image</label>
                {modalContent.image && (
                  <img src={modalContent.image} alt="Preview" className="rounded-lg mb-2 max-h-32" />
                )}
                {modalMode !== 'preview' && (
                  <input
                    type="file"
                    accept="image/*"
                    className="input-field w-full"
                    onChange={handleImageChange}
                  />
                )}
              </div>
            )}
            {modalContent.type === 'video' && (
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1">YouTube Link</label>
                <input
                  className="input-field w-full"
                  name="video"
                  value={modalContent.video}
                  onChange={handleModalChange}
                  placeholder="Paste YouTube link"
                  disabled={modalMode === 'preview'}
                />
                {modalContent.video && (
                  <div className="mt-2">
                    <iframe
                      width="100%"
                      height="180"
                      src={modalContent.video.replace('watch?v=', 'embed/')}
                      title="YouTube Preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1">Status</label>
              <select
                className="input-field w-full"
                name="status"
                value={modalContent.status}
                onChange={handleModalChange}
                disabled={modalMode === 'preview'}
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            {modalMode !== 'preview' && (
              <div className="flex gap-2 justify-end mt-6">
                <button className="btn-secondary px-4 py-2 rounded-lg text-xs" onClick={closeModal}>Cancel</button>
                <button className="btn-primary px-4 py-2 rounded-lg text-xs" onClick={handleSave} disabled={!modalContent.title.trim()}>Save</button>
              </div>
            )}
            {modalMode === 'preview' && (
              <div className="flex gap-2 justify-end mt-6">
                <button className="btn-secondary px-4 py-2 rounded-lg text-xs" onClick={closeModal}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModerationPage; 