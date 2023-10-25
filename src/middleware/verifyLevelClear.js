const {verifyMirror, verifyUniqueObjectPosition} = require('./verifyObjects');
const ObjectType = {None: 0, Laser: 1, Target: 2, Reflector: 3, Lens: 4};
const mirrorNormalVectors = [
    {x: -1, y: 0},
    {x: -1, y: -1},
    {x: 0, y: -1},
    {x: 1, y: -1},
    {x: 1, y: 0},
    {x: 1, y: 1},
    {x: 0, y: 1},
    {x: -1, y: 1},
];
const mirrorDegreeToNormalVector = (deg) => mirrorNormalVectors[(deg/45)%8];
  
class Grid {
    gridHeight;
    gridWidth;
    grid;
    constructor(gridHeight, gridWidth) {
      this.gridHeight = gridHeight;
      this.gridWidth = gridWidth;
  
      this.grid = [];
      for(let i=0; i<this.gridHeight; i++){
        const row = [];
        for(let j=0; j<this.gridWidth; j++){
          row.push({object: {type: ObjectType.None}, color: 0}); // color: MSB -> (top right bottom left) <- LSB
        }
        this.grid.push(row);
      }
    }
    positionTransform(pos){return pos;}
    directionTransform(dir){return dir;}
    outOfBound(pos){
      return (pos.x < 0 || pos.y < 0 || pos.x >= this.gridWidth || pos.y >= this.gridHeight);
    }
    addObject(pos, obj){
      const newPos = this.positionTransform(pos);
      this.grid[newPos.y][newPos.x].object = obj;
    }
    loopDetection(pos, dir, loopPotentialMirrors){
      let hasLoop = false;
      loopPotentialMirrors.forEach((mirror, i)=>{
        if(mirror.pos.x === pos.x && mirror.pos.y === pos.y && mirror.dir.x === dir.x && mirror.dir.y === dir.y) 
          hasLoop = true;
      })
      return hasLoop;
    }
    pushState(Q, state, nextDir, loopPotential){
      Q.unshift({
        pos: {x: state.pos.x + nextDir.x, y: state.pos.y + nextDir.y},
        dir: {x: nextDir.x, y: nextDir.y},
        loopPotentialMirrors: loopPotential ? [...state.loopPotentialMirrors, {
          pos: {x: state.pos.x, y: state.pos.y},
          dir: {x: state.dir.x, y: state.dir.y}
        }] : [...state.loopPotentialMirrors]
      })
    }
    getColorMask(dir){
      if(dir.x === 1 && dir.y === 0) return 0; //left
      if(dir.x === 0 && dir.y === -1) return 3; // bottom
      if(dir.x === -1 && dir.y === 0) return 6; //right
      if(dir.x === 0 && dir.y === 1) return 9; //top
      return 0;
    }
    trace(laser){
  
      let Q = [];
      const LaserPos = this.positionTransform(laser.pos);
      const LaserDir = this.directionTransform(laser.dir);
      const initState = {pos: {x: LaserPos.x + LaserDir.x, y: LaserPos.y + LaserDir.y}, dir: LaserDir, loopPotentialMirrors: []};
      this.grid[LaserPos.y][LaserPos.x].color |= (laser.color << this.getColorMask({x: -LaserDir.x, y: -LaserDir.y}));
      Q.unshift(initState);
  
      while(Q.length>0){
        const state = Q.pop();
        const {pos, dir, loopPotentialMirrors} = state;
  
        if(!this.outOfBound(pos)){
            const objType = this.grid[pos.y][pos.x].object.type;

            switch(objType){
                case ObjectType.None:
                case ObjectType.Target:
                    // direct pass
                    if(Math.abs(dir.x) === 1 && dir.y === 0){
                        this.grid[pos.y][pos.x].color |= (laser.color << 6);
                        this.grid[pos.y][pos.x].color |= (laser.color << 0);
                    }else if(Math.abs(dir.y) === 1 && dir.x === 0){
                        this.grid[pos.y][pos.x].color |= (laser.color << 9);
                        this.grid[pos.y][pos.x].color |= (laser.color << 3);
                    }
                    this.pushState(Q, state, dir, false);
                    break;
                case ObjectType.Laser:
                    this.grid[pos.y][pos.x].color |= (laser.color << this.getColorMask({x: dir.x, y: dir.y}));
                    break;
                case ObjectType.Reflector:
                    if(!this.loopDetection(pos, dir, loopPotentialMirrors)){
                        const incidentVector = dir;
                        const normalVector = this.directionTransform(this.grid[pos.y][pos.x].object.nv);
                        let reflectVector;
                        const innerProduct = incidentVector.x * normalVector.x + incidentVector.y * normalVector.y;
                        if(-incidentVector.x === normalVector.x && -incidentVector.y === normalVector.y){
                            // 180 deg reflect
                            reflectVector = normalVector;
                            this.pushState(Q, state, reflectVector, true);
                        }else if(innerProduct < 0){
                            // 45 deg reflect
                            reflectVector = {x: incidentVector.x + normalVector.x, y: incidentVector.y + normalVector.y};
                            this.pushState(Q, state, reflectVector, true);
                            this.grid[pos.y][pos.x].color |= (laser.color << this.getColorMask({x: -reflectVector.x, y: -reflectVector.y}));
                        }
                        this.grid[pos.y][pos.x].color |= (laser.color << this.getColorMask(dir));
                    }
                    break;
                case ObjectType.Lens:
                    //should prevent for way loop
                    if(!this.loopDetection(pos, dir, loopPotentialMirrors)){
                        const incidentVector = dir;
                        const normalVector = this.directionTransform(this.grid[pos.y][pos.x].object.nv);
                        let reflectVector;
                        const innerProduct = incidentVector.x * normalVector.x + incidentVector.y * normalVector.y;

                        if(innerProduct !== 0){

                            reflectVector = (innerProduct < 0) ? 
                                {x: incidentVector.x + normalVector.x, y: incidentVector.y + normalVector.y} : 
                                {x: incidentVector.x - normalVector.x, y: incidentVector.y - normalVector.y}
                

                            if(reflectVector.x !== 0 || reflectVector.y !==0){
                                this.pushState(Q, state, reflectVector, true);
                                this.grid[pos.y][pos.x].color |= (laser.color << this.getColorMask({x: -reflectVector.x, y: -reflectVector.y}));
                            }
                            this.pushState(Q, state, incidentVector, true);
                            this.grid[pos.y][pos.x].color |= (laser.color << this.getColorMask({x: -incidentVector.x, y: -incidentVector.y}));
                        }
                        this.grid[pos.y][pos.x].color |= (laser.color << this.getColorMask(dir));
                    }
                    break;
                default:
                    break;
            }
        }
      }
    }
  }
  
