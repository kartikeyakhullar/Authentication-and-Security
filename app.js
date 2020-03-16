require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport  = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const  app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Using express-session package

app.use(session({
    secret: process.env.ENCRYPT_KEY,
    resave: false,
    saveUninitialized: false 
}));

// Initialising passport

app.use(passport.initialize());
app.use(passport.session());

// Connecting to DB

mongoose.connect('mongodb://localhost/userDB', {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Adding a plugin to the  userSchema

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User",userSchema);

// Adding strategy of passport-local-mongoose

passport.use(User.createStrategy());
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());






// Routes

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets", function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})

app.post("/register", function(req,res){
    User.register({username : req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
        }
    } )
});

app.post("/login",function(req,res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })        
        }
    });
});


app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
});


app.listen(3000, function(){
    console.log("Server started on port 3000...");
})
