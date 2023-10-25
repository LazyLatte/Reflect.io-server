require('../../config.js');
if (!global.db) {
    const pgp = require('pg-promise')();
    db = pgp(process.env.DB_URL);
}

const getUserLevels = (name) => {
    const sql=`
        SELECT id, height, width, array_to_json(lasers) AS lasers, array_to_json(targets) AS targets, "reflectorNum", "lensNum", public, clears, likes, record, creator, timestamp, encode(thumbnail, 'base64') AS thumbnail
        FROM level WHERE creator = $1 ORDER BY timestamp ASC
    `;
    return db.any(sql, name);
}

const createLevel = (name, height, width, thumbnail) => {
    const sql=`
        INSERT INTO level (id, creator, height, width, thumbnail)
        VALUES (uuid_generate_v4(), $1, $2, $3, decode($4, 'base64'))
        RETURNING id, height, width, array_to_json(lasers) AS lasers, array_to_json(targets) AS targets, "reflectorNum", "lensNum", public, clears, likes, record, creator, timestamp, encode(thumbnail, 'base64') AS thumbnail
    `;
    return db.one(sql, [name, height, width, thumbnail]);
}

const updateLevel = (name, id, levelInfo, thumbnail) => {
    const {height, width, lasers, targets, reflectorNum, lensNum} = levelInfo;
    const lasersString = lasers.map((laser, i)=>`((${laser.pos.x}, ${laser.pos.y}), (${laser.dir.x}, ${laser.dir.y}), ${laser.color})`);
    const targetsString= targets.map((target, i)=>`((${target.pos.x}, ${target.pos.y}), ${target.color})`);
    const sql=`
        DELETE FROM player_cleared_level WHERE level_id = $2;
        DELETE FROM player_favorite_level WHERE level_id = $2;

        UPDATE level SET 
        height = $3, 
        width = $4, 
        lasers = array[${lasersString}]::laser[], 
        targets = array[${targetsString}]::target[], 
        "reflectorNum" = $5, 
        "lensNum" = $6,
        thumbnail = decode($7, 'base64'),
        clears = 0,
        likes = 0,
        public = false
        WHERE creator = $1 AND id = $2
        RETURNING id, height, width, array_to_json(lasers) AS lasers, array_to_json(targets) AS targets, "reflectorNum", "lensNum", public, clears, likes, record, creator, timestamp, encode(thumbnail, 'base64') AS thumbnail
    `;
    return db.one(sql, [name, id, height, width, reflectorNum, lensNum, thumbnail]);
}
const uploadLevel = (name, id, levelInfo, record, thumbnail) => {
    const {height, width, lasers, targets, reflectorNum, lensNum} = levelInfo;
    const lasersString = lasers.map((laser, i)=>`((${laser.pos.x}, ${laser.pos.y}), (${laser.dir.x}, ${laser.dir.y}), ${laser.color})`);
    const targetsString= targets.map((target, i)=>`((${target.pos.x}, ${target.pos.y}), ${target.color})`);
    const sql=`
        DELETE FROM player_cleared_level WHERE level_id = $2;
        DELETE FROM player_favorite_level WHERE level_id = $2;

        UPDATE level SET 
        height = $3, 
        width = $4, 
        lasers = array[${lasersString}]::laser[], 
        targets = array[${targetsString}]::target[], 
        "reflectorNum" = $5, 
        "lensNum" = $6, 
        thumbnail = decode($7, 'base64'),
        clears = 0,
        likes = 0,
        record = $8,
        public = true
        WHERE creator = $1 AND id = $2
        RETURNING id, height, width, array_to_json(lasers) AS lasers, array_to_json(targets) AS targets, "reflectorNum", "lensNum", public, clears, likes, record, creator, timestamp, encode(thumbnail, 'base64') AS thumbnail
    `;
    return db.one(sql, [name, id, height, width, reflectorNum, lensNum, thumbnail, record]);
}

const deleteLevel = (id) => {
    const sql=`
        DELETE FROM player_cleared_level WHERE level_id = $1;
        DELETE FROM player_favorite_level WHERE level_id = $1;
        DELETE FROM level WHERE id = $1
        RETURNING id, height, width, array_to_json(lasers) AS lasers, array_to_json(targets) AS targets, "reflectorNum", "lensNum", public, likes, creator
    `;
    return db.one(sql, id);
}
const checkUserOwnsLevel = (name, id) => {
    const sql=`
        SELECT EXISTS (SELECT true from level WHERE creator = $1 AND id = $2)::int
    `;
    return db.one(sql, [name, id]);
}

module.exports = {
    getUserLevels,
    createLevel,
    updateLevel,
    uploadLevel,
    deleteLevel,
    checkUserOwnsLevel
};


/*
    const {height, width, lasers, targets, reflectorNum, lensNum} = levelInfo;
    const lasersString = lasers.map((laser, i)=>`((${laser.pos.x}, ${laser.pos.y}), (${laser.dir.x}, ${laser.dir.y}), ${laser.color})`);
    const targetsString= targets.map((target, i)=>`((${target.pos.x}, ${target.pos.y}), ${target.color})`);
    const sql=`
    INSERT INTO level (height, width, lasers, targets, "reflectorNum", "lensNum", creator)
    VALUES (${height}, ${width}, array[${lasersString}]::laser[], array[${targetsString}]::target[], ${reflectorNum}, ${lensNum}, '${name}')
    RETURNING id, height, width, array_to_json(lasers) AS lasers, array_to_json(targets) AS targets, "reflectorNum", "lensNum", likes, creator
    `;
*/