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
  _id: String,
  subjectOrTitle: String,
  description:  String,
  location: {
    saddress: String,
    city: String,
    state:String
  },
  witness: []
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
  weaponORtool: [],
  details: {
    skinTone: String,
    height: {
      ft: Number,
      in: Number
    },
    handed: String,
    eyeColor: String,
    bodyFit: String
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
  weaponORtool: [],
  partner: String,
  details: {
    skinTone: String,
    height: {
      ft: Number,
      in: Number
    },
    handed: String,
    eyeColor: String,
    bodyFit: String
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
  console.log("post request triggered");
    if(isLoggedIn){
      let caseId = req.body.caseId;
      let witnessList = req.body.witness.split(" ");

        const newCase = new Case({
          _id: req.body.caseId,
          subjectOrTitle: req.body.caseSubjectOrTitle,
          description: req.body.caseDescription,
          location: {
           saddress: req.body.saddress,
           city: req.body.city,
           state: req.body.state
          },
          witness: witnessList
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
    let typeOfCrimeList = req.body.crime.split(" ");
    let vehicleList = req.body.vehicle.split(" ");
    let weaponORtoolList = req.body.weaponORtool.split(" ")
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
        typeOfCrime: typeOfCrimeList,
        weaponORtool: weaponORtoolList,
        details: {
          skinTone: req.body.skinTone,
          height: {
                ft: req.body.heightFt,
                in: req.body.heightIn
              },
          handed: req.body.handed,
          eyeColor: req.body.eyeColor,
          bodyFit: req.body.bodyFit
        },
        bodyMark: {
          bodyPart: req.body.bodyPart,
          mark: req.body.mark
        },
        vehicle: vehicleList
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
  let typeOfCrimeList = req.body.crime.split(" ");
  let vehicleList = req.body.vehicle.split(" ");
  let weaponORtoolList = req.body.weaponORtool.split(" ")
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
      typeOfCrime: typeOfCrimeList,
      commitedDate: req.body.commitedDate,
      caughtORarrestDate: req.body.caughtDate,
      weaponORtool: weaponORtoolList,
      partner: req.body.partnerInCrime,
      details: {
        skinTone: req.body.skinTone,
        height: {
              ft: req.body.heightFt,
              in: req.body.heightIn
            },
        handed: req.body.handed,
        eyeColor: req.body.eyeColor,
        bodyFit: req.body.bodyFit
      },
      bodyMark: {
        bodyPart: req.body.bodyPart,
        mark: req.body.mark
      },
      vehicle: vehicleList
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
  let totalFields = 0, totalMatches=0;
  let suspectID=req.params.sentSuspect;
  let criminalID;
  let result=[];
  let str1,str2;

      Suspect.findOne({_id: req.params.sentSuspect}, function(err, suspect){
      // Criminal.find({_id: {$ne: suspectID}},function(err,criminals){
      Criminal.find(function(err,criminals){
          criminals.forEach(function(criminal){
            criminalID=criminal._id
            totalFields=0;
            totalMatches=0;
              if(suspect.name.fname!==""&&criminal.name.fname!=="")
              {
                console.log("fname activated");
                totalFields=totalFields+1;
                  if(suspect.name.fname===criminal.name.fname)
                  {
                      console.log("fname equal activated");
                      totalMatches=totalMatches+1;
                  }
              }
              if(suspect.name.mname!==""&&criminal.name.mname!=="")
              {
                console.log("mname activated");
                totalFields=totalFields+1;
                  if(suspect.name.mname===criminal.name.mname)
                  {
                    console.log("mname equal activated");
                      totalMatches=totalMatches+1;
                  }
              }
              if(suspect.name.lname!==""&&criminal.name.lname!=="")
              {
                console.log("lname activated");
                totalFields=totalFields+1;
                  if(suspect.name.lname===criminal.name.lname)
                  {
                      console.log("lname equal activated");
                      totalMatches=totalMatches+1;
                  }
              }
              if(suspect.address.saddress!==""&&criminal.address.saddress!=="")
              {
                console.log("before saddress");
                console.log("totalFields : "+totalFields);
                console.log("totalMatches : "+totalMatches);
                console.log("saddress activated");
                let flag=0;
                totalFields=totalFields+1;
                if(suspect.address.saddress===criminal.address.saddress){
                  console.log("saddress equal activated");
                    totalMatches=totalMatches+1;
                }else{
                  str1=suspect.address.saddress.toLowerCase().split(" ");
                  console.log("str1 : "+str1);
                  str2=criminal.address.saddress.toLowerCase().split(" ");
                  console.log("str2 : "+str2);
                  str1.forEach(function(str11){
                      str2.forEach(function(str22){
                        if(str11===str22){
                          console.log("str11 & str22 equal activated for " + str1 +" "+ str2);
                          if(flag===0){
                            totalMatches=totalMatches+0.5;
                            flag=1;
                          }else if(flag===1){
                            console.log("activated with flag 1");
                            totalFields=totalFields+1;
                            totalMatches=totalMatches+1;
                          }
                        }
                      })
                  })
                }
                console.log("after Saddress");
                console.log("totalFields : "+totalFields);
                console.log("totalMatches : "+totalMatches);
              }
              if(suspect.address.city!==""&&criminal.address.city!=="")
              {
                  console.log("city activated");
                  totalFields=totalFields+1;
                  if(suspect.address.city===criminal.address.city)
                  {
                    console.log("city equals");
                    totalMatches=totalMatches+1;
                  }
                  console.log("after city");
                  console.log("totalFields : "+totalFields);
                  console.log("totalMatches : "+totalMatches);
              }
              if(suspect.address.state!==""&&criminal.address.state!=="")
              {
                console.log("state activated");
                  totalFields=totalFields+1;
                  if(suspect.address.state===criminal.address.state)
                  {
                    console.log("State Equals");
                    totalMatches=totalMatches+1;
                  }
                  console.log("after State");
                  console.log("totalFields : "+totalFields);
                  console.log("totalMatches : "+totalMatches);
              }
              if(suspect.nationality!==""&&criminal.nationality!=="")
              {
                console.log("nationality Activated");
                totalFields=totalFields+1;
                if(suspect.nationality===criminal.nationality)
                {
                  console.log("nationality equals");
                  totalMatches=totalMatches+1;
                }
                console.log("after nationality");
                console.log("totalFields : "+totalFields);
                console.log("totalMatches : "+totalMatches);
              }
              if(suspect.typeOfCrime[0]!==""&&criminal.typeOfCrime[0]!=="")
              {
                console.log("Type of Crime Activated");
                  suspect.typeOfCrime.forEach(function(suspectCrime){
                      criminal.typeOfCrime.forEach(function(criminalCrime){
                        totalFields=totalFields+1;
                          if(suspectCrime===criminalCrime){
                            console.log("crime equals");
                            totalMatches=totalMatches+1;
                        }
                      });
                  });
                  console.log("after type of crime");
                  console.log("totalFields : "+totalFields);
                  console.log("totalMatches : "+totalMatches);
              }
              if(suspect.weaponORtool[0]!==""&&criminal.weaponORtool[0]!=="")
              {
                console.log("wOt activated");
                  suspect.weaponORtool.forEach(function(suspectWT){
                      criminal.weaponORtool.forEach(function(criminalWT){
                        totalFields=totalFields+1;
                          if(suspectWT===criminalWT){
                            console.log("wOt equals");
                            totalMatches=totalMatches+1;
                        }
                      });
                  });
                  console.log("after type of wOt");
                  console.log("totalFields : "+totalFields);
                  console.log("totalMatches : "+totalMatches);
              }
              if(suspect.details.skinTone!==""&&criminal.details.skinTone!=="")
              {
                console.log("skinTone activated");
                totalFields=totalFields+1;
                  if(suspect.details.skinTone===criminal.details.skinTone)
                  {
                    console.log("skinTone equals");
                      totalMatches=totalMatches+1;
                  }
                  console.log("after type of SkinTone");
                  console.log("totalFields : "+totalFields);
                  console.log("totalMatches : "+totalMatches);
              }
              if(suspect.details.height.ft!==""&&criminal.details.ft!=="")
              {
                console.log("height activated");
                totalFields=totalFields+1;
                let criminalHeightInNumbers = (criminal.details.height.ft*12)+criminal.details.height.in;
                let suspectHeightInNumbers= (suspect.details.height.ft*12)+suspect.details.height.in;;
                console.log(criminalHeightInNumbers+" "+suspectHeightInNumbers);
                let upperLimit=criminalHeightInNumbers+2, lowerLimit=criminalHeightInNumbers-2;
                  if(suspectHeightInNumbers>=lowerLimit&&suspectHeightInNumbers<=upperLimit){
                    console.log("height equals");
                      totalMatches=totalMatches+0.5;
                  }
                  console.log("after type of height");
                  console.log("totalFields : "+totalFields);
                  console.log("totalMatches : "+totalMatches);
              }
              if(suspect.details.eyeColor!==""&&criminal.details.eyeColor!=="")
              {
                totalFields=totalFields+1;
                  if(suspect.details.eyeColor===criminal.details.eyeColor)
                  {
                    console.log("Eye Color Equals");
                      totalMatches=totalMatches+1;
                  }
                  console.log("after type of eyeColor");
                  console.log("totalFields : "+totalFields);
                  console.log("totalMatches : "+totalMatches);
              }
              if(suspect.details.handed!==""&&criminal.details.handed!=="")
              {
                totalFields=totalFields+1;
                  if(suspect.details.handed===criminal.details.handed)
                  {
                    console.log("hand equals");
                      totalMatches=totalMatches+1;
                  }
                  console.log("after type of Handed");
                  console.log("totalFields : "+totalFields);
                  console.log("totalMatches : "+totalMatches);
              }
              if(suspect.bodyMark.bodyPart!==""&&criminal.bodyMark.bodyPart!=="")
              {
                console.log("body part activated");
                totalFields=totalFields+1;
                if(suspect.bodyMark.bodyPart===criminal.bodyMark.bodyPart){
                  console.log("body part equals");
                    totalMatches=totalMatches+1;
                }
                console.log("after type of body part");
                console.log("totalFields : "+totalFields);
                console.log("totalMatches : "+totalMatches);
              }
              if(suspect.bodyMark.mark!==""&&criminal.bodyMark.mark!=="")
              {
                totalFields=totalFields+1;
                if(suspect.bodyMark.mark===criminal.bodyMark.mark){
                    totalMatches=totalMatches+1;
                }
              }
              if(suspect.vehicle[0]!==""&&criminal.vehicle[0]!=="")
              {
                console.log("Vehicle Activated");
                console.log("suspect vehicle : "+suspect.vehicle[0]);
                console.log("Criminal Vehicle : "+criminal.vehicle[0]);
                  suspect.vehicle.forEach(function(suspectVehicle){
                    totalFields=totalFields+1;
                      criminal.vehicle.forEach(function(criminalVehicle){
                        if(suspectVehicle===criminalVehicle){
                          totalMatches=totalMatches+1;
                        }
                      })
                  })
                  console.log("after type of Vehicle");
                  console.log("totalFields : "+totalFields);
                  console.log("totalMatches : "+totalMatches);
              }
            let percent = ((totalMatches/totalFields)*100);
            result = [...result, {id: criminalID, matchScore: percent}];
            console.log("Total Comparisons of Not Null fields : " + totalFields);
            console.log("Total Match Found : " + totalMatches);
            console.log("Percent : " + percent+"%");
          });
  });
});
// res.render("matchResult", {matchResult:result});
});

app.listen(3000, function(err){
  if(!err){
    console.log("Server Started on Port 3000");
  }
});
