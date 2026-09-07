import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MapPin, Calendar } from 'lucide-react';
import CategoryIcon from './CategoryIcon.jsx';
import StatusBadge from './StatusBadge.jsx';
import { issueAPI } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_BASE_URL.replace('/api', '');

const IssueCard = ({ issue, onVoteSuccess }) => {
  const { user } = useAuth();
  const [voting, setVoting] = useState(false);
  const [voteCount, setVoteCount] = useState(issue.voteCount || 0);
  const [hasVoted, setHasVoted] = useState(issue.userHasVoted || false);
  const [currentStatus, setCurrentStatus] = useState(issue.status);

  const handleVote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please log in to upvote issues.');
      return;
    }

    try {
      setVoting(true);
      const res = await issueAPI.toggleVote(issue.id);
      setVoteCount(res.data.voteCount);
      setHasVoted(res.data.voted);
      if (res.data.status) {
        setCurrentStatus(res.data.status);
      }
      if (onVoteSuccess) {
        onVoteSuccess(issue.id, res.data);
      }
    } catch (err) {
      console.error('Error voting:', err);
      alert(err.response?.data?.message || 'Failed to vote on issue.');
    } finally {
      setVoting(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
  };

  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {issue.imageUrl && (
          <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
            <img
              src={getImageUrl(issue.imageUrl)}
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold">
              <CategoryIcon category={issue.category} className="w-3.5 h-3.5" />
              <span>{issue.category}</span>
            </div>
            <StatusBadge status={currentStatus} />
          </div>

          <Link to={`/issues/${issue.id}`} className="block group-hover:text-sky-600 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 line-clamp-1 leading-snug">
              {issue.title}
            </h3>
          </Link>

          <p className="text-slate-600 text-sm mt-2 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>

          <div className="mt-4 flex items-center text-xs text-slate-500 space-x-4">
            <div className="flex items-center space-x-1 truncate max-w-[200px]">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{issue.address}</span>
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={handleVote}
          disabled={voting}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            hasVoted
              ? 'bg-sky-600 text-white shadow-sm hover:bg-sky-700'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
          <span>{voteCount} Upvotes</span>
        </button>

        <Link
          to={`/issues/${issue.id}`}
          className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
};

export default IssueCard;
