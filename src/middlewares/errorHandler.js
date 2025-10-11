const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  
  const isDevOrTest = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  const response = {
    status: 'error',
    message: isDevOrTest ? err.message : 'An internal server error occurred',
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;