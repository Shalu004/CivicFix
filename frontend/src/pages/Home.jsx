import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Filter, ArrowUpDown, AlertCircle, RefreshCw } from 'lucide-react';
import IssueCard from '../components/IssueCard.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import { issueAPI } from '../api/api.js';

const CATEGORIES = ['ALL', 'POTHOLE', 'SEWAGE', 'GARBAGE', 'ELECTRICITY', 'WATER', 'STREETLIGHT', 'OTHER'];
const STATUSES = ['ALL', 'PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'REJECTED'];

const Home = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (sortBy) params.sort = sortBy;

      const res = await issueAPI.getAll(params);
      setIssues(res.data.issues || []);
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError('Failed to load civic issues. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [selectedCategory, selectedStatus, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIssues();
  };

  return (
    <div className="flex-1 bg-slate-50 pb-16">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center space-x-2 bg-sky-500/20 text-sky-300 border border-sky-400/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            Direct Civic Action Platform
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Fixing Local Problems Together
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto font-normal">
            Report potholes, broken streetlights, sewage leaks, or uncollected waste in your neighborhood. Track resolution progress in real time.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/report"
              className="w-full sm:w-auto px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center space-x-2 text-base"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report an Issue Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, description, or area address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Controls: Category chips & Status dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            {/* Category chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    selectedCategory === cat
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat !== 'ALL' && <CategoryIcon category={cat} className="w-3.5 h-3.5" />}
                  <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                </button>
              ))}
            </div>

            {/* Status & Sort */}
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="ALL">All Statuses</option>
                  {STATUSES.filter(s => s !== 'ALL').map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="votes">Most Voted</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Issues Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchIssues}
              className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold"
            >
              Retry Connection
            </button>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
            <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-slate-400 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No issues found</h3>
            <p className="text-slate-500 text-sm mt-1">
              Try adjusting your category filters, search keywords, or report a new civic issue.
            </p>
            <Link
              to="/report"
              className="inline-block mt-5 px-5 py-2.5 bg-sky-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-sky-700 transition-colors"
            >
              Report a New Issue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onVoteSuccess={fetchIssues} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
