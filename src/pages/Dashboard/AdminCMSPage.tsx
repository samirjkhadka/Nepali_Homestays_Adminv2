import React, { useState } from 'react';
import { Plus, Edit, Eye, Trash, Image, FileText, Video, Info, CheckCircle, XCircle, Filter } from 'lucide-react';
import { Dialog } from '@headlessui/react';

// Mock content data
const initialContent = [
  {
    id: 1,
    page: 'Home',
    section: 'Hero',
    key: 'heroTitle',
    type: 'text',
    value: 'Discover Authentic Nepali Homestays',
    status: 'active',
    description: 'Main heading in homepage hero section',
    updatedAt: '2024-06-10',
  },
  {
    id: 2,
    page: 'Home',
    section: 'Hero',
    key: 'heroImage',
    type: 'image',
    value: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&w=400',
    status: 'active',
    description: 'Background image for homepage hero',
    updatedAt: '2024-06-10',
  },
  {
    id: 3,
    page: 'About',
    section: 'Intro',
    key: 'aboutText',
    type: 'text',
    value: 'We connect travelers with local Nepali families for authentic experiences.',
    status: 'active',
    description: 'About page intro text',
    updatedAt: '2024-06-09',
  },
  {
    id: 4,
    page: 'Footer',
    section: 'Contact',
    key: 'footerEmail',
    type: 'text',
    value: 'hello@homestaynepal.com',
    status: 'active',
    description: 'Footer contact email',
    updatedAt: '2024-06-08',
  },
  {
    id: 5,
    page: 'Home',
    section: 'Video',
    key: 'promoVideo',
    type: 'video',
    value: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'draft',
    description: 'Homepage promotional video',
    updatedAt: '2024-06-07',
  },
];

const typeIcon = {
  text: <FileText className="h-4 w-4" />, 
  image: <Image className="h-4 w-4" />, 
  video: <Video className="h-4 w-4" />
};

