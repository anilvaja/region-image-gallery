// Middleware to validate that user is accessing their own region
const validateUserRegion = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const userRegionId = req.user.region_id;
  const requestRegionId = parseInt(req.body.region_id || req.query.region_id);

  if (requestRegionId && userRegionId !== requestRegionId) {
    return res.status(403).json({
      error: 'Access denied: You can only access your assigned region',
    });
  }

  next();
};

module.exports = {
  validateUserRegion,
};
