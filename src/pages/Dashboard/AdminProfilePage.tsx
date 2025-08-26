import React, { useEffect, useState } from "react";
import { Cross, Eye, EyeOff, SaveIcon } from "lucide-react";
import { apiFetch } from "../../services/api";
import { useAdminAuth } from "../../context/AdminAuthContext";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { CloseIcon } from "../../icons";

const AdminProfilePage: React.FC = () => {
  const { token } = useAdminAuth();
  const [profile, setProfile] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>({});
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch<{ data: { profile: any } }>(
          "/admin/profile",
          {},
          token || undefined
        );
        const profile = res.data.profile;
        const normalized = {
          first_name: profile.FullName || "",
          last_name: profile.last_name || "",
          email: profile.EmailAddress || "",
          phone: profile.MobileNumber || "",
          avatar: profile.avatar || profile.ProfileImage || "",
          profile_image_url: profile.ProfileImage || profile.avatar || "",
          role: profile.role || "",
        };
        setProfile(normalized);
        setForm(normalized);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    setSaveMsg("");
    setLoading(true);
    try {
      const updateFields: any = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        profile_image_url: form.avatar, // map avatar input to profile_image_url
        phone: form.phone,
      };
      const res = await apiFetch<{ data: { profile: any } }>(
        "/admin/profile",
        {
          method: "PUT",
          body: JSON.stringify(updateFields),
        },
        token || undefined
      );
      const updated = res.data.profile;
      const normalized = {
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        avatar: updated.avatar || updated.profile_image_url || "",
        profile_image_url: updated.profile_image_url || updated.avatar || "",
        role: updated.role || "",
      };
      setProfile(normalized);
      setForm(normalized);
      setEdit(false);
      setSaveMsg("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    setForm(profile);
    setEdit(false);
    setSaveMsg("");
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMsg("New passwords do not match.");
      return;
    }
    if (!passwordForm.current || !passwordForm.new) {
      setPasswordMsg("Please fill all fields.");
      return;
    }
    setPasswordMsg("Password changed (mock)!");
    setPasswordForm({ current: "", new: "", confirm: "" });
  };
  const toggleShow = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading)
    return <div className="text-center py-12 dark:text-gray-100">Loading profile...</div>;
  if (error)
    return <div className="text-center text-red-600 py-12">{error}</div>;

  return (
    <>
      <PageMeta title="Admin Profile" description="Admin Profile" />
      <PageBreadcrumb pageTitle="Admin Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-blue-600 dark:border-blue-400 text-gray-900 dark:text-gray-100"
                : "border-transparent text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === "password"
                ? "border-blue-600 dark:border-blue-400 text-gray-900 dark:text-gray-100"
                : "border-transparent text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
            onClick={() => setActiveTab("password")}
          >
            Change Password
          </button>
        </div>
        {activeTab === "profile" && profile && (
          <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
            <div className="justify-center w-20 h-20 bg-brand-500 rounded-full text-white font-semibold text-xl">
              <img
                src={profile.avatar || profile.ProfileImage}
                alt="avatar"
                className="w-16 h-16 rounded-full border object-cover border-gray-200 dark:border-gray-800 p-1"
              />
              <div className="text-center mt-2 ">
                <div className="block mb-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                  {profile.first_name} {profile.last_name}
                </div>
                <div className="block mb-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                  {profile.email}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="mb-4">
                <label className="block mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400 pt-1 mb-1">
                  First Name
                </label>
                <input
                  name="first_name"
                  value={edit ? form.first_name : profile.first_name}
                  onChange={handleChange}
                  className="text-sm font-medium text-gray-800 dark:text-white/90 pt-1"
                  disabled={!edit}
                />
              </div>
              <div>
                <label className="block mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400 pt-1 mb-1">
                  Last Name
                </label>
                <input
                  name="last_name"
                  value={edit ? form.last_name : profile.last_name}
                  onChange={handleChange}
                  className="text-sm font-medium text-gray-800 dark:text-white/90 pt-1"
                  disabled={!edit}
                />
              </div>
              <div>
                <label className="block mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400 pt-1 mb-1">Email</label>
                <input
                  name="email"
                  value={edit ? form.email : profile.email}
                  onChange={handleChange}
                  className="text-sm font-medium text-gray-800 dark:text-white/90 pt-1"
                  disabled={!edit}
                />
              </div>
              <div>
                <label className="block mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400 pt-1 mb-1">Phone</label>
                <input
                  name="phone"
                  value={edit ? form.phone : profile.phone || ""}
                  onChange={handleChange}
                  className="text-sm font-medium text-gray-800 dark:text-white/90 pt-1"
                  disabled={!edit}
                />
              </div>
              <div>
                <label className="block mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400 pt-1 mb-1">
                  Avatar URL
                </label>
                <input
                  name="avatar"
                  value={
                    edit
                      ? form.avatar
                      : profile.avatar || profile.profile_image_url || ""
                  }
                  onChange={handleChange}
                  className="text-sm font-medium text-gray-800 dark:text-white/90 pt-1"
                  disabled={!edit}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              {edit ? (
                <>
                  <Button className="btn-primary" startIcon={<SaveIcon />} onClick={handleSave}>
                    Save
                  </Button>
                  <Button className="btn-secondary" startIcon={<CloseIcon />} variant="outline"  onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <button
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                  onClick={() => setEdit(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
            {saveMsg && <div className="text-green-600 mt-4">{saveMsg}</div>}
          </div>
        )}
        {activeTab === "password" && (
          <div className="card p-6">
           
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400 pt-1 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    name="current"
                    value={passwordForm.current}
                    onChange={handlePasswordChange}
                    className="text-sm font-medium text-gray-800 dark:text-white/90 pt-2 dark:border-gray-800 border-2 rounded-lg w-full"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-nepal-blue"
                    onClick={() => toggleShow("current")}
                    tabIndex={-1}
                  >
                    {showPassword.current ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400 pt-1 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="new"
                    value={passwordForm.new}
                    onChange={handlePasswordChange}
                    className="text-sm font-medium text-gray-800 dark:text-white/90 pt-2 dark:border-gray-800 border-2 rounded-lg w-full"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-nepal-blue"
                    onClick={() => toggleShow("new")}
                    tabIndex={-1}
                  >
                    {showPassword.new ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400 pt-1 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirm"
                    value={passwordForm.confirm}
                    onChange={handlePasswordChange}
                    className="text-sm font-medium text-gray-800 dark:text-white/90 pt-2 dark:border-gray-800 border-2 rounded-lg w-full"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-nepal-blue"
                    onClick={() => toggleShow("confirm")}
                    tabIndex={-1}
                  >
                    {showPassword.confirm ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {passwordMsg && (
                <div className="mt-1 text-sm text-red-600">{passwordMsg}</div>
              )}
              <button type="submit" className="border border-gray-300 rounded-full px-4 py-2 dark:border-gray-700 dark:hover:bg-white/[0.03] dark:text-gray-400">
                Change Password
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminProfilePage;
