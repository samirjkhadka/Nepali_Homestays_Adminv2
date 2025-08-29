export interface User {
  Id: string;
  FullName: string;
  EmailAddress: string;
  Username: string;
  MobileNumber: string;
  role: string | null;
}

export interface FormData {
  host: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  address: string;
  name: string;
  description: string;
  price: number | null;
  facilities: string[];
  images: File[];
  homestayType: string;
  registration_office: string;
  registration_place: string;
  registration_no: string;
  pan_no: string;
  operated_house_no: string;
  rooms_available: string;
  guest_capacity: string;
  num_bathrooms: string;
  category: string;
  contact_person: string;
  contact_person_role: string;
  mobile_no: string;
  email: string;
  history: string;
  story: string;
  about: string;
  ward_no: string;
  street: string;
  normal_package_cost: string;
  bank_name: string;
  branch: string;
  account_type: string;
  account_name: string;
  account_number: string;
  country: string;
  additional_services: string;
  community: string;
  city: string;
  latitude: string;
  longitude: string;
  location: string;
  state: string;
  num_bedrooms: string;
  homestay_subtype: string;
}

export interface Errors {
  host?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  address?: string;
  name?: string;
  description?: string;
  price?: string;
  facilities?: string;
  images?: string;
}

export type SelectOption = { value: string; label: string };

export type ApiResponse<T> = {
  data: T;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
