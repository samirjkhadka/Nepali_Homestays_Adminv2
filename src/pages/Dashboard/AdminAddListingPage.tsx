import React, { useState, useEffect, useCallback } from "react";
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
import {
  ACTIVITY_OPTIONS,
  TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  COUNTRY_OPTIONS,
  FACILITY_CATEGORIES,
} from "../../data/mockData";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";

const initialForm = {
  type: "",
  registration_office: "",
  registration_place: "",
  registration_no: "",
  pan_no: "",
  municipality: "",
  ward_no: "",
  //normal_package_cost: "",
  facilities: {},
  additional_services: "",
  bank_name: "",
  branch: "",
  account_type: "",
  account_name: "",
  account_number: "",
  operated_house_no: "",
  contact_person: "",
  contact_person_role: "",
  mobile_no: "",
  email: "",
  history: "",
  story: "",
  community: "",
  title: "",
  description: "",
  price_Per_Night: "",
  max_Guests: "",
  address: "",
  city: "",
  country: "",
  state: "",
  category: "",
  homestay_subtype: "",
  bedrooms: "",
  bathrooms: "",
};

const initialImages = {
  registration_certificates: [],
  pan_vat_certificate: null,
  contact_id_front: null,
  contact_id_back: null,
  homestay_photos: [],
};

interface District {
  id: number;
  name: string;
}

interface User {
  Id: string;
  FullName: string;
  EmailAddress: string;
  Username: string;
  MobileNumber: string;
  role: string | null;
}

function validateForm(form: any, images: any) {
  const errors: any = {};
  const requiredFields = [
    "type",
    "title",
    "registration_office",
    "registration_place",
    "registration_no",
    "pan_no",
    "municipality",
    "ward_no",
    //"normal_package_cost",
    "bank_name",
    "branch",
    "account_type",
    "account_name",
    "account_number",
    "operated_house_no",
    "bedrooms", // Replaced rooms_available
    "contact_person",
    "contact_person_role",
    "mobile_no",
    "email",
    "history",
    "story",
    "community",
    "address",
    "country",
    "category",
    "description",
    "price_Per_Night",
    "max_Guests",
    "bedrooms",
    "bathrooms",
  ];

  requiredFields.forEach((field) => {
    if (
      !form[field] ||
      (typeof form[field] === "string" && !form[field].trim())
    ) {
      errors[field] = "Required";
    }
  });

  if (
    form.type === "homestay" &&
    (!form.homestay_subtype || !form.homestay_subtype.trim())
  ) {
    errors.homestay_subtype = "Required";
  }

  if (form.title && form.title.length < 3) {
    errors.title = "Title must be at least 3 characters long";
  }
  if (form.description && form.description.length < 10) {
    errors.description = "Description must be at least 10 characters long";
  }
  if (form.price_Per_Night && Number(form.price_Per_Night) <= 0) {
    errors.price_Per_Night = "Price per night must be greater than 0";
  }
  if (form.max_Guests && Number(form.max_Guests) <= 0) {
    errors.max_Guests = "Maximum guests must be greater than 0";
  }
  if (form.bathrooms && Number(form.bathrooms) <= 0) {
    errors.bathrooms = "Number of bathrooms must be greater than 0";
  }
  if (form.bedrooms && Number(form.bedrooms) <= 0) {
    errors.bedrooms = "Number of bedrooms must be greater than 0";
  }

  ["registration_no", "pan_no", "ward_no", "mobile_no"].forEach((field) => {
    if (form[field] && !/^[0-9]+$/.test(form[field])) {
      errors[field] = "Only numeric";
    }
  });

  if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
    errors.email = "Invalid email";
  }

  if (!form.facilities || Object.keys(form.facilities).length === 0) {
    errors.facilities = "Select at least one facility";
  }

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

  ["history", "story", "description", "community"].forEach((field) => {
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
  } catch (err) {
    console.error(err);
    return file;
  }
}

