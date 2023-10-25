require('../../config.js');
if (!global.db) {
    const pgp = require('pg-promise')();
    db = pgp(process.env.DB_URL);
}

const getLevels = (name, start, orderBy, ascend) => {
    const order = ascend === 'true' ? 'ASC' : 'DESC';
    const sql=`
        SELECT 
            level.id, 
            level.height, 
            level.width, 
            array_to_json(level.lasers) AS lasers, 
            array_to_json(level.targets) AS targets, 
            level."reflectorNum", 
            level."lensNum", 
            level.clears, 
            level.likes, 
            level.record, 
            level.creator, 
            level.timestamp,
            encode(level.thumbnail, 'base64') AS thumbnail,
            player_cleared_level.personal_best,
            CASE WHEN player_favorite_level.id IS NOT NULL THEN true ELSE false END "isFavorite"
        FROM level 
        LEFT JOIN player_cleared_level
        ON level.id = player_cleared_level.level_id AND player_cleared_level.player_name = $1
        LEFT JOIN player_favorite_level
        ON level.id = player_favorite_level.level_id AND player_favorite_level.player_name = $1
        WHERE level.public = true
        ORDER BY ${orderBy} ${order} LIMIT 5 OFFSET $2 
    `;
    return db.any(sql, [name, start]);
}
const getLevelByID = (id) => {
    const sql=`
        SELECT 
            id, 
            height, 
            width, 
            array_to_json(lasers) AS lasers,
            array_to_json(targets) AS targets, 
            "reflectorNum", 
            "lensNum", 
            clears, 
            likes, 
            record, 
            creator, 
            timestamp, 
            encode(thumbnail, 'base64') AS thumbnail
        FROM level WHERE public = true AND id = $1
    `;
    return db.oneOrNone(sql, id);
}

const addToFavorite = (name, id) => {
    const sql= `
        UPDATE level SET likes = likes + 1 WHERE id = $2;

        INSERT INTO player_favorite_level (player_name, level_id) VALUES ($1, $2)
        ON CONFLICT (player_name, level_id) DO NOTHING
    ` 
    return db.none(sql, [name, id]);
}

const removeFromFavorite = (name, id) => {
    const sql= `
        UPDATE level SET likes = likes - 1 WHERE id = $2;

        DELETE FROM player_favorite_level WHERE player_name = $1 AND level_id = $2
    ` 
    return db.none(sql, [name, id]);
}

const levelClear = (name, id, record) => {
    const sql=`
        UPDATE level SET 
        clears = (CASE WHEN EXISTS (SELECT 1 FROM player_cleared_level WHERE player_name = $1 AND level_id = $2) THEN clears ELSE clears + 1 END),
        record = LEAST(record, $3)
        WHERE id = $2;
        
        INSERT INTO player_cleared_level (player_name, level_id, personal_best) VALUES ($1, $2, $3)
        ON CONFLICT (player_name, level_id)
        DO UPDATE SET 
        personal_best = LEAST(player_cleared_level.personal_best, $3)
        WHERE player_cleared_level.player_name = $1 AND player_cleared_level.level_id = $2
        RETURNING personal_best
    `;
    return db.one(sql, [name, id, record]);
}

const checkIsFavorite = (name, id) => {
    const sql= `
        SELECT EXISTS (SELECT true from player_favorite_level WHERE player_name = $1 AND level_id = $2)::int AS "isFavorite"
    `;
    return db.one(sql, [name, id]);
}

module.exports = {
    getLevels,
    getLevelByID,
    levelClear,
    checkIsFavorite,
    addToFavorite,
    removeFromFavorite
};