const cn = process.env.NODE_ENV === 'development' ? {
    host: process.env.PG_HOSTNAME,
    port: process.env.PG_PORT,
    database: process.env.PG_DB_NAME,
    user: process.env.PG_USERNAME,
    password: 'henry',
} : {
    host: process.env.RDS_HOSTNAME,
    port: process.env.RDS_POR,
    database: process.env.RDS_DB_NAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    ssl: {
        rejectUnauthorized: false,
    },
}
// try {
//     switch (process.env.NODE_ENV) {
//         case 'development': 
//             process.env.DB_URL = `postgres://${process.env.PG_USERNAME}:${'henry'}@${process.env.PG_HOSTNAME}:${process.env.PG_PORT}/${process.env.PG_DB_NAME}`;

//             break;
//         default: // 'staging' or 'production'
//             process.env.DB_URL = `postgres://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT}/${process.env.RDS_DB_NAME}`;
//             break;
//     }
// } catch (err) {
//     console.log(err, '\n\nError configuring the project. Have you set the environment veriables?');
// }

module.exports={cn};