import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { Plus, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker from "../../../components/form/date-picker";
import { useEmployees, useOrganisations } from "../../../hooks/useApi";
import type { CreateEmployeeRequest, Organisation } from "../../../services/api";

interface ValidationErrors {
  [key: string]: string | undefined;
}

const AddEmployee = () => {
  const navigate = useNavigate();
  const { createEmployee, loading } = useEmployees();
  const { fetchOrganisations, loading: loadingOrgs } = useOrganisations();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    hire_date: "",
    organisation_id: 0,
    department: "",
    position: "",
    salary: 0,
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    status: "active"
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Load organisations on component mount
  useEffect(() => {
    loadOrganisations();
  }, []);

  const loadOrganisations = async () => {
    try {
      const result = await fetchOrganisations();
      setOrganisations(result.data);
    } catch (error) {
      console.error('Failed to load organisations:', error);
    }
  };

  const validate = () => {
    const newErrors: ValidationErrors = {};
    
    // Required fields validation
    if (!formData.first_name) newErrors.first_name = "First name is required.";
    if (!formData.last_name) newErrors.last_name = "Last name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.email = "Invalid email format.";
    
    if (!formData.phone) newErrors.phone = "Phone number is required.";
    else if (!/^\+?[0-9\s\-()]{7,}$/.test(formData.phone)) newErrors.phone = "Invalid phone number.";
    
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required.";
    if (!formData.hire_date) newErrors.hire_date = "Hire date is required.";
    if (!formData.organisation_id) newErrors.organisation_id = "Organisation is required.";
    if (!formData.department) newErrors.department = "Department is required.";
    if (!formData.position) newErrors.position = "Position is required.";
    if (!formData.salary || formData.salary <= 0) newErrors.salary = "Salary is required and must be greater than 0.";
    if (!formData.address) newErrors.address = "Address is required.";
    if (!formData.city) newErrors.city = "City is required.";
    if (!formData.state) newErrors.state = "State is required.";
    if (!formData.country) newErrors.country = "Country is required.";
    if (!formData.postal_code) newErrors.postal_code = "Postal code is required.";
    if (!formData.emergency_contact_name) newErrors.emergency_contact_name = "Emergency contact name is required.";
    if (!formData.emergency_contact_phone) newErrors.emergency_contact_phone = "Emergency contact phone is required.";
    if (!formData.emergency_contact_relationship) newErrors.emergency_contact_relationship = "Relationship is required.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    navigate("/employee");
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    try {
      // Convert string values to numbers where needed
      const submitData = {
        ...formData,
        salary: parseFloat(formData.salary.toString()),
        organisation_id: parseInt(formData.organisation_id.toString())
      };

      await createEmployee(submitData);
      navigate("/employee");
    } catch (error) {
      console.error('Failed to create employee:', error);
    }
  };

  const departmentOptions = [
    { value: "engineering", label: "Engineering" },
    { value: "marketing", label: "Marketing" },
    { value: "finance", label: "Finance" },
    { value: "hr", label: "Human Resources" },
    { value: "sales", label: "Sales" },
    { value: "operations", label: "Operations" }
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "terminated", label: "Terminated" }
  ];

  const relationshipOptions = [
    { value: "spouse", label: "Spouse" },
    { value: "parent", label: "Parent" },
    { value: "sibling", label: "Sibling" },
    { value: "friend", label: "Friend" },
    { value: "other", label: "Other" }
  ];

  if (loadingOrgs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading organisations...</span>
      </div>
    );
  }

  return (
    <div className="">
      <PageBreadcrumb pageTitle="Add Employee" />
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employee List
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  type="text" 
                  id="firstName" 
                  value={formData.first_name} 
                  onChange={e => handleInputChange("first_name", e.target.value)}
                  className={errors.first_name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  type="text" 
                  id="lastName" 
                  value={formData.last_name} 
                  onChange={e => handleInputChange("last_name", e.target.value)}
                  className={errors.last_name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <DatePicker
                  id="dateOfBirth"
                  defaultDate={formData.date_of_birth}
                  onChange={([date]) => handleInputChange("date_of_birth", date ? date.toISOString().slice(0, 10) : "")}
                  className={errors.date_of_birth ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
                )}
              </div>
              <div>
                <Label htmlFor="hireDate">Hire Date *</Label>
                <DatePicker
                  id="hireDate"
                  defaultDate={formData.hire_date}
                  onChange={([date]) => handleInputChange("hire_date", date ? date.toISOString().slice(0, 10) : "")}
                  className={errors.hire_date ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.hire_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.hire_date}</p>
                )}
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Employment Information
            </h3>
            <div>
              <Label htmlFor="organisationId">Organisation *</Label>
              <Select
                id="organisationId"
                value={formData.organisation_id || ""}
                onChange={value => handleInputChange("organisation_id", value)}
                options={organisations.map(org => ({ value: org.id.toString(), label: org.name }))}
                className={errors.organisation_id ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.organisation_id && (
                <p className="mt-1 text-sm text-red-600">{errors.organisation_id}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  id="department"
                  value={formData.department}
                  onChange={value => handleInputChange("department", value)}
                  options={departmentOptions}
                  className={errors.department ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>
              <div>
                <Label htmlFor="position">Position *</Label>
                <Input 
                  type="text" 
                  id="position" 
                  value={formData.position} 
                  onChange={e => handleInputChange("position", e.target.value)}
                  className={errors.position ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  placeholder="Enter position"
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salary">Salary *</Label>
                <Input 
                  type="number" 
                  id="salary" 
                  value={formData.salary || ""} 
                  onChange={e => handleInputChange("salary", e.target.value)}
                  className={errors.salary ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  placeholder="Enter salary"
                  min="0"
                  step="0.01"
                />
                {errors.salary && (
                  <p className="mt-1 text-sm text-red-600">{errors.salary}</p>
                )}
              </div>
              <div>
                <Label htmlFor="status">Employment Status *</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={value => handleInputChange("status", value)}
                  options={statusOptions}
                  className={errors.status ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
              </div>
            </div>
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
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input 
                type="text" 
                id="postalCode" 
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

        {/* Emergency Contact Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Emergency Contact Information
          </h3>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
              <Label htmlFor="emergencyName">Emergency Contact Name *</Label>
              <Input 
                type="text" 
                id="emergencyName" 
                value={formData.emergency_contact_name || ""} 
                onChange={e => handleInputChange("emergency_contact_name", e.target.value)}
                className={errors.emergency_contact_name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                placeholder="Enter emergency contact name"
              />
              {errors.emergency_contact_name && (
                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
              <Input 
                type="tel" 
                id="emergencyPhone" 
                value={formData.emergency_contact_phone || ""} 
                onChange={e => handleInputChange("emergency_contact_phone", e.target.value)}
                className={errors.emergency_contact_phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                placeholder="Enter emergency contact phone"
              />
              {errors.emergency_contact_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_phone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="relationship">Relationship *</Label>
              <Select
                id="relationship"
                value={formData.emergency_contact_relationship || ""}
                onChange={value => handleInputChange("emergency_contact_relationship", value)}
                options={relationshipOptions}
                className={errors.emergency_contact_relationship ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.emergency_contact_relationship && (
                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_relationship}</p>
              )}
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
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Employee
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;