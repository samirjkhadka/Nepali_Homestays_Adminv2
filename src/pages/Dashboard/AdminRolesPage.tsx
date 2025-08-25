import React, { useState } from 'react';
import { Edit, Save, X, Plus, Shield } from 'lucide-react';
import Tooltip from '../../components/Tooltip';

const systemPrivileges = [
  { key: 'manage_users', label: 'Manage Users' },
  { key: 'manage_listings', label: 'Manage Listings' },
  { key: 'manage_bookings', label: 'Manage Bookings' },
  { key: 'view_analytics', label: 'View Analytics' },
  { key: 'moderate_content', label: 'Moderate Content' },
  { key: 'site_settings', label: 'Site Settings' },
  { key: 'support_tickets', label: 'Support Tickets' },
];

const initialRoles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full access to all features',
    privileges: systemPrivileges.map(p => p.key),
    system: true,
  },
  {
    id: 2,
    name: 'Host',
    description: 'Can manage own listings and bookings',
    privileges: ['manage_listings', 'manage_bookings'],
    system: true,
  },
  {
    id: 3,
    name: 'Guest',
    description: 'Can book and review listings',
    privileges: [],
    system: true,
  },
];

const AdminRolesPage: React.FC = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrivileges, setEditPrivileges] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', privileges: [] as string[] });
  const [privileges, setPrivileges] = useState(systemPrivileges);
  const [newPrivilege, setNewPrivilege] = useState('');

  const handleEdit = (role: any) => {
    setEditingId(role.id);
    setEditPrivileges(role.privileges);
  };
  const handlePrivilegeChange = (priv: string) => {
    setEditPrivileges(prev => prev.includes(priv) ? prev.filter(p => p !== priv) : [...prev, priv]);
  };
  const handleSave = () => {
    setRoles(roles.map(r => r.id === editingId ? { ...r, privileges: editPrivileges } : r));
    setEditingId(null);
    setEditPrivileges([]);
  };
  const handleCancel = () => {
    setEditingId(null);
    setEditPrivileges([]);
  };
  const handleAddRole = () => {
    if (!newRole.name.trim()) return;
    setRoles([
      ...roles,
      {
        id: Math.max(...roles.map(r => r.id)) + 1,
        name: newRole.name,
        description: newRole.description,
        privileges: newRole.privileges,
        system: false,
      },
    ]);
    setShowAdd(false);
    setNewRole({ name: '', description: '', privileges: [] });
  };
  const handleNewPrivilegeChange = (priv: string) => {
    setNewRole(prev => ({ ...prev, privileges: prev.privileges.includes(priv) ? prev.privileges.filter(p => p !== priv) : [...prev.privileges, priv] }));
  };

  // Add privilege
  const handleAddPrivilege = () => {
    const key = newPrivilege.trim().toLowerCase().replace(/\s+/g, '_');
    if (!key || privileges.some(p => p.key === key)) return;
    setPrivileges([...privileges, { key, label: newPrivilege.trim() }]);
    setNewPrivilege('');
  };
  // Delete privilege
  const handleDeletePrivilege = (key: string) => {
    setPrivileges(privileges.filter(p => p.key !== key));
    setRoles(roles.map(r => ({ ...r, privileges: r.privileges.filter(p => p !== key) })));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-primary-600 flex items-center gap-2"><Shield className="h-6 w-6" /> Roles & Privileges</h1>
      <div className="admin-card overflow-x-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">Privileges</h2>
          <div className="flex flex-wrap gap-2 items-center">
            {privileges.map(priv => (
              <span key={priv.key} className="bg-primary-100 text-primary-600 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                {priv.label}
                {!systemPrivileges.some(sp => sp.key === priv.key) && (
                  <Tooltip content="Delete Privilege">
                    <button className="ml-1 text-red-500 hover:text-red-700" onClick={() => handleDeletePrivilege(priv.key)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Tooltip>
                )}
              </span>
            ))}
            <input
                              className="admin-input w-40 text-xs ml-2"
              placeholder="Add privilege"
              value={newPrivilege}
              onChange={e => setNewPrivilege(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddPrivilege(); }}
            />
            <Tooltip content="Add Privilege">
              <button className="admin-button-primary px-2 py-1 text-xs rounded-lg flex items-center" onClick={handleAddPrivilege} disabled={!newPrivilege.trim()}>
                <Plus className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>
        </div>
        <table className="w-full min-w-[700px] text-xs rounded-xl overflow-hidden">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Privileges</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id} className="border-b last:border-b-0 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                <td className="py-3 px-4 font-semibold">{role.name}</td>
                <td className="py-3 px-4 text-gray-600">{role.description}</td>
                <td className="py-3 px-4">
                  {editingId === role.id ? (
                    <div className="flex flex-wrap gap-2">
                      {privileges.map(priv => (
                        <label key={priv.key} className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={editPrivileges.includes(priv.key)}
                            onChange={() => handlePrivilegeChange(priv.key)}
                            className="accent-primary-600"
                          />
                          <span>{priv.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {privileges.filter(p => role.privileges.includes(p.key)).map(p => (
                        <span key={p.key} className="bg-primary-100 text-primary-600 px-2 py-1 rounded text-xs font-medium">{p.label}</span>
                      ))}
                      {role.privileges.length === 0 && <span className="text-gray-400">No privileges</span>}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 flex gap-2">
                  {editingId === role.id ? (
                    <>
                      <Tooltip content="Save">
                        <button className="admin-button-primary px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={handleSave}><Save className="h-4 w-4" /></button>
                      </Tooltip>
                      <Tooltip content="Cancel">
                        <button className="admin-button-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={handleCancel}><X className="h-4 w-4" /></button>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      {!role.system && (
                        <Tooltip content="Edit Privileges">
                          <button className="admin-button-secondary px-2 py-1 text-xs rounded-lg flex items-center justify-center" onClick={() => handleEdit(role)}><Edit className="h-4 w-4" /></button>
                        </Tooltip>
                      )}
                      {role.system && <span className="text-gray-400 text-xs">System Role</span>}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 flex justify-end">
          <Tooltip content="Add Role">
            <button className="admin-button-primary flex items-center gap-2 px-4 py-2 rounded-lg text-xs" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" /> Add Role
            </button>
          </Tooltip>
        </div>
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-primary-600 flex items-center gap-2"><Plus className="h-5 w-5" /> Add New Role</h2>
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1">Role Name</label>
              <input
                className="admin-input w-full"
                value={newRole.name}
                onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="Enter role name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1">Description</label>
              <input
                className="admin-input w-full"
                value={newRole.description}
                onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1">Privileges</label>
              <div className="flex flex-wrap gap-2">
                {privileges.map(priv => (
                  <label key={priv.key} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={newRole.privileges.includes(priv.key)}
                      onChange={() => handleNewPrivilegeChange(priv.key)}
                      className="accent-primary-600"
                    />
                    <span>{priv.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button className="admin-button-secondary px-4 py-2 rounded-lg text-xs" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="admin-button-primary px-4 py-2 rounded-lg text-xs" onClick={handleAddRole} disabled={!newRole.name.trim()}>Add Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRolesPage; 