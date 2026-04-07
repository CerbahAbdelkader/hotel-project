const User =require('../models/User')
const { StatusCodes } = require('http-status-codes');


const login=async(req,res)=>{
  try {
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(!user){
        return res.status(StatusCodes.UNAUTHORIZED).json({message:' user not found'})
    }
    const isMatched=await user.comparePassword(password)
    if(!isMatched){
        return res.status(StatusCodes.UNAUTHORIZED).json({message:'password is not correct'})
    }
    const token=user.createToken()

    const { password: _, ...safeUser } = user._doc;

    return res.status(StatusCodes.OK).cookie('token', token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Strict', 
        maxAge: 1000 * 60 * 60 * 24 * 7, 
      }).json({ user: safeUser, token });
  } catch (error) {
    console.error('Error during Loging:', error); 
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation error occurred' });
    }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
    }
  
}
const register=async(req,res)=>{
    const {email}=req.body
    try {
     const findUser= await User.findOne({email})
     if(findUser){
       return res.status(StatusCodes.CONFLICT).json({message:'email already token'})
     }
     const user= await User.create({...req.body})
     const token = user.createToken()
     return  res.status(StatusCodes.CREATED).json({user,token})
    } catch (error) {
    console.error('Error during registration:', error); 
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation error occurred' });
    }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
    }
}
const getAllUserProfile=async(req,res)=>{
  try {
    const users = await User.find().select('-password');
    return res.status(StatusCodes.OK).json({ users });
    
  } catch (error) {
    console.error('Error during getting all users:', error); 
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation error occurred' });
    }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
}
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }

    return res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error during deleting user:', error);

    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation error occurred' });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};

const deleteAccount = async (req, res) => {
  const { id } = req.params;

  try {
    if (String(req.user._id) !== String(id) && req.user.role !== 'admin') {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Not authorized' });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }

    return res.status(StatusCodes.OK).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error during deleting account:', error);

    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Validation error occurred' });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};




module.exports={login,register,getAllUserProfile,deleteUser,deleteAccount}