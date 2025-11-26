const ForumPost = require('../models/ForumPost');

// Get all forum posts
exports.getPosts = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = { status: status || 'active' };
    
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }
    
    const posts = await ForumPost.find(filter)
      .populate('author', 'name')
      .populate('replies.author', 'name')
      .sort({ isPinned: -1, lastActivity: -1 })
      .lean();
    
    // Hide author info for anonymous posts
    posts.forEach(post => {
      if (post.anonymous && post.author._id.toString() !== req.user._id.toString()) {
        post.author = { name: 'Anonymous User' };
      }
      post.replies.forEach(reply => {
        if (reply.anonymous && reply.author._id.toString() !== req.user._id.toString()) {
          reply.author = { name: 'Anonymous User' };
        }
      });
    });
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new post
exports.createPost = async (req, res) => {
  try {
    const { category, title, content, tags, anonymous } = req.body;
    
    const post = await ForumPost.create({
      author: req.user._id,
      category,
      title,
      content,
      tags: tags || [],
      anonymous: anonymous || false
    });
    
    await post.populate('author', 'name');
    
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single post
exports.getPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name')
      .populate('replies.author', 'name');
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Increment views
    post.views += 1;
    await post.save();
    
    // Hide author info for anonymous
    const postObj = post.toObject();
    if (postObj.anonymous && postObj.author._id.toString() !== req.user._id.toString()) {
      postObj.author = { name: 'Anonymous User' };
    }
    postObj.replies.forEach(reply => {
      if (reply.anonymous && reply.author._id.toString() !== req.user._id.toString()) {
        reply.author = { name: 'Anonymous User' };
      }
    });
    
    res.json({ success: true, post: postObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add reply to post
exports.addReply = async (req, res) => {
  try {
    const { content, anonymous } = req.body;
    
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    post.replies.push({
      author: req.user._id,
      content,
      anonymous: anonymous || false
    });
    
    await post.save();
    await post.populate('replies.author', 'name');
    
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Like post
exports.likePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const likeIndex = post.likes.findIndex(like => 
      like.user.toString() === req.user._id.toString()
    );
    
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }
    
    await post.save();
    
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Like reply
exports.likeReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    const reply = post.replies.id(replyId);
    
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }
    
    const likeIndex = reply.likes.findIndex(like => 
      like.user.toString() === req.user._id.toString()
    );
    
    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push({ user: req.user._id });
    }
    
    await post.save();
    
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Report post
exports.reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    post.reportedBy.push({
      user: req.user._id,
      reason
    });
    
    // Auto-flag if reported multiple times
    if (post.reportedBy.length >= 3) {
      post.status = 'flagged';
    }
    
    await post.save();
    
    res.json({ success: true, message: 'Post reported successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Only author or admin can delete
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await post.deleteOne();
    
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get forum statistics
exports.getStats = async (req, res) => {
  try {
    const posts = await ForumPost.find({ status: 'active' });
    
    const stats = {
      totalPosts: posts.length,
      totalReplies: posts.reduce((sum, post) => sum + post.replyCount, 0),
      totalViews: posts.reduce((sum, post) => sum + post.views, 0),
      byCategory: {},
      topPosts: await ForumPost.find({ status: 'active' })
        .sort({ views: -1 })
        .limit(5)
        .populate('author', 'name')
        .select('title views likeCount category')
    };
    
    posts.forEach(post => {
      stats.byCategory[post.category] = (stats.byCategory[post.category] || 0) + 1;
    });
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
