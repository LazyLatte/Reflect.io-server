const {verifyMirror, verifyUniqueObjectPosition} = require('./verifyObjects');
const ObjectType = {None: 0, Laser: 1, Target: 2, Reflector: 3, Lens: 4};
const mirrorDirections = [
  {x: -1, y: 0},
  {x: -1, y: -1},
  {x: 0, y: -1},
  {x: 1, y: -1},
  {x: 1, y: 0},
  {x: 1, y: 1},
  {x: 0, y: 1},
  {x: -1, y: 1},
];
const mirrorDegreeToDirection = (deg) => mirrorDirections[(deg/45)%8];
  
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
          row.push({
            object: {
              type: ObjectType.None,
              dir: {x:0, y:0},
              color: 0
            }, 
            topColor: 0,
            rightColor: 0,
            bottomColor: 0,
            leftColor: 0
          }); 
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
    pushState(Q, state, nextDir, nextColor, loopPotential){
      Q.unshift({
        pos: {x: state.pos.x + nextDir.x, y: state.pos.y + nextDir.y},
        dir: {x: nextDir.x, y: nextDir.y},
        color: nextColor,
        loopPotentialMirrors: loopPotential ? [...state.loopPotentialMirrors, {
          pos: {x: state.pos.x, y: state.pos.y},
          dir: {x: state.dir.x, y: state.dir.y}
        }] : [...state.loopPotentialMirrors]
      })
    }
    applyColor(pos, dir, color){
        if(dir.x === 1 && dir.y === 0) this.grid[pos.y][pos.x].leftColor |= color; //left
        if(dir.x === 0 && dir.y === -1) this.grid[pos.y][pos.x].bottomColor |= color; // bottom
        if(dir.x === -1 && dir.y === 0) this.grid[pos.y][pos.x].rightColor |= color; //right
        if(dir.x === 0 && dir.y === 1) this.grid[pos.y][pos.x].topColor |= color; //top
      }
    trace(laser){
      let Q = [];
      const LaserPos = this.positionTransform(laser.pos);
      const LaserDir = this.directionTransform(laser.dir);
      const initState = {pos: {x: LaserPos.x + LaserDir.x, y: LaserPos.y + LaserDir.y}, dir: LaserDir, color: laser.color, loopPotentialMirrors: []};
      this.applyColor(LaserPos, {x: -LaserDir.x, y: -LaserDir.y}, laser.color);
      Q.unshift(initState);
  
      while(Q.length>0){
        const state = Q.pop();
        const {pos, dir, color, loopPotentialMirrors} = state;
  
        if(!this.outOfBound(pos)){
          const objType = this.grid[pos.y][pos.x].object.type;

          switch(objType){
            case ObjectType.None:
            case ObjectType.Target:
              // direct pass
              this.applyColor(pos, dir, color);
              this.applyColor(pos, {x: -dir.x, y: -dir.y}, color);
              this.pushState(Q, state, dir, color, false);
              break;
            case ObjectType.Laser:
              this.applyColor(pos, dir, color);
              break;
            case ObjectType.Reflector:
              if(!this.loopDetection(pos, dir, loopPotentialMirrors)){
                const incidentVector = dir;
                const normalVector = this.directionTransform(this.grid[pos.y][pos.x].object.dir);
                const reflectorColor = this.grid[pos.y][pos.x].object.color;
                const nextColor = (color & reflectorColor);
                const innerProduct = incidentVector.x * normalVector.x + incidentVector.y * normalVector.y;
                if(-incidentVector.x === normalVector.x && -incidentVector.y === normalVector.y){
                  // 180 deg reflect
                  const reflectVector = normalVector;
                  this.pushState(Q, state, reflectVector, nextColor, true);
                }else if(innerProduct < 0){
                  // 45 deg reflect
                  const reflectVector = {x: incidentVector.x + normalVector.x, y: incidentVector.y + normalVector.y};
                  this.pushState(Q, state, reflectVector, nextColor, true);
                  this.applyColor(pos, {x: -reflectVector.x, y: -reflectVector.y}, nextColor);
                }
                this.applyColor(pos, dir, color);
              }
              break;
            case ObjectType.Lens:
              if(!this.loopDetection(pos, dir, loopPotentialMirrors)){
                const incidentVector = dir;
                const normalVector = this.directionTransform(this.grid[pos.y][pos.x].object.dir);
                const lensColor = this.grid[pos.y][pos.x].object.color;
                const nextColor = (color & lensColor);
                const innerProduct = incidentVector.x * normalVector.x + incidentVector.y * normalVector.y;
                if(innerProduct !== 0){
  
                  const reflectVector = (innerProduct < 0) ? {x: incidentVector.x + normalVector.x, y: incidentVector.y + normalVector.y} : {x: incidentVector.x - normalVector.x, y: incidentVector.y - normalVector.y}
  
                  if(reflectVector.x !== 0 || reflectVector.y !==0){
                    this.pushState(Q, state, reflectVector, nextColor, true);
                    this.applyColor(pos, {x: -reflectVector.x, y: -reflectVector.y}, nextColor);
                  }
                  this.pushState(Q, state, incidentVector, nextColor, true);
                  this.applyColor(pos, {x: -incidentVector.x, y: -incidentVector.y}, nextColor);
                }
                this.applyColor(pos, dir, color);
              }
              break;
            default:
              console.log('Unknown object', pos);
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
          row.push({
            object: {
              type: ObjectType.None,
              dir: {x:0, y:0},
              color: 0
            }, 
            topColor: 0,
            rightColor: 0,
            bottomColor: 0,
            leftColor: 0
          });
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

const verifySolution = (req, res, next) => {
    const {levelInfo, mirrorStates} = req.body;
    if(!mirrorStates || !Array.isArray(mirrorStates.reflectors) || !Array.isArray(mirrorStates.lenses)) return res.sendStatus(400);
    const {height, width, lasers, targets, reflectors, lenses} = levelInfo;
    if(mirrorStates.reflectors.length !== reflectors.length || mirrorStates.lenses.length !== lenses.length) return res.sendStatus(400);

    const reflectorsOnGrid = mirrorStates.reflectors.filter(mirror => verifyMirror(mirror, height, width));
    const lensesOnGrid = mirrorStates.lenses.filter(mirror => verifyMirror(mirror, height, width));

    if(!verifyUniqueObjectPosition([...lasers, ...targets, ...reflectorsOnGrid, ...lensesOnGrid], height, width)) return res.sendStatus(400);
    
    // start verify the solution
    const newGrid = new Grid(height, width);
    const newDgrid = new Dgrid(height, width);

    lasers.forEach(laser => {
      const {pos, dir, color} = laser;
      newGrid.addObject(pos, {type: ObjectType.Laser, dir, color});
      newDgrid.addObject(pos, {type: ObjectType.Laser, dir, color});
    });

    reflectorsOnGrid.forEach(mirror => {
      const {pos, deg, color} = mirror;
      newGrid.addObject(pos, {type: ObjectType.Reflector, dir: mirrorDegreeToDirection(deg), color});
      newDgrid.addObject(pos, {type: ObjectType.Reflector, dir: mirrorDegreeToDirection(deg), color});
    });
    lensesOnGrid.forEach(mirror => {
      const {pos, deg, color} = mirror;
      newGrid.addObject(pos, {type: ObjectType.Lens, dir: mirrorDegreeToDirection(deg), color});
      newDgrid.addObject(pos, {type: ObjectType.Lens, dir: mirrorDegreeToDirection(deg), color});
    });


    lasers.forEach(laser => {
      (laser.dir.x === 0 || laser.dir.y === 0) ? newGrid.trace(laser) : newDgrid.trace(laser);
    });
    
    let levelClear = true;
    targets.forEach(target => {
      const targetPos = target.pos;
      const DgridTargetPos = newDgrid.positionTransform(target.pos);
      const centerColor = newGrid.grid[targetPos.y][targetPos.x].topColor | newGrid.grid[targetPos.y][targetPos.x].rightColor | newDgrid.grid[DgridTargetPos.y][DgridTargetPos.x].topColor | newDgrid.grid[DgridTargetPos.y][DgridTargetPos.x].rightColor;
      levelClear &= (target.color === centerColor);
    })
    //console.log(levelClear);
    if(levelClear){
      let mirrorsUsed = 0;
      reflectorsOnGrid.concat(lensesOnGrid).forEach(mirror => {
        const mirrorPos = mirror.pos;
        const DgridMirrorPos = newDgrid.positionTransform(mirror.pos);
        const centerColor = 
          (newGrid.grid[mirrorPos.y][mirrorPos.x].topColor) | 
          (newGrid.grid[mirrorPos.y][mirrorPos.x].rightColor) | 
          (newGrid.grid[mirrorPos.y][mirrorPos.x].bottomColor) | 
          (newGrid.grid[mirrorPos.y][mirrorPos.x].leftColor) | 
          (newDgrid.grid[DgridMirrorPos.y][DgridMirrorPos.x].topColor) | 
          (newDgrid.grid[DgridMirrorPos.y][DgridMirrorPos.x].rightColor) |
          (newDgrid.grid[DgridMirrorPos.y][DgridMirrorPos.x].bottomColor) |
          (newDgrid.grid[DgridMirrorPos.y][DgridMirrorPos.x].leftColor);
        if(centerColor > 0) mirrorsUsed++;
      });
      req.body.record = mirrorsUsed;
      next();
    }else{
      return res.sendStatus(400);
    }
}
module.exports = verifySolution;