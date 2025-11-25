import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, FileText, X } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ReportUpload() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reportType: 'prescription',
    tags: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Only PDF, JPEG, JPG, and PNG files are allowed');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10485760) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('reportType', formData.reportType);
    uploadData.append('tags', formData.tags);

    setUploading(true);

    try {
      await axios.post('/api/reports/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Report uploaded successfully!');
      navigate('/patient/reports');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Upload Medical Report</h1>
          <p className="mt-2 text-gray-600 text-lg">Add a new medical report to your records</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="animate-fade-in">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Report Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Blood Test Results - Jan 2024"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-300"
              />
            </div>

            {/* Report Type */}
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <label htmlFor="reportType" className="block text-sm font-semibold text-gray-700 mb-2">
                Report Type *
              </label>
              <select
                id="reportType"
                name="reportType"
                required
                value={formData.reportType}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-white"
              >
                <option value="prescription">💊 Prescription</option>
                <option value="lab-report">🔬 Lab Report</option>
                <option value="scan">📊 Scan</option>
                <option value="x-ray">🩻 X-Ray</option>
                <option value="other">📄 Other</option>
              </select>
            </div>

            {/* Description */}
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any additional notes or details about this report..."
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-300"
              />
            </div>

            {/* Tags */}
            <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
              <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., diabetes, cardiology, routine checkup"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-300"
              />
            </div>

            {/* File Upload */}
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload File * (PDF, JPEG, JPG, PNG - Max 10MB)
              </label>
              
              {!file ? (
                <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group">
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">PDF, JPEG, JPG, PNG up to 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  '📤 Upload Report'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/patient/reports')}
                className="px-6 py-3.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
