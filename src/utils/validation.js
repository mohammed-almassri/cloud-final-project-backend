const validateSignupInput = (data) => {
    const errors = {};
  
    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Email is invalid';
    }
  
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
  
    if (!data.name) {
      errors.name = 'Name is required';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
  
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  };
  
  const validateImageInput = (base64String) => {
    if (!base64String) {
      return {
        isValid: false,
        error: 'Image is required'
      };
    }
  
    
    const isValid = /^data:image\/(jpeg|png|gif);base64,/.test(base64String);
    
    return {
      isValid,
      error: isValid ? null : 'Invalid image format'
    };
  };
  
  module.exports = {
    validateSignupInput,
    validateImageInput
  };