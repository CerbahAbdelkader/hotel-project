const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  role: {
    type: String,
    default: "user"
<<<<<<< HEAD
=======
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
>>>>>>> origin/main
  }
}, { timestamps: true });


// Hash password only when it changes.
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
})
UserSchema.methods.createToken=function(){
  const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SCRT;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
  }
  return (
    jwt.sign({userId:this._id,name:this.name,email:this.email,role:this.role}, jwtSecret, { expiresIn: '30d' })
  )
}
UserSchema.methods.comparePassword=async function(password){
<<<<<<< HEAD
const isMatched=await bcrypt.compare(password,this.password)
return isMatched
=======
  // Backward compatibility: some legacy records may still store plain text passwords.
  if (typeof this.password === 'string' && !this.password.startsWith('$2')) {
    return password === this.password;
  }

  const isMatched = await bcrypt.compare(password, this.password);
  return isMatched;
>>>>>>> origin/main
}
module.exports = mongoose.model('User', UserSchema);