import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Label from '../../../components/form/Label';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface AttendanceRow {
  employeeId: string;
  date: string;
  status: string;
  error?: string;
}

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateRow = (row: AttendanceRow): string | undefined => {
    if (!row.employeeId) return 'Missing Employee ID';
    if (!row.date) return 'Missing Date';
    if (!row.status) return 'Missing Status';
    return undefined;
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      toast.error('Please upload a valid Excel or CSV file.');
      return;
    }
    setLoading(true);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (!bstr) return;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
      // Assume first row is header
      const [header, ...rows] = data;
      const idxEmployeeId = header.findIndex(h => h.toLowerCase().includes('employee'));
      const idxDate = header.findIndex(h => h.toLowerCase().includes('date'));
      const idxStatus = header.findIndex(h => h.toLowerCase().includes('status'));
      if (idxEmployeeId === -1 || idxDate === -1 || idxStatus === -1) {
        toast.error('Excel must have Employee, Date, and Status columns.');
        setLoading(false);
        return;
      }
      const parsed: AttendanceRow[] = rows.map(row => {
        const attendanceRow: AttendanceRow = {
          employeeId: row[idxEmployeeId] || '',
          date: row[idxDate] || '',
          status: row[idxStatus] || ''
        };
        const error = validateRow(attendanceRow);
        if (error) attendanceRow.error = error;
        return attendanceRow;
      });
      setAttendanceData(parsed);
      setLoading(false);
      toast.success('Attendance file parsed successfully!');
    };
    reader.readAsBinaryString(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleZoneClick = () => {
    inputRef.current?.click();
  };

  const handleSubmit = () => {
    if (attendanceData.length === 0) {
      toast.error('No attendance data to submit.');
      return;
    }
    const invalidRows = attendanceData.filter(row => row.error);
    if (invalidRows.length > 0) {
      toast.error('Please fix errors before submitting.');
      return;
    }
    // Here you would send attendanceData to the backend
    toast.success('Attendance data submitted! (Not yet connected to backend)');
  };

  if (loading && attendanceData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading attendance records...</span>
      </div>
    );
  }

  if (!loading && attendanceData.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 text-lg">
        No attendance records found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow space-y-8">
      <h2 className="text-2xl font-bold mb-2">Attendance Upload</h2>
      <div className="mb-4">
        <Label>Upload Attendance Excel/CSV</Label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400'}`}
          onClick={handleZoneClick}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileUpload}
            className="hidden"
            ref={inputRef}
            disabled={loading}
          />
          <div className="flex flex-col items-center justify-center">
            <span className="text-2xl">📁</span>
            <span className="mt-2 text-gray-700">Drag & drop or click to upload</span>
            <span className="text-xs text-gray-400">(Excel .xlsx or .csv)</span>
            {fileName && <div className="mt-2 text-sm text-gray-500">File: {fileName}</div>}
          </div>
        </div>
      </div>
      {attendanceData.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr>
                  <th className="px-2 py-1">Employee ID</th>
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1 text-red-600">Error</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((row, i) => (
                  <tr key={i} className={row.error ? 'bg-red-50' : ''}>
                    <td className="px-2 py-1">{row.employeeId}</td>
                    <td className="px-2 py-1">{row.date}</td>
                    <td className="px-2 py-1">{row.status}</td>
                    <td className="px-2 py-1 text-red-600">{row.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
            onClick={handleSubmit}
            disabled={loading || attendanceData.some(row => row.error)}
          >
            Submit Attendance
          </button>
        </div>
      )}
    </div>
  );
} 