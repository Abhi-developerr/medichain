import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, FileText, Download, Eye, Users, CheckCircle, Clock, MessageSquare, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [shareCode, setShareCode] = useState('');
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);

  const handleAccessReports = async (e) => {
    e.preventDefault();
    if (!shareCode.trim()) {
      toast.error('Please enter a share code');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/reports/access', { 
        shareCode: shareCode.toUpperCase() 
      });
      
      setPatient(data.patient);
      setReports(data.reports);
      toast.success(`Access granted to ${data.patient.name}'s reports`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid share code');
      setPatient(null);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId, filename) => {
    try {
      const response = await axios.get(`/api/reports/download/${reportId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const handleView = async (fileId) => {
    try {
      const response = await axios.get(`/api/reports/view/${fileId}`, {
        responseType: 'blob'
      });
      
      // Get content type from response headers
      const contentType = response.headers['content-type'] || 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      toast.error('Failed to view report');
    }
  };

  const handleOpenNotesModal = (report) => {
    setSelectedReport(report);
    setNotes('');
    setShowNotesModal(true);
  };

  const handleAddNotes = async () => {
    if (!notes.trim()) {
      toast.error('Please enter your notes');
      return;
    }

    try {
      await axios.put(`/api/reports/${selectedReport._id}/notes`, { notes });
      toast.success('Notes added successfully');
      setShowNotesModal(false);
      handleAccessReports({ preventDefault: () => {} });
    } catch (error) {
      toast.error('Failed to add notes');
    }
  };

  const handleMarkResolved = async (reportId) => {
    try {
      await axios.put(`/api/reports/${reportId}/status`, { status: 'reviewed' });
      toast.success('Report marked as resolved');
      handleAccessReports({ preventDefault: () => {} });
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getReportTypeColor = (type) => {
    const colors = {
      'prescription': 'bg-blue-100 text-blue-800',
      'lab-report': 'bg-green-100 text-green-800',
      'scan': 'bg-purple-100 text-purple-800',
      'x-ray': 'bg-yellow-100 text-yellow-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Doctor Dashboard</h1>
          <p className="mt-2 text-gray-600 text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Welcome, <span className="font-semibold text-gray-900">Dr. {user?.name}</span> - {user?.specialization}
          </p>
        </div>

        {/* Access Patient Reports */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-blue-100 animate-scale-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Search className="h-5 w-5 text-white" />
            </div>
            Access Patient Reports
          </h2>
          <p className="text-gray-600 mb-6">Enter the patient's share code to access their medical reports</p>
          
          <form onSubmit={handleAccessReports} className="flex gap-4">
            <div className="flex-1 group">
              <input
                type="text"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                placeholder="Enter patient share code (e.g., A1B2C3D4)"
                className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 uppercase font-mono text-lg hover:border-gray-300"
                maxLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Search className="h-5 w-5" />
              {loading ? 'Searching...' : 'Access Reports'}
            </button>
          </form>
        </div>

        {/* Patient Info */}
        {patient && (
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-8 border border-purple-200 shadow-md animate-slide-up">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                    <p className="text-gray-600 font-medium">Name</p>
                    <p className="font-bold text-gray-900 text-lg">{patient.name}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                    <p className="text-gray-600 font-medium">Email</p>
                    <p className="font-semibold text-gray-900">{patient.email}</p>
                  </div>
                  {patient.phone && (
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                      <p className="text-gray-600 font-medium">Phone</p>
                      <p className="font-semibold text-gray-900">{patient.phone}</p>
                    </div>
                  )}
                  {patient.dateOfBirth && (
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                      <p className="text-gray-600 font-medium">Date of Birth</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {patient.gender && (
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                      <p className="text-gray-600 font-medium">Gender</p>
                      <p className="font-semibold text-gray-900 capitalize">{patient.gender}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right bg-white/80 backdrop-blur-sm p-4 rounded-xl">
                <p className="text-gray-600 text-sm font-medium">Total Reports</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{reports.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reports List */}
        {reports.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Medical Reports
              <span className="ml-auto text-sm font-normal bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{reports.length} reports</span>
            </h2>
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div key={report._id} className="border-2 border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md">
                        <FileText className="h-7 w-7 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{report.title}</h3>
                        {report.description && (
                          <p className="mt-2 text-gray-600 text-sm">{report.description}</p>
                        )}
                        
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getReportTypeColor(report.reportType)}`}>
                            {report.reportType}
                          </span>
                          
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            report.status === 'reviewed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status === 'reviewed' ? '✓ Reviewed' : '⏱ Pending'}
                          </span>
                          
                          <span className="text-gray-600 font-medium">
                            📅 {new Date(report.uploadDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          
                          <span className="text-gray-600 font-medium">
                            📦 {(report.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleView(report.fileId)}
                        className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all font-semibold flex items-center gap-2 hover:scale-105 transform"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                        View
                      </button>
                      
                      <button
                        onClick={() => handleDownload(report._id, report.filename)}
                        className="px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-all font-semibold flex items-center gap-2 hover:scale-105 transform"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                        Download
                      </button>
                      
                      <button
                        onClick={() => handleOpenNotesModal(report)}
                        className="px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all font-semibold flex items-center gap-2 hover:scale-105 transform"
                        title="Add Notes"
                      >
                        <MessageSquare className="h-5 w-5" />
                        Notes
                      </button>
                      
                      {report.status !== 'reviewed' && (
                        <button
                          onClick={() => handleMarkResolved(report._id)}
                          className="px-4 py-2 text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-xl transition-all font-semibold flex items-center gap-2 shadow-md hover:scale-105 transform"
                          title="Mark as Resolved"
                        >
                          <CheckCircle className="h-5 w-5" />
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!patient && !loading && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="h-20 w-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">No Patient Selected</h3>
            <p className="mt-3 text-gray-600 max-w-md mx-auto">
              Enter a patient's share code above to access their medical reports and start reviewing
            </p>
          </div>
        )}

        {/* Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-scale-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-purple-600" />
                Add Doctor's Notes
              </h3>
              <p className="text-gray-600 mb-6">Report: <span className="font-semibold">{selectedReport?.title}</span></p>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter your professional notes, observations, or recommendations..."
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-gray-300"
              />
              
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNotes}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
