const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require("body-parser");
const md5 = require("md5");

const app = express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

let resultHistory = [];
let isLoggedIn = false;
let currentUserId;
mongoose.connect("mongodb://localhost:27017/ciudm", {useNewUrlParser:true, useUnifiedTopology:true});

const criminalSchema = {
  name: {
    fname: String,
    mname: String,
    lname: String
  },
  address: String,
  typeOfCrime: [],
  details: {
    skinTone: String,
    height: Number,
    eyeColor: String,
    handed: String
  },
  tatto: {
    bodyPart: String,
    design: String
  },
  vehicle: [],
  nationality: String
};

const userSchema = {
  username : String,
  password: String
}

const Criminal = mongoose.model("criminal", criminalSchema);
const User = mongoose.model("user", userSchema);

app.get("/",function(req,res){
    res.render("login", {message: ""});
});

app.post("/login",function(req,res){
    let username = req.body.email;
    let password = md5(req.body.password);

    User.findOne({username: username}, function(err, user){
      if(user!==null){
        if(user.username===username&&user.password===password){
          isLoggedIn = true;
          currentUserId = user._id;
          res.redirect("/dashboard");
        }else{
          res.render("login", {message: "*Invalid Credentials. Please try again"});
        }
      }else{
        res.render("login", {message: "*Invalid Credentials. Please try again"});
      }
    });

});

app.get("/dashboard",function(req,res){
  if(isLoggedIn){
    res.render("dashboard")
  }else{
    res.render("login",{message: "*Please Login"});
  }
});

app.get("/operation", function(req, res){
  if(isLoggedIn){
    res.send("You can perform task")
  }else{
    res.render("login",{message: "*Please Login before requesting any operation"});
  }
});

app.post("/register",function(req,res){
  let email = req.body.email;
  let password = md5(req.body.password);
  const newUser = new User({
    username: email,
    password: password
  });
  newUser.save(function(err){
    if(!err){
      res.send("User Addeded Succesfully");
    }else{
      res.send(err);
    }
  });
});

app.get("/match/:sentSuspect", function(req,res){
  let totalFieds = 0, totalMatches=0;
  let suspectID=req.params.sentSuspect;
  let criminalID;
  let result=[];
  let itemsProcessed = 0
      Criminal.findOne({_id: req.params.sentSuspect}, function(err, suspect){
      Criminal.find({_id: {$ne: suspectID}},function(err,criminals){
          criminals.forEach(function(criminal){
            itemsProcessed = itemsProcessed+1;
            criminalID=criminal._id
            totalFieds=0;
            totalMatches=0;
              if(suspect.name.fname!==null||criminal.name.fname!==null)
              {
                totalFieds=totalFieds+1;
                  if(suspect.name.fname===criminal.name.fname)
                  {
                      totalMatches=totalMatches+1;
                  }
              }
              if(suspect.name.mname!==null||criminal.name.mname!==null)
              {
                totalFieds=totalFieds+1;
                  if(suspect.name.mname===criminal.name.mname)
                  {
                      totalMatches=totalMatches+1;
                  }
              }
              if(suspect.name.lname!==null||criminal.name.lname!==null)
              {
                totalFieds=totalFieds+1;
                  if(suspect.name.lname===criminal.name.lname)
                  {
                      totalMatches=totalMatches+1;
                  }
              }
              if(suspect.typeOfCrime[0]!==null||criminal.typeOfCrime[0]!==null)
              {
                  suspect.typeOfCrime.forEach(function(susCrime){
                    totalFieds=totalFieds+1;
                      criminal.typeOfCrime.forEach(function(criCrime){
                        if(susCrime===criCrime){
                          totalMatches=totalMatches+1;
                        }
                      })
                  })
              }
              if(suspect.details.skinTone!==null||criminal.details.skinTone!==null)
              {
                totalFieds=totalFieds+1;
                  if(suspect.details.skinTone===criminal.details.skinTone)
                  {
                      totalMatches=totalMatches+1;
                  }
              }
              if(suspect.details.eyeColor!==null||criminal.details.eyeColor!==null)
              {
                totalFieds=totalFieds+1;
                  if(suspect.details.eyeColor===criminal.details.eyeColor)
                  {
                      totalMatches=totalMatches+1;
                  }
              }
              if(suspect.details.handed!==null||criminal.details.handed!==null)
              {
                totalFieds=totalFieds+1;
                  if(suspect.details.handed===criminal.details.handed)
                  {
                      totalMatches=totalMatches+1;
                  }
              }
              if(suspect.vehicle[0]!==null||criminal.vehicle[0]!==null)
              {
                  suspect.vehicle.forEach(function(veh){
                    totalFieds=totalFieds+1;
                      criminal.vehicle.forEach(function(vehi){
                        if(veh===vehi){
                          totalMatches=totalMatches+1;
                        }
                      })
                  })
              }
              if(suspect.nationality!==null||criminal.nationality!==null)
              {
                totalFieds=totalFieds+1;
                  if(suspect.nationality===criminal.nationality)
                  {
                      totalMatches=totalMatches+1;
                  }
              }
            let percent = ((totalMatches/totalFieds)*100);
            result = [...result, {id: criminalID, matchScore: percent}];
            console.log("Total Comparisons of Not Null fields : " + totalFieds);
            console.log("Total Match Found : " + totalMatches);
            console.log("Percent : " + percent+"%");
          });
  });
});
res.send("Hello");
});

app.listen(3000, function(err){
  if(!err){
    console.log("Server Started on Port 3000");
  }
})
