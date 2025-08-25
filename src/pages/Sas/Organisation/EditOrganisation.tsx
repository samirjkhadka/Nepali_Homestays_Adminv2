import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { Save, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { useOrganisations } from "../../../hooks/useApi";
import { apiClient } from "../../../services/api";
import type { Organisation, UpdateOrganisationRequest } from "../../../services/api";

interface ValidationErrors {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  website?: string;
  industry?: string;
  founded_year?: string;
  employee_count?: string;
}

const EditOrganisation = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateOrganisation, deleteOrganisation, loading } = useOrganisations();
  
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState<UpdateOrganisationRequest>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    website: "",
    description: "",
    industry: "",
    founded_year: undefined,
    employee_count: undefined
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Load organisation data
  useEffect(() => {
    if (id) {
      loadOrganisation();
    }
  }, [id]);

  const loadOrganisation = async () => {
    try {
      setLoadingData(true);
      const orgData = await apiClient.getOrganisation(parseInt(id!));
      setOrganisation(orgData);
      setFormData({
        name: orgData.name,
        email: orgData.email,
        phone: orgData.phone,
        address: orgData.address,
        city: orgData.city,
        state: orgData.state,
        country: orgData.country,
        postal_code: orgData.postal_code,
        website: orgData.website || "",
        description: orgData.description || "",
        industry: orgData.industry || "",
        founded_year: orgData.founded_year,
        employee_count: orgData.employee_count
      });
    } catch (error) {
      console.error('Failed to load organisation:', error);
      toast.error('Failed to load organisation data');
      navigate("/organisationList");
    } finally {
      setLoadingData(false);
    }
  };

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  };

  const validateUrl = (url: string) => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateYear = (year: string) => {
    if (!year) return true; // Optional field
    const yearNum = parseInt(year);
    return yearNum >= 1800 && yearNum <= new Date().getFullYear();
  };

  const validateNumber = (num: string) => {
    if (!num) return true; // Optional field
    const numValue = parseInt(num);
    return numValue > 0;
  };

  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = "Organisation name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Organisation email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Organisation phone is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Organisation address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = "Postal code is required";
    }

    // Optional fields validation
    if (formData.website && !validateUrl(formData.website)) {
      newErrors.website = "Please enter a valid URL";
    }

    if (formData.founded_year && !validateYear(formData.founded_year.toString())) {
      newErrors.founded_year = "Please enter a valid year between 1800 and current year";
    }

    if (formData.employee_count && !validateNumber(formData.employee_count.toString())) {
      newErrors.employee_count = "Please enter a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    navigate("/organisationList");
  };

  const handleInputChange = (field: string, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      // Convert string values to numbers where needed
      const submitData = {
        ...formData,
        founded_year: formData.founded_year ? parseInt(formData.founded_year.toString()) : undefined,
        employee_count: formData.employee_count ? parseInt(formData.employee_count.toString()) : undefined
      };

      await updateOrganisation(parseInt(id!), submitData);
      navigate("/organisationList");
    } catch (error) {
      console.error('Failed to update organisation:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this organisation? This action cannot be undone.")) {
      try {
        await deleteOrganisation(parseInt(id!));
        navigate("/organisationList");
      } catch (error) {
        console.error('Failed to delete organisation:', error);
      }
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading organisation data...</span>
      </div>
    );
  }

  if (!organisation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Organisation not found</h2>
          <p className="text-gray-600 mt-2">The organisation you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Organisations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <PageBreadcrumb pageTitle="Edit Organisation" />
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Organisation List
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4" />
          Delete Organisation
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Basic Information
            </h3>
            <div>
              <Label htmlFor="name">Organisation Name *</Label>
              <Input 
                type="text" 
                id="name" 
                value={formData.name} 
                onChange={e => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                placeholder="Enter organisation name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input 
                type="email" 
                id="email" 
                value={formData.email} 
                onChange={e => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                type="tel" 
                id="phone" 
                value={formData.phone} 
                onChange={e => handleInputChange("phone", e.target.value)}
                className={errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input 
                type="url" 
                id="website" 
                value={formData.website || ""} 
                onChange={e => handleInputChange("website", e.target.value)}
                className={errors.website ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
              )}
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input 
                type="text" 
                id="industry" 
                value={formData.industry || ""} 
                onChange={e => handleInputChange("industry", e.target.value)}
                placeholder="Enter industry"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Address Information
            </h3>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input 
                type="text" 
                id="address" 
                value={formData.address} 
                onChange={e => handleInputChange("address", e.target.value)}
                className={errors.address ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                placeholder="Enter full address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input 
                  type="text" 
                  id="city" 
                  value={formData.city} 
                  onChange={e => handleInputChange("city", e.target.value)}
                  className={errors.city ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input 
                  type="text" 
                  id="state" 
                  value={formData.state} 
                  onChange={e => handleInputChange("state", e.target.value)}
                  className={errors.state ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input 
                  type="text" 
                  id="country" 
                  value={formData.country} 
                  onChange={e => handleInputChange("country", e.target.value)}
                  className={errors.country ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  placeholder="Enter country"
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                )}
              </div>
              <div>
                <Label htmlFor="postal_code">Postal Code *</Label>
                <Input 
                  type="text" 
                  id="postal_code" 
                  value={formData.postal_code} 
                  onChange={e => handleInputChange("postal_code", e.target.value)}
                  className={errors.postal_code ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  placeholder="Enter postal code"
                />
                {errors.postal_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description || ""}
                onChange={e => handleInputChange("description", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter organisation description"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="founded_year">Founded Year</Label>
                <Input 
                  type="number" 
                  id="founded_year" 
                  value={formData.founded_year || ""} 
                  onChange={e => handleInputChange("founded_year", e.target.value)}
                  className={errors.founded_year ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  placeholder="Enter founded year"
                  min="1800"
                  max={new Date().getFullYear()}
                />
                {errors.founded_year && (
                  <p className="mt-1 text-sm text-red-600">{errors.founded_year}</p>
                )}
              </div>
              <div>
                <Label htmlFor="employee_count">Employee Count</Label>
                <Input 
                  type="number" 
                  id="employee_count" 
                  value={formData.employee_count || ""} 
                  onChange={e => handleInputChange("employee_count", e.target.value)}
                  className={errors.employee_count ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  placeholder="Enter employee count"
                  min="1"
                />
                {errors.employee_count && (
                  <p className="mt-1 text-sm text-red-600">{errors.employee_count}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Organisation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOrganisation; 