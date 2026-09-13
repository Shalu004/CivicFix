import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, ThumbsUp, Activity, PlusCircle, RefreshCw, AlertCircle } from 'lucide-react';
import IssueCard from '../components/IssueCard.jsx';
import { issueAPI } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' or 'votes'

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await issueAPI.getMyDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load user dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 max-w-lg mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <p className="font-semibold text-slate-800">{error || 'Could not load dashboard data.'}</p>
        <button onClick={fetchDashboard} className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold">
          Retry
        </button>
      </div>
    );
  }

  const { stats, myReports, myVotedIssues } = data;

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Citizen Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome back, <strong className="text-slate-800">{user?.name}</strong>. Track your submitted civic reports and active community votes.
            </p>
          </div>

          <Link
            to="/report"
            className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report New Issue</span>
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="bg-sky-50 text-sky-600 p-3 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.totalReports}</div>
              <div className="text-xs font-semibold text-slate-500">Reports Submitted</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.resolvedReports}</div>
              <div className="text-xs font-semibold text-slate-500">Issues Resolved</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
              <ThumbsUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.totalVotesCast}</div>
              <div className="text-xs font-semibold text-slate-500">Votes Cast</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.activeReports}</div>
              <div className="text-xs font-semibold text-slate-500">Active Issues</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 space-x-6">
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Reports ({myReports.length})
          </button>
          <button
            onClick={() => setActiveTab('votes')}
            className={`pb-3 font-bold text-sm border-b-2 transition-colors ${
              activeTab === 'votes'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Votes ({myVotedIssues.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'reports' ? (
          myReports.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto">
              <div className="text-3xl mb-2">👋</div>
              <h3 className="text-lg font-bold text-slate-900">Welcome to CivicFix!</h3>
              <p className="text-sm text-slate-500 mt-1">You haven't reported any civic issues yet.</p>
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/report" className="w-full sm:w-auto px-4 py-2.5 bg-sky-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-sky-700 transition-colors">
                  Report Your First Issue
                </Link>
                <Link to="/" className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Explore Issues
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myReports.map(issue => (
                <IssueCard key={issue.id} issue={issue} onVoteSuccess={fetchDashboard} />
              ))}
            </div>
          )
        ) : (
          myVotedIssues.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto">
              <ThumbsUp className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No voted issues found</h3>
              <p className="text-xs text-slate-500 mt-1">Upvote community reports to highlight urgent issues to municipal teams.</p>
              <Link to="/" className="inline-block mt-4 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-lg">
                Browse Community Issues
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myVotedIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} onVoteSuccess={fetchDashboard} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
