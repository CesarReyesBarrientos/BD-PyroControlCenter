const { pool, dbConfig } = require('../config/database');

const testDbConnection = async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT NOW() as `current_time`, VERSION() as `mysql_version`');
    connection.release();

    res.json({
      status: 'success',
      message: 'Database connection is successful',
      data: {
        ...rows[0],
        database: dbConfig.database,
        host: dbConfig.host,
      },
    });
  } catch (error) {
    // Pass the error to the centralized error handler
    error.message = `Database connection failed: ${error.message}`;
    next(error); 
  }
};

module.exports = {
  testDbConnection,
};