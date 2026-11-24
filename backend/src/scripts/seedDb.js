const path = require('path');
const bcrypt = require('bcrypt');
// dotenv is loaded inside db.js with the correct absolute path before the Pool is created.
const { pool, query } = require('../config/db');

async function seedDb() {
  console.log('--- Seeding PostgreSQL Database with Roxiler Demo Data ---');
  try {
    // 1. Clear existing data in reverse order of foreign keys
    await query('TRUNCATE TABLE ratings, stores, users RESTART IDENTITY CASCADE');
    console.log('Cleared existing tables.');

    // 2. Hash default passwords (meeting requirements: 8-16 chars, 1 uppercase, 1 special character)
    const adminPasswordHash = await bcrypt.hash('Admin@1234', 10);
    const ownerPasswordHash = await bcrypt.hash('Owner@1234', 10);
    const userPasswordHash = await bcrypt.hash('User@1234', 10);

    // 3. Seed Users (All names between 20 and 60 characters)
    // - Admin
    const adminRes = await query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [
        'Platform System Administrator', // 29 chars
        'admin@roxiler.com',
        adminPasswordHash,
        'Roxiler Systems HQ, Suite 500, Tech Park Boulevard, Silicon Valley',
        'ADMIN',
      ]
    );
    const admin = adminRes.rows[0];
    console.log(`Created Admin: ${admin.name} (${admin.email})`);

    // - Store Owners
    const owner1Res = await query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [
        'Marcus Aurelius Storekeeper', // 27 chars
        'owner.marcus@gmail.com',
        ownerPasswordHash,
        '104 Olive Blossom Way, North District, Metropolis',
        'STORE_OWNER',
      ]
    );
    const owner1 = owner1Res.rows[0];

    const owner2Res = await query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [
        'Eleanor Roosevelt Merchant', // 26 chars
        'owner.eleanor@gmail.com',
        ownerPasswordHash,
        '212 Artisan Market Street, Heritage Quarter, Metropolis',
        'STORE_OWNER',
      ]
    );
    const owner2 = owner2Res.rows[0];

    const owner3Res = await query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [
        'Jonathan Montgomery Grocer', // 26 chars
        'owner.jonathan@gmail.com',
        ownerPasswordHash,
        '789 Evergreen Terrace, Pinecrest Valley',
        'STORE_OWNER',
      ]
    );
    const owner3 = owner3Res.rows[0];

    // - Normal Users
    const user1Res = await query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [
        'Alexander Hamilton Consumer', // 27 chars
        'user.alexander@gmail.com',
        userPasswordHash,
        '45 Federal Plaza, Apt 12B, Financial District, Metropolis',
        'USER',
      ]
    );
    const user1 = user1Res.rows[0];

    const user2Res = await query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [
        'Charlotte Bronte Reviewer', // 25 chars
        'user.charlotte@gmail.com',
        userPasswordHash,
        '88 Victorian Avenue, Greenfield Woods',
        'USER',
      ]
    );
    const user2 = user2Res.rows[0];

    const user3Res = await query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      [
        'Benjamin Franklin Shopper', // 25 chars
        'user.benjamin@gmail.com',
        userPasswordHash,
        '1776 Independence Boulevard, Liberty City',
        'USER',
      ]
    );
    const user3 = user3Res.rows[0];

    // 4. Seed Stores (Name between 20 and 60 chars)
    const store1Res = await query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name`,
      [
        'Metropolis Gourmet Supermarket', // 30 chars
        'contact@metropolisgourmet.com',
        '100 Main Street, Suite A, Downtown Metropolis',
        owner1.id,
      ]
    );
    const store1 = store1Res.rows[0];

    const store2Res = await query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name`,
      [
        'Heritage Artisan Organic Bakery', // 31 chars
        'support@heritagebakery.com',
        '210 Artisan Market Street, Heritage Quarter, Metropolis',
        owner2.id,
      ]
    );
    const store2 = store2Res.rows[0];

    const store3Res = await query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name`,
      [
        'Evergreen Fresh Produce Market', // 30 chars
        'hello@evergreenproduce.com',
        '780 Evergreen Terrace, Pinecrest Valley',
        owner3.id,
      ]
    );
    const store3 = store3Res.rows[0];

    // 5. Seed Ratings (1 to 5)
    // Ratings for Store 1:
    await query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [user1.id, store1.id, 5]);
    await query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [user2.id, store1.id, 4]);
    await query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [user3.id, store1.id, 5]);

    // Ratings for Store 2:
    await query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [user1.id, store2.id, 4]);
    await query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [user2.id, store2.id, 5]);

    // Ratings for Store 3:
    await query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [user3.id, store3.id, 3]);

    console.log('Seeding completed successfully!');
    console.log('\n--- DEMO CREDENTIALS ---');
    console.log('ADMIN: admin@roxiler.com / Admin@1234');
    console.log('STORE OWNER 1: owner.marcus@gmail.com / Owner@1234');
    console.log('STORE OWNER 2: owner.eleanor@gmail.com / Owner@1234');
    console.log('USER 1: user.alexander@gmail.com / User@1234');
    console.log('USER 2: user.charlotte@gmail.com / User@1234');

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedDb();
}

module.exports = seedDb;
