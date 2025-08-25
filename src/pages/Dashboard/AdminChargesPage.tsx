import React, { useState } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
//import AdminSidebar from '../../components/';
//import AdminTopbar from '../components/AdminTopbar';
import { mockListings } from '../../data/mockData';

// Mock data for charges/discounts
const initialRules = [
  {
    id: '1',
    label: 'Pokhara Lake House Discount',
    type: 'discount',
    scope: 'homestay',
    target: 'Pokhara Lake House',
    minPrice: 1000,
    maxPrice: 5000,
    mode: 'percent',
    value: 10,
    status: 'active',
  },
  {
    id: '2',
    label: 'Bagmati Service Charge',
    type: 'charge',
    scope: 'province',
    target: 'Bagmati',
    minPrice: 0,
    maxPrice: 10000,
    mode: 'flat',
    value: 200,
    status: 'active',
  },
];

const scopes = [
  { value: 'homestay', label: 'Homestay' },
  { value: 'region', label: 'Region' },
  { value: 'province', label: 'Province' },
  { value: 'district', label: 'District' },
];
const types = [
  { value: 'charge', label: 'Charge' },
  { value: 'discount', label: 'Discount' },
];
const modes = [
  { value: 'percent', label: 'Percent (%)' },
  { value: 'flat', label: 'Flat (NPR)' },
];

const AdminChargesPage: React.FC = () => {
  const [rules, setRules] = useState(initialRules);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterScope, setFilterScope] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const openAddModal = () => {
    setEditingRule(null);
    setForm({ type: 'charge', scope: 'homestay', mode: 'percent', status: 'active' });
    setShowModal(true);
  };
  const openEditModal = (rule: any) => {
    setEditingRule(rule);
    setForm(rule);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingRule(null);
    setForm({});
  };
  const getTargetOptions = () => {
    if (form.scope === 'homestay') {
      // All homestay titles
      return Array.from(new Set(mockListings.map(l => l.title)));
    }
    if (form.scope === 'province') {
      // All provinces
      return Array.from(new Set(mockListings.map(l => l.province)));
    }
    if (form.scope === 'region' || form.scope === 'district') {
      // All locations (region/district)
      return Array.from(new Set(mockListings.map(l => l.location)));
    }
    return [];
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Reset target if scope changes
    if (e.target.name === 'scope') {
      setForm({ ...form, scope: e.target.value, target: '' });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...form, id: editingRule.id } : r));
    } else {
      setRules([...rules, { ...form, id: Date.now().toString() }]);
    }
    closeModal();
  };
  const handleDelete = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const filteredRules = rules.filter(rule => {
    return (
      (!filterType || rule.type === filterType) &&
      (!filterScope || rule.scope === filterScope) &&
      (!filterStatus || rule.status === filterStatus) &&
      (
        rule.label.toLowerCase().includes(search.toLowerCase()) ||
        rule.target.toLowerCase().includes(search.toLowerCase())
      )
    );
  });

  return (
    <div className="text-sm font-sans min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* <AdminSidebar /> */}
      <div className="flex-1 flex flex-col">
        {/* <AdminTopbar /> */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-nepal-blue font-heading">Charges & Discounts</h1>
            <button className="btn-primary flex items-center gap-2" onClick={openAddModal}>
              <Plus className="h-5 w-5" /> Add Rule
            </button>
          </div>
          <div className="card p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <input type="text" placeholder="Search label or target..." value={search} onChange={e => setSearch(e.target.value)} className="input w-56" />
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input">
                <option value="">All Types</option>
                {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select value={filterScope} onChange={e => setFilterScope(e.target.value)} className="input">
                <option value="">All Scopes</option>
                {scopes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="card p-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2 text-left">Label</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Scope</th>
                  <th className="p-2 text-left">Target</th>
                  <th className="p-2 text-left">Price Slab</th>
                  <th className="p-2 text-left">Mode</th>
                  <th className="p-2 text-left">Value</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map(rule => (
                  <tr key={rule.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="p-2">{rule.label}</td>
                    <td className="p-2">{rule.type === 'charge' ? <span className="text-red-600">Charge</span> : <span className="text-green-600">Discount</span>}</td>
                    <td className="p-2">{scopes.find(s => s.value === rule.scope)?.label}</td>
                    <td className="p-2">{rule.target}</td>
                    <td className="p-2">NPR {rule.minPrice} - {rule.maxPrice}</td>
                    <td className="p-2">{modes.find(m => m.value === rule.mode)?.label}</td>
                    <td className="p-2">{rule.mode === 'percent' ? `${rule.value}%` : `NPR ${rule.value}`}</td>
                    <td className="p-2">{rule.status === 'active' ? <CheckCircle className="inline h-5 w-5 text-green-500" /> : <XCircle className="inline h-5 w-5 text-gray-400" />}</td>
                    <td className="p-2 flex gap-2">
                      <button className="btn-icon" title="Edit" onClick={() => openEditModal(rule)}><Edit className="h-4 w-4" /></button>
                      <button className="btn-icon" title="Delete" onClick={() => handleDelete(rule.id)}><Trash2 className="h-4 w-4 text-red-500" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Modal for Add/Edit Rule */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4 text-nepal-blue">{editingRule ? 'Edit Rule' : 'Add Rule'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Label</label>
                    <input name="label" value={form.label || ''} onChange={handleChange} className="input w-full" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Type</label>
                      <select name="type" value={form.type} onChange={handleChange} className="input w-full">
                        {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Scope</label>
                      <select name="scope" value={form.scope} onChange={handleChange} className="input w-full">
                        {scopes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Target {form.scope ? `(${scopes.find(s => s.value === form.scope)?.label})` : ''}</label>
                    <select name="target" value={form.target || ''} onChange={handleChange} className="input w-full" required>
                      <option value="">Select...</option>
                      {getTargetOptions().map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Min Price (NPR)</label>
                      <input name="minPrice" type="number" value={form.minPrice || ''} onChange={handleChange} className="input w-full" required min={0} />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Max Price (NPR)</label>
                      <input name="maxPrice" type="number" value={form.maxPrice || ''} onChange={handleChange} className="input w-full" required min={0} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Mode</label>
                      <select name="mode" value={form.mode} onChange={handleChange} className="input w-full">
                        {modes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Value</label>
                      <input name="value" type="number" value={form.value || ''} onChange={handleChange} className="input w-full" required min={0} />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className="input w-full">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn-primary">{editingRule ? 'Update' : 'Add'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChargesPage; 