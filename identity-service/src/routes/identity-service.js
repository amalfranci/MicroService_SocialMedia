
const express = require('express')
const { registerUser, userLogin, userRefreshToken } = require('../controllers/identity-controller')

const router = express.Router()

router.post('/register',registerUser)
router.post('/login',userLogin)
router.post('/refreshToken',userRefreshToken)

module.exports = router;