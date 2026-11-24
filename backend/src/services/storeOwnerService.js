const { query } = require('../config/db');
const AppError = require('../utils/appError');

class StoreOwnerService {
  /**
   * Get store dashboard for store owner:
   * Returns store details, average rating, total ratings, and rating breakdown
   */
  async getDashboard(ownerId) {
    // 1. Fetch store(s) owned by this owner
    const storesRes = await query(
      `SELECT 
         s.id,
         s.name,
         s.email,
         s.address,
         s.created_at,
         COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS average_rating,
         COUNT(r.id)::int AS total_ratings
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [ownerId]
    );

    if (storesRes.rowCount === 0) {
      return {
        hasStore: false,
        message: 'No store is currently associated with your store owner account. Please contact an Administrator.',
        stores: [],
      };
    }

    const stores = storesRes.rows;

    // For the primary store (or each store), calculate rating breakdown (count of 1s, 2s, 3s, 4s, 5s)
    for (const store of stores) {
      const breakdownRes = await query(
        `SELECT 
           rating,
           COUNT(*)::int AS count
         FROM ratings
         WHERE store_id = $1
         GROUP BY rating
         ORDER BY rating DESC`,
        [store.id]
      );

      const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      breakdownRes.rows.forEach((row) => {
        breakdown[row.rating] = row.count;
      });
      store.rating_breakdown = breakdown;
    }

    return {
      hasStore: true,
      store: stores[0], // primary store
      allStores: stores,
    };
  }

  /**
   * View list of users who submitted ratings for their store:
   * Includes user details (name, email, address) and submitted ratings.
   * Supports sorting by rating, date, user name.
   */
  async getStoreRatingsWithUsers(ownerId, { storeId, sortBy = 'created_at', order = 'desc' }) {
    // 1. Check store ownership
    let storeCheckQuery = 'SELECT id, name FROM stores WHERE owner_id = $1';
    const storeCheckParams = [ownerId];

    if (storeId) {
      storeCheckQuery += ' AND id = $2';
      storeCheckParams.push(storeId);
    }

    const storeCheckRes = await query(storeCheckQuery, storeCheckParams);
    if (storeCheckRes.rowCount === 0) {
      throw new AppError('Store not found or you do not have permission to view ratings for this store.', 404);
    }

    const validSortColumns = {
      rating: 'r.rating',
      created_at: 'r.created_at',
      updated_at: 'r.updated_at',
      name: 'u.name',
      email: 'u.email',
    };

    const sortCol = validSortColumns[sortBy] || 'r.created_at';
    const sortDir = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const targetStoreId = storeId ? parseInt(storeId, 10) : storeCheckRes.rows[0].id;

    // 2. Fetch ratings with user details
    const ratingsSql = `
      SELECT 
        r.id AS rating_id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY ${sortCol} ${sortDir}
    `;

    const ratingsRes = await query(ratingsSql, [targetStoreId]);

    // 3. Overall average for this store
    const avgRes = await query(
      `SELECT 
         COALESCE(ROUND(AVG(rating)::numeric, 2), 0) AS average_rating,
         COUNT(*)::int AS total_ratings
       FROM ratings 
       WHERE store_id = $1`,
      [targetStoreId]
    );

    return {
      store: storeCheckRes.rows[0],
      average_rating: avgRes.rows[0].average_rating,
      total_ratings: avgRes.rows[0].total_ratings,
      ratings: ratingsRes.rows,
    };
  }
}

module.exports = new StoreOwnerService();
