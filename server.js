const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
//const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const playRouter = require('./src/routers/play');
const levelRouter = require('./src/routers/level');
const accountRouter = require('./src/routers/account');
const refreshRouter = require('./src/routers/refresh');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')))
// const whiteList = ['http://localhost:3000', 'http://localhost:5173'];
// const corsOptions = {
//     origin: (origin, callback) =>{
//         //callback(null, true);
//         if(whiteList.indexOf(origin) !== -1 ){
//             callback(null, true);
//         }else{
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
//     optionsSuccessStatus: 200
// }
// const credentials = (req, res, next) => {
//     const origin = req.headers.origin;
//     if(whiteList.includes(origin)){
//         res.header('Access-Control-Allow-Credentials', true);
//     }
//     next();
// }
// app.use(credentials);
// app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/refresh', refreshRouter);
app.use('/api/account', accountRouter);
app.use('/api/play', playRouter);
app.use('/api/levels', levelRouter);
const port = 443;
const options = {
    key: fs.readFileSync(process.env.SSL_KEY),
    cert: fs.readFileSync(process.env.SSL_CERT),
    ca: fs.readFileSync(process.env.SSL_CA)
};
https.createServer(options, app).listen(port, () => {
    console.log(`Server is up and running on port ${port}...`);
});