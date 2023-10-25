const express = require('express');
const {
    handleListUserLevels, 
    handleCreateLevel, 
    handleUpdateLevel, 
    handleUploadLevel, 
    handleDeleteLevel
} = require('../controllers/levelController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyLevel = require('../middleware/verifyLevel');
const verifyLevelClear = require('../middleware/verifyLevelClear');
const verifyLevelOwner = require('../middleware/verifyLevelOwner');
const bodyParser = require('body-parser');
const router = express.Router();

router.use(bodyParser.json());

router.get('/:name', handleListUserLevels);
router.post('/', [verifyJWT], handleCreateLevel);
router.put('/:id', [verifyJWT, verifyLevelOwner, verifyLevel], handleUpdateLevel);
router.put('/upload/:id', [verifyJWT, verifyLevelOwner, verifyLevel, verifyLevelClear], handleUploadLevel);
router.delete('/:id', [verifyJWT, verifyLevelOwner], handleDeleteLevel);

module.exports = router;