import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileText, Download, Eye, Calendar, Trash2, Search, FileDown } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get('/api/reports/my-reports');
      setReports(data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
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
      console.error('Download error:', error);
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
      console.error('View error:', error);
      toast.error('Failed to view report');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await axios.delete(`/api/reports/${reportId}`);
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.loading('Generating PDF...');
      const response = await axios.get('/api/reports/export-pdf', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `medical-records-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.dismiss();
      toast.success('Medical records exported successfully');
    } catch (error) {
      toast.dismiss();
      console.error('Export error:', error);
      toast.error('Failed to export medical records');
    }
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportType.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Medical Reports</h1>
          <p className="mt-2 text-gray-600">View, download, and manage your medical records</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by title or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Upload Button */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => navigate('/patient/upload')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Upload New Report
          </button>
          <button
            onClick={handleExportPDF}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <FileDown className="h-5 w-5" />
            Export All to PDF
          </button>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No reports found</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm ? 'Try a different search term' : 'Upload your first medical report to get started'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <div key={report._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
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
                      
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReportTypeColor(report.reportType)}`}>
                          {report.reportType}
                        </span>
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(report.uploadDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        
                        <span>{(report.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
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
                    
                    <button
                      onClick={() => handleDelete(report._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}