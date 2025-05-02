const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async(req,res) =>{
    try {
        // validate the data
        validate(req.body);
        const {firstName, emailId, password} = req.body;

        // email already exist to nhi krti
        // const ans = User.exists({emailId});

        req.body.password = await bcrypt.hash(password, 10);
        const user = await User.create(req.body);

        
        // give the token
        const token = jwt.sign({id:user._id, emailId:emailId}, process.env.JWT_KEY,{expiresIn: 3600})
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(201).send("User Registered Successfully");

    } catch (err) {
        res.status(400).send("Error: " + err);
    }
}

const login = async(req,res) => {
    try {
        const {emailId, password} = req.body;

        if(!emailId || !password)
            throw new Error("Invalid Ceredentials");

        const user = User.findOne({emailId});
        const match = bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Ceredentials");

        // give the token
        const token = jwt.sign({id:user._id, emailId:emailId}, process.env.JWT_KEY,{expiresIn: 3600})
        res.cookie('token',token,{maxAge:60*60*1000});
        res.status(200).send("Logged In Successfully");
        
    } catch (err) {
        res.status(401).send("Error: " + err);
    }
}
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'));


// logout feature
const logout = async (req,res) => {
    try {
        
    } catch (err) {
        res.status().send("Error: " + err);
    }
}