module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }

  if (password === "") {
    errors.password = "Password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  }

  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email must be a valid email address";
    }
  }

  if (password === "") {
    errors.password = "Password must not be empty";
  } else if (password !== confirmPassword) {
    errors.password = "Passwords must match";
    errors.confirmPassword = "Confirm Password not matching";
  }

  if (confirmPassword === "") {
    errors.confirmPassword = "Confirm password must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLogSetInput = (exerciseName, weight, reps) => {
  const errors = {};

  if (exerciseName.trim() === "") {
    errors.exerciseName = "Choose the exercise you performed";
  }

  if (weight === null || weight === undefined || isNaN(weight)) {
    errors.weight = "Enter the weight you did for this set";
  }

  if (reps === null || reps === undefined || isNaN(reps)) {
    errors.reps = "Enter the number of repetitions you did for this set";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateEditSetInput = (weight, reps) => {
  const errors = {};
  if (weight === null || weight === undefined || isNaN(weight)) {
    errors.weight = "Enter the weight you did for this set";
  }

  if (reps === null || reps === undefined || isNaN(reps)) {
    errors.reps = "Enter the number of repetitions you did for this set";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
