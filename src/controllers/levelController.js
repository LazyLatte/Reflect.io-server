const {getUserLevels, createLevel, updateLevel, uploadLevel, deleteLevel} = require('../model/level');

const handleListUserLevels = async (req, res) => {
    const {name} = req.params;
    const levels = await getUserLevels(name);
    res.json(levels);
}

const handleCreateLevel = async (req, res) => {
    const {name, height, width, thumbnail} = req.body;
    //validate height and width
    const newlevel = await createLevel(name, height, width, thumbnail);
    res.json(newlevel);
}
const handleUpdateLevel = async (req, res) => {
    const {id} = req.params;
    const {name, levelInfo, thumbnail} = req.body;
    const updatedLevel = await updateLevel(name, id, levelInfo, thumbnail);
    res.json(updatedLevel);
}
const handleUploadLevel = async (req, res) => {
    const {id} = req.params;
    const {name, levelInfo, record, thumbnail} = req.body;
    const uploadedLevel = await uploadLevel(name, id, levelInfo, record, thumbnail);
    res.json(uploadedLevel);

}

const handleDeleteLevel = async (req, res) => {
    const {id} = req.params;
    const deletedLevel = await deleteLevel(id);
    res.json(deletedLevel);
}

module.exports = {
    handleListUserLevels,
    handleCreateLevel,
    handleUpdateLevel,
    handleUploadLevel,
    handleDeleteLevel
};