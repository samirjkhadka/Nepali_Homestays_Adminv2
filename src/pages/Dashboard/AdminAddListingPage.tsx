import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowRightIcon,
  ArrowLeftIcon,
  SaveIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from "browser-image-compression";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useToast } from "../../components/ToastContainer";
import { apiFetch } from "../../services/api";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";

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
const COUNTRY_OPTIONS = ["Nepal", "India", "Other"];
const TYPE_OPTIONS = [
  { value: "homestay", label: "Homestay" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
];
const CATEGORY_OPTIONS = [
  { value: "traditional", label: "Traditional" },
  { value: "modern", label: "Modern" },
  { value: "luxury", label: "Luxury" },
  { value: "budget", label: "Budget" },
  { value: "family", label: "Family" },
];
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
  // Required text fields
  [
    "type",
    "name",
    "registration_office",
    "registration_place",
    "registration_no",
    "pan_no",
    "province",
    "district",
    "municipality",
    "ward_no",
    "street",
    "normal_package_cost",
    "bank_name",
    "branch",
    "account_type",
    "account_name",
    "account_number",
    "operated_house_no",
    "rooms_available",
    "guest_capacity",
    "contact_person",
    "contact_person_role",
    "mobile_no",
    "email",
    "history",
    "story",
    "about",
    "community",
    "address",
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
  // Numeric fields
  ["registration_no", "pan_no", "ward_no", "mobile_no"].forEach((field) => {
    if (form[field] && !/^[0-9]+$/.test(form[field])) {
      errors[field] = "Only numeric";
    }
  });
  // Email
  if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
    errors.email = "Invalid email";
  }
  // Facilities
  if (!form.facilities || Object.keys(form.facilities).length === 0) {
    errors.facilities = "Select at least one facility";
  }
  // Images
  if (
    !images.registration_certificates ||
    images.registration_certificates.length === 0
  ) {
    errors.registration_certificates = "Required";
  } else if (images.registration_certificates.length > 5) {
    errors.registration_certificates = "Max 5 images";
  }
  if (!images.pan_vat_certificate) errors.pan_vat_certificate = "Required";
  if (!images.contact_id_front) errors.contact_id_front = "Required";
  if (!images.contact_id_back) errors.contact_id_back = "Required";
  if (!images.homestay_photos || images.homestay_photos.length === 0) {
    errors.homestay_photos = "Required";
  } else if (images.homestay_photos.length > 10) {
    errors.homestay_photos = "Max 10 images";
  }
  // Word count for textareas
  ["history", "story", "about", "community"].forEach((field) => {
    if (form[field] && form[field].split(/\s+/).length > 500) {
      errors[field] = "Max 500 words";
    }
  });
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
ACTIVITY_OPTIONS.forEach((act) => {
  initialActivityPrices[act] = { perPerson: "", perGroup: "", other: "" };
});

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
    const compressedFile = await imageCompression(file, options);
    return new File([compressedFile], file.name, { type: compressedFile.type });

    //return compressed;
  } catch (err) {
    console.error(err);
    return file;
  }
}

// Utility to upload images/files for a field
async function uploadImages(files: File[], token: string): Promise<string[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file, file.name);
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

