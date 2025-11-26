import { useState, useEffect } from 'react';
import { Scan, Upload, CheckCircle, XCircle, FileText, Eye, Trash2, Download } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const DocumentScanner = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('prescription');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      const params = filter !== 'all' ? { documentType: filter } : {};
      const response = await api.get('/document-scanner', { params });
      setDocuments(Array.isArray(response.data.documents) ? response.data.documents : []);
    } catch (error) {
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error('Please select a document first');
      return;
    }

    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('documentType', documentType);

      const response = await api.post('/document-scanner/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Document scanned successfully!');
      setSelectedFile(null);
      setDocumentType('prescription');
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;

    try {
      await api.delete(`/document-scanner/${id}`);
      toast.success('Document deleted');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const documentTypes = [
    { value: 'prescription', label: 'Prescription', icon: '💊' },
    { value: 'lab-report', label: 'Lab Report', icon: '🔬' },
    { value: 'medical-certificate', label: 'Medical Certificate', icon: '📄' },
    { value: 'insurance-card', label: 'Insurance Card', icon: '💳' },
    { value: 'vaccination-card', label: 'Vaccination Card', icon: '💉' },
    { value: 'bill', label: 'Medical Bill', icon: '💰' },
    { value: 'other', label: 'Other', icon: '📎' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Scan className="w-10 h-10 text-blue-600" />
            Medical Document Scanner
          </h1>
          <p className="text-gray-600">Upload and extract data from medical documents using AI-powered OCR</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600" />
            Upload Document
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {selectedFile && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-500 hover:text-red-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={!selectedFile || scanning}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {scanning ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Scan className="w-5 h-5" />
                Scan Document
              </>
            )}
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Documents</option>
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto" />
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Scan className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No documents scanned yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <div key={doc._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{documentTypes.find(t => t.value === doc.documentType)?.icon}</span>
                      <h3 className="font-semibold text-lg capitalize">{doc.documentType.replace('-', ' ')}</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {doc.verified && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Verified</span>
                    )}
                  </div>
                </div>

                {doc.extractedData && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg text-sm">
                    {doc.extractedData.medications?.length > 0 && (
                      <div className="mb-2">
                        <strong>Medications:</strong>
                        <ul className="ml-4 list-disc">
                          {doc.extractedData.medications.map((med, idx) => (
                            <li key={idx}>{med.name} - {med.dosage}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {doc.extractedData.doctorName && (
                      <p><strong>Doctor:</strong> {doc.extractedData.doctorName}</p>
                    )}
                    {doc.extractedData.confidence && (
                      <p className="text-xs text-gray-500 mt-2">
                        Confidence: {(doc.extractedData.confidence * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Document Details</h2>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <strong>Type:</strong> <span className="capitalize">{selectedDoc.documentType.replace('-', ' ')}</span>
                </div>
                <div>
                  <strong>Status:</strong> <span className="capitalize">{selectedDoc.status}</span>
                </div>
                {selectedDoc.extractedData?.text && (
                  <div>
                    <strong>Extracted Text:</strong>
                    <p className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{selectedDoc.extractedData.text}</p>
                  </div>
                )}
                {selectedDoc.extractedData?.structured && (
                  <div>
                    <strong>Structured Data:</strong>
                    <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(selectedDoc.extractedData.structured, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentScanner;
