import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, AlertCircle, CheckCircle, Upload, ArrowLeft } from 'lucide-react';
import { issueAPI } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORIES = [
  { value: 'POTHOLE', label: 'Pothole' },
  { value: 'SEWAGE', label: 'Sewage Leak' },
  { value: 'GARBAGE', label: 'Garbage & Waste' },
  { value: 'ELECTRICITY', label: 'Electricity Fault' },
  { value: 'WATER', label: 'Water Supply Issue' },
  { value: 'STREETLIGHT', label: 'Broken Streetlight' },
  { value: 'OTHER', label: 'Other Issue' }
];

const ReportIssue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('POTHOLE');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Image file size exceeds the 5 MB limit.');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          if (!address) {
            setAddress(`GPS Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          alert('Could not retrieve current location. Please enter location address manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!title.trim() || !description.trim() || !address.trim()) {
      setError('Please fill in title, description, and location address.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('address', address.trim());
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      if (file) formData.append('image', file);

      const res = await issueAPI.create(formData);
      navigate(`/issues/${res.data.issue.id}`);
    } catch (err) {
      console.error('Submit issue error:', err);
      setError(err.response?.data?.message || 'Failed to submit issue report. Please check input fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Report a Civic Problem</h1>
            <p className="text-slate-500 text-sm mt-1">
              Submit your report in under 60 seconds. Municipal teams will verify and address the issue.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-medium flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Issue Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      category === cat.value
                        ? 'border-sky-600 bg-sky-50 text-sky-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Issue Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Deep pothole causing tire damage near school"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe the issue, severity, and any hazards to traffic or pedestrians..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
            </div>

            {/* Location & Coordinates */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Location / Address <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center space-x-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Use Current GPS</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. 104 Main Street, opposite Central Mall"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude (optional)"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude (optional)"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Photo Evidence (Max 5 MB)
              </label>

              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-slate-100">
                  <img src={previewUrl} alt="Preview" className="w-full h-56 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    className="absolute top-3 right-3 bg-slate-900/80 text-white p-1.5 rounded-full text-xs font-bold hover:bg-rose-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors text-center">
                  <Camera className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-700">Click to upload photo</span>
                  <span className="text-xs text-slate-400 mt-1">JPEG, PNG, WEBP, or GIF up to 5 MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-base shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span>Submitting Report...</span>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit Civic Issue Report</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
