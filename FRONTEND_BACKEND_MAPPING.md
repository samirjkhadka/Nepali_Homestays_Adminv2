# Frontend-Backend API Mapping

This document outlines the complete mapping between the React frontend components and the Node.js/Express backend API endpoints.

## 🏗️ Architecture Overview

### Frontend Structure
```
src/
├── services/
│   └── api.ts              # Centralized API client
├── hooks/
│   └── useApi.ts           # Custom hooks for API operations
├── config/
│   └── environment.ts      # Environment configuration
└── pages/Sas/
    ├── Organisation/       # Organisation management
    ├── Employee/          # Employee management
    ├── Attendance/        # Attendance management
    └── Salary/           # Salary management
```

### Backend Structure
```
backend/src/
├── controllers/           # HTTP request handlers
├── services/             # Business logic layer
├── models/              # Data models
├── routes/              # API route definitions
├── validations/         # Request validation schemas
├── middlewares/         # Express middlewares
└── utils/              # Utility functions
```

## 🔗 API Endpoint Mapping

### 1. Authentication Module

#### Backend Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

#### Frontend Integration
```typescript
// src/services/api.ts
const apiClient = new ApiClient(API_BASE_URL);

// Login
const login = async (credentials: LoginRequest) => {
  return await apiClient.login(credentials);
};

// Register
const register = async (userData: RegisterRequest) => {
  return await apiClient.register(userData);
};
```

### 2. Organisation Module

#### Backend Routes
- `GET /api/organisations` - Get all organisations
- `GET /api/organisations/:id` - Get organisation by ID
- `GET /api/organisations/:id/stats` - Get organisation statistics
- `GET /api/organisations/:id/employees` - Get organisation employees
- `POST /api/organisations` - Create new organisation
- `PUT /api/organisations/:id` - Update organisation
- `DELETE /api/organisations/:id` - Delete organisation

#### Frontend Components
```typescript
// src/pages/Sas/Organisation/OrganisationsList.tsx
const { fetchOrganisations, deleteOrganisation } = useOrganisations();

// Load organisations
const loadOrganisations = async () => {
  const result = await fetchOrganisations({
    page: currentPage,
    limit: 10,
    search: searchTerm
  });
};

// src/pages/Sas/Organisation/AddOrganisation.tsx
const { createOrganisation } = useOrganisations();

const handleSubmit = async (data: CreateOrganisationRequest) => {
  await createOrganisation(data);
};
```

### 3. Employee Module

#### Backend Routes
- `GET /api/employees` - Get all employees
- `GET /api/employees/search` - Search employees
- `GET /api/employees/:id` - Get employee by ID
- `GET /api/employees/:id/details` - Get employee with details
- `GET /api/employees/:id/stats` - Get employee statistics
- `GET /api/employees/:id/attendance` - Get employee attendance
- `GET /api/employees/:id/salary-increments` - Get employee salary increments
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/organisation/:organisationId` - Get employees by organisation

#### Frontend Components
```typescript
// src/pages/Sas/Employee/Employee.tsx
const { fetchEmployees, deleteEmployee } = useEmployees();

// Load employees
const loadEmployees = async () => {
  const result = await fetchEmployees({
    page: currentPage,
    limit: 10,
    search: searchTerm
  });
};

// src/pages/Sas/Employee/AddEmployee.tsx
const { createEmployee } = useEmployees();

const handleSubmit = async (data: CreateEmployeeRequest) => {
  await createEmployee(data);
};
```

### 4. Attendance Module

#### Backend Routes
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/stats` - Get attendance statistics
- `GET /api/attendance/report` - Get attendance report
- `GET /api/attendance/:id` - Get attendance by ID
- `GET /api/attendance/:id/details` - Get attendance with details
- `POST /api/attendance` - Create attendance record
- `POST /api/attendance/bulk` - Bulk create attendance records
- `PUT /api/attendance/:id` - Update attendance record
- `DELETE /api/attendance/:id` - Delete attendance record
- `GET /api/attendance/employee/:employeeId` - Get attendance by employee
- `GET /api/attendance/organisation/:organisationId` - Get attendance by organisation

#### Frontend Integration
```typescript
// src/hooks/useApi.ts
export function useAttendance() {
  const { fetchAttendance, createAttendance, updateAttendance, deleteAttendance } = useAttendance();
  
  // Implementation for attendance operations
}
```

### 5. Salary Module

#### Backend Routes
- `GET /api/salary` - Get all salary increments
- `GET /api/salary/stats` - Get salary statistics
- `GET /api/salary/report` - Get salary report
- `GET /api/salary/:id` - Get salary increment by ID
- `GET /api/salary/:id/details` - Get salary increment with details
- `POST /api/salary` - Create salary increment
- `PUT /api/salary/:id` - Update salary increment
- `DELETE /api/salary/:id` - Delete salary increment
- `GET /api/salary/employee/:employeeId` - Get salary increments by employee
- `GET /api/salary/employee/:employeeId/projection` - Calculate salary projection
- `GET /api/salary/organisation/:organisationId` - Get salary increments by organisation