class Dgrid extends Grid{
    DgridWidth;
    constructor(gridHeight, gridWidth) {
        super(gridHeight, gridWidth);

        this.DgridWidth = gridHeight + gridWidth + 1;
        this.grid = [];
        for(let i=0; i<this.DgridWidth; i++){
            const row = [];
            for(let j=0; j<this.DgridWidth; j++){
                row.push({object: {type: ObjectType.None}, color: 0});
            }
            this.grid.push(row);
        }
    }
    positionTransform(pos){
        // GridPos to DgridPos
        const origin = {x: 1, y: this.gridWidth};
        return {x: pos.x + pos.y + origin.x, y: -pos.x + pos.y + origin.y};
    }
    directionTransform(dir){
        //GridDir to DgridDir
        if(dir.x === 1 && dir.y === 1) return {x: 1, y: 0};
        if(dir.x === 1 && dir.y === -1) return {x: 0, y: -1};
        if(dir.x === -1 && dir.y === 1) return {x: 0, y: 1};
        if(dir.x === -1 && dir.y === -1) return {x: -1, y: 0};

        if(dir.x === 1 && dir.y === 0) return {x: 1, y: -1};
        if(dir.x === 0 && dir.y === 1) return {x: 1, y: 1};
        if(dir.x === -1 && dir.y === 0) return {x: -1, y: 1};
        if(dir.x === 0 && dir.y === -1) return {x: -1, y: -1};
        return {x: 0, y: 0};
    }
    outOfBound(pos){
        const top = pos.y;
        const left = pos.x;
        const bottom = this.DgridWidth - top -1;
        const right = this.DgridWidth - left -1;
        return top + left < this.gridWidth || bottom + right < this.gridWidth || top + right < this.gridHeight || left + bottom < this.gridHeight;
    }
}

