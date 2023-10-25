require('../../config.js');


const pgp = require("pg-promise")();
db = pgp(process.env.DB_URL);


const schemaSql = `
    -- Extensions
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    -- Drop (droppable only when no dependency)
    DROP TABLE IF EXISTS player_favorite_level;
    DROP TABLE IF EXISTS player_cleared_level;
    DROP TABLE IF EXISTS level;
    DROP TABLE IF EXISTS player;
    DROP TYPE IF EXISTS target;
    DROP TYPE IF EXISTS laser;
    DROP TYPE IF EXISTS vector2d;



    -- Create
    CREATE TYPE vector2d AS (
        x   int,
        y   int
    );
    CREATE TYPE laser AS (
        pos     vector2d,
        dir     vector2d,
        color   int
    );
    CREATE TYPE target AS (
        pos     vector2d,
        color   int
    );


    CREATE TABLE player (
        id                UUID PRIMARY KEY NOT NULL,
        name              text NOT NULL,
        password          text NOT NULL,
        UNIQUE(name)
    );
    
    CREATE TABLE level (
        id                  UUID PRIMARY KEY NOT NULL,
        height              int NOT NULL DEFAULT 10,
        width               int NOT NULL DEFAULT 10,
        lasers              laser[] NOT NULL DEFAULT array[]::laser[],
        targets             target[] NOT NULL DEFAULT array[]::target[],
        "reflectorNum"      int NOT NULL DEFAULT 0,
        "lensNum"           int NOT NULL DEFAULT 0,
        public              boolean NOT NULL DEFAULT false,
        clears              int NOT NULL DEFAULT 0,
        likes               int NOT NULL DEFAULT 0,
        record              int NOT NULL DEFAULT 999,
        creator             text NOT NULL REFERENCES player (name),
        timestamp           timestamp default current_timestamp,
        thumbnail           bytea DEFAULT NULL
    );
    CREATE TABLE player_cleared_level (
        id                  serial PRIMARY KEY NOT NULL,
        player_name         text NOT NULL REFERENCES player (name),
        level_id            UUID NOT NULL REFERENCES level (id),
        personal_best       int NOT NULL,
        UNIQUE (player_name, level_id)
    );
    CREATE TABLE player_favorite_level (
        id                  serial PRIMARY KEY NOT NULL,
        player_name         text NOT NULL REFERENCES player (name),
        level_id            UUID NOT NULL REFERENCES level (id),
        UNIQUE (player_name, level_id)
    );    
`;

const dataSql = `
    -- Populate dummy player
    -- INSERT INTO player (id, name, password) VALUES (uuid_generate_v4(), 'guest', '1234');
    -- Populate dummy level
    -- INSERT INTO level (id, height, width, lasers, targets, "reflectorNum", "lensNum", creator)
    -- SELECT uuid_generate_v4(), 10, 10, array[((3, 3), (1, 0), 2)]::laser[], array[((5, 6), 2), ((7, 3), 2)]::target[], 1, 1, 'guest' 
    -- From generate_series(1, 100) AS s(i);
`;

db.none(schemaSql).then(() => {

    console.log('Schema created');
    db.none(dataSql).then(() => {
        console.log('Data populated');
        pgp.end();
    });
}).catch(err => {
    console.log('Error creating schema', err);
});