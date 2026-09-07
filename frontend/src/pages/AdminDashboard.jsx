import React, { useState, useEffect } from 'react';
import { Shield, Filter, Search, Edit3, CheckCircle2, AlertCircle, BarChart3, PieChart, MapPin, X, RefreshCw } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import { adminAPI } from '../api/api.js';

const STATUS_LIST = ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'ESCALATED'];
const AUTHENTICITY_LIST = ['UNVERIFIED', 'VERIFIED', 'SPAM'];
const CATEGORY_LIST = ['POTHOLE', 'SEWAGE', 'GARBAGE', 'ELECTRICITY', 'WATER', 'STREETLIGHT', 'OTHER'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('issues'); // 'issues' or 'analytics'

  // Issues State
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [issuesError, setIssuesError] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterMinVotes, setFilterMinVotes] = useState('');

  // Update Modal State
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusVal, setStatusVal] = useState('');
  const [authVal, setAuthVal] = useState('');
  const [noteVal, setNoteVal] = useState('');
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchAdminIssues = async () => {
    try {
      setLoadingIssues(true);
      setIssuesError(null);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;
      if (filterSearch.trim()) params.search = filterSearch.trim();
      if (filterMinVotes) params.minVotes = filterMinVotes;

      const res = await adminAPI.getIssues(params);
      setIssues(res.data.issues || []);
    } catch (err) {
      console.error('Error fetching admin issues:', err);
      setIssuesError('Failed to load admin issues. Ensure admin authorization.');
    } finally {
      setLoadingIssues(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await adminAPI.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'issues') {
      fetchAdminIssues();
    } else {
      fetchAnalytics();
    }
  }, [activeTab, filterStatus, filterCategory, filterMinVotes]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminIssues();
  };

  const openUpdateModal = (issue) => {
    setSelectedIssue(issue);
    setStatusVal(issue.status);
    setAuthVal(issue.authenticity);
    setNoteVal('');
    setModalError(null);
    setModalOpen(true);
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    if (statusVal === 'REJECTED' && !noteVal.trim()) {
      setModalError('A rejection reason note is required when rejecting an issue.');
      return;
    }

    try {
      setUpdating(true);
      setModalError(null);

      await adminAPI.updateIssue(selectedIssue.id, {
        status: statusVal,
        authenticity: authVal,
        note: noteVal
      });

      setModalOpen(false);
      fetchAdminIssues();
    } catch (err) {
      console.error('Update issue error:', err);
      setModalError(err.response?.data?.message || 'Failed to update issue status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Management Console</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Verify civic reports, assign status updates, and review city-wide issue analytics.
              </p>
            </div>
          </div>

          <div className="flex bg-slate-200 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'issues'
                  ? 'bg-white text-purple-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Issue Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-purple-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Civic Analytics
            </button>
          </div>
        </div>

        {/* TAB 1: ISSUES MANAGEMENT */}
        {activeTab === 'issues' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title, description, area, or reporter name..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                >
                  Filter
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Status:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Statuses</option>
                    {STATUS_LIST.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Category:</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Categories</option>
                    {CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Min Upvotes:</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={filterMinVotes}
                    onChange={(e) => setFilterMinVotes(e.target.value)}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {loadingIssues ? (
                <div className="flex justify-center items-center py-20">
                  <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
              ) : issuesError ? (
                <div className="p-8 text-center text-rose-600 font-semibold">{issuesError}</div>
              ) : issues.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium">No matching issues found for selected admin filters.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Issue Details</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Reporter</th>
                        <th className="px-6 py-4">Area Location</th>
                        <th className="px-6 py-4 text-center">Votes</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Authenticity</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {issues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 max-w-xs">
                            <div className="font-bold text-slate-900 line-clamp-1">{issue.title}</div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              ID: #{issue.id} &bull; {new Date(issue.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center space-x-1 font-semibold text-xs text-slate-700">
                              <CategoryIcon category={issue.category} className="w-3.5 h-3.5" />
                              <span>{issue.category}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                            {issue.reporter?.name || 'Citizen'}
                          </td>
                          <td className="px-6 py-4 text-xs max-w-xs truncate text-slate-600">
                            {issue.address}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-slate-900">
                            {issue.voteCount}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={issue.status} />
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              issue.authenticity === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : issue.authenticity === 'SPAM'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {issue.authenticity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openUpdateModal(issue)}
                              className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Update</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CIVIC ANALYTICS */}
        {activeTab === 'analytics' && (
          <div>
            {loadingAnalytics || !analytics ? (
              <div className="flex justify-center items-center py-20">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Summary Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reports</div>
                    <div className="text-3xl font-black text-slate-900 mt-1">{analytics.summary.totalIssues}</div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Citizens</div>
                    <div className="text-3xl font-black text-slate-900 mt-1">{analytics.summary.totalUsers}</div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Community Votes</div>
                    <div className="text-3xl font-black text-slate-900 mt-1">{analytics.summary.totalVotes}</div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolution Rate</div>
                    <div className="text-3xl font-black text-emerald-600 mt-1">{analytics.summary.resolutionRate}%</div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Breakdown */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-sky-600" />
                      <span>Issues by Category</span>
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.byCategory).map(([cat, count]) => {
                        const pct = analytics.summary.totalIssues > 0 ? Math.round((count / analytics.summary.totalIssues) * 100) : 0;
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-700">{cat}</span>
                              <span className="text-slate-500">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                              <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                      <PieChart className="w-5 h-5 text-purple-600" />
                      <span>Issues by Status</span>
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.byStatus).map(([st, count]) => {
                        const pct = analytics.summary.totalIssues > 0 ? Math.round((count / analytics.summary.totalIssues) * 100) : 0;
                        return (
                          <div key={st}>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-700">{st.replace('_', ' ')}</span>
                              <span className="text-slate-500">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                              <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vote Distribution */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Vote Distribution</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(analytics.voteDistribution).map(([label, count]) => (
                        <div key={label} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="text-xs font-semibold text-slate-500">{label}</div>
                          <div className="text-2xl font-black text-slate-900 mt-1">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Areas */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <span>Top Affected Areas</span>
                    </h3>
                    <div className="space-y-2.5">
                      {analytics.byArea.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                          <span className="text-xs font-bold text-slate-800">{item.area}</span>
                          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            {item.count} Reports
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* UPDATE MODAL */}
      {modalOpen && selectedIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Update Issue #{selectedIssue.id}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpdateIssue} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900"
                >
                  {STATUS_LIST.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Authenticity</label>
                <select
                  value={authVal}
                  onChange={(e) => setAuthVal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900"
                >
                  {AUTHENTICITY_LIST.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Progress Note / Rejection Reason {statusVal === 'REJECTED' && <span className="text-rose-500">* Required</span>}
                </label>
                <textarea
                  rows={3}
                  placeholder={statusVal === 'REJECTED' ? 'Provide a clear rejection reason...' : 'Add progress details for citizen timeline...'}
                  value={noteVal}
                  onChange={(e) => setNoteVal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
