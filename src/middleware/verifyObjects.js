const verifyPos = (pos, gridHeight, gridWidth) => pos && Object.keys(pos).length === 2 && Number.isInteger(pos.x) && Number.isInteger(pos.y) && pos.x >= 0 && pos.x < gridWidth && pos.y >= 0 && pos.y < gridHeight;
const verifyDir = (dir) => dir && Object.keys(dir).length === 2 && (dir.x === 1 || dir.x === -1 || dir.x === 0) && (dir.y === 1 || dir.y === -1 || dir.y === 0); 
const verifyDegree = (deg) => Number.isInteger(deg / 45);
const verifyColor = (color) => color === 1 || color === 2 || color === 3 || color === 4 || color === 5 || color === 6 || color === 7;
const verifyLaser = (laser, gridHeight, gridWidth) => laser && Object.keys(laser).length === 3 && verifyPos(laser.pos, gridHeight, gridWidth) && verifyDir(laser.dir) && verifyColor(laser.color);
const verifyTarget = (target, gridHeight, gridWidth) => target && Object.keys(target).length === 2 && verifyPos(target.pos, gridHeight, gridWidth) && verifyColor(target.color);
const verifyMirror = (mirror, gridHeight, gridWidth) => mirror && Object.keys(mirror).length === 3 && verifyPos(mirror.pos, gridHeight, gridWidth) && verifyDegree(mirror.deg) && verifyColor(mirror.color);

const verifyArrayOfObjects = (arr, gridHeight, gridWidth, verifyFunc) => {
    return arr.map(e => verifyFunc(e, gridHeight, gridWidth)).reduce(
        (accumulator, currentValue) => accumulator & currentValue,
        true
    );
}

const verifyUniqueObjectPosition = (objects, gridHeight, gridWidth) => {
    
    const grid = [];
    for(let i=0; i<gridHeight; i++){
        const row = [];
        for(let j=0; j<gridWidth; j++){
            row.push(false);
        }
        grid.push(row);
    }
    let allUnique = true;
    objects.forEach((obj)=>{
        const {pos} = obj;
        if(grid[pos.y][pos.x]){
            allUnique = false;
        }else{
            grid[pos.y][pos.x] = true;
        }
    })
    return allUnique;
}

module.exports = {verifyLaser, verifyTarget, verifyMirror, verifyArrayOfObjects, verifyUniqueObjectPosition};