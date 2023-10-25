const {getAccount, createAccount} = require('../model/account');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleCheckExistence = async (req, res) => {
    const {name} = req.query;
    if(!name) return res.status(400).json({message: 'Name is required!'});

    const user = await getAccount(name);
    user ? res.send(true) : res.send(false);
}
//const accessMinutes = 1;
const refreshDay = 7;
const saltRound = 10;
const handleRegister = async (req, res) => {
    const {name, password} = req.body;
    if(!name || !password) return res.status(400).json({message: 'Name and password are required!'});

    const user = await getAccount(name);
    if(user) return res.sendStatus(409);
    try{
        const hashedPassword = await bcrypt.hash(password, saltRound);
        const newUser = await createAccount(name, hashedPassword);
        //console.log(newUser);
        const accessToken = jwt.sign({name}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '2h'});
        const refreshToken = jwt.sign({name}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'}); 

        res.cookie('jwt', refreshToken, {httpOnly: true,  sameSite: 'none', secure: true, maxAge: refreshDay * 24 * 60 * 60 * 1000});
        res.json({name, accessToken});
    }catch(err){
        res.status(500).json({message: err.message});
    }
}
const handleSignIn = async (req, res) => {
    const {name, password} = req.body;
    if(!name || !password) return res.status(400).json({message: 'Name and password are required!'});
    const user = await getAccount(name);
    if(!user) return res.sendStatus(401);

    // evaluating pwd
    const match = await bcrypt.compare(password, user.password);
    if(match){
        const accessToken = jwt.sign({name}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '2h'});
        const refreshToken = jwt.sign({name}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'}); 
        
        res.cookie('jwt', refreshToken, {httpOnly: true,  sameSite: 'none', secure: true, maxAge: refreshDay * 24 * 60 * 60 * 1000});
        res.json({name, accessToken});
    }else{
        res.sendStatus(401);
    }
}
const handleSignOut = async (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(401); // expired
    const refreshToken = cookies.jwt;
    //console.log(refreshToken)
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decode) => {
            if(err) return res.sendStatus(403); // token not exist
            res.cookie('jwt', '', {httpOnly: true,  sameSite: 'none', secure: true, maxAge: 1});
            res.sendStatus(200);
        }
    );

}

// const handleChangeUsername= async (req, res) => {
//     const {name, newName} = req.body;
//     if(!newName) return res.status(400).json({message: 'New name is required!'});

//     const updatedUser = await updateUsername(name, newName);
//     res.json(updatedUser);
// }
// const handleChangePassword= async (req, res) => {
//     const {name, newPassword} = req.body;
//     if(!newPassword) return res.status(400).json({message: 'New password is required!'});

//     const updatedUser = await updatePassword(name, newPassword);
//     res.json(updatedUser);
// }

// const handleDeleteAccount = async (req, res) => {
//     const {name} = req.body;
//     const deletedUser = await deleteAccount(name);
//     res.json(deletedUser);
// }
module.exports = {
    handleCheckExistence,
    handleRegister,
    handleSignIn,
    handleSignOut,
    // handleChangeUsername, 
    // handleChangePassword, 
    // handleDeleteAccount
};