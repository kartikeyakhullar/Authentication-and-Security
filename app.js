require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const  bcrypt = require("bcrypt");
const saltRounds = 10;


const  app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");


// Connecting to DB

mongoose.connect('mongodb://localhost/userDB', {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("User",userSchema);








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

app.post("/register", function(req,res){
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const user = new User({
            email: req.body.username,
            password: hash
        });
        user.save(function(err){
            if(err){
                console.log(err);
            }else{
                res.render("secrets");
            }
        });
    });    
});

app.post("/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err,foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if(result === true){
                        res.render("secrets");
                    }
                });
            }
        }
    });
});





app.listen(3000, function(){
    console.log("Server started on port 3000...");
})
