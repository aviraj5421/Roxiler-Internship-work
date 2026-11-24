const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const { signToken } = require('../utils/token');
const AppError = require('../utils/appError');

class AuthService {
  /**
   * Register a new normal user (Role: USER)
   */
  async register({ name, email, password, address }) {
    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      throw new AppError('An account with this email address already exists.', 409, {
        email: 'An account with this email address already exists.',
      });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into PostgreSQL
    const result = await query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, 'USER')
       RETURNING id, name, email, address, role, created_at`,
      [name, email, hashedPassword, address]
    );

    const newUser = result.rows[0];
    const token = signToken(newUser);

    return {
      user: newUser,
      token,
    };
  }

  /**
   * Single login endpoint for all three roles (ADMIN, USER, STORE_OWNER)
   */
  async login({ email, password }) {
    // Find user by email
    const result = await query(
      'SELECT id, name, email, password, address, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      throw new AppError('Invalid email or password.', 401);
    }

    const user = result.rows[0];

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Generate JWT
    const token = signToken(user);

    // Return user info without password hash
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    };
  }

  /**
   * Change password for logged-in user
   */
  async changePassword(userId, { oldPassword, newPassword }) {
    // Fetch current user's password
    const result = await query('SELECT id, password FROM users WHERE id = $1', [userId]);
    if (result.rowCount === 0) {
      throw new AppError('User not found.', 404);
    }

    const user = result.rows[0];

    // Verify old password
    const isOldValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldValid) {
      throw new AppError('The old password you provided is incorrect.', 400, {
        oldPassword: 'The old password you provided is incorrect.',
      });
    }

    // Hash new password
    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update in database
    await query('UPDATE users SET password = $1 WHERE id = $2', [newHashedPassword, userId]);

    return {
      message: 'Password changed successfully.',
    };
  }

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(userId) {
    const result = await query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      throw new AppError('User not found.', 404);
    }

    return result.rows[0];
  }
}

module.exports = new AuthService();
