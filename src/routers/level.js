const express = require('express');
const {
    handleListUserLevels, 
    handleCreateLevel, 
    handleUpdateLevel, 
    handleUploadLevel, 
    handleDeleteLevel
} = require('../controllers/levelController');
const verifyJWT = require('../middleware/verifyJWT');
const {verifyGrid, verifyLevel} = require('../middleware/verifyLevel');
const verifySolution = require('../middleware/verifySolution');
const verifyLevelOwner = require('../middleware/verifyLevelOwner');
const bodyParser = require('body-parser');
const router = express.Router();

router.use(bodyParser.json());

router.get('/:name', handleListUserLevels);
router.post('/', [verifyJWT, verifyGrid], handleCreateLevel);
router.put('/:id', [verifyJWT, verifyLevelOwner, verifyLevel], handleUpdateLevel);
router.put('/upload/:id', [verifyJWT, verifyLevelOwner, verifyLevel, verifySolution], handleUploadLevel);
router.delete('/:id', [verifyJWT, verifyLevelOwner], handleDeleteLevel);

module.exports = router;