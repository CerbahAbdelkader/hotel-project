const Contact = require('../models/Contact');
const { StatusCodes } = require('http-status-codes');
const { sendContactEmail } = require('../utils/emailService');

const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'All fields (name, email, subject, message) are required.',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid email format.',
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
    });

    // Send email to hotel (and confirmation to user if email provided)
    await sendContactEmail({
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
    });

    return res.status(StatusCodes.CREATED).json({
      message: 'Contact message saved successfully and email sent to hotel.',
      contact,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error.message,
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error',
    });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.status(StatusCodes.OK).json({
      message: 'Contacts retrieved successfully.',
      contacts,
      count: contacts.length,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error',
    });
  }
};

const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Contact not found.',
      });
    }
    return res.status(StatusCodes.OK).json({
      message: 'Contact retrieved successfully.',
      contact,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid contact ID.',
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error',
    });
  }
};

const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'read', 'replied'];

    if (!status || !allowed.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Status must be one of: ${allowed.join(', ')}`,
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Contact not found.',
      });
    }

    return res.status(StatusCodes.OK).json({
      message: 'Contact status updated successfully.',
      contact,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid contact ID.',
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error',
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Contact not found.',
      });
    }
    return res.status(StatusCodes.OK).json({
      message: 'Contact deleted successfully.',
      contact,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid contact ID.',
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
};
