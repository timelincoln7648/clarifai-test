require('dotenv').config()
var express = require("express");
var session = require('express-session');
var bodyParser = require("body-parser");
var config = require("./config.js");

const Clarifai = require("clarifai");
const clarifaiApp = new Clarifai.App({
 apiKey: config.CLARIFAI_API_KEY
});

var app = express();

app.set("view engine", "ejs");app.set('trust proxy', 1);
app.use(session({
    secret: config.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
  res.locals = req.session;
  next();
});

//ROUTES

// Home Page
app.get('/', function(req, res) {
    
    
    if (req.session.predictions) {
       // do something with response
        var predictions = req.session.predictions;
        console.log("\nClarifai predictions: \n\n");
        var length = Object.keys(predictions.concepts).length
        
        for (var i=0; i<length; i++){
            var prediction = predictions.concepts[i]
            console.log(prediction.name+" - "+prediction.value);
        } 
    }
    
    
    res.render('home');
   
});

app.post('/runClarifai', function(req, res) {
    
    const imgURL = req.body.inputImgURL;
    
    clarifaiApp.models.predict(Clarifai.GENERAL_MODEL, imgURL).then(
      function(response) {
          req.session.predictions = response.outputs[0].data;
          res.redirect('/');
      },
      function(err) {
        // there was an error
        console.log("Clarifai Error: ", err);
        res.redirect('/');
      }
    ); 
});

app.get('/settings', function(req, res) {
    res.render('settings');
});




//start server
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server started homie");
});