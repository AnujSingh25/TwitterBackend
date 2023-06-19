const express = require('express');

const router = express.Router();

const { register, login } = require('../controllers/authController.js')

router.get('/showMessage', async (req, res) => {
    res.json({ message: "Message" })
})

// ! register
router.post('/register', register)

// ! login
router.post('/login', login)

module.exports = router