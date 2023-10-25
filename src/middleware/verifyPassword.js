const verifyPassword = async (req, res, next) => {
    const {name, password} = req.body;
    if(!name || !password) return res.status(400).json({message: 'Original name and password are required!'});
    const user = await findUser(name);
    if(!user) return res.sendStatus(401);
    const match = await bcrypt.compare(password, user.password);
    if(match){
        next();
    }else{
        res.sendStatus(401);
    }
}

module.exports = verifyPassword;