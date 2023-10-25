const {getLevels, getLevelByID, levelClear, checkIsFavorite, addToFavorite, removeFromFavorite} = require('../model/play');

const validOrderByOptions = ['clears', 'likes', 'timestamp']
const handleListLevels = async (req, res) => {
    const {name, start, orderBy, ascend} = req.query;
    if(validOrderByOptions.indexOf(orderBy) < 0) return res.status(400).json({message: 'invalid order by'});
    const levels = await getLevels(name ? name : '', start ? start : 0, orderBy, ascend);
    res.json(levels);
}

const handleListLevelByID = async (req, res) => {
    const {id} = req.params;
    if(!id) return res.status(400).json({message: 'id is required'});
    const level = await getLevelByID(id);
    res.json(level);
}

const handleUpdateLikes = async (req, res) => {
    const {id} = req.params;
    const {name} = req.body;
    const {isFavorite} = await checkIsFavorite(name, id);
    isFavorite ? removeFromFavorite(name, id) : addToFavorite(name, id);
    res.json(!isFavorite);
}

const handleLevelClear = async (req, res) => {
    const {id} = req.params;
    const {name, record} = req.body;
    const clearedLevel = await levelClear(name, id, record);
    res.json(clearedLevel);
}

module.exports = {
    handleListLevels,
    handleListLevelByID,
    handleUpdateLikes,
    handleLevelClear
};