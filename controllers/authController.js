const User = require('../models/User.js');
const { hashPassword, matchPassword } = require('../utilities/auth-utils.js');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    let emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    try {

        const { name, email, password, username } = req.body;

        if (!emailPattern.test(email)) return res.json({ error: 'Enter a valid email' });

        if (!name || !email || !password || !username) return res.json({ error: 'Values are missing.' });

        const alreadyExistingUser = await User.findOne({ email });
        const alreadyExistingUserName = await User.findOne({ username });

        if (alreadyExistingUser) return res.json({ error: "Email already exist" });

        if (alreadyExistingUserName) return res.json({ error: "Username already exist" });

        const hashedPassword = await hashPassword(password);

        const user = await new User({ name, email, password: hashedPassword, username }).save();

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });

        res.json({
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
            },
            token
        });
    } catch (error) {
        console.error(error)
        return res.json({ error: error })
    }
}


const login = async (req, res) => {

    let emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    try {
        const { email, password } = req.body;

        if (!emailPattern.test(email)) return res.json({ error: 'Enter a valid email' });

        if (!email || !password) return res.json({ error: 'Values are missing.' });

        const user = await User.findOne({ email });

        if (!user) return res.json({ error: "user not found" });

        const isMatch = await matchPassword(password, user.password);

        if (!isMatch) return res.json({ error: "Wrong Password" });

        const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '10d' });

        res.status(200).json({
            user: {
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                joiningDate: user.createdAt,
                username: user.username,
                following: user?.following,
                followers: user?.followers
            },
            token
        });
    } catch (error) {
        return res.json({ error: error })
    }
}

module.exports = { register, login }