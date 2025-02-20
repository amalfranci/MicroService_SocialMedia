const express =require('express')
const { SerachPostController } = require('../controllers/SearchController')
const authMiddleWare = require('../middleware/authMiddleWare')

const router = express.Router()

router.get('/posts',authMiddleWare,SerachPostController)



module.exports = router
