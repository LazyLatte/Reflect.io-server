const {getLevelByID} = require('../model/level');

const getLevelInfo = async (req, res, next) => {
    const {id} = req.params;
    // must be public level
    const levelInfo = await getLevelByID(id);
    if(!levelInfo) return res.sendStatus(400);
    req.body.levelInfo = levelInfo;
    next();
}
module.exports = getLevelInfo;