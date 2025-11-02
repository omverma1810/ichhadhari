export type EmployeeStatus = "active" | "on_leave" | "suspended" | "resigned";
export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "temporary";
export type EmployeeGender = "M" | "F" | "Other";
export type EmployeeRole =
  | "admin"
  | "manager"
  | "supervisor"
  | "staff"
  | "operator";

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface EmployeeDocument {
  id: string;
  file_name: string;
  file_url: string;
  document_type: string;
  upload_date: string;
  uploaded_by?: string;
}

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: EmployeeGender;
  blood_type?: string;
  profile_picture?: string;
  personal_phone: string;
  personal_email: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  alternate_contact_phone?: string;
  residential_address: Address;
  permanent_address?: Address;
  aadhar_number?: string;
  pan_number?: string;
  driving_license?: string;
  passport_number?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  department: string;
  position: string;
  role: EmployeeRole;
  reporting_manager_id?: string;
  salary_grade: number;
  employment_type: EmploymentType;
  date_of_joining: string;
  date_of_resignation?: string;
  status: EmployeeStatus;
  system_roles: string[];
  performance_rating: number;
  last_review_date?: string;
  attendance_score: number;
  productivity_score: number;
  behavioral_score?: number;
  created_at: string;
  updated_at: string;
  documents: EmployeeDocument[];
}
