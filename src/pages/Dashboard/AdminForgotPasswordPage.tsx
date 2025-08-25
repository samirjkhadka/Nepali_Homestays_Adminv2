import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="admin-card max-w-md w-full">
        <h1 className="text-2xl font-bold text-primary-600 mb-6 text-center">Forgot Password</h1>
        {sent ? (
          <div className="text-success-600 text-center mb-4">Password reset link sent to your email (mock).</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="admin-input"
              required
            />
            <button type="submit" className="admin-button-primary w-full">Send Reset Link</button>
          </form>
        )}
        <div className="mt-4 text-center">
          <Link to="/admin/login" className="text-primary-600 underline text-sm">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPasswordPage; 