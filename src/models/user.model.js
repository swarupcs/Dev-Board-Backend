import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new Schema({
  avatar: {
    url: {
      type: String,
      default: 'https://via.placeholder.com/200x200.png',
    },
    localPath: {
      type: String,
      default: '',
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // do not return password in queries by default
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: '',
  },
  emailVerificationExpiry: {
    type: Date,
  },
  forgotPasswwordToken: {
    type: String,
  },
  forgotPasswordExpiry: {
    type: Date,
  },
  refreshToken: {
    type: String,
  },
}, {timestamps: true});

// Middleware: Hash password before saving
userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// Password verification method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
}

export const User = mongoose.model('User', userSchema);