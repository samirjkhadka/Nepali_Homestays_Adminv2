import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { ArrowLeft, Edit, Loader2, Users, Calendar, Globe, Building } from 'lucide-react';
import { apiClient } from "../../../services/api";
import type { Organisation } from "../../../services/api";
import toast from "react-hot-toast";

const ViewOrganisation = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrganisation();
    }
  }, [id]);

  const loadOrganisation = async () => {
    try {
      setLoading(true);
      const orgData = await apiClient.getOrganisation(parseInt(id!));
      setOrganisation(orgData);
    } catch (error) {
      console.error('Failed to load organisation:', error);
      toast.error('Failed to load organisation data');
      navigate("/organisationList");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/organisationList");
  };

  const handleEdit = () => {
    navigate(`/edit-organisation/${organisation?.id}`);
  };

  if (loading) {
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
      default:
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Organisation Details" />
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Organisation List
        </button>
        <button
          onClick={handleEdit}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <Edit className="w-4 h-4" />
          Edit Organisation
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{organisation.name}</h2>
              <p className="text-gray-600 mt-1">{organisation.industry || 'No industry specified'}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Employees</p>
                <p className="text-2xl font-bold text-blue-900">{organisation.employee_count || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Founded</p>
                <p className="text-2xl font-bold text-green-900">{organisation.founded_year || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Status</p>
                <div className="mt-1">{getStatusBadge(organisation.status || 'active')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <p className="mt-1 text-gray-900">{organisation.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Phone Number</label>
              <p className="mt-1 text-gray-900">{organisation.phone}</p>
            </div>

            {organisation.website && (
              <div>
                <label className="text-sm font-medium text-gray-500">Website</label>
                <p className="mt-1">
                  <a 
                    href={organisation.website} 
                    className="text-blue-600 hover:underline" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {organisation.website}
                  </a>
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Organisation ID</label>
              <p className="mt-1 text-gray-900">#{organisation.id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="mt-1 text-gray-900">
                {new Date(organisation.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="mt-1 text-gray-900">
                {new Date(organisation.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h3>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Full Address</label>
              <p className="mt-1 text-gray-900">{organisation.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">City</label>
                <p className="mt-1 text-gray-900">{organisation.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">State</label>
                <p className="mt-1 text-gray-900">{organisation.state}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Country</label>
                <p className="mt-1 text-gray-900">{organisation.country}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Postal Code</label>
                <p className="mt-1 text-gray-900">{organisation.postal_code}</p>
              </div>
            </div>

            {organisation.industry && (
              <div>
                <label className="text-sm font-medium text-gray-500">Industry</label>
                <p className="mt-1 text-gray-900">{organisation.industry}</p>
              </div>
            )}

            {organisation.founded_year && (
              <div>
                <label className="text-sm font-medium text-gray-500">Founded Year</label>
                <p className="mt-1 text-gray-900">{organisation.founded_year}</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {organisation.description && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed">{organisation.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewOrganisation; 