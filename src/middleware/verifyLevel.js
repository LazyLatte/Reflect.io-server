const {verifyLaser, verifyTarget, verifyArrayOfObjects, verifyUniqueObjectPosition} = require('./verifyObjects');

const MAX_MIRROR_NUM = 8;
const verifyGridSize = (gridHeight, gridWidth) =>  (gridHeight === 8 && gridWidth === 8) || (gridHeight === 9 && gridWidth === 9) || (gridHeight === 10 && gridWidth === 10) || (gridHeight === 11 && gridWidth === 11) || (gridHeight === 12 && gridWidth === 12);
const verifyMirrorNum = (reflectorNum, lensNum) => Number.isInteger(reflectorNum) && Number.isInteger(lensNum) && reflectorNum >= 0 && lensNum >= 0 && reflectorNum + lensNum <= MAX_MIRROR_NUM;
const verifyLevel = (req, res, next) => {
    const {levelInfo} = req.body;
    
    if(!levelInfo) return res.sendStatus(400);
    const {height, width, lasers, targets, reflectorNum, lensNum} = levelInfo;
    if(verifyGridSize(height, width) && verifyMirrorNum(reflectorNum, lensNum) && 
        verifyArrayOfObjects(lasers, height, width, verifyLaser) && verifyArrayOfObjects(targets, height, width, verifyTarget) &&
        verifyUniqueObjectPosition([...lasers, ...targets], height, width)
    ){
        next();
    }else{
        return res.sendStatus(400);
    }
    
}
module.exports = verifyLevel;