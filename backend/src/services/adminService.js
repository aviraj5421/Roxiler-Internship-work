const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const AppError = require('../utils/appError');

class AdminService {
  /**
   * Create a new user (ADMIN, USER, or STORE_OWNER)
   */
  async createUser({ name, email, password, address, role }) {
    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      throw new AppError('An account with this email address already exists.', 409, {
        email: 'An account with this email address already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at`,
      [name, email, hashedPassword, address, role]
    );

    return result.rows[0];
  }

  /**
   * Create a new store and associate with an owner
   */
  async createStore({ name, email, address, owner_id }) {
    // Verify owner exists and check/update role
    const ownerRes = await query('SELECT id, name, email, role FROM users WHERE id = $1', [owner_id]);
    if (ownerRes.rowCount === 0) {
      throw new AppError('Store owner user does not exist with the given owner_id.', 404, {
        owner_id: 'User not found with this owner_id.',
      });
    }

    const owner = ownerRes.rows[0];

    // If the user's role is not STORE_OWNER or ADMIN, update role to STORE_OWNER
    if (owner.role === 'USER') {
      await query("UPDATE users SET role = 'STORE_OWNER' WHERE id = $1", [owner_id]);
    }

    // Insert new store
    const result = await query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id, created_at`,
      [name, email, address, owner_id]
    );

    const store = result.rows[0];
    return {
      ...store,
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
      },
    };
  }

  /**
   * Get dashboard statistics: Total users, total stores, total submitted ratings
   */
  async getDashboardStats() {
    const usersCountRes = await query('SELECT COUNT(*)::int AS count FROM users');
    const storesCountRes = await query('SELECT COUNT(*)::int AS count FROM stores');
    const ratingsCountRes = await query('SELECT COUNT(*)::int AS count FROM ratings');

    // Also get breakdown of users by role for richer admin dashboard insights
    const roleBreakdownRes = await query(
      'SELECT role, COUNT(*)::int AS count FROM users GROUP BY role'
    );
    const roleCounts = {};
    roleBreakdownRes.rows.forEach((r) => {
      roleCounts[r.role] = r.count;
    });

    return {
      totalUsers: usersCountRes.rows[0].count,
      totalStores: storesCountRes.rows[0].count,
      totalRatings: ratingsCountRes.rows[0].count,
      userRoleCounts: {
        admin: roleCounts['ADMIN'] || 0,
        storeOwner: roleCounts['STORE_OWNER'] || 0,
        normalUser: roleCounts['USER'] || 0,
      },
    };
  }

  /**
   * Get all stores with name, email, address, overall rating, and owner details
   * Supports searching by name/email/address and sorting
   */
  async getAllStores({ search, sortBy = 'name', order = 'asc' }) {
    const validSortColumns = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      created_at: 's.created_at',
      rating: 'overall_rating',
      overall_rating: 'overall_rating',
      total_ratings: 'total_ratings',
    };

    const sortCol = validSortColumns[sortBy] || 's.name';
    const sortDir = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const params = [];
    let whereClause = '';

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      whereClause = `WHERE (s.name ILIKE $1 OR s.email ILIKE $1 OR s.address ILIKE $1)`;
    }

    const sql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        u.id AS owner_id,
        u.name AS owner_name,
        u.email AS owner_email,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS overall_rating,
        COUNT(r.id)::int AS total_ratings
      FROM stores s
      JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereClause}
      GROUP BY s.id, u.id
      ORDER BY ${sortCol} ${sortDir}
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get users with name, email, address and role
   * Supports searching by name/email/address, filtering by role, and sorting
   */
  async getAllUsers({ search, role, sortBy = 'name', order = 'asc' }) {
    const validSortColumns = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      created_at: 'u.created_at',
    };

    const sortCol = validSortColumns[sortBy] || 'u.name';
    const sortDir = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.address ILIKE $${params.length})`);
    }

    if (role && role.trim()) {
      params.push(role.trim().toUpperCase());
      conditions.push(`u.role = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at
      FROM users u
      ${whereClause}
      ORDER BY ${sortCol} ${sortDir}
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * View individual user details.
   * If the user is a STORE_OWNER, also display the store owner's rating and store information!
   */
  async getUserById(userId) {
    const userResult = await query(
      `SELECT id, name, email, address, role, created_at 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rowCount === 0) {
      throw new AppError('User not found.', 404);
    }

    const user = userResult.rows[0];

    // If user is a STORE_OWNER, fetch their store details and overall store rating
    if (user.role === 'STORE_OWNER') {
      const storeRes = await query(
        `SELECT 
           s.id,
           s.name,
           s.email,
           s.address,
           s.created_at,
           COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS overall_rating,
           COUNT(r.id)::int AS total_ratings
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = $1
         GROUP BY s.id`,
        [userId]
      );

      user.stores = storeRes.rows;
      // Calculate overall rating across all stores owned by this store owner
      if (storeRes.rows.length > 0) {
        const totalRatingSum = storeRes.rows.reduce((sum, s) => sum + (parseFloat(s.overall_rating) * s.total_ratings), 0);
        const totalRatingsCount = storeRes.rows.reduce((sum, s) => sum + s.total_ratings, 0);
        user.store_owner_rating = totalRatingsCount > 0 
          ? Number((totalRatingSum / totalRatingsCount).toFixed(2)) 
          : 0;
      } else {
        user.store_owner_rating = 0;
      }
    }

    // If user is a normal USER, fetch the ratings they have submitted
    if (user.role === 'USER') {
      const userRatingsRes = await query(
        `SELECT 
           r.id AS rating_id,
           r.rating,
           r.created_at,
           r.updated_at,
           s.id AS store_id,
           s.name AS store_name
         FROM ratings r
         JOIN stores s ON r.store_id = s.id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC`,
        [userId]
      );
      user.submitted_ratings = userRatingsRes.rows;
      user.total_submitted_ratings = userRatingsRes.rowCount;
    }

    return user;
  }
}

module.exports = new AdminService();
