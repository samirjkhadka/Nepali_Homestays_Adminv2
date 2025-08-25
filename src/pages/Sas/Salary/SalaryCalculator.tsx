import { useState, useEffect } from "react";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Switch from "../../../components/form/switch/Switch";
import { Info, Loader2 } from 'lucide-react';
import { apiClient } from '../../../services/api';
import type { Employee, SalaryIncrement } from '../../../services/api';

const TAX_SLABS = {
  single: [
    { min: 0, max: 500000, rate: 0.01 },
    { min: 500001, max: 700000, rate: 0.10 },
    { min: 700001, max: 1000000, rate: 0.20 },
    { min: 1000001, max: Infinity, rate: 0.30 }
  ],
  married: [
    { min: 0, max: 600000, rate: 0.01 },
    { min: 600001, max: 800000, rate: 0.10 },
    { min: 800001, max: 1100000, rate: 0.20 },
    { min: 1100001, max: Infinity, rate: 0.30 }
  ]
};

// Define types for employee list and details
interface EmployeeListItem {
  id: string;
  name: string;
}
interface EmployeeDetails extends EmployeeListItem {
  maritalStatus: "single" | "married";
  deductCIT: boolean;
  basic: string;
  allowance: string;
  other: string;
}

// Mock async fetch functions (replace with real API calls)
async function fetchEmployees(): Promise<EmployeeListItem[]> {
  // Simulate API call delay
  return new Promise(resolve => setTimeout(() => resolve([
    { id: "EMP001", name: "John Doe" },
    { id: "EMP002", name: "Jane Smith" },
    { id: "EMP003", name: "Mike Johnson" }
  ]), 500));
}

async function fetchEmployeeDetails(id: string): Promise<EmployeeDetails | undefined> {
  // Simulate API call delay and return detailed info
  const details: Record<string, EmployeeDetails> = {
    EMP001: {
      id: "EMP001",
      name: "John Doe",
      maritalStatus: "single",
      deductCIT: true,
      basic: "75000",
      allowance: "5000",
      other: "2000"
    },
    EMP002: {
      id: "EMP002",
      name: "Jane Smith",
      maritalStatus: "married",
      deductCIT: false,
      basic: "80000",
      allowance: "6000",
      other: "2500"
    },
    EMP003: {
      id: "EMP003",
      name: "Mike Johnson",
      maritalStatus: "single",
      deductCIT: true,
      basic: "70000",
      allowance: "4000",
      other: "1500"
    }
  };
  return new Promise(resolve => setTimeout(() => resolve(details[id]), 500));
}

