const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation} = require('../validation');


// REGISTER
router.post('/register', async (req, res ) => {

    // Validate user data before registration
    const {error} = registerValidation(req.body);
    
    if(error){
        return res.status(400).send(error.details[0].message);
    }

    // Check if user email already exists
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('User with this email already exists');

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });
    console.log(user);
    try {
        const savedUser = await user.save();
        res.send({ user: user._id, name: user.name });
    } catch (err) {
        res.status(400).send("Cannot create an user!!");
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    // Validate user data before login
    const {error} = loginValidation(req.body);  
    if(error){
        return res.status(400).send(error.details[0].message);
    }

     // Check if user with the email exists
     const user = await User.findOne({email: req.body.email});
     if(!user) return res.status(400).send('Email not found');
 
    // Check if password is correct or not
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Invalid password');

    // Create and assign a token
    const token = jwt.sign({_id: user._id, name: user.name}, process.env.JWT_SECRET );
    res.header('jwt-auth-token', token).send(token);

    //res.send(`Successfully Logged In , Welcome ${user.name}`);
})



module.exports = router;