const AdminAddListingPage: React.FC = () => {
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

  // Dynamic dropdowns
  const districts = DISTRICTS[form.province] || [];
  const municipalities = MUNICIPALITIES[form.district] || [];

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
    const files = e.target.files;
    if (!files) return;
    if (multiple) {
      setImages((prev: any) => ({
        ...prev,
        [field]: [...(prev[field] || []), ...Array.from(files)],
      }));
    } else {
      setImages((prev: any) => ({ ...prev, [field]: files[0] }));
    }
  };
  const handleRemoveImage = (field: string, idx: number) => {
    setImages((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== idx),
    }));
  };
  // Validation and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm(form, images);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      // 1. Compress images
      const compressAll = async (arr: File[]) =>
        Promise.all(arr.map((f) => compressImage(f)));
      const registrationCerts = await compressAll(
        images.registration_certificates || []
      );
      const panCert = images.pan_vat_certificate
        ? [await compressImage(images.pan_vat_certificate)]
        : [];
      const idFront = images.contact_id_front
        ? [await compressImage(images.contact_id_front)]
        : [];
      const idBack = images.contact_id_back
        ? [await compressImage(images.contact_id_back)]
        : [];
      const homestayPhotos = await compressAll(images.homestay_photos || []);
      // 2. Upload each type
      const [regCertUrls, panCertUrls, idFrontUrls, idBackUrls, photoUrls] =
        await Promise.all([
          registrationCerts.length
            ? uploadImages(registrationCerts, token || "")
            : Promise.resolve([]),
          panCert.length
            ? uploadImages(panCert, token || "")
            : Promise.resolve([]),
          idFront.length
            ? uploadImages(idFront, token || "")
            : Promise.resolve([]),
          idBack.length
            ? uploadImages(idBack, token || "")
            : Promise.resolve([]),
          homestayPhotos.length
            ? uploadImages(homestayPhotos, token || "")
            : Promise.resolve([]),
        ]);
      // 3. Prepare payload
      const payload = {
        ...form,
        title: form.name,
        description: form.about,
        pricePerNight: Number(form.normal_package_cost),
        maxGuests: Number(form.guest_capacity),
        address: form.address,
        city: form.district, // use district for city
        country: form.country,
        state: form.province, // use province for state
        bedrooms: Number(form.rooms_available), // use rooms_available for bedrooms
        bathrooms: Number(form.num_bathrooms), // use num_bathrooms for bathrooms
        type: form.type,
        category: form.category,
        homestay_subtype: form.homestay_subtype, // include homestay subtype
        registration_certificates: regCertUrls,
        pan_vat_certificate: panCertUrls[0] || "",
        contact_id_front: idFrontUrls[0] || "",
        contact_id_back: idBackUrls[0] || "",
        homestay_photos: photoUrls,
        activity_prices: activityPrices,
      };
      // 4. Submit listing
      await apiFetch(
        "/listings",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token || ""
      );
      showSuccess(
        "Listing Added Successfully!",
        "Your listing has been created and is pending approval."
      );
      navigate("/listings");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to add listing";
      setErrors({ submit: errorMessage });
      showError("Failed to Add Listing", errorMessage);
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };
  const isValid = Object.keys(validateForm(form, images)).length === 0;

  // Step validation
  function validateStep(currentStep: number) {
    const stepFields: Record<number, string[]> = {
      0: [
        "type",
        "name",
        "registration_office",
        "registration_place",
        "registration_no",
        "pan_no",
        "operated_house_no",
        "rooms_available",
        "guest_capacity",
        "num_bathrooms",
        "category",
      ],
      1: [
        "province",
        "district",
        "municipality",
        "ward_no",
        "street",
        "normal_package_cost",
        "address",
        "country",
      ],
      2: ["facilities"],
      3: [
        "bank_name",
        "branch",
        "account_type",
        "account_name",
        "account_number",
      ],
      4: ["contact_person", "contact_person_role", "mobile_no", "email"],
      5: [], // handled below
      6: [], // handled below
      7: ["additional_services", "history", "story", "about", "community"],
    };
    const errs: any = {};
    // Validate only fields for this step
    (stepFields[currentStep] || []).forEach((field) => {
      if (
        !form[field] ||
        (typeof form[field] === "string" && !form[field].trim())
      ) {
        errs[field] = "Required";
      }
    });
    // Step-specific validation
    if (currentStep === 0) {
      ["registration_no", "pan_no"].forEach((field) => {
        if (form[field] && !/^[0-9]+$/.test(form[field])) {
          errs[field] = "Only numeric";
        }
      });
    }
    if (currentStep === 1) {
      if (form["ward_no"] && !/^[0-9]+$/.test(form["ward_no"])) {
        errs["ward_no"] = "Only numeric";
      }
    }
    if (currentStep === 2) {
      if (!form.facilities || Object.keys(form.facilities).length === 0) {
        errs.facilities = "Select at least one facility";
      }
      // Validate activity prices for selected activities
      const selectedActs = form.facilities?.Activities || [];
      selectedActs.forEach((act: string) => {
        if (
          !activityPrices[act] ||
          (!activityPrices[act].perPerson &&
            !activityPrices[act].perGroup &&
            !activityPrices[act].other)
        ) {
          errs[`activity_price_${act}`] = "Enter at least one price for " + act;
        }
      });
    }
    if (currentStep === 4) {
      if (form["mobile_no"] && !/^[0-9]+$/.test(form["mobile_no"])) {
        errs["mobile_no"] = "Only numeric";
      }
      if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
        errs.email = "Invalid email";
      }
    }
    if (currentStep === 5) {
      if (
        !images.registration_certificates ||
        images.registration_certificates.length === 0
      ) {
        errs.registration_certificates = "Required";
      } else if (images.registration_certificates.length > 5) {
        errs.registration_certificates = "Max 5 images";
      }
      if (!images.pan_vat_certificate) errs.pan_vat_certificate = "Required";
      if (!images.contact_id_front) errs.contact_id_front = "Required";
      if (!images.contact_id_back) errs.contact_id_back = "Required";
    }
    if (currentStep === 6) {
      if (!images.homestay_photos || images.homestay_photos.length === 0) {
        errs.homestay_photos = "Required";
      } else if (images.homestay_photos.length > 10) {
        errs.homestay_photos = "Max 10 images";
      }
    }
    if (currentStep === 7) {
      ["history", "story", "about", "community"].forEach((field) => {
        if (form[field] && form[field].split(/\s+/).length > 500) {
          errs[field] = "Max 500 words";
        }
      });
    }
    return errs;
  }

  const handleNext = () => {
    const errs = validateStep(step);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep((s) => s + 1);
  };
  const handleBack = () => setStep((s) => s - 1);

  // Activity price handler
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

  // Stepper UI
  return (
    <>
      <PageMeta title="Nepali Homestays" description="Add New Listing" />
      <PageBreadcrumb pageTitle="Add New Listing" />
      <div className="">
        {/* <h1 className="text-2xl font-bold mb-8 text-nepal-blue font-heading self-center md:self-start">Add New Listing</h1> */}
        <div className="flex flex-col md:flex-row gap-12 w-full max-w-7xl mx-auto">
          {/* Stepper */}
          <div className="w-full md:w-80 flex-shrink-0 mb-8 md:mb-0">
            <ol className="space-y-6 bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800">
              {STEPS.map((label, idx) => (
                <li
                  key={label}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    step === idx
                      ? "font-bold text-nepal-blue dark:text-white"
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
                  <h2 className="text-lg font-bold mb-6 text-nepal-blue font-heading dark:text-gray-200">
                    Homestay Details
                  </h2>
                  <div className="mb-6">
                    <label className="block text-xs font-medium mb-1 dark:text-gray-200">
                      Homestay Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleValidatedChange}
                      className={`block w-full px-3 py-2 rounded-xl  border dark:bg-gray-900 dark:text-gray-200 ${
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
                      <label className="block text-xs font-medium mb-1 dark:text-gray-200">
                        Homestay Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-6">
                        <label
                          className={`flex items-center gap-1 px-3 py-2 rounded cursor-pointer transition-all ${
                            form.homestay_subtype === "individual"
                              ? "bg-blue-50 border border-nepal-blue"
                              : "hover:bg-gray-50 dark:text-gray-200"
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
                              : "hover:bg-gray-50 dark:text-gray-200"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-gray-200 mt-6">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Homestay Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
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
                        Office of Registration
                      </label>
                      <input
                        name="registration_office"
                        value={form.registration_office}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.registration_office
                            ? "border-red-400"
                            : form.registration_office
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.registration_office && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.registration_office}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Place of Registration
                      </label>
                      <input
                        name="registration_place"
                        value={form.registration_place}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.registration_place
                            ? "border-red-400"
                            : form.registration_place
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.registration_place && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.registration_place}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Registration No <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="registration_no"
                        value={form.registration_no}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.registration_no
                            ? "border-red-400"
                            : form.registration_no
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.registration_no && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.registration_no}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        PAN No <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="pan_no"
                        value={form.pan_no}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.pan_no
                            ? "border-red-400"
                            : form.pan_no
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.pan_no && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.pan_no}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Homestay Operated House No{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="operated_house_no"
                        value={form.operated_house_no}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.operated_house_no
                            ? "border-red-400"
                            : form.operated_house_no
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.operated_house_no && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.operated_house_no}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        No Of Rooms Available{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="rooms_available"
                        value={form.rooms_available}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
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
                        className={`border w-full px-3 py-2 rounded-xl ${
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
                        Number of Bathrooms{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="num_bathrooms"
                        value={form.num_bathrooms}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.num_bathrooms
                            ? "border-red-400"
                            : form.num_bathrooms
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.num_bathrooms && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.num_bathrooms}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.category
                            ? "border-red-400"
                            : form.category
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      >
                        <option value="">Select Category</option>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.category}
                        </div>
                      )}
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
                  <h2 className="text-lg font-bold mb-6 text-nepal-blue dark:text-gray-100">
                    Homestay Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 dark:text-gray-100">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Province <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="province"
                        value={form.province}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.province
                            ? "border-red-400"
                            : form.province
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      >
                        <option value="">Select Province</option>
                        {PROVINCES.map((p) => (
                          <option key={p}>{p}</option>
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
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.district
                            ? "border-red-400"
                            : form.district
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                        disabled={!form.province}
                      >
                        <option value="">Select District</option>
                        {districts.map((d) => (
                          <option key={d}>{d}</option>
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
                        Municipality <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="municipality"
                        value={form.municipality}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.municipality
                            ? "border-red-400"
                            : form.municipality
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                        disabled={!form.district}
                      >
                        <option value="">Select Municipality</option>
                        {municipalities.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                      {errors.municipality && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.municipality}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 dark:text-gray-100">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Ward No <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="ward_no"
                        value={form.ward_no}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.ward_no
                            ? "border-red-400"
                            : form.ward_no
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.ward_no && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.ward_no}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Street <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="street"
                        value={form.street}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
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
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Normal Package Cost{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="normal_package_cost"
                        value={form.normal_package_cost}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
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
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.address
                            ? "border-red-400"
                            : form.address
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.address && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.address}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="country"
                        value={form.country}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.country
                            ? "border-red-400"
                            : form.country
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      >
                        <option value="">Select Country</option>
                        {COUNTRY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {errors.country && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.country}
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
                  <h2 className="text-lg font-bold mb-6 text-nepal-blue dark:text-white">
                    Facilities
                  </h2>
                  <div className="space-y-4 dark:text-gray-100">
                    {FACILITY_CATEGORIES.map((cat) => (
                      <div key={cat.category}>
                        <div className="font-semibold text-xs mb-2">
                          {cat.category}
                        </div>
                        <div className="flex gap-4 flex-wrap">
                          {cat.options.map((opt) => (
                            <label
                              key={opt}
                              className="flex items-center gap-1"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  form.facilities?.[cat.category]?.includes(
                                    opt
                                  ) || false
                                }
                                onChange={() =>
                                  handleFacilityChange(cat.category, opt)
                                }
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    {/* Internet */}
                    <div>
                      <div className="font-semibold text-xs mb-2">Internet</div>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={
                            form.facilities?.Internet?.includes("Available") ||
                            false
                          }
                          onChange={() =>
                            handleFacilityChange("Internet", "Available")
                          }
                        />
                        Available
                      </label>
                    </div>
                    {/* Community Hall with Capacity */}
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={
                            form.facilities?.["Community Hall"]?.includes(
                              "Yes"
                            ) || false
                          }
                          onChange={() =>
                            handleFacilityChange("Community Hall", "Yes")
                          }
                        />
                        Community Hall
                      </label>
                      {form.facilities?.["Community Hall"]?.includes("Yes") && (
                        <input
                          type="text"
                          name="community_hall_capacity"
                          value={form.community_hall_capacity || ""}
                          onChange={handleChange}
                          placeholder="Capacity"
                          className="input-field w-32"
                        />
                      )}
                    </div>
                    {/* Community Museum */}
                    <div>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={
                            form.facilities?.["Community Museum"]?.includes(
                              "Yes"
                            ) || false
                          }
                          onChange={() =>
                            handleFacilityChange("Community Museum", "Yes")
                          }
                        />
                        Community Museum
                      </label>
                    </div>
                    {/* Gift Shop */}
                    <div>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={
                            form.facilities?.["Gift Shop"]?.includes("Yes") ||
                            false
                          }
                          onChange={() =>
                            handleFacilityChange("Gift Shop", "Yes")
                          }
                        />
                        Gift Shop
                      </label>
                    </div>
                    {/* Cultural Program */}
                    <div>
                      <div className="font-semibold text-xs mb-2">
                        Cultural Program
                      </div>
                      {["Per Person", "Per Group", "Other"].map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-1 mr-4"
                        >
                          <input
                            type="checkbox"
                            checked={
                              form.facilities?.["Cultural Program"]?.includes(
                                opt
                              ) || false
                            }
                            onChange={() =>
                              handleFacilityChange("Cultural Program", opt)
                            }
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                    {/* Activities with pricing */}
                    <div>
                      <div className="font-semibold text-xs mb-2">
                        Activities
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        {ACTIVITY_OPTIONS.map((opt) => (
                          <label key={opt} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={
                                form.facilities?.Activities?.includes(opt) ||
                                false
                              }
                              onChange={() =>
                                handleFacilityChange("Activities", opt)
                              }
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                      {/* Activity pricing UI */}
                      {form.facilities?.Activities?.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {form.facilities.Activities.map((act: string) => (
                            <div
                              key={act}
                              className="bg-gray-50 dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700"
                            >
                              <div className="font-semibold mb-2">
                                {act} Pricing
                              </div>
                              <div className="flex gap-4 flex-wrap">
                                <div>
                                  <label className="block text-xs font-medium mb-1">
                                    Per Person
                                  </label>
                                  <input
                                    type="text"
                                    value={activityPrices[act]?.perPerson || ""}
                                    onChange={(e) =>
                                      handleActivityPriceChange(
                                        act,
                                        "perPerson",
                                        e.target.value
                                      )
                                    }
                                    className="input-field w-32"
                                    placeholder="Price"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">
                                    Per Group
                                  </label>
                                  <input
                                    type="text"
                                    value={activityPrices[act]?.perGroup || ""}
                                    onChange={(e) =>
                                      handleActivityPriceChange(
                                        act,
                                        "perGroup",
                                        e.target.value
                                      )
                                    }
                                    className="input-field w-32"
                                    placeholder="Price"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">
                                    Other
                                  </label>
                                  <input
                                    type="text"
                                    value={activityPrices[act]?.other || ""}
                                    onChange={(e) =>
                                      handleActivityPriceChange(
                                        act,
                                        "other",
                                        e.target.value
                                      )
                                    }
                                    className="input-field w-32"
                                    placeholder="Price"
                                  />
                                </div>
                              </div>
                              {errors[`activity_price_${act}`] && (
                                <div className="text-red-500 text-xs mt-1">
                                  {errors[`activity_price_${act}`]}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.facilities && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.facilities}
                    </div>
                  )}
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
                  <h2 className="text-lg font-bold mb-6 text-nepal-blue dark:text-gray-100">
                    Bank Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 dark:text-gray-100">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="bank_name"
                        value={form.bank_name}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.bank_name
                            ? "border-red-400"
                            : form.bank_name
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.bank_name && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.bank_name}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Branch <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="branch"
                        value={form.branch}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.branch
                            ? "border-red-400"
                            : form.branch
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.branch && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.branch}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Account Type <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="account_type"
                        value={form.account_type}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.account_type
                            ? "border-red-400"
                            : form.account_type
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.account_type && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.account_type}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Account Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="account_name"
                        value={form.account_name}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.account_name
                            ? "border-red-400"
                            : form.account_name
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.account_name && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.account_name}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="account_number"
                        value={form.account_number}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.account_number
                            ? "border-red-400"
                            : form.account_number
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.account_number && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.account_number}
                        </div>
                      )}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 dark:text-gray-100">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Contact Person <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="contact_person"
                        value={form.contact_person}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.contact_person
                            ? "border-red-400"
                            : form.contact_person
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.contact_person && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.contact_person}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Contact Person Role{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="contact_person_role"
                        value={form.contact_person_role}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.contact_person_role
                            ? "border-red-400"
                            : form.contact_person_role
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.contact_person_role && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.contact_person_role}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Mobile No <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="mobile_no"
                        value={form.mobile_no}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.mobile_no
                            ? "border-red-400"
                            : form.mobile_no
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.mobile_no && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.mobile_no}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.email
                            ? "border-red-400"
                            : form.email
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.email && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </div>
                      )}
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
                  className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800 dark:text-gray-100"
                >
                  <h2 className="text-lg font-bold mb-6 text-nepal-blue border-b border-gray-100 dark:border-gray-800 dark:text-white">
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
                      className="border w-full px-3 py-2 rounded-xl"
                    />
                    {images.registration_certificates &&
                      images.registration_certificates.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {images.registration_certificates.map(
                            (img: any, idx: number) => {
                              const isImage =
                                img.type &&
                                (img.type.includes("image") ||
                                  img.name?.match(/\.(jpg|jpeg|png)$/i));
                              const isPdf =
                                img.type === "application/pdf" ||
                                img.name?.match(/\.pdf$/i);
                              return (
                                <div key={idx} className="relative">
                                  {isImage ? (
                                    <img
                                      src={URL.createObjectURL(img)}
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
                                    {img.name}
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
                    {errors.registration_certificates && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.registration_certificates}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        PAN/VAT Certificate (single image)
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={(e) =>
                          handleImageChange(e, "pan_vat_certificate")
                        }
                      />
                      {images.pan_vat_certificate && (
                        <img
                          src={URL.createObjectURL(images.pan_vat_certificate)}
                          alt="pan"
                          className="h-16 w-16 object-cover rounded mt-2"
                        />
                      )}
                      {errors.pan_vat_certificate && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.pan_vat_certificate}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Contact Person Identity Certificate (Front)
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={(e) =>
                          handleImageChange(e, "contact_id_front")
                        }
                      />
                      {images.contact_id_front && (
                        <img
                          src={URL.createObjectURL(images.contact_id_front)}
                          alt="id front"
                          className="h-16 w-16 object-cover rounded mt-2"
                        />
                      )}
                      {errors.contact_id_front && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.contact_id_front}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Contact Person Identity Certificate (Back)
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={(e) =>
                          handleImageChange(e, "contact_id_back")
                        }
                      />
                      {images.contact_id_back && (
                        <img
                          src={URL.createObjectURL(images.contact_id_back)}
                          alt="id back"
                          className="h-16 w-16 object-cover rounded mt-2"
                        />
                      )}
                      {errors.contact_id_back && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.contact_id_back}
                        </div>
                      )}
                    </div>
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
                  className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800 dark:text-white/90"
                >
                  <h2 className="text-lg font-bold mb-6 text-nepal-blue">
                    Homestay Image Upload
                  </h2>
                  <label className="block text-xs font-medium mb-1">
                    Homestay Photos (up to 10 images)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    multiple
                    onChange={(e) =>
                      handleImageChange(e, "homestay_photos", true)
                    }
                  />
                  {images.homestay_photos &&
                    images.homestay_photos.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {images.homestay_photos.map((img: any, idx: number) => {
                          const isImage =
                            img.type &&
                            (img.type.includes("image") ||
                              img.name?.match(/\.(jpg|jpeg|png)$/i));
                          const isPdf =
                            img.type === "application/pdf" ||
                            img.name?.match(/\.pdf$/i);
                          return (
                            <div key={idx} className="relative">
                              {isImage ? (
                                <img
                                  src={URL.createObjectURL(img)}
                                  alt="photo"
                                  className="h-16 w-16 object-cover rounded"
                                />
                              ) : isPdf ? (
                                <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded border">
                                  <FileText className="h-8 w-8 text-gray-500" />
                                  <span className="text-xs mt-1">PDF</span>
                                </div>
                              ) : null}
                              <div className="text-xs truncate w-16">
                                {img.name}
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
                          );
                        })}
                      </div>
                    )}
                  {errors.homestay_photos && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.homestay_photos}
                    </div>
                  )}
                </motion.div>
              )}
              {step === 7 && (
                <motion.div
                  key="step7"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800 dark:text-white/90"
                >
                  <h2 className="text-lg font-bold mb-6 text-nepal-blue">
                    Homestay Contents
                  </h2>
                  <div className="mb-6">
                    <label className="block text-xs font-medium mb-1">
                      Additional Services Provided By Homestay
                    </label>
                    <textarea
                      name="additional_services"
                      value={form.additional_services}
                      onChange={handleValidatedChange}
                      className={`border w-full px-3 py-2 rounded-xl ${
                        errors.additional_services
                          ? "border-red-400"
                          : form.additional_services
                          ? "border-green-400"
                          : ""
                      }`}
                      required
                      rows={2}
                    />
                    {errors.additional_services && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.additional_services}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Our History (max 500 words)
                      </label>
                      <textarea
                        name="history"
                        value={form.history}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.history
                            ? "border-red-400"
                            : form.history
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                        rows={3}
                      />
                      {errors.history && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.history}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Our Story (max 500 words)
                      </label>
                      <textarea
                        name="story"
                        value={form.story}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.story
                            ? "border-red-400"
                            : form.story
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                        rows={3}
                      />
                      {errors.story && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.story}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        About Us (max 500 words)
                      </label>
                      <textarea
                        name="about"
                        value={form.about}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.about
                            ? "border-red-400"
                            : form.about
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                        rows={3}
                      />
                      {errors.about && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.about}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Our Community (max 500 words)
                      </label>
                      <textarea
                        name="community"
                        value={form.community}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.community
                            ? "border-red-400"
                            : form.community
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                        rows={3}
                      />
                      {errors.community && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.community}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex flex-col md:flex-row justify-between gap-2 mt-6">
              {step > 0 && (
                <Button
                  className="btn-secondary w-full md:w-auto"
                  variant="outline"
                  startIcon={<ArrowLeftIcon />}
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 && (
                <Button
                  className=""
                  variant="primary"
                  endIcon={<ArrowRightIcon />}
                  onClick={() => {
                    const errs = validateStep(step);
                    setErrors(errs);
                    if (Object.keys(errs).length === 0) setStep((s) => s + 1);
                  }}
                >
                  Next
                </Button>
              )}
              {step === STEPS.length - 1 && (
                <>
                  <Button
                    type="submit"
                    className="border border-gray-300 rounded-full px-4 py-2 dark:border-gray-700 dark:hover:bg-white/[0.03] dark:text-gray-400 dark:hover:text-gray-200"
                    disabled={loading}
                    variant="primary"
                    startIcon={<SaveIcon />}
                  >
                    {loading && <span className="loader mr-2" />}
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  {errors.submit && (
                    <div className="text-red-500 text-sm mt-2 text-center">
                      {errors.submit}
                    </div>
                  )}
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminAddListingPage;
