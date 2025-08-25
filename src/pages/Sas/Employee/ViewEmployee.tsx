import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { useEmployees } from '../../../hooks/useApi';
import type { Employee } from '../../../services/api';

const ViewEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchEmployees } = useEmployees();

  useEffect(() => {
    const loadEmployee = async () => {
      if (!id) {
        setError('Employee ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch employee by ID
        const result = await fetchEmployees({ 
          page: 1, 
          limit: 100 // Get all employees to find the specific one
        });
        
        const foundEmployee = result.data.find(emp => emp.id.toString() === id);
        
        if (foundEmployee) {
          setEmployee(foundEmployee);
        } else {
          setError('Employee not found');
        }
      } catch (err) {
        console.error('Failed to load employee:', err);
        setError('Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id, fetchEmployees]);

  const handleBack = () => {
    navigate("/employee");
  };

  const handleEdit = () => {
    navigate(`/edit-employee/${employee?.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Active
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Inactive
          </span>
        );
      case "terminated":
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Terminated
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading employee details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Employee List
          </button>
        </div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div>
      <PageBreadcrumb pageTitle="Employee Details" />
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employee List
        </button>
        <button
          onClick={handleEdit}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <Edit className="w-4 h-4" />
          Edit Employee
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-8 max-w-4xl mx-auto">
        {/* Employee Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-2xl font-medium text-gray-700">
              {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {employee.first_name} {employee.last_name}
            </h2>
            <p className="text-lg text-gray-600">{employee.position}</p>
            <p className="text-gray-500">{employee.department} Department</p>
            <div className="mt-2">
              {getStatusBadge(employee.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Employee ID</div>
                <div className="font-medium text-gray-900">{employee.employee_id || employee.id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Full Name</div>
                <div className="font-medium text-gray-900">{employee.first_name} {employee.last_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email Address</div>
                <div className="font-medium text-gray-900">{employee.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone Number</div>
                <div className="font-medium text-gray-900">{employee.phone}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Date of Birth</div>
                <div className="font-medium text-gray-900">
                  {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'Not specified'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Address</div>
                <div className="font-medium text-gray-900">
                  {employee.address}, {employee.city}, {employee.state} {employee.postal_code}, {employee.country}
                </div>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
              Employment Information
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Department</div>
                <div className="font-medium text-gray-900">{employee.department}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Position</div>
                <div className="font-medium text-gray-900">{employee.position}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Hire Date</div>
                <div className="font-medium text-gray-900">
                  {new Date(employee.hire_date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Current Salary</div>
                <div className="font-medium text-gray-900">${parseFloat(employee.salary.toString()).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Employment Status</div>
                <div className="font-medium text-gray-900">{getStatusBadge(employee.status)}</div>
              </div>
              {employee.organisation_name && (
                <div>
                  <div className="text-sm text-gray-500">Organization</div>
                  <div className="font-medium text-gray-900">{employee.organisation_name}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        {(employee.emergency_contact_name || employee.emergency_contact_phone || employee.emergency_contact_relationship) && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {employee.emergency_contact_name && (
                <div>
                  <div className="text-sm text-gray-500">Contact Name</div>
                  <div className="font-medium text-gray-900">{employee.emergency_contact_name}</div>
                </div>
              )}
              {employee.emergency_contact_phone && (
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium text-gray-900">{employee.emergency_contact_phone}</div>
                </div>
              )}
              {employee.emergency_contact_relationship && (
                <div>
                  <div className="text-sm text-gray-500">Relationship</div>
                  <div className="font-medium text-gray-900">{employee.emergency_contact_relationship}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Created At</div>
              <div className="font-medium text-gray-900">
                {new Date(employee.created_at).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Last Updated</div>
              <div className="font-medium text-gray-900">
                {new Date(employee.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee; 