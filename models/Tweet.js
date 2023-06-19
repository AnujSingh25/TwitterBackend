const mongoose = require('mongoose');

const { Schema } = mongoose;

const TweetSchema = new Schema(
    {
        content: {
            type: String,
        },
        image: {
            type: String
        },
        isAReply: {
            type: Boolean,
            default: false
        },
        isAReplyOfTweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet'
        },
        tweetedBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
        likes: [{
            user: {
                type: mongoose.Types.ObjectId,
                immutable: false,
                ref: 'User',
            }
        }],
        comments: [
            {
                comment: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Tweet',
                    content: {
                        type: String
                    },
                    commentedBy: {
                        type: mongoose.Types.ObjectId,
                        ref: 'User'
                    }
                }

            }

        ],
        reTweetedBy: [{
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
        ],
        thisTweetIsRetweetedBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        isARetweet: {
            type: Boolean,
            default: false
        },
        replies: [{
            reply: {
                type: mongoose.Types.ObjectId,
                ref: 'Tweet'
            }
        }],

    }
    , { timestamps: true }
)

module.exports = mongoose.model("Tweet", TweetSchema)