import { useState, useEffect } from 'react';
import { useEmployees } from '../../../hooks/useApi';
import { Users, UserCheck, UserX, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import type { Employee } from '../../../services/api';

interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  terminated: number;
  averageSalary: number;
  departments: { [key: string]: number };
  recentHires: number;
}

const EmployeeStats = () => {
  const { fetchEmployees } = useEmployees();
  const [stats, setStats] = useState<EmployeeStats>({
    total: 0,
    active: 0,
    inactive: 0,
    terminated: 0,
    averageSalary: 0,
    departments: {},
    recentHires: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const result = await fetchEmployees({ page: 1, limit: 1000 });
      const employees = result.data;

      // Calculate statistics
      const total = employees.length;
      const active = employees.filter(emp => emp.status === 'active').length;
      const inactive = employees.filter(emp => emp.status === 'inactive').length;
      const terminated = employees.filter(emp => emp.status === 'terminated').length;
      
      const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
      const averageSalary = total > 0 ? totalSalary / total : 0;

      // Department distribution
      const departments: { [key: string]: number } = {};
      employees.forEach(emp => {
        departments[emp.department] = (departments[emp.department] || 0) + 1;
      });

      // Recent hires (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentHires = employees.filter(emp => 
        new Date(emp.hire_date) >= thirtyDaysAgo
      ).length;

      setStats({
        total,
        active,
        inactive,
        terminated,
        averageSalary,
        departments,
        recentHires
      });
    } catch (error) {
      console.error('Failed to load employee stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const DepartmentCard = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
      <div className="space-y-3">
        {Object.entries(stats.departments).map(([dept, count]) => (
          <div key={dept} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{dept}</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(count / stats.total) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-900">{count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Employee Statistics</h2>
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Employees"
            value={stats.total}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Employees"
            value={stats.active}
            icon={UserCheck}
            color="bg-green-500"
          />
          <StatCard
            title="Inactive Employees"
            value={stats.inactive}
            icon={UserX}
            color="bg-red-500"
          />
          <StatCard
            title="Recent Hires (30 days)"
            value={stats.recentHires}
            icon={TrendingUp}
            color="bg-purple-500"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Average Salary"
            value={`$${stats.averageSalary.toLocaleString()}`}
            icon={DollarSign}
            color="bg-yellow-500"
          />
          <StatCard
            title="Terminated Employees"
            value={stats.terminated}
            icon={Calendar}
            color="bg-gray-500"
          />
        </div>

        {/* Department Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DepartmentCard />
          
          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Active</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(stats.active / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.active}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Inactive</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(stats.inactive / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.inactive}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Terminated</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ width: `${(stats.terminated / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.terminated}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeStats;
