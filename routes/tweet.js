const express = require('express');
const { createTweet, getAllTweets, deleteTweet, likeTweet, followUser, reTweet, uploadImageToCloud, getSingleTweet, createComment, getAllTweetsFromFollowingUsers, createComment2, createReTweet } = require('../controllers/tweetController');
const { followUserController } = require('../controllers/userController');
const { isUserAuthenticated } = require('../middleware/auth');
const { tweetPhotoUpload, afterUploadingThroughMulter } = require('../utilities/tweetPhotoUpload');

const router = express.Router();

router.post('/uploadPictureToCloud', tweetPhotoUpload.single('file'), afterUploadingThroughMulter, uploadImageToCloud)

router.post('/createTweet', isUserAuthenticated, createTweet)
router.get('/getSingleTweet/:id', isUserAuthenticated, getSingleTweet)
router.post('/getAllTweets', isUserAuthenticated, getAllTweetsFromFollowingUsers)
router.get('/getAllTweets', isUserAuthenticated, getAllTweets)
router.post('/createComment/:tweetId', isUserAuthenticated, createComment)
router.put('/createComment/:tweetId', isUserAuthenticated, createComment2)
router.post('/createRetweet/:tweetId', isUserAuthenticated, createReTweet)
// ! sending from the frontend's SingleUserPage.js
router.post('/follow/:follower/:toFollow', isUserAuthenticated, followUserController)
// ! 
router.put('/likeTweet/:tweetId', isUserAuthenticated, likeTweet);

router.delete('/deleteTweet/:id', isUserAuthenticated, deleteTweet);

module.exports = router