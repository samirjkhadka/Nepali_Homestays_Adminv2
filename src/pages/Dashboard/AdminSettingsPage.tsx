import React, { useState } from 'react';

const initialSettings = {
  siteName: 'Nepali Homestays',
  supportEmail: 'support@nepalihomestay.com',
  paymentMethod: 'Bank Transfer',
};
const paymentOptions = ['Bank Transfer', 'eSewa', 'Khalti', 'PayPal'];

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = () => {
    setSettings(form);
    setEdit(false);
  };
  const handleCancel = () => {
    setForm(settings);
    setEdit(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-nepal-blue">Site Settings</h1>
      <div className="card p-6 max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Site Name</label>
            <input
              name="siteName"
              value={edit ? form.siteName : settings.siteName}
              onChange={handleChange}
              className="input-field w-full"
              disabled={!edit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Support Email</label>
            <input
              name="supportEmail"
              value={edit ? form.supportEmail : settings.supportEmail}
              onChange={handleChange}
              className="input-field w-full"
              disabled={!edit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select
              name="paymentMethod"
              value={edit ? form.paymentMethod : settings.paymentMethod}
              onChange={handleChange}
              className="input-field w-full"
              disabled={!edit}
            >
              {paymentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          {edit ? (
            <>
              <button className="btn-primary" onClick={handleSave}>Save</button>
              <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <button className="btn-secondary" onClick={() => setEdit(true)}>Edit Settings</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage; 