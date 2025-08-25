import React, { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { mockListings, mockBookings } from '../../data/mockData';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

// const stats = [
//   { label: 'Total Users', value: '1,245' },
//   { label: 'Active Listings', value: '312' },
//   { label: 'Bookings This Month', value: '98' },
//   { label: 'Revenue', value: 'NPR 1,200,000' },
// ];

const provinces = Array.from(new Set(mockListings.map(l => l.province)));
const locations = Array.from(new Set(mockListings.map(l => l.location)));
const homestays = Array.from(new Set(mockListings.map(l => l.title)));

function getDateNDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const AdminAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('last7');
  const [customStart, setCustomStart] = useState(formatDate(getDateNDaysAgo(7)));
  const [customEnd, setCustomEnd] = useState(formatDate(new Date()));
  const [province, setProvince] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [homestay, setHomestay] = useState('');

  // Filter bookings based on all filters
  let startDate: Date, endDate: Date;
  if (dateRange === 'last7') {
    startDate = getDateNDaysAgo(7);
    endDate = new Date();
  } else if (dateRange === 'last30') {
    startDate = getDateNDaysAgo(30);
    endDate = new Date();
  } else if (dateRange === 'thisYear') {
    startDate = new Date(new Date().getFullYear(), 0, 1);
    endDate = new Date();
  } else {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);
  }

  const filteredBookings = mockBookings.filter(b => {
    const d = new Date(b.date);
    if (d < startDate || d > endDate) return false;
    if (province && b.province !== province) return false;
    if (region && b.location !== region) return false;
    if (district && b.location !== district) return false;
    if (homestay && mockListings.find(l => l.id === b.listingId)?.title !== homestay) return false;
    return true;
  });

  // Generate chart data for bookings over time (by day)
  const days: string[] = [];
  const bookingsPerDay: Record<string, number> = {};
  let d = new Date(startDate);
  while (d <= endDate) {
    const key = formatDate(d);
    days.push(key);
    bookingsPerDay[key] = 0;
    d = new Date(d.getTime() + 24 * 60 * 60 * 1000); // add 1 day
  }
  filteredBookings.forEach(b => {
    if (bookingsPerDay[b.date] !== undefined) bookingsPerDay[b.date]++;
  });

  // Helper to get previous period dates
  function getPreviousPeriod(start: Date, end: Date) {
    const diff = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - diff);
    return { prevStart, prevEnd };
  }

  // Calculate stats for current and previous period
  const { prevStart, prevEnd } = getPreviousPeriod(startDate, endDate);
  const prevFilteredBookings = mockBookings.filter(b => {
    const d = new Date(b.date);
    if (d < prevStart || d > prevEnd) return false;
    if (province && b.province !== province) return false;
    if (region && b.location !== region) return false;
    if (district && b.location !== district) return false;
    if (homestay && mockListings.find(l => l.id === b.listingId)?.title !== homestay) return false;
    return true;
  });

  // Stat: Bookings
  const bookingsNow = filteredBookings.length;
  const bookingsPrev = prevFilteredBookings.length;
  const bookingsChange = bookingsPrev === 0 ? 0 : ((bookingsNow - bookingsPrev) / bookingsPrev) * 100;

  // Stat: Revenue (sum of price)
  const revenueNow = filteredBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const revenuePrev = prevFilteredBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const revenueChange = revenuePrev === 0 ? 0 : ((revenueNow - revenuePrev) / revenuePrev) * 100;

  // Stat: Unique Users (mock, not in mockBookings)
  const usersNow = 1245; // static for demo
  const usersPrev = 1200; // static for demo
  const usersChange = ((usersNow - usersPrev) / usersPrev) * 100;

  // Stat: Active Listings (mock, not filterable in this demo)
  const listingsNow = 312;
  const listingsPrev = 300;
  const listingsChange = ((listingsNow - listingsPrev) / listingsPrev) * 100;

  // Bookings chart: previous period data
  const prevDays: string[] = [];
  const prevBookingsPerDay: Record<string, number> = {};
  let pd = new Date(prevStart);
  while (pd <= prevEnd) {
    const key = formatDate(pd);
    prevDays.push(key);
    prevBookingsPerDay[key] = 0;
    pd = new Date(pd.getTime() + 24 * 60 * 60 * 1000);
  }
  prevFilteredBookings.forEach(b => {
    if (prevBookingsPerDay[b.date] !== undefined) prevBookingsPerDay[b.date]++;
  });

  const bookingsTrendData = {
    labels: days,
    datasets: [
      {
        label: 'Bookings',
        data: days.map(day => bookingsPerDay[day]),
        backgroundColor: 'rgba(30, 64, 175, 0.7)',
        borderColor: 'rgba(30, 64, 175, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Previous Period',
        data: days.map((_, i) => prevBookingsPerDay[prevDays[i]] ?? 0),
        backgroundColor: 'rgba(30, 64, 175, 0.1)',
        borderColor: 'rgba(30, 64, 175, 0.2)',
        borderWidth: 2,
        fill: false,
        borderDash: [6, 6],
        pointRadius: 0,
      },
    ],
  };

  // User growth mock (not filterable in this mock, but could be)
  const userGrowthData = {
    labels: days,
    datasets: [
      {
        label: 'Users',
        data: days.map((_, i) => 100 + i * 5),
        backgroundColor: 'rgba(5, 150, 105, 0.7)',
        borderColor: 'rgba(5, 150, 105, 1)',
        borderWidth: 2,
      },
      {
        label: 'Previous Period',
        data: days.map((_, i) => 90 + i * 5),
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        borderColor: 'rgba(5, 150, 105, 0.2)',
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
      },
    ],
  };

  // Helper for trend UI
  function Trend({ change, diff }: { change: number, diff: number }) {
    if (change === 0 && diff === 0) return <span className="ml-2 text-gray-400">—</span>;
    const up = change > 0;
    return (
      <span className={`ml-2 flex items-center gap-1 font-medium ${up ? 'text-green-600' : 'text-red-600'}`}>
        {up ? <ArrowUpRight className="inline h-4 w-4" /> : <ArrowDownRight className="inline h-4 w-4" />}
        {diff > 0 ? '+' : ''}{diff} ({Math.abs(change).toFixed(1)}%)
      </span>
    );
  }

  return (
    <div className="text-sm font-sans">
      <h1 className="text-2xl font-bold mb-8 text-nepal-blue font-heading">Analytics</h1>
      <div className="mb-6 card p-4 flex flex-wrap gap-4 items-center">
        <label className="font-medium">Date Range:
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="input ml-2">
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        {dateRange === 'custom' && (
          <>
            <label className="font-medium">Start:
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="input ml-2" max={customEnd} />
            </label>
            <label className="font-medium">End:
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="input ml-2" min={customStart} />
            </label>
          </>
        )}
        <label className="font-medium">Province:
          <select value={province} onChange={e => setProvince(e.target.value)} className="input ml-2">
            <option value="">All</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="font-medium">Region:
          <select value={region} onChange={e => setRegion(e.target.value)} className="input ml-2">
            <option value="">All</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="font-medium">District:
          <select value={district} onChange={e => setDistrict(e.target.value)} className="input ml-2">
            <option value="">All</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="font-medium">Homestay:
          <select value={homestay} onChange={e => setHomestay(e.target.value)} className="input ml-2">
            <option value="">All</option>
            {homestays.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="card p-6 flex flex-col items-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Bookings</div>
          <div className="text-2xl font-bold text-nepal-blue mt-1 flex items-center">{bookingsNow}<Trend change={bookingsChange} diff={bookingsNow - bookingsPrev} /></div>
        </div>
        <div className="card p-6 flex flex-col items-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Revenue</div>
          <div className="text-2xl font-bold text-nepal-blue mt-1 flex items-center">NPR {revenueNow}<Trend change={revenueChange} diff={revenueNow - revenuePrev} /></div>
        </div>
        <div className="card p-6 flex flex-col items-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Total Users</div>
          <div className="text-2xl font-bold text-nepal-blue mt-1 flex items-center">{usersNow}<Trend change={usersChange} diff={usersNow - usersPrev} /></div>
        </div>
        <div className="card p-6 flex flex-col items-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Active Listings</div>
          <div className="text-2xl font-bold text-nepal-blue mt-1 flex items-center">{listingsNow}<Trend change={listingsChange} diff={listingsNow - listingsPrev} /></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4 text-nepal-blue">Bookings Over Time</h2>
          <div className="mb-2 flex items-center">
            <span className="font-medium">Change:</span>
            <Trend change={bookingsChange} diff={bookingsNow - bookingsPrev} />
          </div>
          <Line data={bookingsTrendData} options={{
            responsive: true,
            plugins: {
              legend: { display: true },
              title: { display: false },
            },
          }} height={220} />
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4 text-nepal-blue">User Growth</h2>
          <div className="mb-2 flex items-center">
            <span className="font-medium">Change:</span>
            <Trend change={usersChange} diff={usersNow - usersPrev} />
          </div>
          <Bar data={userGrowthData} options={{
            responsive: true,
            plugins: {
              legend: { display: true },
              title: { display: false },
            },
          }} height={220} />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage; 