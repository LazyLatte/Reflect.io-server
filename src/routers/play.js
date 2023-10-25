const express = require('express');
const {
    handleListLevels, 
    handleListLevelByID,
    handleUpdateLikes, 
    handleLevelClear, 
} = require('../controllers/playController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyLevelClear = require('../middleware/verifyLevelClear');
const getLevelInfo = require('../middleware/getLevelInfo');
const bodyParser = require('body-parser');
const router = express.Router();

router.use(bodyParser.json());

router.get('/', handleListLevels);
router.get('/:id', handleListLevelByID);
router.put('/like/:id', [verifyJWT], handleUpdateLikes);
router.put('/clear/:id', [verifyJWT, getLevelInfo, verifyLevelClear], handleLevelClear);

module.exports = router;