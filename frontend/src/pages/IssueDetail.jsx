import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { MapPin, Calendar, User, ThumbsUp, ArrowLeft, ShieldCheck, AlertTriangle, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import CategoryIcon from '../components/CategoryIcon.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import IssueLocationMap from '../components/IssueLocationMap.jsx';
import { issueAPI } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getImageUrl } from '../api/config.js';

const IssueDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justSubmitted = location.state?.justSubmitted || false;

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voting, setVoting] = useState(false);

  const fetchIssueDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await issueAPI.getById(id);
      setIssue(res.data.issue);
    } catch (err) {
      console.error('Error fetching issue detail:', err);
      setError('Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueDetail();
  }, [id]);

  const handleVote = async () => {
    if (!user) {
      alert('Please log in to upvote issues.');
      navigate('/login');
      return;
    }

    try {
      setVoting(true);
      const res = await issueAPI.toggleVote(issue.id);
      setIssue(prev => ({
        ...prev,
        voteCount: res.data.voteCount,
        userHasVoted: res.data.voted,
        status: res.data.status || prev.status
      }));
    } catch (err) {
      console.error('Error voting:', err);
      alert(err.response?.data?.message || 'Failed to process vote.');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex-1 max-w-lg mx-auto py-16 px-4 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">{error || 'Issue not found'}</h2>
        <Link to="/" className="inline-block mt-4 text-sm font-semibold text-sky-600">
          &larr; Return to Home
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Issues</span>
        </button>

        {/* Submission Success Confirmation Banner */}
        {justSubmitted && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-start space-x-3 shadow-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Issue Report Submitted Successfully!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your report has been logged and is currently pending verification by municipal team inspectors.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Issue Header Banner */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 bg-slate-100 text-slate-800 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                  <CategoryIcon category={issue.category} className="w-4 h-4" />
                  <span>{issue.category}</span>
                </span>
                <StatusBadge status={issue.status} />
              </div>

              <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Authenticity: <strong className="text-slate-700 capitalize">{issue.authenticity.toLowerCase()}</strong></span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {issue.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center text-xs text-slate-500 gap-y-2 gap-x-6">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">{issue.address}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Reported {formattedDate}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>By {issue.reporter?.name || 'Citizen'}</span>
              </div>
            </div>
          </div>

          {/* Rejection Warning Banner */}
          {issue.status === 'REJECTED' && (
            <div className="bg-rose-50 border-b border-rose-200 p-5 text-rose-900 flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Issue Report Rejected by Authority</h4>
                <p className="text-xs text-rose-700 mt-1">
                  Reason: {issue.statusHistory?.slice(-1)[0]?.note || 'This report was determined invalid or duplicate.'}
                </p>
              </div>
            </div>
          )}

          {/* Issue Content & Media */}
          <div className="p-6 sm:p-8 space-y-6">
            {issue.imageUrl && (
              <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 max-h-[450px]">
                <img
                  src={getImageUrl(issue.imageUrl)}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-slate-800 text-base leading-relaxed whitespace-pre-line">
                {issue.description}
              </p>
            </div>

            {/* Interactive Leaflet Map View */}
            <IssueLocationMap
              latitude={issue.latitude}
              longitude={issue.longitude}
              address={issue.address}
              title={issue.title}
            />

            {/* Voting Bar */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-sm font-bold text-slate-900">{issue.voteCount} Community Upvotes</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {issue.status === 'ESCALATED' ? (
                    <strong className="text-amber-700">⚡ Community vote threshold (10 upvotes) reached — Auto-escalated to municipal team</strong>
                  ) : issue.voteCount < 10 ? (
                    <span>{10 - issue.voteCount} more upvote{10 - issue.voteCount === 1 ? '' : 's'} needed for automatic municipal escalation</span>
                  ) : (
                    <span>High priority community resolution request</span>
                  )}
                </p>
              </div>

              <button
                onClick={handleVote}
                disabled={voting}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center space-x-2 ${
                  issue.userHasVoted
                    ? 'bg-sky-600 text-white hover:bg-sky-700'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${issue.userHasVoted ? 'fill-current' : ''}`} />
                <span>{issue.userHasVoted ? 'Upvoted' : 'Upvote Issue'}</span>
              </button>
            </div>

            {/* Status History Timeline */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Status & Resolution History</span>
              </h3>

              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                {issue.statusHistory && issue.statusHistory.length > 0 ? (
                  issue.statusHistory.map((item, idx) => (
                    <div key={item.id || idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 bg-white border-2 border-sky-600 rounded-full p-1 text-sky-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={item.status} />
                          <span className="text-xs text-slate-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-sm text-slate-700 font-medium mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {item.note}
                          </p>
                        )}
                        {item.changedByAdmin && (
                          <span className="text-xs font-semibold text-purple-700 mt-1 block">
                            Updated by Admin: {item.changedByAdmin.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">No history records logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
