
const jwt=require('jsonwebtoken')
const {StatusCodes}=require('http-status-codes')
const User = require('../models/User');
 const auth=async(req,res,next)=>{

 if (!process.env.JWT_SECRET && !process.env.JWT_SCRT) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'JWT_SECRET is not defined' });
  }
  const authHeader = req.headers.authorization;
if(!authHeader){
    return res.status(StatusCodes.UNAUTHORIZED).json({error:"INVALID AUTHORISATION"})
}  
const token=authHeader.split(' ')[1].trim()
const jwtSecret = process.env.JWT_SECRET || process.env.JWT_SCRT;
   
try {
  const payload = jwt.verify(token, jwtSecret)
 const user = await User.findById(payload.userId);
 if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not found' });
 }
req.user=user
  next()
} catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({error:'Invalid or expired token'})
}

}
const itsAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'You are not admin' });
  }

  return next();
}
module.exports= {auth,itsAdmin}