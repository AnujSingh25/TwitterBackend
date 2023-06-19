const multer = require('multer')
const path = require('path')
const uploadImage = async (req, res, next) => {
    next()
}

const upload = multer({ dest: 'uploads/' })

module.exports = { uploadImage, upload };