import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageBreadcrumb from '../../../components/common/PageBreadCrumb'
import { Edit, Eye, Trash2, Plus, Search, Loader2, Download, CheckSquare, Square } from 'lucide-react'
import { useEmployees } from '../../../hooks/useApi';
import type { Employee } from '../../../services/api';

const Employee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, fetchEmployees, deleteEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Parse query params for organisation filter
  const queryParams = new URLSearchParams(location.search);
  const organisationId = queryParams.get('organisation_id');
  const organisationName = queryParams.get('organisation_name');

  useEffect(() => {
    loadEmployees();
  }, [currentPage, searchTerm, organisationId]);

  const loadEmployees = async () => {
    try {
      const result = await fetchEmployees({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        organisation_id: organisationId ? Number(organisationId) : undefined
      });
      console.log('API Response:', result);
      console.log('Employees data:', result.data);
      console.log('Pagination:', result.pagination);
      setEmployees(Array.isArray(result.data) ? result.data : []);
      setPagination(result.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      // Clear selections when data changes
      setSelectedEmployees([]);
    } catch (error) {
      console.error('Failed to load employees:', error);
      setEmployees([]);
    }
  };

  const handleAddEmployee = () => {
    navigate("/add-employee");
  };

  const handleEditEmployee = (employeeId: number) => {
    navigate(`/edit-employee/${employeeId}`);
  };

  const handleViewEmployee = (employeeId: number) => {
    navigate(`/view-employee/${employeeId}`);
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : 'Employee';
    
    if (window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      try {
        await deleteEmployee(employeeId);
        await loadEmployees(); // Reload the list
      } catch (error) {
        console.error('Failed to delete employee:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select employees to delete');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedEmployees.length} selected employee(s)? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      try {
        // Delete each selected employee
        for (const employeeId of selectedEmployees) {
          await deleteEmployee(employeeId);
        }
        await loadEmployees(); // Reload the list
        setSelectedEmployees([]);
      } catch (error) {
        console.error('Failed to delete employees:', error);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const handleSelectEmployee = (employeeId: number) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleExportEmployees = () => {
    const dataToExport = employees.map(emp => ({
      ID: emp.id,
      'First Name': emp.first_name,
      'Last Name': emp.last_name,
      Email: emp.email,
      Phone: emp.phone,
      Department: emp.department,
      Position: emp.position,
      Salary: emp.salary,
      Status: emp.status,
      'Hire Date': new Date(emp.hire_date).toLocaleDateString(),
      Address: `${emp.address}, ${emp.city}, ${emp.state}, ${emp.country} ${emp.postal_code}`
    }));

    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading employees...</span>
      </div>
    );
  }

  // Debug logging
  console.log('Render - Employees state:', employees);
  console.log('Render - Employees length:', employees.length);
  console.log('Render - Is array:', Array.isArray(employees));

  return (
    <div>
      <PageBreadcrumb pageTitle="" />
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">
            {organisationName ? `Employees of ${decodeURIComponent(organisationName)}` : 'Employee Management'}
          </h3>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
              onClick={handleExportEmployees}
              disabled={employees.length === 0}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
              onClick={handleAddEmployee}
            >
              <Plus className="w-5 h-5" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </form>
        </div>

        {/* Bulk Actions */}
        {selectedEmployees.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedEmployees.length} employee(s) selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center justify-center w-4 h-4"
                >
                  {selectedEmployees.length === employees.length && employees.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(!Array.isArray(employees) || employees.length === 0) ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500 text-lg">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees && employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleSelectEmployee(employee.id)}
                      className="flex items-center justify-center w-4 h-4"
                    >
                      {selectedEmployees.includes(employee.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Hired: {new Date(employee.hire_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(employee.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewEmployee(employee.id)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Employee"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditEmployee(employee.id)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Edit Employee"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {(pagination?.pages ?? 0) > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === (pagination?.pages ?? 0)}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * (pagination?.limit ?? 10)) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * (pagination?.limit ?? 10), pagination?.total ?? 0)}
                  </span>{' '}
                  of <span className="font-medium">{pagination?.total ?? 0}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, pagination?.pages ?? 0) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === (pagination?.pages ?? 0)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employee;