#### Frontend Integration
```typescript
// src/hooks/useApi.ts
export function useSalary() {
  const { fetchSalaryIncrements, createSalaryIncrement, updateSalaryIncrement, deleteSalaryIncrement } = useSalary();
  
  // Implementation for salary operations
}
```

## 🔧 Data Flow

### 1. API Client Layer
```typescript
// src/services/api.ts
class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Handles authentication, error handling, and response formatting
  }
  
  // Methods for each module
  async getOrganisations(params?: QueryParams): Promise<PaginatedResponse<Organisation>>
  async createOrganisation(data: CreateOrganisationRequest): Promise<Organisation>
  // ... other methods
}
```

### 2. Custom Hooks Layer
```typescript
// src/hooks/useApi.ts
export function useOrganisations() {
  const [state, setState] = useState<ApiState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchOrganisations = useCallback(async (params?: QueryParams) => {
    // Handles loading states, error handling, and toast notifications
  }, []);

  return { ...state, fetchOrganisations, createOrganisation, updateOrganisation, deleteOrganisation };
}
```

### 3. Component Layer
```typescript
// Example: OrganisationsList.tsx
const OrganisationsList = () => {
  const { loading, fetchOrganisations, deleteOrganisation } = useOrganisations();
  
  useEffect(() => {
    loadOrganisations();
  }, [currentPage, searchTerm]);

  const loadOrganisations = async () => {
    const result = await fetchOrganisations({
      page: currentPage,
      limit: 10,
      search: searchTerm
    });
    setOrganisations(result.data);
    setPagination(result.pagination);
  };
};
```

## 🔐 Authentication & Authorization

### JWT Token Management
```typescript
// src/services/api.ts
class ApiClient {
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.accessToken = localStorage.getItem('accessToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    // ... rest of request logic
  }
}
```

### Role-Based Access Control
```typescript
// Backend middleware
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Frontend route protection
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole: string }) => {
  const { user } = useAuth();
  
  if (!user || user.role !== requiredRole) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};
```

## 📊 Data Types & Validation

### TypeScript Interfaces
```typescript
// src/services/api.ts
export interface Organisation {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  website?: string;
  description?: string;
  industry?: string;
  founded_year?: number;
  employee_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  hire_date: string;
  organisation_id: number;
  department: string;
  position: string;
  salary: number;
  // ... other fields
}
```

### Validation Schemas
```typescript
// Backend validation
const createOrganisationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).required(),
  // ... other validations
});

// Frontend validation
const validateForm = () => {
  const newErrors: ValidationErrors = {};
  
  if (!formData.name.trim()) {
    newErrors.name = "Organisation name is required";
  }
  
  // ... other validations
};
```

## 🚀 Error Handling

### Backend Error Responses
```typescript
// src/utils/ApiResponse.js
class ApiResponse {
  static success(res: Response, message: string, data: any, statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res: Response, message: string, statusCode: number = 500) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Frontend Error Handling
```typescript
// src/hooks/useApi.ts
const execute = useCallback(async (apiCall: () => Promise<T>) => {
  setState(prev => ({ ...prev, loading: true, error: null }));
  
  try {
    const result = await apiCall();
    setState({ data: result, loading: false, error: null });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    setState({ data: null, loading: false, error: errorMessage });
    toast.error(errorMessage);
    throw error;
  }
}, []);
```

## 🔄 State Management

### Loading States
```typescript
const [loading, setLoading] = useState(false);

// Show loading spinner
if (loading && data.length === 0) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="ml-2">Loading...</span>
    </div>
  );
}
```

### Pagination
```typescript
const [pagination, setPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
});

const handlePageChange = (page: number) => {
  setCurrentPage(page);
  loadData(); // Reload data with new page
};
```

## 📱 User Experience Features

### Toast Notifications
```typescript
// Success notifications
toast.success('Organisation created successfully');

// Error notifications
toast.error('Failed to create organisation');

// Loading notifications
toast.loading('Creating organisation...');
```

### Search & Filtering
```typescript
const [searchTerm, setSearchTerm] = useState("");

const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();
  setCurrentPage(1);
  loadData();
};
```

### Confirmation Dialogs
```typescript
const handleDelete = async (id: number) => {
  if (window.confirm('Are you sure you want to delete this item?')) {
    try {
      await deleteItem(id);
      await loadData(); // Reload the list
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  }
};
```

## 🎯 Next Steps

1. **Complete Component Updates**: Update remaining components (EditEmployee, ViewEmployee, etc.)
2. **Authentication Integration**: Implement login/logout functionality
3. **Form Validation**: Add comprehensive client-side validation
4. **Error Boundaries**: Implement React error boundaries
5. **Testing**: Add unit and integration tests
6. **Performance**: Implement caching and optimization
7. **Deployment**: Set up production deployment pipeline

## 📝 Notes

- All API calls are centralized through the `ApiClient` class
- Custom hooks provide loading states, error handling, and toast notifications
- TypeScript interfaces ensure type safety between frontend and backend
- JWT tokens are automatically included in API requests
- Role-based access control is implemented on both frontend and backend
- Pagination, search, and filtering are supported across all modules
- Error handling includes user-friendly toast notifications
- Loading states provide good user experience during API calls
</rewritten_file> 