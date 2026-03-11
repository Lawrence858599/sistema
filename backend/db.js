const { Pool } = require("pg");
require("dotenv").config();

// A conexao principal usa a DATABASE_URL definida no arquivo .env.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  connect: () => pool.connect(),
  query: (text, params) => pool.query(text, params),
};
