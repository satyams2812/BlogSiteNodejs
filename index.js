var port = process.env.port ||5000 ;

const express = require('express');
const app = express();
const routes = require('./route.js');
const path = require('path');
const { route } = require('./route.js');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');




app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('uploads'));




app.get('/',routes);

app.get('/register',routes);

app.post('/register',routes);

app.post('/login',routes);

app.get('/dashboard',routes);

app.get('/logout',routes);

app.post('/addmsg',routes);

app.get('/editprofile',routes);

app.post('/edit',routes);

app.get('/home',routes);

app.post('/image',routes);
 
app.get('/uploads/:id',routes);




app.listen(port,()=>{
    console.log("server started at ", port)
})