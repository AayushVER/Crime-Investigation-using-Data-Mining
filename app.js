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
// let currentUserId;

mongoose.connect("mongodb://localhost:27017/ciudm", {useNewUrlParser:true, useUnifiedTopology:true});

const caseSchema = {
  caseId: String,
  subjectOrTitle: String,
  description:  String,
  location: {
    saddress: String,
    city: String,
    state:String
  },
  witness: String
}

const suspectSchema = {
  caseId: String,
  name: {
    fname: String,
    mname: String,
    lname: String
  },
  address: {
    saddress: String,
    city: String,
    state:String
  },
  nationality: String,
  typeOfCrime: [],
  weaponORtool: String,
  details: {
    skinTone: String,
    height: Number,
    handed: String,
    eyeColor: String
  },
  bodyMark: {
    bodyPart: String,
    mark: String
  },
  vehicle: []
};

const criminalSchema = {
  caseId: String,
  name: {
    fname: String,
    mname: String,
    lname: String
  },
  address: {
    saddress: String,
    city: String,
    state:String
  },
  nationality: String,
  typeOfCrime: [],
  commitedDate: Date,
  caughtORarrestDate: Date,
  weaponORtool: String,
  partner: String,
  details: {
    skinTone: String,
    height: Number,
    handed: String,
    eyeColor: String
  },
  bodyMark: {
    bodyPart: String,
    mark: String
  },
  vehicle: []
};


const userSchema = {
  username : String,
  password: String
}

const Case = mongoose.model("case", caseSchema);
const Suspect = mongoose.model("suspect", suspectSchema);
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
          res.render("dashboard", {newCaseMessage: ""});
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
    res.render("dashboard", {newCaseMessage: ""})
  }else{
    res.render("login",{message: "*Please Login"});
  }
});

app.post("/dashboard",function(req,res){
    isLoggedIn=false;
    res.redirect("/")
});

app.get("/newCase", function(req,res){
    if(isLoggedIn){

      res.render("newCase");
    }else{
      res.render("login",{message: "*Please Login"});
    }
});

app.post("/newCase", function(req,res){
    if(isLoggedIn){
      let caseId = req.body.caseId;
        const newCase = new Case({
          caseId: req.body.caseId,
          subjectOrTitle: req.body.caseSubjectOrTitle,
          description: req.body.caseDescription,
          location: {
            saddress: req.body.saddress,
            city: req.body.city,
            state: req.body.state
          },
          witness: req.body.witness
        });

        newCase.save(function(err){
          if(!err){
            if(req.body.radio!==null){
                if(req.body.radio==="suspect"){
                  res.render("newSuspectForm", {cid:caseId,newCaseMessage: "Case registered successfully!"});
                }else if(req.body.radio==="criminal"){
                  res.render("newCriminalForm", {cid:caseId,newCaseMessage: "Case registered successfully!"})
                }else{
                    res.render("dashboard", {newCaseMessage: "Case registered successfully!"});
                }
            }else{
              res.render("dashboard", {newCaseMessage: "Case registered successfully!"});
            }
          }
        })
    }else{
      res.render("login",{message: "*Please Login"});
    }
});

app.get("/newSuspectForm",function(req,res){
    if(isLoggedIn){
      res.render("newSuspectForm", {cid:"",newCaseMessage: ""});
    }else{
      res.render("login",{message: "*Please Login"});
    }
});

app.post("/newSuspectForm", function(req,res){
      const newSuspect= new Suspect({
        caseId: req.body.caseId,
        name: {
          fname: req.body.fname,
          mname: req.body.mname,
          lname: req.body.lname
        },
        address: {
          saddress: req.body.saddress,
          city: req.body.city,
          state:req.body.state
        },
        nationality: req.body.nationality,
        typeOfCrime: [req.body.crime],
        weaponORtool: req.body.weaponORtool,
        details: {
          skinTone: req.body.skinTone,
          height: req.body.height,
          handed: req.body.handed,
          eyeColor: req.body.eyeColor
        },
        bodyMark: {
          bodyPart: req.body.bodyPart,
          mark: req.body.mark
        },
        vehicle: [req.body.vehicle]
      });

      newSuspect.save(function(err){
        if(!err){
          res.render("dashboard", {newCaseMessage: ""});
        }else{
          res.send(err);
        }
      });

});

app.get("/newCriminalForm", function(req,res){
    if(isLoggedIn){
      res.render("newCriminalForm", {cid:"",newCaseMessage: ""});
    }else{
      res.render("login",{message: "*Please Login"});
    }
});

app.post("/newCriminalForm", function(req,res){
    const newCriminal = new Criminal({
      caseId: req.body.caseId,
      name: {
        fname: req.body.fname,
        mname: req.body.mname,
        lname: req.body.lname
      },
      address: {
        saddress: req.body.saddress,
        city: req.body.city,
        state:req.body.state
      },
      nationality: req.body.nationality,
      typeOfCrime: [req.body.crime],
      commitedDate: req.body.commitedDate,
      caughtORarrestDate: req.body.caughtDate,
      weaponORtool: req.body.weaponORtool,
      partner: req.body.partnerInCrime,
      details: {
        skinTone: req.body.skinTone,
        height: req.body.height,
        handed: req.body.handed,
        eyeColor: req.body.eyeColor
      },
      bodyMark: {
        bodyPart: req.body.bodyPart,
        mark: req.body.mark
      },
      vehicle: [req.body.vehicle]
    });

    newCriminal.save(function(err){
      if(!err){
        res.render("dashboard", {newCaseMessage: ""});
      }else{
        res.send(err);
      }
    });
});

app.get("/operation", function(req, res){
  if(isLoggedIn){
    res.send("You can perform task")
  }else{
    // res.render("login",{message: "*Please Login before requesting any operation"});
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
      Suspect.findOne({_id: req.params.sentSuspect}, function(err, suspect){
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
              if(suspect.adress.sadress!==null||criminal.adress.saddress!==null)
              {
                  totalFieds=totalFieds+1;
                  if(suspect.adress.sadress===criminal.adress.saddress)
                  {
                    totalMatches=totalMatches+1;
                  }
              }
              if(suspect.adress.city!==null||criminal.adress.city!==null)
              {
                  totalFieds=totalFieds+1;
                  if(suspect.adress.city===criminal.adress.city)
                  {
                    totalMatches=totalMatches+1;
                  }
              }
              if(suspect.adress.state!==null||criminal.adress.state!==null)
              {
                  totalFieds=totalFieds+1;
                  if(suspect.adress.state===criminal.adress.state)
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
              if(suspect.weaponORtool!==null||criminal.weaponORtool!==null)
              {
                totalFieds=totalFieds+1;
                  if(suspect.weaponORtool===criminal.weaponORtool)
                  {
                      totalMatches=totalMatches+1;
                  }
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
});
