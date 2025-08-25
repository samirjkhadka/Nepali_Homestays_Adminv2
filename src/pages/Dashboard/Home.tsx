import PageMeta from "../../components/common/PageMeta";
import { useNavigate } from "react-router-dom";

const organisationOptions = [
  { value: "ORG001", label: "Digi Hub" },
  { value: "ORG002", label: "Innovate Solutions" },
  { value: "ORG003", label: "Global Tech Corp" },
  { value: "ORG004", label: "Startup Ventures" },
];

const mockEmployees = [
  {
    id: "EMP001",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Engineering",
    position: "Senior Developer",
    status: "Active",
    organisationId: "ORG001",
    createdAt: "2024-06-01"
  },
  {
    id: "EMP002",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Marketing",
    position: "Marketing Manager",
    status: "Active",
    organisationId: "ORG002",
    createdAt: "2024-05-28"
  },
  {
    id: "EMP003",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    department: "Finance",
    position: "Financial Analyst",
    status: "On Leave",
    organisationId: "ORG001",
    createdAt: "2024-05-20"
  }
];

export default function Home() {
  const navigate = useNavigate();
  const totalOrgs = organisationOptions.length;
  const totalEmployees = mockEmployees.length;
  const recentEmployees = [...mockEmployees].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const orgEmployeeCounts = organisationOptions.map(org => ({
    ...org,
    count: mockEmployees.filter(e => e.organisationId === org.value).length
  }));

  return (
    <>
      <PageMeta
        title="Admin Dashboard"
        description="Organisation and Employee Management Dashboard"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Metrics */}
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="text-gray-500 text-sm">Total Organisations</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalOrgs}</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="text-gray-500 text-sm">Total Employees</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalEmployees}</div>
          </div>
        </div>

        {/* Organisation Overview */}
        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Organisation Overview</div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisation</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orgEmployeeCounts.map(org => (
                  <tr key={org.value}>
                    <td className="px-4 py-2 text-sm text-gray-900">{org.label}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{org.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Employees */}
        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Employees</div>
              <button
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={() => navigate('/employee')}
              >
                View All
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisation</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{emp.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{organisationOptions.find(o => o.value === emp.organisationId)?.label || emp.organisationId}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{emp.department}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{emp.position}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{emp.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
