import { useState, useEffect } from 'react';
import { Users, MessageSquare, ThumbsUp, Send, Flag, Eye, PlusCircle, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CommunityForum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
    anonymous: false
  });

  const categories = [
    { value: 'general', label: 'General Health', icon: '💊' },
    { value: 'mental-health', label: 'Mental Health', icon: '🧠' },
    { value: 'chronic-illness', label: 'Chronic Illness', icon: '❤️' },
    { value: 'pregnancy', label: 'Pregnancy & Parenting', icon: '🤰' },
    { value: 'fitness', label: 'Fitness & Exercise', icon: '💪' },
    { value: 'nutrition', label: 'Nutrition & Diet', icon: '🥗' },
    { value: 'caregiving', label: 'Caregiving', icon: '👨‍⚕️' },
    { value: 'success-stories', label: 'Success Stories', icon: '⭐' },
    { value: 'questions', label: 'Questions', icon: '❓' },
    { value: 'support', label: 'Support', icon: '🤗' }
  ];

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async () => {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/forum', { params });
      setPosts(Array.isArray(response.data.posts) ? response.data.posts : []);
    } catch (error) {
      toast.error('Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const postData = {
        ...newPost,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      await api.post('/forum', postData);
      toast.success('Post created successfully!');
      setShowCreatePost(false);
      setNewPost({ title: '', content: '', category: 'general', tags: '', anonymous: false });
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  };

  const handleViewPost = async (postId) => {
    try {
      const response = await api.get(`/forum/${postId}`);
      setSelectedPost(response.data.post);
    } catch (error) {
      toast.error('Failed to load post');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await api.post(`/forum/${postId}/like`);
      if (selectedPost && selectedPost._id === postId) {
        handleViewPost(postId);
      }
      fetchPosts();
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await api.post(`/forum/${selectedPost._id}/reply`, { content: replyText });
      toast.success('Reply added!');
      setReplyText('');
      handleViewPost(selectedPost._id);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to add reply');
    }
  };

  const handleLikeReply = async (replyId) => {
    try {
      await api.post(`/forum/${selectedPost._id}/reply/${replyId}/like`);
      handleViewPost(selectedPost._id);
    } catch (error) {
      toast.error('Failed to like reply');
    }
  };

  const handleReport = async (postId) => {
    if (!window.confirm('Report this post?')) return;
    try {
      await api.post(`/forum/${postId}/report`);
      toast.success('Post reported');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to report post');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-purple-600" />
            Community Forum
          </h1>
          <p className="text-gray-600">Connect, share experiences, and support each other</p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCreatePost(true)}
            className="ml-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Create Post
          </button>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No posts yet. Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{categories.find(c => c.value === post.category)?.icon}</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {categories.find(c => c.value === post.category)?.label}
                      </span>
                      {post.isPinned && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">📌 Pinned</span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{post.author?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <button
                    onClick={() => handleLikePost(post._id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.likeCount || 0}</span>
                  </button>
                  <button
                    onClick={() => handleViewPost(post._id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.replyCount || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{post.views || 0}</span>
                  </div>
                  <button
                    onClick={() => handleReport(post._id)}
                    className="ml-auto text-gray-400 hover:text-red-600"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Create Post</h2>
                <button onClick={() => setShowCreatePost(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[150px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. diabetes, diet, exercise"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={newPost.anonymous}
                    onChange={(e) => setNewPost({ ...newPost, anonymous: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-700">Post anonymously</label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700"
                >
                  Create Post
                </button>
              </form>
            </div>
          </div>
        )}

        {/* View Post Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
                <button onClick={() => setSelectedPost(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {categories.find(c => c.value === selectedPost.category)?.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedPost.author?.name || 'Anonymous'} • {new Date(selectedPost.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleLikePost(selectedPost._id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{selectedPost.likeCount || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{selectedPost.views || 0}</span>
                  </div>
                </div>
              </div>

              {/* Replies */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Replies ({selectedPost.replies?.length || 0})</h3>
                <div className="space-y-4">
                  {selectedPost.replies?.map((reply) => (
                    <div key={reply._id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm text-gray-600">
                          {reply.author?.name || 'Anonymous'} • {new Date(reply.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => handleLikeReply(reply._id)}
                          className="flex items-center gap-1 text-gray-500 hover:text-purple-600"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span className="text-xs">{reply.likes?.length || 0}</span>
                        </button>
                      </div>
                      <p className="text-gray-700">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Reply */}
              <form onSubmit={handleReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityForum;
