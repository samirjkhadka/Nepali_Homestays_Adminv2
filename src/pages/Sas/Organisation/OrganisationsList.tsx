import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { Trash2, Edit, Eye, Plus, User, Search, Loader2 } from 'lucide-react';
import { useOrganisations, useEmployees } from "../../../hooks/useApi";
import { Organisation, Employee } from "../../../services/api";

const OrganisationsList = () => {
  const navigate = useNavigate();
  const { loading, fetchOrganisations, deleteOrganisation } = useOrganisations();
  const { fetchEmployees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; pages: number }>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [expandedOrgId, setExpandedOrgId] = useState<number | null>(null);
  const [orgEmployees, setOrgEmployees] = useState<{ [orgId: number]: Employee[] }>({});
  const [orgEmployeesLoading, setOrgEmployeesLoading] = useState<{ [orgId: number]: boolean }>({});

  useEffect(() => {
    loadOrganisations();
  }, [currentPage, searchTerm]);

  const loadOrganisations = async () => {
    try {
      const result = await fetchOrganisations({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined
      });
      
      // Handle the current API response format
      if (Array.isArray(result.data)) {
        // Current format: { data: [...], pagination: {...} }
        setOrganisations(result.data);
        setPagination(result.pagination || { page: 1, limit: 10, total: result.data.length, pages: 1 });
      } else if (result.data && result.data.organisations) {
        // Old format: { data: { organisations: [...], pagination: {...} } }
        setOrganisations(result.data.organisations);
        setPagination(result.data.pagination);
      } else {
        console.error('Unexpected API response format:', result);
        setOrganisations([]);
        setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Failed to load organisations:', error);
    }
  };

  const handleAddOrganisation = () => {
    navigate("/add-organisation");
  };

  const handleEditOrganisation = (orgId: number) => {
    navigate(`/edit-organisation/${orgId}`);
  };

  const handleViewOrganisation = (orgId: number) => {
    navigate(`/view-organisation/${orgId}`);
  };

  const handleDeleteOrganisation = async (orgId: number) => {
    const organisation = organisations.find(org => org.id === orgId);
    const organisationName = organisation ? organisation.name : 'Organisation';
    
    if (window.confirm(`Are you sure you want to delete ${organisationName}? This action cannot be undone.`)) {
      try {
        await deleteOrganisation(orgId);
        await loadOrganisations(); // Reload the list
      } catch (error) {
        console.error('Failed to delete organisation:', error);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadOrganisations();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleToggleEmployees = async (orgId: number) => {
    if (expandedOrgId === orgId) {
      setExpandedOrgId(null);
      return;
    }
    setExpandedOrgId(orgId);
    if (!orgEmployees[orgId]) {
      setOrgEmployeesLoading(prev => ({ ...prev, [orgId]: true }));
      try {
        const result = await fetchEmployees({ organisation_id: orgId, page: 1, limit: 100 });
        setOrgEmployees(prev => ({ ...prev, [orgId]: result.data }));
      } catch (error) {
        setOrgEmployees(prev => ({ ...prev, [orgId]: [] }));
      } finally {
        setOrgEmployeesLoading(prev => ({ ...prev, [orgId]: false }));
      }
    }
  };

  if (loading && organisations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading organisations...</span>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="" />
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Organisation Management</h3>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            onClick={handleAddOrganisation}
          >
            <Plus className="w-5 h-5" />
            Add Organisation
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search organisations..."
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
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Industry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Founded
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employees
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {organisations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 text-lg">
                  No organisations found.
                </td>
              </tr>
            ) : (
              organisations.map((org) => (
                <>
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {org.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-sm text-gray-500">{org.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{org.email}</div>
                        <div className="text-sm text-gray-500">{org.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {org.industry || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {org.founded_year || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer underline" onClick={() => handleToggleEmployees(org.id)}>
                      {orgEmployees[org.id]?.length ?? (org.employee_count ?? 'View')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOrganisation(org.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Organisation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditOrganisation(org.id)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit Organisation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrganisation(org.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Organisation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedOrgId === org.id && (
                    <tr>
                      <td colSpan={8} className="bg-blue-50 px-6 py-4">
                        {orgEmployeesLoading[org.id] ? (
                          <div className="flex items-center"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading employees...</div>
                        ) : orgEmployees[org.id]?.length ? (
                          <div>
                            <div className="font-semibold mb-2 flex items-center justify-between">
                              <span>Employees:</span>
                              <button
                                className="text-blue-600 underline text-sm font-normal hover:text-blue-800"
                                onClick={() => navigate(`/employee?organisation_id=${org.id}&organisation_name=${encodeURIComponent(org.name)}`)}
                              >
                                View All
                              </button>
                            </div>
                            <ul className="space-y-1">
                              {orgEmployees[org.id].map(emp => (
                                <li key={emp.id} className="flex gap-4 items-center text-sm">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">{emp.first_name} {emp.last_name}</span>
                                  <span className="text-gray-500">{emp.email}</span>
                                  <span className="text-gray-500">{emp.position}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <span className="text-gray-500">No employees found for this organisation.</span>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.pages > 1 && (
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
                disabled={currentPage === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
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
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
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
                    disabled={currentPage === pagination.pages}
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

export default OrganisationsList;