export default function SalaryCalculator() {
  // Employee selection and autofill
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    maritalStatus: "single",
    deductCIT: true
  });

  // Salary Inputs
  const [salary, setSalary] = useState({
    basic: "",
    allowance: "",
    other: ""
  });

  // Config
  const [config, setConfig] = useState({
    pf: 10,
    cit: 10,
    dashainType: "month", // "month" or "percent"
    dashainPercent: 8.33, // default 8.33% (1/12)
    sst: 1
  });

  // View toggle
  const [viewMode, setViewMode] = useState<"monthly" | "annual">("annual");

  // Salary increment history
  const [salaryIncrements, setSalaryIncrements] = useState<SalaryIncrement[]>([]);
  const [salaryHistoryLoading, setSalaryHistoryLoading] = useState(false);

  // Fetch employees on mount
  useEffect(() => {
    setLoading(true);
    apiClient.getEmployees({ page: 1, limit: 100 }).then((result) => {
      setEmployees(result.data);
      setLoading(false);
    });
  }, []);

  // Autofill on employee select
  async function handleEmployeeChange(id: string) {
    setSelectedEmployeeId(Number(id));
    setLoading(true);
    try {
      const emp = await apiClient.getEmployee(Number(id));
      setProfile({
        maritalStatus: (emp as any).marital_status || "single",
        deductCIT: (emp as any).deduct_cit ?? true
      });
      setSalary({
        basic: emp.salary ? emp.salary.toString() : "",
        allowance: "",
        other: ""
      });
      // Fetch salary increment history
      setSalaryHistoryLoading(true);
      const incrementsResult = await apiClient.getSalaryIncrementsByEmployee(Number(id), { page: 1, limit: 12 });
      setSalaryIncrements(incrementsResult.data);
    } catch (e) {
      setSalaryIncrements([]);
    } finally {
      setLoading(false);
      setSalaryHistoryLoading(false);
    }
  }

  // Parse numbers safely
  const basic = parseFloat(salary.basic) || 0;
  const allowance = parseFloat(salary.allowance) || 0;
  const other = parseFloat(salary.other) || 0;
  const pfRate = config.pf / 100;
  const citRate = config.cit / 100;
  const sstRate = config.sst / 100;
  const dashainBonus = config.dashainType === "month"
    ? basic
    : (basic * config.dashainPercent / 100);

  // Calculations
  const gross = basic + allowance + other;
  const annualGross = gross * 12;
  const annualDashain = dashainBonus;
  const annualTaxable = annualGross + annualDashain;
  const sst = annualTaxable * sstRate;
  const cit = profile.deductCIT ? basic * citRate * 12 : 0;
  const pf = basic * pfRate * 12;

  // Tax calculation (progressive)
  function calculateTax(amount: number, slabs: { min: number; max: number; rate: number }[]) {
    let tax = 0;
    let remaining = amount;
    for (const slab of slabs) {
      if (remaining <= 0) break;
      const slabMin = slab.min;
      const slabMax = slab.max === Infinity ? amount : slab.max;
      const taxable = Math.max(0, Math.min(remaining, slabMax - slabMin + (slabMin === 0 ? 1 : 0)));
      if (taxable > 0) {
        tax += taxable * slab.rate;
        remaining -= taxable;
      }
    }
    return tax;
  }
  const slabs = TAX_SLABS[profile.maritalStatus as "single" | "married"];
  const tax = calculateTax(annualTaxable, slabs);
  const netAnnual = annualTaxable - (tax + sst + cit + pf);
  const netMonthly = netAnnual / 12;

  // Helper for tooltips
  function Tooltip({ text }: { text: string }) {
    return <span className="ml-1 text-blue-500 cursor-pointer" title={text}><Info className="inline w-4 h-4" /></span>;
  }

  // Slab summary for both categories
  function SlabTable() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {(["single", "married"] as const).map(cat => (
          <div key={cat} className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">{cat.charAt(0).toUpperCase() + cat.slice(1)} Slabs</h4>
            <table className="min-w-full text-xs border">
              <thead>
                <tr>
                  <th className="px-2 py-1">From</th>
                  <th className="px-2 py-1">To</th>
                  <th className="px-2 py-1">Rate %</th>
                </tr>
              </thead>
              <tbody>
                {TAX_SLABS[cat].map((slab, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1">{slab.min.toLocaleString()}</td>
                    <td className="px-2 py-1">{slab.max === Infinity ? "∞" : slab.max.toLocaleString()}</td>
                    <td className="px-2 py-1">{(slab.rate * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  }

  // Output helpers
  const showAnnual = viewMode === "annual";
  const showMonthly = viewMode === "monthly";

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow space-y-8">
      <h2 className="text-2xl font-bold mb-2">Salary Calculator</h2>
      {loading && <div className="text-blue-500">Loading...</div>}
      <div className="flex gap-4 items-center mb-4">
        <span className="font-medium">View as:</span>
        <button className={`px-3 py-1 rounded ${showAnnual ? 'bg-brand-500 text-white' : 'bg-gray-200'}`} onClick={() => setViewMode("annual")}>Annual</button>
        <button className={`px-3 py-1 rounded ${showMonthly ? 'bg-brand-500 text-white' : 'bg-gray-200'}`} onClick={() => setViewMode("monthly")}>Monthly</button>
      </div>
      {/* Employee Profile Section */}
      <section className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Employee Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Staff Name</Label>
            <Select
              id="employee"
              value={selectedEmployeeId ?? ""}
              onChange={e => handleEmployeeChange(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Select --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Marital Status</Label>
            <Input type="text" value={profile.maritalStatus.charAt(0).toUpperCase() + profile.maritalStatus.slice(1)} disabled />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Switch label="Deduct CIT" defaultChecked={profile.deductCIT} onChange={() => {}} disabled />
          </div>
        </div>
      </section>
      {/* Salary Input Section */}
      <section className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Salary Inputs (Monthly)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Basic Salary</Label>
            <Input type="number" value={salary.basic} onChange={e => setSalary(s => ({ ...s, basic: e.target.value }))} min="0" disabled={loading} />
          </div>
          <div>
            <Label>Allowance</Label>
            <Input type="number" value={salary.allowance} onChange={e => setSalary(s => ({ ...s, allowance: e.target.value }))} min="0" disabled={loading} />
          </div>
          <div>
            <Label>Other Allowance</Label>
            <Input type="number" value={salary.other} onChange={e => setSalary(s => ({ ...s, other: e.target.value }))} min="0" disabled={loading} />
          </div>
        </div>
      </section>
      {/* Configuration Section */}
      <section className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>PF % <Tooltip text="Provident Fund as % of Basic Salary" /></Label>
            <Input type="number" value={config.pf} onChange={e => setConfig(c => ({ ...c, pf: Number(e.target.value) }))} min="0" max="100" />
          </div>
          <div>
            <Label>CIT % <Tooltip text="Citizen Investment Trust as % of Basic Salary (if opted)" /></Label>
            <Input type="number" value={config.cit} onChange={e => setConfig(c => ({ ...c, cit: Number(e.target.value) }))} min="0" max="100" />
          </div>
          <div>
            <Label>Dashain Bonus <Tooltip text="1 month basic or custom % of basic" /></Label>
            <div className="flex gap-2 items-center">
              <button className={`px-2 py-1 rounded ${config.dashainType === 'month' ? 'bg-brand-500 text-white' : 'bg-gray-200'}`} onClick={() => setConfig(c => ({ ...c, dashainType: 'month' }))}>1 Month</button>
              <button className={`px-2 py-1 rounded ${config.dashainType === 'percent' ? 'bg-brand-500 text-white' : 'bg-gray-200'}`} onClick={() => setConfig(c => ({ ...c, dashainType: 'percent' }))}>%</button>
              {config.dashainType === 'percent' && (
                <Input type="number" value={config.dashainPercent} onChange={e => setConfig(c => ({ ...c, dashainPercent: Number(e.target.value) }))} min="0" max="100" className="w-20" />
              )}
            </div>
          </div>
          <div>
            <Label>SST % <Tooltip text="Social Security Tax (fixed at 1%)" /></Label>
            <Input type="number" value={config.sst} min="1" max="1" disabled />
          </div>
        </div>
      </section>
      {/* Real-Time Output Panel */}
      <section className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Calculation Summary</h3>
        <table className="min-w-full text-sm border">
          <tbody>
            <tr><td className="font-medium">Gross Salary</td><td className="text-right">{showAnnual ? annualGross.toLocaleString() : gross.toLocaleString()}</td></tr>
            <tr><td className="font-medium">Dashain Bonus</td><td className="text-right">{showAnnual ? annualDashain.toLocaleString() : (annualDashain/12).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td></tr>
            <tr><td className="font-medium">Annual Taxable Income</td><td className="text-right">{showAnnual ? annualTaxable.toLocaleString() : (annualTaxable/12).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td></tr>
            <tr><td className="font-medium">SST Deduction</td><td className="text-right">{showAnnual ? sst.toLocaleString(undefined, { maximumFractionDigits: 2 }) : (sst/12).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td></tr>
            <tr><td className="font-medium">CIT Deduction</td><td className="text-right">{showAnnual ? cit.toLocaleString(undefined, { maximumFractionDigits: 2 }) : (cit/12).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td></tr>
            <tr><td className="font-medium">PF Deduction</td><td className="text-right">{showAnnual ? pf.toLocaleString(undefined, { maximumFractionDigits: 2 }) : (pf/12).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td></tr>
            <tr><td className="font-medium">Income Tax</td><td className="text-right">{showAnnual ? tax.toLocaleString(undefined, { maximumFractionDigits: 2 }) : (tax/12).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td></tr>
            <tr className="border-t-2"><td className="font-bold">Net Salary</td><td className="text-right font-bold">{showAnnual ? netAnnual.toLocaleString(undefined, { maximumFractionDigits: 2 }) : netMonthly.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td></tr>
          </tbody>
        </table>
      </section>
      {/* Tax Slab Table */}
      <section>
        <SlabTable />
      </section>
      {/* Salary Increment History */}
      {selectedEmployeeId && (
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <h4 className="font-semibold mb-2">Salary Increment History</h4>
          {salaryHistoryLoading ? (
            <div className="flex items-center"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading history...</div>
          ) : salaryIncrements.length > 0 ? (
            <table className="min-w-full text-xs border">
              <thead>
                <tr>
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Amount</th>
                  <th className="px-2 py-1">Reason</th>
                </tr>
              </thead>
              <tbody>
                {salaryIncrements.map(inc => (
                  <tr key={inc.id}>
                    <td className="px-2 py-1">{new Date(inc.increment_date).toLocaleDateString()}</td>
                    <td className="px-2 py-1">{inc.increment_amount}</td>
                    <td className="px-2 py-1">{inc.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <span className="text-gray-500">No salary increments found.</span>
          )}
        </div>
      )}
    </div>
  );
} 