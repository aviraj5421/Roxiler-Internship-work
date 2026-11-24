const { query } = require('../config/db');
const AppError = require('../utils/appError');

class UserService {
  /**
   * View all registered stores for normal user.
   * Displays store name, email, address, overall store rating, and logged-in user's submitted rating.
   * Allows searching by store name and address.
   * Supports sorting ascending and descending.
   */
  async getAllStoresForUser(userId, { search, sortBy = 'name', order = 'asc' }) {
    const validSortColumns = {
      name: 's.name',
      address: 's.address',
      created_at: 's.created_at',
      rating: 'overall_rating',
      overall_rating: 'overall_rating',
      my_rating: 'my_rating',
    };

    const sortCol = validSortColumns[sortBy] || 's.name';
    const sortDir = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const params = [userId];
    let whereClause = '';

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      whereClause = `WHERE (s.name ILIKE $2 OR s.address ILIKE $2)`;
    }

    const sql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS overall_rating,
        COUNT(r.id)::int AS total_ratings,
        my_r.rating AS my_rating,
        my_r.updated_at AS my_rating_updated_at
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings my_r ON s.id = my_r.store_id AND my_r.user_id = $1
      ${whereClause}
      GROUP BY s.id, my_r.rating, my_r.updated_at
      ORDER BY ${sortCol} ${sortDir}
    `;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Submit or update rating for a store.
   * User can submit only ONE rating per store, but can modify it.
   */
  async submitRating(userId, { store_id, rating }) {
    // 1. Check if store exists
    const storeRes = await query('SELECT id, name FROM stores WHERE id = $1', [store_id]);
    if (storeRes.rowCount === 0) {
      throw new AppError('Store not found with the given ID.', 404);
    }

    // 2. Upsert rating using Postgres ON CONFLICT clause
    const sql = `
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, store_id)
      DO UPDATE SET 
        rating = EXCLUDED.rating,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, user_id, store_id, rating, created_at, updated_at,
        (xmax = 0) AS is_new_record
    `;

    const result = await query(sql, [userId, store_id, rating]);
    const row = result.rows[0];

    // Fetch the updated overall rating for this store
    const avgRes = await query(
      `SELECT 
         COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS overall_rating,
         COUNT(*)::int AS total_ratings
       FROM ratings 
       WHERE store_id = $1`,
      [store_id]
    );

    return {
      rating: {
        id: row.id,
        user_id: row.user_id,
        store_id: row.store_id,
        rating: row.rating,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
      isUpdated: !row.is_new_record,
      storeStats: avgRes.rows[0],
      message: row.is_new_record ? 'Rating submitted successfully.' : 'Rating updated successfully.',
    };
  }

  /**
   * Modify previously submitted rating explicitly (via PUT /api/user/ratings/:storeId)
   */
  async updateRating(userId, storeId, ratingValue) {
    // Check if rating exists
    const existing = await query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existing.rowCount === 0) {
      // If no rating exists yet, create one
      return await this.submitRating(userId, { store_id: storeId, rating: ratingValue });
    }

    const result = await query(
      `UPDATE ratings 
       SET rating = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2 AND store_id = $3
       RETURNING id, user_id, store_id, rating, created_at, updated_at`,
      [ratingValue, userId, storeId]
    );

    // Fetch updated store stats
    const avgRes = await query(
      `SELECT 
         COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS overall_rating,
         COUNT(*)::int AS total_ratings
       FROM ratings 
       WHERE store_id = $1`,
      [storeId]
    );

    return {
      rating: result.rows[0],
      isUpdated: true,
      storeStats: avgRes.rows[0],
      message: 'Rating updated successfully.',
    };
  }

  /**
   * View all ratings submitted by the logged-in user
   */
  async getUserRatings(userId) {
    const result = await query(
      `SELECT 
         r.id,
         r.rating,
         r.created_at,
         r.updated_at,
         s.id AS store_id,
         s.name AS store_name,
         s.email AS store_email,
         s.address AS store_address
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = $1
       ORDER BY r.updated_at DESC`,
      [userId]
    );

    return result.rows;
  }
}

module.exports = new UserService();
