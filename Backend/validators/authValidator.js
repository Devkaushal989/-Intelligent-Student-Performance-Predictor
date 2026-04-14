const loginValidator = (req) => {
  const errors = [];
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    errors.push('Valid email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Valid password is required');
  }

  return errors;
};

module.exports = {
  loginValidator,
};