async function uploadImages(files: File[], token: string): Promise<string[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file, file.name);
  }
  const res = await fetch(
    `${
      import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1"
    }/admin/upload/images`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    }
  );
  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
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
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  useEffect(() => {
    if (form.state) {
      const fetchDistricts = async () => {
        setApiLoading(true);
        setDistricts([]);
        setMunicipalities([]);
        setForm((prev: any) => ({ ...prev, city: "", municipality: "" }));
        try {
          const provinceId = provinces.indexOf(form.state) + 1;
          const response = await apiFetch<string[]>(
            `/staticData/provinces/${provinceId}/districts`,
            {},
            token || ""
          );
          const districtObjects = response.map((name, index) => ({
            id: index + 1,
            name,
          }));
          setDistricts(districtObjects);
        } catch (error) {
          console.error("Error fetching districts:", error);
          setErrors((prev: any) => ({
            ...prev,
            city: "Failed to load districts",
          }));
        } finally {
          setApiLoading(false);
        }
      };
      fetchDistricts();
    }
  }, [form.state, provinces, token]);

  useEffect(() => {
    if (form.city) {
      const fetchMunicipalities = async () => {
        setApiLoading(true);
        setMunicipalities([]);
        setForm((prev: any) => ({ ...prev, municipality: "" }));
        try {
          const response = await apiFetch<string[]>(
            `/staticData/provinces/${form.city}/municipalities`,
            {},
            token || ""
          );
          setMunicipalities(response);
        } catch (error) {
          console.error("Error fetching municipalities:", error);
          setErrors((prev: any) => ({
            ...prev,
            municipality: "Failed to load municipalities",
          }));
        } finally {
          setApiLoading(false);
        }
      };
      fetchMunicipalities();
    }
  }, [form.city, token]);

  useEffect(() => {
    const fetchProvinces = async () => {
      setApiLoading(true);
      try {
        const response = await apiFetch<{ data: { provinces: string[] } }>(
          "/staticData/provinces",
          {},
          token || ""
        );
        setProvinces(response.data.provinces);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        setErrors((prev: any) => ({
          ...prev,
          state: "Failed to load provinces",
        }));
      } finally {
        setApiLoading(false);
      }
    };
    fetchProvinces();
  }, [token]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm(form, images);
    if (Object.keys(errs).length > 0) {
      console.log("Validation Errors on Submit:", errs);
      setErrors(errs);

      return;
    }
    setLoading(true);
    try {
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

      const payload = {
        type: form.type,
      registration_office: form.registration_office,
      registration_place: form.registration_place,
      registration_no: form.registration_no,
      pan_no: form.pan_no,
      municipality: form.municipality,
      ward_no: form.ward_no,
      //normal_package_cost: form.normal_package_cost,
      facilities: form.facilities,
      additional_services: form.additional_services,
      bank_name: form.bank_name,
      branch: form.branch,
      account_type: form.account_type,
      account_name: form.account_name,
      account_number: form.account_number,
      operated_house_no: form.operated_house_no,
      // rooms_available: form.rooms_available, // Removed as it's not used
      contact_person: form.contact_person,
      contact_person_role: form.contact_person_role,
      mobile_no: form.mobile_no,
      email: form.email,
      history: form.history,
      story: form.story,
      community: form.community,
      title: form.title,
      description: form.description,
      price_Per_Night: Number(form.price_Per_Night),
      max_Guests: Number(form.max_Guests),
      address: form.address,
      city: form.city,
      country: form.country,
      state: form.state,
      category: form.category,
      homestay_subtype: form.type === "homestay" ? form.homestay_subtype : "",
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      registration_certificates: regCertUrls,
      pan_vat_certificate: panCertUrls[0] || "",
      contact_id_front: idFrontUrls[0] || "",
      contact_id_back: idBackUrls[0] || "",
      homestay_photos: photoUrls,
      activity_prices: activityPrices,
      };

      console.log("Submitting payload:", payload);
      const response =await apiFetch(
        "/admin/listings/create",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token || ""
      );
      console.log("API Response: ",{
        status:response.status,
        data:response.data || response.body || "No data",
        error:response.error || null,

      })
      showSuccess(
        "Listing Added Successfully!",
        "Your listing has been created and is pending approval."
      );
      navigate("/listings");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to add listing";
      setErrors({ submit: errorMessage });
      showError("Failed to Add Listing", errorMessage);
      console.error("Submit error:", {
        message:err.message,
        code:err.code,
        stack:err.stack
      });
    } finally {
      setLoading(false);
    }
  };

  function validateStep(currentStep: number) {
    const stepFields: Record<number, string[]> = {
      0: [
        "type",
        "title",
        "registration_office",
        "registration_place",
        "registration_no",
        "pan_no",
        "operated_house_no",
       
        "max_Guests",
        "bathrooms",
        "category",
        "price_Per_Night",
        "bedrooms",
      ],
      1: ["state", "city", "municipality", "ward_no", "address", "country"],
      2: ["facilities"],
      3: [
        "bank_name",
        "branch",
        "account_type",
        "account_name",
        "account_number",
      ],
      4: ["contact_person", "contact_person_role", "mobile_no", "email"],
      5: [],
      6: [],
      7: [
        "additional_services",
        "history",
        "story",
        "description",
        "community",
      ],
    };
    const errs: any = {};
    (stepFields[currentStep] || []).forEach((field) => {
      if (
        !form[field] ||
        (typeof form[field] === "string" && !form[field].trim())
      ) {
        errs[field] = "Required";
      }
    });

    if (currentStep === 0) {
      if (
        form.type === "homestay" &&
        (!form.homestay_subtype || !form.homestay_subtype.trim())
      ) {
        errs.homestay_subtype = "Required";
      }
      ["registration_no", "pan_no"].forEach((field) => {
        if (form[field] && !/^[0-9]+$/.test(form[field])) {
          errs[field] = "Only numeric";
        }
      });
      if (form.price_Per_Night && Number(form.price_Per_Night) <= 0) {
        errs.price_Per_Night = "Price per night must be greater than 0";
      }
      if (form.max_Guests && Number(form.max_Guests) <= 0) {
        errs.max_Guests = "Maximum guests must be greater than 0";
      }
      if (form.bathrooms && Number(form.bathrooms) <= 0) {
        errs.bathrooms = "Number of bathrooms must be greater than 0";
      }
      if (form.bedrooms && Number(form.bedrooms) <= 0) {
        errs.bedrooms = "Number of bedrooms must be greater than 0";
      }
    }
    if (currentStep === 1) {
      if (form.ward_no && !/^[0-9]+$/.test(form.ward_no)) {
        errs.ward_no = "Only numeric";
      }
    }
    if (currentStep === 2) {
      if (!form.facilities || Object.keys(form.facilities).length === 0) {
        errs.facilities = "Select at least one facility";
      }
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
      if (form.mobile_no && !/^[0-9]+$/.test(form.mobile_no)) {
        errs.mobile_no = "Only numeric";
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
      ["history", "story", "description", "community"].forEach((field) => {
        if (form[field] && form[field].split(/\s+/).length > 500) {
          errs[field] = "Max 500 words";
        }
      });
    }
    return errs;
  }

  const handleNext = () => {
    const errs = validateStep(step);
    console.log("Step 0 Validation Errors:", errs)
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep((s) => s + 1);
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

  const handleValidatedChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    handleChange(e);
    const errs = validateStep(step);
    console.log("Validated Change Errors:", errs);
    setErrors(errs);
  };

  return (
    <>
      <PageMeta title="Nepali Homestays" description="Add New Listing" />
      <PageBreadcrumb pageTitle="Add New Listing" />
      <div className="">
        <div className="flex flex-col md:flex-row gap-12 w-full max-w-7xl mx-auto">
          <div className="w-full md:w-80 flex-shrink-0 mb-8 md:mb-0">
            <ol className="space-y-6 bg-white text-gray-500 dark:bg-gray-900 rounded-xl shadow p-8 border border-gray-100 dark:border-gray-800">
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
                        ? "bg-gray-900 text-white border-nepal-blue"
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
                      className={`block w-full px-3 py-2 rounded-xl border dark:bg-gray-900 dark:text-gray-200 ${
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
                    <div className="mb-6">
                      <label className="block text-xs font-medium mb-1 dark:text-gray-200">
                        Homestay Subtype <span className="text-red-500">*</span>
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
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-gray-200 mt-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 dark:text-gray-200 mt-6">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Homestay Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.title
                            ? "border-red-400"
                            : form.title
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.title && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.title}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Office of Registration{" "}
                        <span className="text-red-500">*</span>
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
                        Place of Registration{" "}
                        <span className="text-red-500">*</span>
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
                        type="number"
                        name="bedrooms"
                        value={form.bedrooms}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.bedrooms
                            ? "border-red-400"
                            : form.bedrooms
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.bedrooms && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.bedrooms}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Guest Capacity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="max_Guests"
                        value={form.max_Guests}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.max_Guests
                            ? "border-red-400"
                            : form.max_Guests
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.max_Guests && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.max_Guests}
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
                        name="bathrooms"
                        value={form.bathrooms}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.bathrooms
                            ? "border-red-400"
                            : form.bathrooms
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.bathrooms && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.bathrooms}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Normal Package Cost (NPR){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price_Per_Night"
                        value={form.price_Per_Night}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.price_Per_Night
                            ? "border-red-400"
                            : form.price_Per_Night
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                      />
                      {errors.price_Per_Night && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.price_Per_Night}
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
                        name="state"
                        value={form.state}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.state
                            ? "border-red-400"
                            : form.state
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                        disabled={apiLoading}
                      >
                        <option value="">Select Province</option>
                        {provinces.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                      {errors.state && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.state}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="city"
                        value={form.city}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.city
                            ? "border-red-400"
                            : form.city
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                        disabled={!form.state || apiLoading}
                      >
                        <option value="">Select District</option>
                        {districts.map((d) => (
                          <option key={d.id}>{d.name}</option>
                        ))}
                      </select>
                      {errors.city && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.city}
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
                        disabled={!form.city || apiLoading}
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
                        name="description"
                        value={form.description}
                        onChange={handleValidatedChange}
                        className={`border w-full px-3 py-2 rounded-xl ${
                          errors.description
                            ? "border-red-400"
                            : form.description
                            ? "border-green-400"
                            : ""
                        }`}
                        required
                        rows={3}
                      />
                      {errors.description && (
                        <div className="text-red-500 text-xs mt-1">
                          {errors.description}
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
                  onClick={handleNext}
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
