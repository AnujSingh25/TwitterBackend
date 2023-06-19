const jwt = require('jsonwebtoken')

const isUserAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    console.log('jwt problem')
    return res.json({ error: 'Invalid token is there' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const dataComingInTheToken = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { userId: dataComingInTheToken._id, name: dataComingInTheToken.name }
    next()
  } catch (error) {
    return res.json({ error: error })
  }
}

module.exports = { isUserAuthenticated }