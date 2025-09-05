import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  ZoomIn,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Home,
  Printer,
  Download,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Star,
  Eye,
  FileImage,
  Building,
  Phone,
  Mail,
  Globe,
  Hash,
  Edit,
} from "lucide-react";
import { apiFetch } from "../../services/api";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useToast } from "../../components/ToastContainer";
import DOMPurify from "dompurify";

// Define the Listing interface for type safety
interface Listing {
  id: string;
  host_id: string | null;
  title: string;
  description: string;
  type: string;
  category: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_night: number;
  currency: string | null;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string | null;
  house_rules: string | null;
  images: string | null;
  main_image_url: string | null;
  availability_calendar: string | null;
  instant_bookable: boolean | null;
  cancellation_policy: string | null;
  cleaning_fee: number | null;
  service_fee: number | null;
  security_deposit: number | null;
  rating: number | null;
  review_count: number;
  view_count: number | null;
  status: string;
  is_featured: boolean | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  createdIp: string | null;
  updatedIp: string | null;
  rooms_available: number | null;
  normal_package_cost: number | null;
  facilities: string | null; // JSON string
  activity_prices: string | null; // JSON string
  homestay_subtype: string;
  registration_office: string;
  registration_place: string;
  registration_no: string;
  pan_no: string;
  municipality: string;
  ward_no: string;
  bank_name: string;
  branch: string;
  account_type: string;
  account_name: string;
  account_number: string;
  operated_house_no: string;
  contact_person: string;
  contact_person_role: string;
  mobile_no: string;
  email: string;
  history: string;
  story: string;
  community: string;
  additional_services: string;
  registration_certificates: string; // JSON string
  pan_vat_certificate: string;
  contact_id_front: string;
  contact_id_back: string;
  homestay_photos: string | null; // JSON string
  host_first_name: string | null;
  host_last_name: string | null;
  host_image: string | null;
  host_verified: boolean | null;
  host_phone: string | null;
  host_email: string | null;
  average_rating: number | null;
  total_bookings: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    listing: Listing[];
  };
}

const AdminViewListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAdminAuth();
  const { showError } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id || !token) {
        setError("Missing listing ID or authentication token");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch<ApiResponse>(
          `/admin/listings/${id}`, // Updated endpoint
          { headers: { Authorization: `Bearer ${token}` } },
          token
        );
        console.log("API Response:", res);
        if (res.success && res.data.listing) {
          // Parse JSON strings
          const listingData = res.data.listing;
          setListing(res.data.listing);
          // setListing({
          //   ...listingData,
          //   facilities: listingData.facilities
          //     ? JSON.parse(listingData.facilities)
          //     : null,
          //   activity_prices: listingData.activity_prices
          //     ? JSON.parse(listingData.activity_prices)
          //     : null,
          //   registration_certificates: listingData.registration_certificates
          //     ? JSON.parse(listingData.registration_certificates)
          //     : [],
          //   homestay_photos: listingData.homestay_photos
          //     ? JSON.parse(listingData.homestay_photos)
          //     : null,
          // });
        } else {
          setError("No listing found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch listing");
        showError(
          "Failed to Load Listing",
          err.message || "Unable to fetch listing details"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, token, showError]);

  // Helper for images and PDFs
  const renderFile = (file: string, idx: number) => {
  if (!file) return null;

  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file);
  const isPdf = /\.pdf$/i.test(file);

  return (
    <div
      key={idx}
      className="relative group cursor-pointer"
      onClick={() => isImage && setZoomImg(file)}
    >
      {isImage ? (
        <div className="relative">
          <img
            src={file}
            alt={`file-${idx}`}
            className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
            <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
          </div>
        </div>
      ) : isPdf ? (
        <a
          href={file}
          target="_blank"
          rel="noopener noreferrer"
          className="h-24 w-24 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FileText className="h-8 w-8 text-gray-500" />
          <span className="text-xs mt-1 text-gray-600 font-medium">PDF</span>
        </a>
      ) : (
        <a
          href={file}
          target="_blank"
          rel="noopener noreferrer"
          className="h-24 w-24 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FileImage className="h-8 w-8 text-gray-400" />
          <span className="text-xs mt-1 text-gray-600 font-medium">File</span>
        </a>
      )}
    </div>
  );
};


  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const formatPrice = (price: string | number | null) =>
    price ? `NPR ${Number(price).toLocaleString()}` : "-";

  const safe = (val: any) =>
    DOMPurify.sanitize(
      val !== null && val !== undefined && val !== "" ? val : "-"
    );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "suspended":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Calendar className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "suspended":
        return <Eye className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Listing Details - ${safe(
                listing?.title || "Unknown"
              )}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .section { margin-bottom: 25px; }
                .section h3 { color: #1e40af; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .field { margin-bottom: 8px; }
                .label { font-weight: bold; color: #374151; }
                .value { color: #111827; }
                .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                .status-pending { background: #fef3c7; color: #92400e; }
                .status-active { background: #d1fae5; color: #065f46; }
                .status-rejected { background: #fee2e2; color: #991b1b; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Listing Details</h1>
                <p>Generated on ${new Date().toLocaleString()}</p>
              </div>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Listing
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/listings")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Listing Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The listing you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/admin/listings")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/listings")}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Listings</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <button
                onClick={() => navigate(`/admin/listings/edit/${id}`)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Edit className="h-5 w-5" />
                <span>Edit Details</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          ref={printRef}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Listing Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {safe(listing.title)}
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  {safe(listing.description)}
                </p>
                <div className="flex items-center space-x-6 text-blue-100">
                  <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span className="capitalize">{safe(listing.type)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span className="capitalize">{safe(listing.category)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>{formatPrice(listing.price_per_night)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                    listing.status
                  )}`}
                >
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(listing.status)}
                    <span className="capitalize">{safe(listing.status)}</span>
                  </div>
                </span>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* General Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Hash className="h-5 w-5 mr-2 text-blue-600" />
                    General Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Max Guests:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.max_guests)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Bedrooms:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.bedrooms)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Bathrooms:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.bathrooms)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Rooms Available:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.rooms_available)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Package Cost:
                      </span>
                      <span className="text-gray-800">
                        {formatPrice(listing.normal_package_cost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Created:
                      </span>
                      <span className="text-gray-800">
                        {formatDate(listing.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Updated:
                      </span>
                      <span className="text-gray-800">
                        {formatDate(listing.updated_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Created By:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.created_by)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Updated By:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.updated_by)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Created IP:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.createdIp)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Updated IP:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.updatedIp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Address Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Province:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.state)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        District/City:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.city)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Country:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.country)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Street Address:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.address)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Postal Code:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.postal_code)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Municipality:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.municipality)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Ward No:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.ward_no)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Contact Person:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.contact_person)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Role:</span>
                      <span className="text-gray-800">
                        {safe(listing.contact_person_role)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="text-gray-800">
                        {safe(listing.email)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Mobile:</span>
                      <span className="text-gray-800">
                        {safe(listing.mobile_no)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Host Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Host Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="text-gray-800">{`${safe(
                        listing.host_first_name
                      )} ${safe(listing.host_last_name)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="text-gray-800">
                        {safe(listing.host_email)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Phone:</span>
                      <span className="text-gray-800">
                        {safe(listing.host_phone)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Verified:
                      </span>
                      <span className="text-gray-800">
                        {listing.host_verified ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Yes
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            No
                          </div>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Registration Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Registration Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Registration Office:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.registration_office)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Registration Place:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.registration_place)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Registration No:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.registration_no)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">PAN No:</span>
                      <span className="text-gray-800">
                        {safe(listing.pan_no)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                    Bank Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Bank Name:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.bank_name)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Branch:</span>
                      <span className="text-gray-800">
                        {safe(listing.branch)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Account Type:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.account_type)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Account Name:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.account_name)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Account Number:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.account_number)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Operated House No:
                      </span>
                      <span className="text-gray-800">
                        {safe(listing.operated_house_no)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Facilities */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Facilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.facilities &&
                    typeof listing.facilities === "object" &&
                    Object.keys(listing.facilities).length > 0 ? (
                      Object.entries(listing.facilities).map(
                        ([cat, opts]: [string, any]) => (
                          <div
                            key={cat}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {cat}:{" "}
                            {Array.isArray(opts) ? opts.join(", ") : safe(opts)}
                          </div>
                        )
                      )
                    ) : (
                      <span className="text-gray-500 italic">
                        No facilities listed
                      </span>
                    )}
                  </div>
                </div>

                {/* Activity Prices */}
                {listing.activity_prices &&
                typeof listing.activity_prices === "object" &&
                Object.keys(listing.activity_prices).length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                      Activity Prices
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(listing.activity_prices).map(
                        ([activity, price]: [string, any]) => {
                          const hasPrices =
                            price &&
                            typeof price === "object" &&
                            (price.perPerson || price.perGroup || price.other);
                          if (!hasPrices) return null;
                          return (
                            <div
                              key={activity}
                              className="bg-green-50 border border-green-200 rounded-lg p-4"
                            >
                              <h4 className="font-semibold text-green-800 mb-2">
                                {activity}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                {price.perPerson && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Per Person:
                                    </span>
                                    <span className="font-medium text-green-700">
                                      {formatPrice(price.perPerson)}
                                    </span>
                                  </div>
                                )}
                                {price.perGroup && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Per Group:
                                    </span>
                                    <span className="font-medium text-green-700">
                                      {formatPrice(price.perGroup)}
                                    </span>
                                  </div>
                                )}
                                {price.other && (
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-600">
                                      Other:
                                    </span>
                                    <span className="font-medium text-green-700">
                                      {formatPrice(price.other)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Images & Documents */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FileImage className="h-5 w-5 mr-2 text-blue-600" />
                    Images & Documents
                  </h3>

                  {/* Registration Certificates */}
                  {listing.registration_certificates &&
                    Array.isArray(listing.registration_certificates) &&
                    listing.registration_certificates.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">
                          Registration Certificates
                        </h4>
                        <div className="flex gap-3 flex-wrap">
                          {listing.registration_certificates.map(
                            (file: string, idx: number) => renderFile(file, idx)
                          )}
                        </div>
                      </div>
                    )}

                  {/* PAN/VAT Certificate */}
                  {listing.pan_vat_certificate && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-3">
                        PAN/VAT Certificate
                      </h4>
                      <div className="flex gap-3 flex-wrap">
                        {renderFile(listing.pan_vat_certificate, 100)}
                      </div>
                    </div>
                  )}

                  {/* Contact ID Documents */}
                  {(listing.contact_id_front || listing.contact_id_back) && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-3">
                        Contact ID Documents
                      </h4>
                      <div className="flex gap-3 flex-wrap">
                        {listing.contact_id_front &&
                          renderFile(listing.contact_id_front, 101)}
                        {listing.contact_id_back &&
                          renderFile(listing.contact_id_back, 102)}
                      </div>
                    </div>
                  )}

                  {/* Homestay Photos */}
                  {listing.homestay_photos &&
                    Array.isArray(listing.homestay_photos) &&
                    listing.homestay_photos.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">
                          Homestay Photos
                        </h4>
                        <div className="flex gap-3 flex-wrap">
                          {listing.homestay_photos.map(
                            (file: string, idx: number) =>
                              renderFile(file, idx + 200)
                          )}
                        </div>
                      </div>
                    )}

                  {/* Fallback */}
                  {!(
                    (listing.registration_certificates &&
                      listing.registration_certificates.length > 0) ||
                    listing.pan_vat_certificate ||
                    listing.contact_id_front ||
                    listing.contact_id_back ||
                    (listing.homestay_photos &&
                      listing.homestay_photos.length > 0) ||
                    (listing.images && listing.images.length > 0)
                  ) && (
                    <span className="text-gray-500 italic">
                      No images or documents uploaded
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setZoomImg(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setZoomImg(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <XCircle className="h-8 w-8" />
            </button>
            <img
              src={zoomImg}
              alt="zoomed"
              className="max-h-[90vh] max-w-full rounded-lg shadow-2xl border-4 border-white object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViewListingPage;
