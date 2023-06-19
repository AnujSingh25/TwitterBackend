const Tweet = require('../models/Tweet.js');
const cloudinary = require('cloudinary');
const cloudinaryUploadImg = require('../utilities/uploadToCloudinary.js');
const fs = require('fs')
const mongoose = require('mongoose')
const createTweet = async (req, res) => {

    const { tweet, image } = req.body;

    if (!tweet.content) return res.json({ error: "Tweet cant be blank" })

    const createdTweet = await new Tweet({
        content: tweet.content,
        tweetedBy: new mongoose.Types.ObjectId(req?.user?.userId),
        image: image
    }).save()

    res.json({ tweet: createdTweet })
}


const getAllTweets = async (req, res) => {
    const tweets = await Tweet.find({}).populate('tweetedBy').populate('thisTweetIsRetweetedBy').populate('likes').sort({ createdAt: '-1' })
    res.json({ tweets })
}

const deleteTweet = async (req, res) => {
    try {
        const { id } = req.params;
        const findThisTweet = await Tweet.find({ _id: id, isAReply: true })
        const tweet = await Tweet.findOne({ _id: id })
        const tweetReplies = await Tweet.findOne({ _id: id }).populate('replies.reply').select('replies')
        const tweetReplyIDs = tweetReplies.replies.map(({ reply }) => { return reply?._id })

        const deleteTweetReplies = await Tweet.deleteMany({
            _id: {
                $in: tweetReplyIDs
            }
        })

        if (tweet.isAReply) {
            const parentTweet = tweet.isAReplyOfTweet.valueOf();
            await Tweet.findByIdAndUpdate({ _id: tweet.isAReplyOfTweet }, {
                $pull: {
                    replies: { reply: tweet._id }
                }
            }, { new: true })
            const deletedTweet = await Tweet.findByIdAndDelete(id)
            return res.json({ deletedTweet, parentTweet: parentTweet, deletedReplies: deleteTweetReplies?.deletedCount, message: "Tweet Deleted Successfully" })
        } else {
            const deletedTweetNotAReply = await Tweet.findByIdAndDelete({ _id: id })
            return res.json({ deletedTweetNotAReply, deletedReplies: deleteTweetReplies?.deletedCount, message: "Tweet Deleted Successfully" })
        }
    } catch (error) {
        return res.json({ error })
    }
}

const likeTweet = async (req, res) => {

    try {
        const { tweetId } = req.params;
        const alreadyLiked = await Tweet.findOne({ "likes.user": new mongoose.Types.ObjectId(req.user.userId), _id: tweetId })

        if (alreadyLiked) {
            const unlikeTweet = await Tweet.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(alreadyLiked._id) },
                {
                    $pull: {
                        likes: {
                            user: req.user.userId
                        }
                    }
                })

            return res.json({ unlikeTweet, like: false })
        }

        const likedTweet = await Tweet.findByIdAndUpdate({ _id: tweetId }, {
            $push: {
                likes: [
                    { user: req.user.userId }
                ]

            }
        })

        res.json({ likedTweet, like: true })
    } catch (error) {
        console.error(error)
        return res.json({ error })
    }
}

const uploadImageToCloud = async (req, res) => {

    if (req?.file) {

        const localPath = `uploads/${req?.file.filename}`
        const result = await cloudinaryUploadImg(localPath)
        fs.unlinkSync(localPath)
        return res.json({ imgURL: result });
    }
    res.json({ imgURL: "" })
}

const getSingleTweet = async (req, res) => {
    const { id } = req.params;

    if (!id) return res.json({ error: "Please provide an id" })

    const singleTweet = await Tweet.findOne({ _id: id }).populate('tweetedBy replies.reply replies.reply').populate(
        {
            path: 'replies.reply',
            populate: 'tweetedBy'
        }
    ).select('-password').populate({
        path: 'tweetedBy',
        select: '-password'
    })

    if (!singleTweet) return res.json({ error: "oops no tweet found" })
    res.send({ singleTweet })
}

const createComment = async (req, res) => {

    const { tweetId } = req.params;
    const { content, commentedBy } = req.body

    const tweetToAddACommentOn = await Tweet.findByIdAndUpdate({ _id: tweetId }, {
        $push: {
            comments: {
                content, commentedBy
            }
        }
    }, { new: true })
    res.json({ tweetToAddACommentOn })
}

const createComment2 = async (req, res) => {

    const { tweetId } = req.params;
    const { content, commentedBy } = req.body

    if (!content) return res.json({ error: "Enter value" }).status(400)
    const commentToAdd = {
        content: content,
        commentedBy: commentedBy,
    }

    const tweetAsComment = await new Tweet({
        content, tweetedBy: req.user.userId, isAReply: true, isAReplyOfTweet: tweetId
    }).save()

    const tweetToAddACommentOn = await Tweet.findByIdAndUpdate({ _id: tweetId }, {
        $push: {
            comments: [
                { comment: new mongoose.Types.ObjectId(tweetAsComment._id), content, commentedBy: new mongoose.Types.ObjectId(req.user.userId) }
            ]
        }
    }, { new: true })

    const addToReplyArray = await Tweet.findByIdAndUpdate({ _id: tweetId }, {
        $push: {
            replies: [
                { reply: new mongoose.Types.ObjectId(tweetAsComment._id) }
            ]
        }
    }, { new: true })

    res.json({ tweetToAddACommentOn })
}

const getAllTweetsFromFollowingUsers = async (req, res) => {
    const followingUsers = req.body.loggedInUser?.following.map(({ user }) => { return user })
    const tweets = await Tweet.find({ tweetedBy: followingUsers }).populate('tweetedBy')
    res.json({ tweets })
}

const createReTweet = async (req, res) => {

    const { tweetId } = req.params;
    const tweetedBy = req.user.userId

    const tweetToRetweet = await Tweet.findOne({ _id: tweetId })
    const retweetsOfTweetToReTweet = tweetToRetweet?.reTweetedBy

    retweetsOfTweetToReTweet.push(tweetedBy)

    const createNewTweetAsARetweet = await new Tweet({
        isARetweet: true,
        content: tweetToRetweet.content, tweetedBy: new mongoose.Types.ObjectId(tweetToRetweet.tweetedBy._id),
        thisTweetIsRetweetedBy: new mongoose.Types.ObjectId(req?.user.userId),
        image: tweetToRetweet?.image ? tweetToRetweet?.image : null,
    }).save()

    const retweet = await Tweet.findByIdAndUpdate({ _id: tweetId }, {
        $push: {
            reTweetedBy: [tweetedBy]
        }
    }, { new: true })

    retweet?.reTweetedBy?.map(async (userID) => {
        await Tweet.findByIdAndUpdate({ _id: createNewTweetAsARetweet._id.valueOf() }, {
            $push: {
                reTweetedBy: [userID]
            }
        }, { new: true })
    })

    res.json({ message: "createReTweet", tweetId, tweetedBy, retweet, createNewTweetAsARetweet });
}

module.exports = { createReTweet, getAllTweetsFromFollowingUsers, createTweet, createComment2, createComment, getSingleTweet, getAllTweets, deleteTweet, likeTweet, followUser, reTweet, uploadImageToCloud }