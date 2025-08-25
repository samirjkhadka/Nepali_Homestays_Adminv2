// Environment Configuration
export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Nepali Homestays',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature Flags
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // Development Configuration
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// API Endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  
  // Organisations
  organisations: {
    list: '/organisations',
    create: '/organisations',
    get: (id: number) => `/organisations/${id}`,
    update: (id: number) => `/organisations/${id}`,
    delete: (id: number) => `/organisations/${id}`,
    stats: (id: number) => `/organisations/${id}/stats`,
    employees: (id: number) => `/organisations/${id}/employees`,
  },
  
  // Employees
  employees: {
    list: '/employees',
    search: '/employees/search',
    create: '/employees',
    get: (id: number) => `/employees/${id}`,
    details: (id: number) => `/employees/${id}/details`,
    update: (id: number) => `/employees/${id}`,
    delete: (id: number) => `/employees/${id}`,
    stats: (id: number) => `/employees/${id}/stats`,
    attendance: (id: number) => `/employees/${id}/attendance`,
    salaryIncrements: (id: number) => `/employees/${id}/salary-increments`,
    byOrganisation: (orgId: number) => `/employees/organisation/${orgId}`,
  },
  
  // Attendance
  attendance: {
    list: '/attendance',
    stats: '/attendance/stats',
    report: '/attendance/report',
    create: '/attendance',
    bulkCreate: '/attendance/bulk',
    get: (id: number) => `/attendance/${id}`,
    details: (id: number) => `/attendance/${id}/details`,
    update: (id: number) => `/attendance/${id}`,
    delete: (id: number) => `/attendance/${id}`,
    byEmployee: (employeeId: number) => `/attendance/employee/${employeeId}`,
    byOrganisation: (orgId: number) => `/attendance/organisation/${orgId}`,
  },
  
  // Salary
  salary: {
    list: '/salary',
    stats: '/salary/stats',
    report: '/salary/report',
    create: '/salary',
    get: (id: number) => `/salary/${id}`,
    details: (id: number) => `/salary/${id}/details`,
    update: (id: number) => `/salary/${id}`,
    delete: (id: number) => `/salary/${id}`,
    byEmployee: (employeeId: number) => `/salary/employee/${employeeId}`,
    projection: (employeeId: number) => `/salary/employee/${employeeId}/projection`,
    byOrganisation: (orgId: number) => `/salary/organisation/${orgId}`,
  },
};

// HTTP Status Codes
export const httpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// User Roles
export const userRoles = {
  ADMIN: 'admin',
  ORGANISATION: 'organisation',
  EMPLOYEE: 'employee',
} as const;

// Employee Status
export const employeeStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TERMINATED: 'terminated',
} as const;

// Attendance Status
export const attendanceStatus = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half-day',
  LEAVE: 'leave',
} as const;

// Pagination
export const pagination = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const; 