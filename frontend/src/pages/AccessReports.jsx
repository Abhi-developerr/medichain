import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, FileText, Download, Eye, Users, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function AccessReports() {
  const { user } = useAuth();
  const [shareCode, setShareCode] = useState('');
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Access Patient Reports</h1>
          <p className="mt-2 text-gray-600">
            Enter the patient's share code to access their medical reports
          </p>
        </div>

        {/* Access Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <form onSubmit={handleAccessReports} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                placeholder="Enter patient share code (e.g., A1B2C3D4)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase font-mono text-lg"
                maxLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <Search className="h-5 w-5" />
              {loading ? 'Searching...' : 'Access Reports'}
            </button>
          </form>
        </div>

        {/* Patient Info */}
        {patient && (
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{patient.email}</p>
                  </div>
                  {patient.phone && (
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">{patient.phone}</p>
                    </div>
                  )}
                  {patient.dateOfBirth && (
                    <div>
                      <p className="text-gray-600">Date of Birth</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {patient.gender && (
                    <div>
                      <p className="text-gray-600">Gender</p>
                      <p className="font-semibold text-gray-900 capitalize">{patient.gender}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">Total Reports</p>
                <p className="text-3xl font-bold text-primary-600">{reports.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reports List */}
        {reports.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Medical Reports</h2>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-3 bg-primary-100 rounded-lg">
                        <FileText className="h-6 w-6 text-primary-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                        {report.description && (
                          <p className="mt-1 text-gray-600 text-sm">{report.description}</p>
                        )}
                        
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.reportType)}`}>
                            {report.reportType}
                          </span>
                          
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(report.uploadDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          
                          <span className="text-gray-500">
                            {(report.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleView(report.fileId)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDownload(report._id, report.filename)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!patient && !loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Users className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Patient Selected</h3>
            <p className="mt-2 text-gray-600">
              Enter a patient's share code above to access their medical reports
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
