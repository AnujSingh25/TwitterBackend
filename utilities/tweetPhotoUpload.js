const multer = require('multer');
const sharp = require('sharp')
const multerStorage = multer.memoryStorage();
const path = require('path')

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true)
    } else {
        cb({ message: "Unsupported File Format" }, false)
    }
}

const tweetPhotoUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})

const profilePhotoUpload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})

const afterUploadingThroughMulter = async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `profilePhoto-${Date.now()}-${req?.file.originalname}`
    await sharp(req.file.buffer).toFormat("jpeg").jpeg({ quality: 90 }).toFile(path.join(`uploads/${req.file.filename}`));
    next()
}

const afterUploadingProfilePictureThroughMulter = async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `profilePhoto-${Date.now()}-${req?.file.originalname}`
    await sharp(req.file.buffer).toFormat("jpeg").jpeg({ quality: 90 }).toFile(path.join(`uploads/profilePhoto/${req.file.filename}`));
    next()
}

module.exports = { tweetPhotoUpload, profilePhotoUpload, afterUploadingProfilePictureThroughMulter, afterUploadingThroughMulter }