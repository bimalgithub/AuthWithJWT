const router = require('express').Router();
const verify = require('./verifyToken');

router.get('/', verify,  (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            name: req.user.name
        },
        posts: {
            title: 'My first post',
            description: 'You are not allowed to access this content without logging In'
        }
    });
});

module.exports = router;