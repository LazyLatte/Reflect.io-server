const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleRefreshToken = (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(401); // expired
    const refreshToken = cookies.jwt;
    console.log(refreshToken)
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decode) => {
            if(err) return res.sendStatus(403); // token not exist
            const accessToken = jwt.sign({name: decode.name}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30s'});
            res.json({name: decode.name, accessToken});
        }
    );
}

module.exports = {handleRefreshToken};