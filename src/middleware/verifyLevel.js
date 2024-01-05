const {verifyLaser, verifyTarget, verifyArrayOfObjects, verifyUniqueObjectPosition} = require('./verifyObjects');

const MAX_MIRROR_NUM = 8;
const verifyGridSize = (gridHeight, gridWidth) =>  (gridHeight === 8 && gridWidth === 8) || (gridHeight === 9 && gridWidth === 9) || (gridHeight === 10 && gridWidth === 10) || (gridHeight === 11 && gridWidth === 11) || (gridHeight === 12 && gridWidth === 12);
const verifyMirrorNum = (reflectorNum, lensNum) => reflectorNum + lensNum <= MAX_MIRROR_NUM;
const verifyLevel = (req, res, next) => {
    const {levelInfo} = req.body;
    
    if(!levelInfo) return res.sendStatus(400);
    const {height, width, lasers, targets, reflectors, lenses} = levelInfo;
    if(verifyGridSize(height, width) && verifyMirrorNum(reflectors.length, lenses.length) && 
        verifyArrayOfObjects(lasers, height, width, verifyLaser) && verifyArrayOfObjects(targets, height, width, verifyTarget) &&
        verifyUniqueObjectPosition([...lasers, ...targets], height, width)
    ){
        next();
    }else{
        return res.sendStatus(400);
    }  
}

const verifyGrid = (req, res, next) => {
    const {height, width} = req.body;
    if(verifyGridSize(height, width)){
        next();
    }else{
        return res.sendStatus(400);
    }
}
module.exports = {verifyGrid, verifyLevel};