import express from 'express';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import { createServer as createServerHttps } from 'https';
import { createServer as createServerHttp } from 'http';
import MongoClient from 'mongodb';
import path from 'path';
import dbConfig from '../config/db.json';

const args = require('minimist')(process.argv.splice(2));
const ENV = args['ENV'].toLowerCase() || 'dev';
const HTTP_PORT = args['HTTP_PORT'] || 80;
const HTTPS_PORT = args['HTTPS_PORT'] || 443;

//setup an express app
const app = express();

//exporting this app for other modules to retrive its locals properties 
export default app;
//this is deliberately imported after app exports coz this app is getting imported in users.js 
import userRoutes from './routes/users';
import accountRoutes from './routes/accounts';
import transactionRoutes from './routes/transactions';

//custom middleware to handle cross-origin requests
const allowCrossDomain = (req,res,next) => {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Content-Type');
    res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');

    next();
}

//mount body-parser middleware 
app.use(bodyParser.json());
//this is to parse body if request coming as XmlHttpRequest directly from browser
//app.use(bodyParser.urlencoded({extended:true}));

app.use(allowCrossDomain);

//app.use(cors())  //bakcup plan in case some issue with custom middleware fn allowCrossDomain()

//configure middleware routes
app.use('/ump',userRoutes,accountRoutes,transactionRoutes);

//app settings - to indent prettified JSON - used by JSON.stringify()
app.set('json spaces', 4);

//check for null, undefined, empty, space String
const stringNullEmptySpace = (str) => (!str || str.length === 0 || /^\s*$/.test(str));

//load env specific db configuration
function getMongodbUrl() {
    let usernamePasswd = '';
    let hostPort = ''    
    const username = dbConfig[ENV].username;
    if (!stringNullEmptySpace(username)) {
        const password = dbConfig[ENV].password;
        usernamePasswd = username + ':' + password + '@';
    }
    const port = dbConfig[ENV].port;
    const hosts = dbConfig[ENV].hosts;    
    for (let host of hosts) {
        hostPort += host + ":" + port + ",";
    }
    hostPort = hostPort.substring(0,hostPort.length-1);
    let appendableOptions = '';
    const options = dbConfig[ENV].options;
    for (let option in options) {
        const value = options[option];
        if (!stringNullEmptySpace(value) || Number.isInteger(value) || Boolean(value)) {
            appendableOptions += option + "=" + value + "&";
        }
    }
    if (!stringNullEmptySpace(appendableOptions)) {
        appendableOptions = appendableOptions.substring(0,appendableOptions.length-1);
    }    
    return `mongodb://${usernamePasswd}${hostPort}/?${appendableOptions}`
} 
//connection url
const dbUrl = getMongodbUrl();

MongoClient.connect(dbUrl, {useNewUrlParser:true}, (err, client) => {
    if(err) {
        console.log(err);
        throw err;
    }

    //database name 
    const dbName = dbConfig[ENV].dbname;

    //storing db connection object in app.locals object so that other modules can share this DB connection object
    app.locals.db = client.db(dbName);   
        
    //start the application after the db connection is ready
    const options = {
        key: readFileSync(path.join(__dirname,'../config/server.key')),
        cert: readFileSync(path.join(__dirname,'../config/server.crt'))
    };    
    //create express https.server and listen
    createServerHttps(options,app)
        .listen(HTTPS_PORT,() => {    
            console.log(`express https.server is listening on port:${HTTPS_PORT}`);
        });        
    //Enable this code if you want to listen on http server also
    //create express http.server and listen
    createServerHttp(app).listen(HTTP_PORT,() => {
        console.log(`express http.server is listening on port:${HTTP_PORT}`);
    });
});    

/* disabled this as redirection is recommended to handle at NGNIX level on top of node.js server 
  coz at server side it add delays in redirection.
  //configure middleware express-force-ssl
     //const expressForceSSL = require('express-force-ssl');   
     //app.use(expressForceSSL);
*/

    
