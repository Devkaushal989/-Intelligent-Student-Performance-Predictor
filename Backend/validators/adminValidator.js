const userCreateValidator = (req) => {
  const errors = [];
  const { name, email, password, role } = req.body;

  if (!name || typeof name !== 'string') {
    errors.push('Name is required');
  }

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!role || !['admin', 'teacher', 'student'].includes(role)) {
    errors.push('Role must be one of admin, teacher, student');
  }

  return errors;
};

const userUpdateValidator = (req) => {
  const errors = [];
  const { role, password } = req.body;

  if (role && !['admin', 'teacher', 'student'].includes(role)) {
    errors.push('Role must be one of admin, teacher, student');
  }

  if (password && (typeof password !== 'string' || password.length < 6)) {
    errors.push('Password must be at least 6 characters');
  }

  return errors;
};

module.exports = {
  userCreateValidator,
  userUpdateValidator,
};
