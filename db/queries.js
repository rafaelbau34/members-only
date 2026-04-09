const pool = require("./pool");

async function createUser(firstName, lastName, username, password) {
  await pool.query(
    "INSERT INTO users (first_name, last_name, username, password, membership_status, is_admin) VALUES ($1, $2, $3, $4, $5, $6)",
    [firstName, lastName, username, password, false, false],
  );
}

async function getUserByUsername(username) {
  const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return rows[0];
}

async function getUserById(id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0];
}

async function updateMembershipStatus(userId, status) {
  await pool.query("UPDATE users SET membership_status = $1 WHERE id = $2", [
    status,
    userId,
  ]);
}

async function updateAdminStatus(userId, status) {
  await pool.query("UPDATE users SET is_admin = $1 WHERE id = $2", [
    status,
    userId,
  ]);
}

async function createMessage(title, text, userId) {
  await pool.query(
    "INSERT INTO messages (title, text, user_id) VALUES ($1, $2, $3)",
    [title, text, userId],
  );
}

async function getAllMessages() {
  const { rows } = await pool.query(`
    SELECT messages.id, messages.title, messages.text, messages.timestamp, users.first_name, users.last_name 
    FROM messages 
    JOIN users ON messages.user_id = users.id 
    ORDER BY messages.timestamp DESC
  `);
  return rows;
}

async function deleteMessage(id) {
  await pool.query("DELETE FROM messages WHERE id = $1", [id]);
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  updateMembershipStatus,
  updateAdminStatus,
  createMessage,
  getAllMessages,
  deleteMessage,
};