const verifyLevelClear = (req, res, next) => {
    const {levelInfo, mirrorStates} = req.body;
    if(!mirrorStates || !Array.isArray(mirrorStates.reflectors) || !Array.isArray(mirrorStates.lenses)) return res.sendStatus(400);
    const {height, width, lasers, targets, reflectorNum, lensNum} = levelInfo;
    if(mirrorStates.reflectors.length !== reflectorNum || mirrorStates.lenses.length !== lensNum) return res.sendStatus(400);

    const reflectors = mirrorStates.reflectors.filter(mirror => verifyMirror(mirror, height, width));
    const lenses = mirrorStates.lenses.filter(mirror => verifyMirror(mirror, height, width));

    if(!verifyUniqueObjectPosition([...lasers, ...targets, ...reflectors, ...lenses], height, width)) return res.sendStatus(400);
    
    // start verify whether the answer is valid
    const newGrid = new Grid(height, width);
    const newDgrid = new Dgrid(height, width);

    lasers.forEach(laser => {
        newGrid.addObject(laser.pos, {type: ObjectType.Laser});
        newDgrid.addObject(laser.pos, {type: ObjectType.Laser});
    });

    reflectors.forEach(mirror => {
        const {pos, deg} = mirror;
        newGrid.addObject(pos, {type: ObjectType.Reflector, nv: mirrorDegreeToNormalVector(deg)});
        newDgrid.addObject(pos, {type: ObjectType.Reflector, nv: mirrorDegreeToNormalVector(deg)});
    });
    lenses.forEach(mirror => {
        const {pos, deg} = mirror;
        newGrid.addObject(pos, {type: ObjectType.Lens, nv: mirrorDegreeToNormalVector(deg)});
        newDgrid.addObject(pos, {type: ObjectType.Lens, nv: mirrorDegreeToNormalVector(deg)});
    });


    lasers.forEach(laser => {
        (laser.dir.x === 0 || laser.dir.y === 0) ? newGrid.trace(laser) : newDgrid.trace(laser);
    });
    
    let levelClear = true;
    targets.forEach(target => {
      const targetPos = target.pos;
      const DgridTargetPos = newDgrid.positionTransform(target.pos);
      const centerColor = (newGrid.grid[targetPos.y][targetPos.x].color & 7) | ((newGrid.grid[targetPos.y][targetPos.x].color >> 3) & 7) | (newDgrid.grid[DgridTargetPos.y][DgridTargetPos.x].color & 7) | ((newDgrid.grid[DgridTargetPos.y][DgridTargetPos.x].color >> 3) & 7);
      levelClear &= (target.color === centerColor);
    })
    console.log(levelClear);
    if(levelClear){
        let mirrorsUsed = 0;
        reflectors.concat(lenses).forEach(mirror => {
            const mirrorPos = mirror.pos;
            const DgridMirrorPos = newDgrid.positionTransform(mirror.pos);
            const centerColor = 
                ((newGrid.grid[mirrorPos.y][mirrorPos.x].color >> 0) & 7) | 
                ((newGrid.grid[mirrorPos.y][mirrorPos.x].color >> 3) & 7) | 
                ((newGrid.grid[mirrorPos.y][mirrorPos.x].color >> 6) & 7) | 
                ((newGrid.grid[mirrorPos.y][mirrorPos.x].color >> 9) & 7) | 
                ((newDgrid.grid[DgridMirrorPos.y][DgridMirrorPos.x].color >> 0) & 7) | 
                ((newDgrid.grid[DgridMirrorPos.y][DgridMirrorPos.x].color >> 3) & 7) |
                ((newDgrid.grid[DgridMirrorPos.y][DgridMirrorPos.x].color >> 6) & 7) |
                ((newDgrid.grid[DgridMirrorPos.y][DgridMirrorPos.x].color >> 9) & 7);
            if(centerColor > 0) mirrorsUsed++;
        });
        req.body.record = mirrorsUsed;
        next();
    }else{
        return res.sendStatus(400);
    }
}
module.exports = verifyLevelClear;