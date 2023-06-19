const express = require('express');
const { isUserAuthenticated } = require('../middleware/auth');
const { getSingleUser, getLoggedInUserDetails, uploadProfilePicture, uploadImageToCloud, getSingleUserDirectly, updateUserProfileDetails } = require('../controllers/userController');
const { profilePhotoUpload, afterUploadingProfilePictureThroughMulter } = require('../utilities/tweetPhotoUpload');

const router = express.Router();

router.get('/getAllUsers', async (req, res) => {
    res.json(
        { message: "get all users" }
    )
})

router.get('/getSingleUser', isUserAuthenticated, getSingleUserDirectly)

router.get('/getSingleUser/:id', isUserAuthenticated, getSingleUser)

router.put('/updateUser/:id', isUserAuthenticated, async (req, res) => {
    res.json(
        { message: "get all users" }
    )
})

router.get('/getLoggedInUserDetails', isUserAuthenticated, getLoggedInUserDetails)
router.post('/updateUserProfileDetails/:id', isUserAuthenticated, updateUserProfileDetails)
router.post('/uploadProfilePicture', isUserAuthenticated, profilePhotoUpload.single('file'), afterUploadingProfilePictureThroughMulter, uploadImageToCloud)

module.exports = router