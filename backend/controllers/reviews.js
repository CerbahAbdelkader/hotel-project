const Review = require('../models/Review');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');

const createReview = async (req, res) => {
  try {
    const { roomId, name, rating, comment } = req.body;

    // Validate required fields
    if (!roomId || !name || !rating || !comment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'All fields (roomId, name, rating, comment) are required.',
      });
    }

    // Validate roomId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(String(roomId))) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid roomId format.',
      });
    }

    // Validate rating is between 1 and 5
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Room not found.',
      });
    }

    // Create the review
    const review = await Review.create({
      room: roomId,
      name: name.trim(),
      rating: ratingNum,
      comment: comment.trim(),
    });

    // Populate room reference for response
    await review.populate('room', 'roomNumber type name');

    return res.status(StatusCodes.CREATED).json({
      message: 'Review created successfully.',
      review,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    }
    if (error.name === 'CastError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid room ID format.',
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error',
    });
  }
};

const getReviewsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate roomId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(String(roomId))) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid roomId format.',
      });
    }

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Room not found.',
      });
    }

    // Fetch reviews sorted by creation date (newest first)
    const reviews = await Review.find({ room: roomId })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    return res.status(StatusCodes.OK).json({
      message: 'Reviews retrieved successfully.',
      reviews,
      count: reviews.length,
      averageRating: Number(averageRating),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid room ID format.',
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error',
    });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('room', 'roomNumber type name')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(StatusCodes.OK).json({
      message: 'All reviews retrieved successfully.',
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error',
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Validate reviewId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(String(reviewId))) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid review ID format.',
      });
    }

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Review not found.',
      });
    }

    return res.status(StatusCodes.OK).json({
      message: 'Review deleted successfully.',
      review,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid review ID format.',
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  createReview,
  getReviewsByRoom,
  getAllReviews,
  deleteReview,
};
