require('../../config.js');
if (!global.db) {
    const pgp = require('pg-promise')();
    db = pgp(process.env.DB_URL);
}
const getAccount = (name) => {
    const sql=`
        SELECT * from player WHERE name = $1
    `;
    return db.oneOrNone(sql, name);
}

const createAccount = (name, password) => {
    const sql=`
        INSERT INTO player (id, $<this:name>)
        VALUES (uuid_generate_v4(), $<name>, $<password>)
        ON CONFLICT (name) DO NOTHING
        RETURNING *
    `;
    return db.one(sql, {name, password});
}

// const updateUsername = (name, newName) => {
//     const sql=`
//         UPDATE player SET
//         name = $2
//         WHERE name = $1
//         RETURNING *
//     `;
//     return db.one(sql, [name, newName]);
// }

// const updatePassword= (name, newPassword) => {
//     const sql=`
//         UPDATE player SET
//         password = $2
//         WHERE name = $1
//         RETURNING *
//     `;
//     return db.one(sql, [name, newPassword]);
// }

// const deleteAccount = (name) => {
//     const sql=`
//         DELETE FROM level WHERE creator = $1;
//         DELETE FROM player WHERE name = $1
//         RETURNING *
//     `;
//     return db.one(sql, name);
// }
module.exports = {
    getAccount,
    createAccount,
    // updateUsername,
    // updatePassword,
    // deleteAccount
};
