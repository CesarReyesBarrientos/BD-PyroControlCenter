const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

const getRootStatus = (req, res) => {
  res.json({
    message: 'Node.js server is running correctly',
    status: 'success',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealthStatus,
  getRootStatus,
};