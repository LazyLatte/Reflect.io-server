const {checkUserOwnsLevel} = require('../model/level');

const verifyLevelOwner = async (req, res, next) => {
    const {id} = req.params;
    const {name} = req.body;
    const { exists } = await checkUserOwnsLevel(name, id);
    if(!exists) return res.sendStatus(400);
    next();
}
module.exports = verifyLevelOwner;