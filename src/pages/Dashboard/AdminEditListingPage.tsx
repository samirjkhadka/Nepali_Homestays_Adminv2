import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Home,
  MapPin,
  CheckSquare,
  CreditCard,
  User,
  Upload,
  Image,
  Info,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from "browser-image-compression";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useToast } from "../../components/ToastContainer";
import { apiFetch } from "../../services/api";

// Dummy data for dropdowns (replace with API data later)
const PROVINCES = [
  "Province 1",
  "Province 2",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpaschim",
];
const DISTRICTS = {
  Bagmati: ["Kathmandu", "Lalitpur", "Bhaktapur"],
  Gandaki: ["Pokhara"],
  "Province 1": ["Morang", "Sunsari"],
  "Province 2": ["Bara", "Parsa"],
  Lumbini: ["Rupandehi"],
  Karnali: ["Jumla"],
  Sudurpaschim: ["Dhangadhi"],
};
const MUNICIPALITIES = {
  Kathmandu: ["KMC", "Tokha"],
  Pokhara: ["Pokhara-1", "Pokhara-2"],
  Morang: ["Biratnagar"],
  Sunsari: ["Itahari"],
  Bara: ["Kalaiya"],
  Parsa: ["Birgunj"],
  Rupandehi: ["Butwal"],
  Jumla: ["Chandannath"],
  Dhangadhi: ["Ghodaghodi"],
};
const FACILITY_CATEGORIES = [
  { category: "Water", options: ["Hot", "Cold"] },
  { category: "Food", options: ["Veg", "Non-Veg"] },
  { category: "Bathroom", options: ["Common", "Private"] },
];
const ACTIVITY_OPTIONS = [
  "Hiking",
  "Sight Seeing",
  "Boating",
  "Farming",
  "Cooking",
  "Jungle Safari",
  "Yoga",
  "Meditation",
];
// const COUNTRY_OPTIONS = ['Nepal', 'India', 'Other'];
const TYPE_OPTIONS = [
  { value: "homestay", label: "Homestay" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
];
// const CATEGORY_OPTIONS = [
//   { value: 'traditional', label: 'Traditional' },
//   { value: 'modern', label: 'Modern' },
//   { value: 'luxury', label: 'Luxury' },
//   { value: 'budget', label: 'Budget' },
//   { value: 'family', label: 'Family' }
// ];
const initialForm = {
  type: "",
  name: "",
  registration_office: "",
  registration_place: "",
  registration_no: "",
  pan_no: "",
  province: "",
  district: "",
  municipality: "",
  ward_no: "",
  street: "",
  normal_package_cost: "",
  facilities: {},
  additional_services: "",
  bank_name: "",
  branch: "",
  account_type: "",
  account_name: "",
  account_number: "",
  operated_house_no: "",
  rooms_available: "",
  guest_capacity: "",
  contact_person: "",
  contact_person_role: "",
  mobile_no: "",
  email: "",
  history: "",
  story: "",
  about: "",
  community: "",
  // Backend required fields
  title: "",
  description: "",
  pricePerNight: "",
  maxGuests: "",
  address: "",
  city: "",
  country: "",
  state: "",
  num_bedrooms: "",
  num_bathrooms: "",
  category: "",
  homestay_subtype: "", // individual or community
};
const initialImages = {
  registration_certificates: [], // up to 5
  pan_vat_certificate: null,
  contact_id_front: null,
  contact_id_back: null,
  homestay_photos: [], // up to 10
};

function validateForm(form: any, images: any) {
  const errors: any = {};
  // Required text fields (only the ones that actually exist in the database)
  [
    "type",
    "name",
    "province",
    "district",
    "street",
    "normal_package_cost",
    "rooms_available",
    "guest_capacity",
    "about",
    "country",
    "num_bathrooms",
    "category",
  ].forEach((field) => {
    if (
      !form[field] ||
      (typeof form[field] === "string" && !form[field].trim())
    ) {
      errors[field] = "Required";
    }
  });

  // Validate homestay subtype when type is homestay
  if (
    form.type === "homestay" &&
    (!form.homestay_subtype || !form.homestay_subtype.trim())
  ) {
    errors.homestay_subtype = "Required";
  }

  // Backend validation rules (on form fields)
  if (form.name && form.name.length < 3)
    errors.name = "Title must be at least 3 characters long";
  if (form.about && form.about.length < 10)
    errors.about = "Description must be at least 10 characters long";
  if (form.normal_package_cost && Number(form.normal_package_cost) <= 0)
    errors.normal_package_cost = "Price per night must be greater than 0";
  if (form.guest_capacity && Number(form.guest_capacity) <= 0)
    errors.guest_capacity = "Maximum guests must be greater than 0";
  if (form.num_bathrooms && Number(form.num_bathrooms) <= 0)
    errors.num_bathrooms = "Number of bathrooms must be greater than 0";

  return errors;
}

const STEPS = [
  "Homestay Details",
  "Homestay Address",
  "Facilities",
  "Bank Details",
  "Contact Details",
  "Homestay Document Uploads",
  "Homestay Image Upload",
  "Homestay Contents",
];

const initialActivityPrices = {};
// ACTIVITY_OPTIONS.forEach(act => {
//   initialActivityPrices[act] = { perPerson: '', perGroup: '', other: '' };
// });

const STEP_ICONS = [
  <Home className="h-5 w-5" />,
  <MapPin className="h-5 w-5" />,
  <CheckSquare className="h-5 w-5" />,
  <CreditCard className="h-5 w-5" />,
  <User className="h-5 w-5" />,
  <Upload className="h-5 w-5" />,
  <Image className="h-5 w-5" />,
  <Info className="h-5 w-5" />,
];

// Utility to compress a single file to max 500 KB
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  try {
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch (err) {
    return file;
  }
}

// Utility to upload images/files for a field
async function uploadImages(files: File[], token: string): Promise<string[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file);
  }
  const res = await fetch(
    `${
      import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1"
    }/listings/upload/images`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    }
  );
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  // Try different response formats
  const urls = data.urls || data.data?.urls || [];
  return urls;
}

const AdminEditListingPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAdminAuth();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState<any>(initialForm);
  const [images, setImages] = useState<any>(initialImages);
  const [errors, setErrors] = useState<any>({});
  const [step, setStep] = useState(0);
  const [activityPrices, setActivityPrices] = useState<any>(
    initialActivityPrices
  );
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // Dynamic dropdowns
  const districts = DISTRICTS[form.province] || [];
  const municipalities = MUNICIPALITIES[form.district] || [];

  useEffect(() => {
    fetchListingData();
  }, [id, token]);

  const fetchListingData = async () => {
    if (!id || !token) return;
    try {
      const res = await apiFetch<{ data: { listing: any } }>(
        `/admin/listings/${id}`,
        {},
        token
      );
      const listing = res.data.listing;

      // Map backend data to form fields
      setForm({
        type: listing.type || "",
        name: listing.title || "",
        registration_office: listing.registration_office || "Not provided",
        registration_place: listing.registration_place || "Not provided",
        registration_no: listing.registration_no || "Not provided",
        pan_no: listing.pan_no || "Not provided",
        province: listing.state || "",
        district: listing.city || "",
        municipality: listing.municipality || "Not provided",
        ward_no: listing.ward_no || "Not provided",
        street: listing.address || "",
        normal_package_cost:
          listing.normal_package_cost || listing.price_per_night || "",
        facilities: listing.facilities || {},
        additional_services: listing.additional_services || "Not provided",
        bank_name: listing.bank_name || "Not provided",
        branch: listing.bank_branch || "Not provided",
        account_type: listing.account_type || "Not provided",
        account_name: listing.account_name || "Not provided",
        account_number: listing.account_number || "Not provided",
        operated_house_no: listing.operated_house_no || "Not provided",
        rooms_available: listing.rooms_available || listing.bedrooms || "",
        guest_capacity: listing.max_guests || "",
        contact_person:
          listing.contact_person ||
          listing.host_first_name + " " + listing.host_last_name,
        contact_person_role: listing.contact_person_role || "Owner",
        mobile_no: listing.mobile_no || listing.host_phone || "",
        email: listing.email || listing.host_email || "",
        history: listing.history || "Not provided",
        story: listing.story || "Not provided",
        about: listing.description || "",
        community: listing.community || "Not provided",
        title: listing.title || "",
        description: listing.description || "",
        pricePerNight: listing.price_per_night || "",
        maxGuests: listing.max_guests || "",
        address: listing.address || "",
        city: listing.city || "",
        country: listing.country || "",
        state: listing.state || "",
        num_bedrooms: listing.bedrooms || "",
        num_bathrooms: listing.bathrooms || "",
        category: listing.category || "",
        homestay_subtype: listing.homestay_subtype || "individual",
      });

      // Map images
      setImages({
        registration_certificates: listing.registration_certificates || [],
        pan_vat_certificate: listing.pan_vat_certificate || null,
        contact_id_front: listing.contact_id_front || null,
        contact_id_back: listing.contact_id_back || null,
        homestay_photos: listing.homestay_photos || [],
      });

      // Map activity prices
      if (listing.activity_prices) {
        setActivityPrices(listing.activity_prices);
      }
    } catch (err: any) {
      showError(
        "Failed to Load Listing",
        err.message || "Unable to fetch listing details"
      );
    } finally {
      setFetchingData(false);
    }
  };

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFacilityChange = (category: string, option: string) => {
    setForm((prev: any) => {
      const selected = prev.facilities?.[category] || [];
      const exists = selected.includes(option);
      return {
        ...prev,
        facilities: {
          ...prev.facilities,
          [category]: exists
            ? selected.filter((o: string) => o !== option)
            : [...selected, option],
        },
      };
    });
  };

  // Image uploaders
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    multiple = false
  ) => {
    const files = Array.from(e.target.files || []);
    if (multiple) {
      setImages((prev) => ({ ...prev, [field]: [...prev[field], ...files] }));
    } else {
      setImages((prev) => ({ ...prev, [field]: files[0] }));
    }
  };

  const handleRemoveImage = (field: string, idx: number) => {
    setImages((prev) => {
      const newImages = { ...prev };
      if (Array.isArray(newImages[field])) {
        newImages[field] = newImages[field].filter((_, i) => i !== idx);
      } else {
        newImages[field] = null;
      }
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validationErrors = validateForm(form, images);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Compress and upload images
      const compressAll = async (arr: File[]) =>
        Promise.all(arr.map((f) => compressImage(f)));

      const regCertFiles = Array.isArray(images.registration_certificates)
        ? images.registration_certificates
        : [];
      const photoFiles = Array.isArray(images.homestay_photos)
        ? images.homestay_photos
        : [];

      const [
        compressedRegCerts,
        compressedPanCert,
        compressedIdFront,
        compressedIdBack,
        compressedPhotos,
      ] = await Promise.all([
        compressAll(regCertFiles),
        images.pan_vat_certificate
          ? compressImage(images.pan_vat_certificate)
          : Promise.resolve(null),
        images.contact_id_front
          ? compressImage(images.contact_id_front)
          : Promise.resolve(null),
        images.contact_id_back
          ? compressImage(images.contact_id_back)
          : Promise.resolve(null),
        compressAll(photoFiles),
      ]);

      // Upload images by type
      const [regCertUrls, panCertUrls, idFrontUrls, idBackUrls, photoUrls] =
        await Promise.all([
          uploadImages(compressedRegCerts, token || ""),
          images.pan_vat_certificate && compressedPanCert
            ? uploadImages([compressedPanCert], token || "")
            : Promise.resolve([]),
          images.contact_id_front && compressedIdFront
            ? uploadImages([compressedIdFront], token || "")
            : Promise.resolve([]),
          images.contact_id_back && compressedIdBack
            ? uploadImages([compressedIdBack], token || "")
            : Promise.resolve([]),
          uploadImages(compressedPhotos, token || ""),
        ]);

      // Prepare payload
      const payload = {
        ...form,
        title: form.name,
        description: form.about,
        pricePerNight: Number(form.normal_package_cost),
        maxGuests: Number(form.guest_capacity),
        address: form.address,
        city: form.district,
        country: form.country,
        state: form.province,
        bedrooms: Number(form.rooms_available),
        bathrooms: Number(form.num_bathrooms),
        type: form.type,
        category: form.category,
        homestay_subtype: form.homestay_subtype,
        registration_certificates: regCertUrls,
        pan_vat_certificate: panCertUrls[0] || "",
        contact_id_front: idFrontUrls[0] || "",
        contact_id_back: idBackUrls[0] || "",
        homestay_photos: photoUrls,
        activity_prices: activityPrices,
      };

      await apiFetch(
        `/admin/listings/${id}`,
        { method: "PUT", body: JSON.stringify(payload) },
        token || ""
      );
      showSuccess(
        "Listing Updated Successfully!",
        "Your listing has been updated successfully."
      );
      navigate("/admin/listings");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update listing";
      setErrors({ submit: errorMessage });
      showError("Failed to Update Listing", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  function validateStep(currentStep: number) {
    const stepErrors: any = {};
    switch (currentStep) {
      case 0: // Homestay Details
        if (!form.type) stepErrors.type = "Required";
        if (form.type === "homestay" && !form.homestay_subtype)
          stepErrors.homestay_subtype = "Required";
        if (!form.name || form.name.length < 3) stepErrors.name = "Required";
        break;
      case 1: // Homestay Address
        if (!form.province) stepErrors.province = "Required";
        if (!form.district) stepErrors.district = "Required";
        if (!form.street) stepErrors.street = "Required";
        break;
      case 2: // Facilities
        // No validation needed for facilities
        break;
      case 3: // Bank Details
        // No validation needed for bank details (optional fields)
        break;
      case 4: // Contact Details
        if (!form.rooms_available) stepErrors.rooms_available = "Required";
        if (!form.guest_capacity) stepErrors.guest_capacity = "Required";
        break;
      case 5: // Document Uploads
        // No validation needed for uploads
        break;
      case 6: // Image Upload
        // No validation needed for uploads
        break;
      case 7: // Homestay Contents
        if (!form.about || form.about.length < 10)
          stepErrors.about = "Required";
        if (!form.normal_package_cost)
          stepErrors.normal_package_cost = "Required";
        break;
    }
    return stepErrors;
  }

  const handleNext = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length === 0) {
      setStep((s) => s + 1);
      setErrors({});
    } else {
      setErrors(stepErrors);
    }
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleActivityPriceChange = (
    act: string,
    field: string,
    value: string
  ) => {
    setActivityPrices((prev: any) => ({
      ...prev,
      [act]: { ...prev[act], [field]: value },
    }));
  };

  // Real-time validation on input
  const handleValidatedChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    handleChange(e);
    const errs = validateStep(step);
    setErrors(errs);
  };

  if (fetchingData) {
    return (
      <div className="w-full min-h-screen py-10 px-2 md:px-8 flex flex-col bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  // Stepper UI
  return (
    <div className="w-full min-h-screen py-10 px-2 md:px-8 flex flex-col bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
      <h1 className="text-2xl font-bold mb-8 text-nepal-blue font-heading self-center md:self-start">
        Edit Listing
      </h1>
      <div className="flex flex-col md:flex-row gap-12 w-full max-w-7xl mx-auto">
        {/* Stepper */}
        <div className="w-full md:w-80 flex-shrink-0 mb-8 md:mb-0">
          <ol className="space-y-6 bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800">
            {STEPS.map((label, idx) => (
              <li
                key={label}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  step === idx
                    ? "font-bold text-nepal-blue"
                    : idx < step
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                <span
                  className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step === idx
                      ? "bg-nepal-blue text-white border-nepal-blue"
                      : idx < step
                      ? "bg-green-100 text-green-600 border-green-400"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {STEP_ICONS[idx]}
                </span>
                <span className="text-base whitespace-normal break-words">
                  {label}
                </span>
              </li>
            ))}
          </ol>
        </div>
        {/* Step Content */}
        <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-12">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800"
              >
                <h2 className="text-lg font-bold mb-6 text-nepal-blue">
                  Homestay Details
                </h2>
                <div className="mb-6">
                  <label className="block text-xs font-medium mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleValidatedChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.type
                        ? "border-red-400"
                        : form.type
                        ? "border-green-400"
                        : ""
                    }`}
                    required
                  >
                    <option value="">Select Type</option>
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.type}
                    </div>
                  )}
                </div>

                {form.type === "homestay" && (
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Homestay Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      <label
                        className={`flex items-center gap-1 px-3 py-2 rounded cursor-pointer transition-all ${
                          form.homestay_subtype === "individual"
                            ? "bg-blue-50 border border-nepal-blue"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="homestay_subtype"
                          value="individual"
                          checked={form.homestay_subtype === "individual"}
                          onChange={handleValidatedChange}
                          required
                        />
                        Individual
                      </label>
                      <label
                        className={`flex items-center gap-1 px-3 py-2 rounded cursor-pointer transition-all ${
                          form.homestay_subtype === "community"
                            ? "bg-blue-50 border border-nepal-blue"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="homestay_subtype"
                          value="community"
                          checked={form.homestay_subtype === "community"}
                          onChange={handleValidatedChange}
                          required
                        />
                        Community
                      </label>
                    </div>
                    {errors.homestay_subtype && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.homestay_subtype}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Homestay Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleValidatedChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name
                          ? "border-red-400"
                          : form.name
                          ? "border-green-400"
                          : ""
                      }`}
                      required
                    />
                    {errors.name && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.name}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Office of Registration (Optional)
                    </label>
                    <input
                      name="registration_office"
                      value={form.registration_office}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Place of Registration (Optional)
                    </label>
                    <input
                      name="registration_place"
                      value={form.registration_place}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Registration No (Optional)
                    </label>
                    <input
                      name="registration_no"
                      value={form.registration_no}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      PAN No (Optional)
                    </label>
                    <input
                      name="pan_no"
                      value={form.pan_no}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800"
              >
                <h2 className="text-lg font-bold mb-6 text-nepal-blue">
                  Homestay Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="province"
                      value={form.province}
                      onChange={handleValidatedChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.province
                          ? "border-red-400"
                          : form.province
                          ? "border-green-400"
                          : ""
                      }`}
                      required
                    >
                      <option value="">Select Province</option>
                      {PROVINCES.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.province}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      District <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district"
                      value={form.district}
                      onChange={handleValidatedChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.district
                          ? "border-red-400"
                          : form.district
                          ? "border-green-400"
                          : ""
                      }`}
                      required
                    >
                      <option value="">Select District</option>
                      {districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                    {errors.district && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.district}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Municipality (Optional)
                    </label>
                    <select
                      name="municipality"
                      value={form.municipality}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Municipality</option>
                      {municipalities.map((municipality) => (
                        <option key={municipality} value={municipality}>
                          {municipality}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Ward No (Optional)
                    </label>
                    <input
                      name="ward_no"
                      value={form.ward_no}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="street"
                      value={form.street}
                      onChange={handleValidatedChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.street
                          ? "border-red-400"
                          : form.street
                          ? "border-green-400"
                          : ""
                      }`}
                      required
                    />
                    {errors.street && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.street}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800"
              >
                <h2 className="text-lg font-bold mb-6 text-nepal-blue">
                  Facilities
                </h2>
                <div className="space-y-6">
                  {FACILITY_CATEGORIES.map((category) => (
                    <div
                      key={category.category}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {category.category}
                        </h3>
                        <div className="space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                facilities: {
                                  ...prev.facilities,
                                  [category.category]: [...category.options],
                                },
                              }));
                            }}
                            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev) => {
                                const newFacilities = { ...prev.facilities };
                                delete newFacilities[category.category];
                                return { ...prev, facilities: newFacilities };
                              });
                            }}
                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {category.options.map((option) => (
                          <label
                            key={option}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={
                                form.facilities[category.category]?.includes(
                                  option
                                ) || false
                              }
                              onChange={() =>
                                handleFacilityChange(category.category, option)
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800"
              >
                <h2 className="text-lg font-bold mb-6 text-nepal-blue">
                  Bank Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Bank Name (Optional)
                    </label>
                    <input
                      name="bank_name"
                      value={form.bank_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Branch (Optional)
                    </label>
                    <input
                      name="branch"
                      value={form.branch}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Account Type (Optional)
                    </label>
                    <input
                      name="account_type"
                      value={form.account_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Account Name (Optional)
                    </label>
                    <input
                      name="account_name"
                      value={form.account_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Account Number (Optional)
                    </label>
                    <input
                      name="account_number"
                      value={form.account_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800"
              >
                <h2 className="text-lg font-bold mb-6 text-nepal-blue">
                  Contact Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Operated House No (Optional)
                    </label>
                    <input
                      name="operated_house_no"
                      value={form.operated_house_no}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Rooms Available <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="rooms_available"
                      value={form.rooms_available}
                      onChange={handleValidatedChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.rooms_available
                          ? "border-red-400"
                          : form.rooms_available
                          ? "border-green-400"
                          : ""
                      }`}
                      required
                    />
                    {errors.rooms_available && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.rooms_available}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Guest Capacity <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="guest_capacity"
                      value={form.guest_capacity}
                      onChange={handleValidatedChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.guest_capacity
                          ? "border-red-400"
                          : form.guest_capacity
                          ? "border-green-400"
                          : ""
                      }`}
                      required
                    />
                    {errors.guest_capacity && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.guest_capacity}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Contact Person (Optional)
                    </label>
                    <input
                      name="contact_person"
                      value={form.contact_person}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Contact Person Role (Optional)
                    </label>
                    <input
                      name="contact_person_role"
                      value={form.contact_person_role}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Mobile No (Optional)
                    </label>
                    <input
                      name="mobile_no"
                      value={form.mobile_no}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Email (Optional)
                    </label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800"
              >
                <h2 className="text-lg font-bold mb-6 text-nepal-blue">
                  Homestay Document Uploads
                </h2>
                <div className="mb-6">
                  <label className="block text-xs font-medium mb-1">
                    Homestay Registration Certificates (up to 5 images)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    multiple
                    onChange={(e) =>
                      handleImageChange(e, "registration_certificates", true)
                    }
                  />
                  {images.registration_certificates &&
                    images.registration_certificates.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {images.registration_certificates.map(
                          (img: any, idx: number) => {
                            const isFile = img instanceof File;
                            const isImage = isFile
                              ? img.type &&
                                (img.type.includes("image") ||
                                  img.name?.match(/\.(jpg|jpeg|png)$/i))
                              : typeof img === "string" &&
                                img.match(/\.(jpg|jpeg|png)$/i);
                            const isPdf = isFile
                              ? img.type === "application/pdf" ||
                                img.name?.match(/\.pdf$/i)
                              : typeof img === "string" && img.match(/\.pdf$/i);
                            return (
                              <div key={idx} className="relative">
                                {isImage ? (
                                  <img
                                    src={
                                      isFile ? URL.createObjectURL(img) : img
                                    }
                                    alt="cert"
                                    className="h-16 w-16 object-cover rounded"
                                  />
                                ) : isPdf ? (
                                  <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded border">
                                    <FileText className="h-8 w-8 text-gray-500" />
                                    <span className="text-xs mt-1">PDF</span>
                                  </div>
                                ) : null}
                                <div className="text-xs truncate w-16">
                                  {isFile ? img.name : "Document"}
                                </div>
                                <button
                                  type="button"
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1"
                                  onClick={() =>
                                    handleRemoveImage(
                                      "registration_certificates",
                                      idx
                                    )
                                  }
                                >
                                  x
                                </button>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-medium mb-1">
                    PAN/VAT Certificate
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) =>
                      handleImageChange(e, "pan_vat_certificate", false)
                    }
                  />
                  {images.pan_vat_certificate && (
                    <div className="mt-2">
                      <div className="text-xs">
                        {images.pan_vat_certificate instanceof File
                          ? images.pan_vat_certificate.name
                          : "PAN/VAT Certificate"}
                      </div>
                      <button
                        type="button"
                        className="text-red-500 text-xs"
                        onClick={() =>
                          handleRemoveImage("pan_vat_certificate", 0)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-medium mb-1">
                    Contact ID Front
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) =>
                      handleImageChange(e, "contact_id_front", false)
                    }
                  />
                  {images.contact_id_front && (
                    <div className="mt-2">
                      <div className="text-xs">
                        {images.contact_id_front instanceof File
                          ? images.contact_id_front.name
                          : "Contact ID Front"}
                      </div>
                      <button
                        type="button"
                        className="text-red-500 text-xs"
                        onClick={() => handleRemoveImage("contact_id_front", 0)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-medium mb-1">
                    Contact ID Back
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={(e) =>
                      handleImageChange(e, "contact_id_back", false)
                    }
                  />
                  {images.contact_id_back && (
                    <div className="mt-2">
                      <div className="text-xs">
                        {images.contact_id_back instanceof File
                          ? images.contact_id_back.name
                          : "Contact ID Back"}
                      </div>
                      <button
                        type="button"
                        className="text-red-500 text-xs"
                        onClick={() => handleRemoveImage("contact_id_back", 0)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800"
              >
                <h2 className="text-lg font-bold mb-6 text-nepal-blue">
                  Homestay Image Upload
                </h2>
                <div className="mb-6">
                  <label className="block text-xs font-medium mb-1">
                    Homestay Photos (up to 10 images)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    multiple
                    onChange={(e) =>
                      handleImageChange(e, "homestay_photos", true)
                    }
                  />
                  {images.homestay_photos &&
                    images.homestay_photos.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {images.homestay_photos.map((img: any, idx: number) => (
                          <div key={idx} className="relative">
                            <img
                              src={
                                img instanceof File
                                  ? URL.createObjectURL(img)
                                  : img
                              }
                              alt="photo"
                              className="h-16 w-16 object-cover rounded"
                            />
                            <div className="text-xs truncate w-16">
                              {img instanceof File ? img.name : "Photo"}
                            </div>
                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1"
                              onClick={() =>
                                handleRemoveImage("homestay_photos", idx)
                              }
                            >
                              x
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800"
              >
                <h2 className="text-lg font-bold mb-6 text-nepal-blue">
                  Homestay Contents
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      History (Optional)
                    </label>
                    <textarea
                      name="history"
                      value={form.history}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Story (Optional)
                    </label>
                    <textarea
                      name="story"
                      value={form.story}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1">
                      About <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="about"
                      value={form.about}
                      onChange={handleValidatedChange}
                      rows={4}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.about
                          ? "border-red-400"
                          : form.about
                          ? "border-green-400"
                          : ""
                      }`}
                      required
                    />
                    {errors.about && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.about}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Community (Optional)
                    </label>
                    <textarea
                      name="community"
                      value={form.community}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Normal Package Cost{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="normal_package_cost"
                      value={form.normal_package_cost}
                      onChange={handleValidatedChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.normal_package_cost
                          ? "border-red-400"
                          : form.normal_package_cost
                          ? "border-green-400"
                          : ""
                      }`}
                      required
                    />
                    {errors.normal_package_cost && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.normal_package_cost}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Activity Prices
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ACTIVITY_OPTIONS.map((activity) => (
                      <div
                        key={activity}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <h4 className="font-semibold mb-3">{activity}</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Per Person
                            </label>
                            <input
                              type="text"
                              value={activityPrices[activity]?.perPerson || ""}
                              onChange={(e) =>
                                handleActivityPriceChange(
                                  activity,
                                  "perPerson",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="NPR"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Per Group
                            </label>
                            <input
                              type="text"
                              value={activityPrices[activity]?.perGroup || ""}
                              onChange={(e) =>
                                handleActivityPriceChange(
                                  activity,
                                  "perGroup",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="NPR"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Other
                            </label>
                            <input
                              type="text"
                              value={activityPrices[activity]?.other || ""}
                              onChange={(e) =>
                                handleActivityPriceChange(
                                  activity,
                                  "other",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="NPR"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Continue with remaining steps - I'll add them in the next part */}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin/listings")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Listing</span>
                  )}
                </button>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminEditListingPage;