const statusBadge = (status: string) => (
  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
    status === 'active' ? 'bg-green-100 text-green-700' : status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'
  }`}>
    {status === 'active' && <CheckCircle className="h-3 w-3" />} 
    {status === 'draft' && <Info className="h-3 w-3" />} 
    {status === 'archived' && <XCircle className="h-3 w-3" />} 
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const allPages = [
  'Home',
  'Homestays',
  'Experiences',
  'Packages',
  'Booking',
  'About',
  'Help',
  'FAQ',
  'Safety',
  'Host',
  'Terms',
  'Profile',
  'Community',
  'Cancellation',
  'Support',
  'Privacy',
  'Cookies',
  'Footer'
];
const pageSections: Record<string, string[]> = {
  Home: ['Hero', 'Stats', 'Features', 'Regions', 'Featured Homestays', 'YouTube Videos', 'Community Stories', 'Blog', 'Call to Action'],
  Homestays: ['Hero', 'Stats', 'Regions', 'Featured Homestays'],
  Experiences: ['Hero', 'Category Filter', 'Experiences List'],
  Packages: ['Hero', 'Packages Grid'],
  Booking: ['Header', 'Step Indicator', 'Booking Form', 'Pricing Breakdown', 'Summary/Confirmation'],
  About: ['Header', 'Intro'],
  Help: ['Header', 'Intro'],
  FAQ: ['Header', 'Intro'],
  Safety: ['Header', 'Intro'],
  Host: ['Header', 'Intro'],
  Terms: ['Header', 'Introduction', 'User Responsibilities', 'Booking & Payment', 'Cancellations & Refunds', 'Prohibited Activities', 'Limitation of Liability', 'Changes to Terms', 'Contact Information'],
  Profile: ['Tabs'],
  Community: ['Header', 'Intro'],
  Cancellation: ['Header', 'Intro'],
  Support: ['Header', 'Intro'],
  Privacy: ['Header', 'Intro'],
  Cookies: ['Header', 'Intro'],
  Footer: ['Contact', 'Links', 'Social', 'Trust Badges', 'Language Switcher', 'Currency Switcher']
};

const getSectionsForPage = (page: string) => pageSections[page] || [];

const allTypes = ['text', 'image', 'video'];
const allStatuses = ['active', 'draft', 'archived'];

const AdminCMSPage: React.FC = () => {
  const [content, setContent] = useState(initialContent);
  const [filter, setFilter] = useState({ page: '', section: '', type: '', status: '', search: '' });
  const [modal, setModal] = useState<{ mode: 'add' | 'edit' | 'preview' | null, item?: any }>({ mode: null });

  // Filtering logic
  const filtered = content.filter(item =>
    (!filter.page || item.page === filter.page) &&
    (!filter.section || item.section === filter.section) &&
    (!filter.type || item.type === filter.type) &&
    (!filter.status || item.status === filter.status) &&
    (!filter.search || (
      item.key.toLowerCase().includes(filter.search.toLowerCase()) ||
      item.value.toLowerCase().includes(filter.search.toLowerCase()) ||
      item.description.toLowerCase().includes(filter.search.toLowerCase())
    ))
  );

  // Add/Edit/Preview handlers
  const handleSave = (item: any) => {
    // If adding a new section, update pageSections
    if (item.section === '__new' && item.newSection) {
      if (!pageSections[item.page]) pageSections[item.page] = [];
      if (!pageSections[item.page].includes(item.newSection)) pageSections[item.page].push(item.newSection);
      item.section = item.newSection;
      delete item.newSection;
    }
    if (modal.mode === 'add') {
      setContent([...content, { ...item, id: Date.now(), updatedAt: new Date().toISOString().slice(0,10) }]);
    } else if (modal.mode === 'edit') {
      setContent(content.map(c => c.id === item.id ? { ...item, updatedAt: new Date().toISOString().slice(0,10) } : c));
    }
    setModal({ mode: null });
  };
  const handleDelete = (id: number) => {
    setContent(content.filter(c => c.id !== id));
  };

  // Modal form state
  const [form, setForm] = useState<any>({});
  React.useEffect(() => {
    if (modal.mode === 'edit' || modal.mode === 'add') {
      setForm(modal.item || { page: '', section: '', key: '', type: 'text', value: '', status: 'active', description: '' });
    }
  }, [modal]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-nepal-blue">Content Management</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModal({ mode: 'add' })} title="Add Content">
          <Plus className="h-4 w-4" /> Add Content
        </button>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select className="input-field" value={filter.page} onChange={e => setFilter(f => ({ ...f, page: e.target.value }))}>
              <option value="">All Pages</option>
              {allPages.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select className="input-field" value={filter.section} onChange={e => setFilter(f => ({ ...f, section: e.target.value }))}>
              <option value="">All Sections</option>
              {[...new Set(content.map(item => item.section))].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select className="input-field" value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
              <option value="">All Types</option>
              {allTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select className="input-field" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              {allStatuses.map(s => <option key={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <input
            className="input-field max-w-xs"
            placeholder="Search..."
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-4 py-2 text-left">Page</th>
                <th className="px-4 py-2 text-left">Section</th>
                <th className="px-4 py-2 text-left">Key</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Preview</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Updated</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No content found.</td></tr>
              )}
              {filtered.map(item => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="px-4 py-2 font-medium">{item.page}</td>
                  <td className="px-4 py-2">{item.section}</td>
                  <td className="px-4 py-2">{item.key}</td>
                  <td className="px-4 py-2">{typeIcon[item.type]}</td>
                  <td className="px-4 py-2">
                    {item.type === 'text' && <span className="truncate block max-w-xs" title={item.value}>{item.value}</span>}
                    {item.type === 'image' && <img src={item.value} alt={item.key} className="h-8 w-12 object-cover rounded shadow" />}
                    {item.type === 'video' && <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-nepal-blue underline">View Video</a>}
                  </td>
                  <td className="px-4 py-2">{statusBadge(item.status)}</td>
                  <td className="px-4 py-2">{item.updatedAt}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Preview" onClick={() => setModal({ mode: 'preview', item })}><Eye className="h-4 w-4" /></button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="Edit" onClick={() => setModal({ mode: 'edit', item })}><Edit className="h-4 w-4" /></button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-600" title="Delete" onClick={() => handleDelete(item.id)}><Trash className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add/Edit Modal */}
      <Dialog open={modal.mode === 'add' || modal.mode === 'edit'} onClose={() => setModal({ mode: null })} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-lg mx-auto z-10">
            <Dialog.Title className="text-lg font-bold mb-4 text-nepal-blue">{modal.mode === 'add' ? 'Add Content' : 'Edit Content'}</Dialog.Title>
            <form onSubmit={e => { e.preventDefault(); handleSave(form); }} className="space-y-4">
              <div className="flex gap-2">
                <select className="input-field" value={form.page} onChange={e => setForm(f => ({ ...f, page: e.target.value }))} required>
                  <option value="">Select Page</option>
                  {allPages.map(p => <option key={p}>{p}</option>)}
                </select>
                <select className="input-field" value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} required>
                  <option value="">Select Section</option>
                  {getSectionsForPage(form.page).map(s => <option key={s}>{s}</option>)}
                  <option value="__new">+ Add New Section</option>
                </select>
              </div>
              {form.section === '__new' && (
                <input className="input-field mt-2" placeholder="New Section Name" value={form.newSection || ''} onChange={e => setForm(f => ({ ...f, newSection: e.target.value }))} required />
              )}
              <input className="input-field" placeholder="Key (e.g. heroTitle)" value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} required />
              <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} required>
                {allTypes.map(t => <option key={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              {form.type === 'text' && (
                <textarea className="input-field" placeholder="Text content" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required rows={3} />
              )}
              {form.type === 'image' && (
                <input className="input-field" placeholder="Image URL" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required />
                // For real app, use file upload and preview
              )}
              {form.type === 'video' && (
                <input className="input-field" placeholder="Video URL (YouTube embed or mp4)" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required />
              )}
              <input className="input-field" placeholder="Description (where/why used)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} required>
                {allStatuses.map(s => <option key={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn-secondary" onClick={() => setModal({ mode: null })}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
      {/* Preview Modal */}
      <Dialog open={modal.mode === 'preview'} onClose={() => setModal({ mode: null })} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 w-full max-w-md mx-auto z-10">
            <Dialog.Title className="text-lg font-bold mb-4 text-nepal-blue">Preview Content</Dialog.Title>
            {modal.item && (
              <div className="space-y-4">
                <div className="text-xs text-gray-500">{modal.item.page} / {modal.item.section} / {modal.item.key}</div>
                <div className="mb-2">{modal.item.description}</div>
                {modal.item.type === 'text' && <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded text-gray-900 dark:text-gray-100">{modal.item.value}</div>}
                {modal.item.type === 'image' && <img src={modal.item.value} alt={modal.item.key} className="w-full rounded shadow" />}
                {modal.item.type === 'video' && <iframe src={modal.item.value} title="Video Preview" className="w-full aspect-video rounded shadow" allowFullScreen />}
                <div>{statusBadge(modal.item.status)}</div>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button className="btn-secondary" onClick={() => setModal({ mode: null })}>Close</button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminCMSPage; 