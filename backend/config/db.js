const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

let gfs, gridfsBucket;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      maxIdleTimeMS: 30000
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Initialize GridFS
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: 'uploads'
    });

    gfs = Grid(conn.connection.db, mongoose.mongo);
    gfs.collection('uploads');

    console.log('✅ GridFS Initialized');

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Server will start but database features will not work.');
    console.log('💡 Please install MongoDB or use MongoDB Atlas.');
    // Don't exit - let server run without DB
  }
};

const getGFS = () => gfs;
const getGridFSBucket = () => gridfsBucket;

module.exports = { connectDB, getGFS, getGridFSBucket };