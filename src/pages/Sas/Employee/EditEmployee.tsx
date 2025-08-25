import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { Save, ArrowLeft, Trash2, Plus, Loader2 } from 'lucide-react';
import DatePicker from "../../../components/form/date-picker";
import { useEmployees, useOrganisations } from "../../../hooks/useApi";
import { apiClient } from "../../../services/api";
import type { Employee, CreateEmployeeRequest, Organisation } from "../../../services/api";

interface Increment {
  id: string;
  date: string;
  previousSalary: number;
  newSalary: number;
  reason: string;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

const EditEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateEmployee, deleteEmployee, loading } = useEmployees();
  const { fetchOrganisations, loading: loadingOrgs } = useOrganisations();
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  
  // Form state
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
  const [increments, setIncrements] = useState<Increment[]>([]);
  const [newIncrement, setNewIncrement] = useState({
    date: "",
    previousSalary: "",
    newSalary: "",
    reason: ""
  });

  const departmentOptions = [
    { value: "engineering", label: "Engineering" },
    { value: "marketing", label: "Marketing" },
    { value: "finance", label: "Finance" },
    { value: "hr", label: "Human Resources" },
    { value: "sales", label: "Sales" },
    { value: "operations", label: "Operations" }
  ];

  const statusOptions = [
    { value: "resigned", label: "Resigned" },
    { value: "terminated", label: "Terminated" },
    { value: "unpaid-leave", label: "Unpaid Leave" }
  ];

  const relationshipOptions = [
    { value: "spouse", label: "Spouse" },
    { value: "parent", label: "Parent" },
    { value: "sibling", label: "Sibling" },
    { value: "friend", label: "Friend" },
    { value: "other", label: "Other" }
  ];

  const maritalStatusOptions = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" }
  ];

  const citTypeOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "manual", label: "Manual" }
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" }
  ];

  // Load employee and organisations on component mount
  useEffect(() => {
    if (id) {
      loadEmployee();
      loadOrganisations();
    }
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoadingEmployee(true);
      const employeeData = await apiClient.getEmployee(parseInt(id!));
      setEmployee(employeeData);
      
      // Populate form data
      setFormData({
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        email: employeeData.email,
        phone: employeeData.phone,
        date_of_birth: employeeData.date_of_birth,
        hire_date: employeeData.hire_date,
        organisation_id: employeeData.organisation_id,
        department: employeeData.department,
        position: employeeData.position,
        salary: employeeData.salary,
        address: employeeData.address,
        city: employeeData.city,
        state: employeeData.state,
        country: employeeData.country,
        postal_code: employeeData.postal_code,
        emergency_contact_name: employeeData.emergency_contact_name || "",
        emergency_contact_phone: employeeData.emergency_contact_phone || "",
        emergency_contact_relationship: employeeData.emergency_contact_relationship || "",
        status: employeeData.status
      });
    } catch (error) {
      console.error('Failed to load employee:', error);
      toast.error('Failed to load employee details');
    } finally {
      setLoadingEmployee(false);
    }
  };

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

      await updateEmployee(parseInt(id!), submitData);
      navigate("/employee");
    } catch (error) {
      console.error('Failed to update employee:', error);
    }
  };

  const handleDelete = async () => {
    if (!employee) return;
    
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    if (window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      try {
        await deleteEmployee(employee.id);
        navigate("/employee");
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const addIncrement = () => {
    if (!newIncrement.date || !newIncrement.previousSalary || !newIncrement.newSalary || !newIncrement.reason) {
      toast.error("Please fill in all increment fields");
      return;
    }

    if (parseFloat(newIncrement.newSalary) <= parseFloat(newIncrement.previousSalary)) {
      toast.error("New salary must be greater than previous salary");
      return;
    }

    const increment: Increment = {
      id: Date.now().toString(),
      date: newIncrement.date,
      previousSalary: parseFloat(newIncrement.previousSalary),
      newSalary: parseFloat(newIncrement.newSalary),
      reason: newIncrement.reason
    };
    
    setIncrements(prev => [...prev, increment]);
    setNewIncrement({
      date: "",
      previousSalary: "",
      newSalary: "",
      reason: ""
    });
    
    toast.success("Salary increment added successfully!");
  };

  const removeIncrement = (incrementId: string) => {
    setIncrements(prev => prev.filter(inc => inc.id !== incrementId));
    toast.success("Salary increment removed successfully!");
  };

  return (
    <div className="">
      <PageBreadcrumb pageTitle="Edit Employee" />
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employee List
        </button>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
          Delete Employee
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Personal Information
            </h3>
            
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input 
                type="text" 
                id="first_name" 
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                className={errors.first_name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input 
                type="text" 
                id="last_name" 
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className={errors.last_name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                type="email" 
                id="email" 
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                type="tel" 
                id="phone" 
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <DatePicker
                id="date_of_birth"
                defaultDate={formData.date_of_birth}
                onChange={([date]) => handleInputChange("date_of_birth", date ? date.toISOString().slice(0, 10) : "")}
                placeholder="Select date"
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                options={genderOptions}
                placeholder="Select Gender"
                defaultValue={formData.gender}
                onChange={value => handleInputChange("gender", value)}
                className={errors.gender ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input 
                type="text" 
                id="address" 
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={errors.address ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select
                options={maritalStatusOptions}
                placeholder="Select Marital Status"
                defaultValue={formData.maritalStatus}
                onChange={value => handleInputChange("maritalStatus", value)}
                className={errors.maritalStatus ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.maritalStatus && (
                <p className="mt-1 text-sm text-red-600">{errors.maritalStatus}</p>
              )}
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Employment Information
            </h3>
            
            <div>
              <Label htmlFor="organisation_id">Organisation</Label>
              <Select
                options={organisations.map(org => ({ value: org.id.toString(), label: org.name }))}
                placeholder="Select Organisation"
                defaultValue={formData.organisation_id.toString()}
                onChange={(value) => handleInputChange("organisation_id", parseInt(value))}
              />
              {errors.organisation_id && <div className="text-red-500 text-xs mt-1">{errors.organisation_id}</div>}
            </div>
            
            <div>
              <Label htmlFor="department">Department</Label>
              <Select 
                options={departmentOptions}
                placeholder="Select Department"
                defaultValue={formData.department}
                onChange={(value) => handleInputChange("department", value)}
                className={errors.department ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="position">Position/Title</Label>
              <Input 
                type="text" 
                id="position" 
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                className={errors.position ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="hire_date">Hire Date</Label>
              <DatePicker
                id="hire_date"
                defaultDate={formData.hire_date}
                onChange={([date]) => handleInputChange("hire_date", date ? date.toISOString().slice(0, 10) : "")}
                placeholder="Select date"
              />
              {errors.hire_date && (
                <p className="mt-1 text-sm text-red-600">{errors.hire_date}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="salary">Current Salary</Label>
              <Input 
                type="number" 
                id="salary" 
                min="0" 
                step={0.01} 
                value={formData.salary}
                onChange={(e) => handleInputChange("salary", e.target.value)}
                className={errors.salary ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.salary && (
                <p className="mt-1 text-sm text-red-600">{errors.salary}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="citType">CIT</Label>
              <Select
                options={citTypeOptions}
                placeholder="Select CIT Option"
                defaultValue={formData.citType}
                onChange={value => handleInputChange("citType", value)}
                className={errors.citType ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.citType && <p className="mt-1 text-sm text-red-600">{errors.citType}</p>}
              {formData.citType === "manual" && (
                <div className="mt-2">
                  <Label htmlFor="citAmount">CIT Amount (Manual)</Label>
                  <Input
                    type="number"
                    id="citAmount"
                    min="0"
                    step={0.01}
                    value={formData.citAmount}
                    onChange={e => handleInputChange("citAmount", e.target.value)}
                    className={errors.citAmount ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.citAmount && <p className="mt-1 text-sm text-red-600">{errors.citAmount}</p>}
                </div>
              )}
              {(formData.citType === "yes" || formData.citType === "no") && formData.salary && (
                <div className="mt-2">
                  <Label>CIT Amount (Calculated)</Label>
                  <div className="p-2 bg-gray-100 rounded text-gray-700">
                    {formData.citType === "yes"
                      ? `Calculated: $${(parseFloat(formData.salary) * 0.1).toFixed(2)}`
                      : "Calculated: $0.00"}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="statusChangeDate">Employment Status Change Date</Label>
              <DatePicker
                id="statusChangeDate"
                defaultDate={formData.statusChangeDate}
                onChange={([date]) => handleInputChange("statusChangeDate", date ? date.toISOString().slice(0, 10) : "")}
                placeholder="Select date"
              />
              {errors.statusChangeDate && <p className="mt-1 text-sm text-red-600">{errors.statusChangeDate}</p>}
            </div>
            
            <div>
              <Label htmlFor="status">Employment Status</Label>
              <Select 
                options={statusOptions}
                placeholder="Select Status"
                defaultValue={formData.status}
                onChange={value => handleInputChange("status", value)}
                className={errors.status ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Emergency Contact
          </h3>
          
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
              <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
              <Input 
                type="text" 
                id="emergency_contact_name" 
                value={formData.emergency_contact_name}
                onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                className={errors.emergency_contact_name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.emergency_contact_name && (
                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_name}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
              <Input 
                type="tel" 
                id="emergency_contact_phone" 
                value={formData.emergency_contact_phone}
                onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                className={errors.emergency_contact_phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.emergency_contact_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_phone}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="emergency_contact_relationship">Relationship</Label>
              <Select 
                options={relationshipOptions}
                placeholder="Select Relationship"
                defaultValue={formData.emergency_contact_relationship}
                onChange={(value) => handleInputChange("emergency_contact_relationship", value)}
                className={errors.emergency_contact_relationship ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.emergency_contact_relationship && (
                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_relationship}</p>
              )}
            </div>
          </div>
        </div>

        {/* Salary Increments */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Salary Increments History
          </h3>
          
          {/* Existing Increments */}
          {increments.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Previous Increments</h4>
              <div className="space-y-3">
                {increments.map((increment) => (
                  <div key={increment.id} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(increment.date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-600">
                          ${increment.previousSalary.toLocaleString()} → ${increment.newSalary.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {increment.reason}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIncrement(increment.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Increment */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Add New Increment</h4>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              <div>
                <Label htmlFor="incrementDate">Increment Date</Label>
                <DatePicker 
                  id="incrementDate" 
                  defaultDate={newIncrement.date}
                  onChange={([date]) => setNewIncrement(prev => ({ ...prev, date: date ? date.toISOString().slice(0, 10) : "" }))}
                />
              </div>
              
              <div>
                <Label htmlFor="previousSalary">Previous Salary</Label>
                <Input 
                  type="number" 
                  id="previousSalary" 
                  min="0" 
                  step={0.01} 
                  value={newIncrement.previousSalary}
                  onChange={(e) => setNewIncrement(prev => ({ ...prev, previousSalary: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="newSalary">New Salary</Label>
                <Input 
                  type="number" 
                  id="newSalary" 
                  min="0" 
                  step={0.01} 
                  value={newIncrement.newSalary}
                  onChange={(e) => setNewIncrement(prev => ({ ...prev, newSalary: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="incrementReason">Reason</Label>
                <Input 
                  type="text" 
                  id="incrementReason" 
                  value={newIncrement.reason}
                  onChange={(e) => setNewIncrement(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                onClick={addIncrement}
              >
                <Plus className="w-4 h-4" />
                Add Increment
              </button>
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
              <Label htmlFor="skills">Skills</Label>
              <Input 
                type="text" 
                id="skills" 
                placeholder="e.g., JavaScript, React, Project Management"
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="education">Education</Label>
              <Input 
                type="text" 
                id="education" 
                placeholder="e.g., Bachelor's in Computer Science"
                value={formData.education}
                onChange={(e) => handleInputChange("education", e.target.value)}
              />
            </div>
            
            <div className="xl:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Any additional notes about the employee..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            onClick={handleBack}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <Save className="size-5" />
            Update Employee
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee; 