import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useUser } from "../context/UserContext";
import { useModal } from "../hooks/useModal";
import { Modal } from "../components/ui/modal";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import toast from "react-hot-toast";
import { apiClient } from "../services/api";

export default function UserProfiles() {
  const { user, setUser } = useUser();
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.name.split(' ')[0] || '',
    last_name: user?.name.split(' ').slice(1).join(' ') || '',
    email: user?.email || ''
  });

  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiClient.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name
      });
      
      // Update user in context
      const updatedUser = {
        ...user,
        name: `${response.first_name} ${response.last_name}`.trim(),
        email: response.email
      };
      
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
      closeModal();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading user data...</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="User Profile | SAS Admin"
        description="Manage your user profile and account settings"
      />
      <PageBreadcrumb pageTitle="Profile" />
      
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-6 p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
            <div className="flex items-center justify-center w-20 h-20 bg-brand-500 rounded-full text-white font-semibold text-xl">
              {getInitials(user.name)}
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {user.name}
              </h4>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                Role: {user.role}
              </p>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                  fill=""
                />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* Personal Information */}
          <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800">
            <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
              Personal Information
            </h4>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Full Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.name}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Email Address
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Role
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90 capitalize">
                  {user.role}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  User ID
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="px-2">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Profile
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Update your personal information.
            </p>
          </div>
          
          <form className="flex flex-col">
            <div className="space-y-5 px-2">
              <div>
                <Label>First Name</Label>
                <Input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email address cannot be changed
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-2 mt-6 justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
