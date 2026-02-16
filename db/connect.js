const mongoose = require('mongoose')

// Optional but recommended in mongoose 7+
mongoose.set('strictQuery', true)

const connectDB = async (url) => {
  try {
    const conn = await mongoose.connect(url)

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ MongoDB connection failed:')
    console.error(error.message)

    // Exit process if DB fails
    process.exit(1)
  }
}

module.exports = connectDB
