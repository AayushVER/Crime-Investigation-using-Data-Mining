const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require("body-parser");
const md5 = require("md5");

const app = express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

let isLoggedIn = true;
let result=[];
// let currentUserId;

mongoose.connect("mongodb://localhost:27017/ciudm", {useNewUrlParser:true, useUnifiedTopology:true});

const caseSchema = {
  _id: String,
  subjectOrTitle: String,
  description:  String,
  victims: [],
  weaponORtool: [],
  time: String,
  crimeCommitedOn: Date,
  location: {
    saddress: String,
    city: String,
    state:String
  },
  witness: []
};

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
  charges:[],
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
  charges:[],
  caughtORarrestDate: Date,
  weaponORtool: [],
  partners: [],
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
};

const Case = mongoose.model("case", caseSchema);
const Suspect = mongoose.model("suspect", suspectSchema);
const Criminal = mongoose.model("criminal", criminalSchema);
const User = mongoose.model("user", userSchema);


app.get("/",function(req,res){
    res.render("login", {message: ""});
});

app.get("/login",function(req,res){
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
          res.render("dashboard", {dashboardMessage: "", failureDashboardMessage:""});
        }else{
          res.render("login", {message: "*Invalid Credentials. Please try again."});
        }
      }else{
        res.render("login", {message: "*Invalid Credentials. Please try again."});
      }
    });

});

app.get("/dashboard",function(req,res){
  if(isLoggedIn){
    res.render("dashboard", {dashboardMessage: "", failureDashboardMessage:""})
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
      let victimsList = req.body.victims.split(",");
      let weaponORtoolList = req.body.weaponORtool.split(",");
      let witnessList = req.body.witness.split(",");

        const newCase = new Case({
          _id: req.body.caseId,
          subjectOrTitle: req.body.caseSubjectOrTitle,
          description: req.body.caseDescription,
          victims: victimsList,
          weaponORtool:weaponORtoolList,
          time: req.body.time,
          crimeCommitedOn: req.body.crimeCommitedOn,
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
                    res.render("dashboard", {dashboardMessage: "Case registered successfully!",failureDashboardMessage:""} );
                }
            }else{
              res.render("dashboard", {dashboardMessage: "Case registered successfully!",failureDashboardMessage:""});
            }
          }
        })
    }else{
      res.render("login",{message: "*Please Login"});
    }
});

app.get("/cases", function(req,res){
  if(isLoggedIn){
      Case.find(function(err,cases){
        if(!cases||err){
          res.render("dashboard", {dashboardMessage:"",failureDashboardMessage:"No record found!"});
        }else{
          res.render("caseList", {cases:cases});
        }
      })
  }
  else{
    res.render("login",{message: "*Please Login"});
  }
});

app.get("/findcase/:caseId", function(req,res){
    Case.findOne({_id:req.params.caseId}, function(err,foundCase){
      if(!err){
          res.render("viewCase", {caseDetails: foundCase, failure:""});
      }else{
        res.render("dashboard", {dashboardMessage: "",failureDashboardMessage:"Something went wrong. Try again later."});
      }
    })
});

app.get("/Criminals/:criminalId", function(req,res){
  Criminal.findOne({_id:req.params.criminalId}, function(err,criminal){
    if(!err){
      res.render("profileView", {profileDetails: criminal,pageHeading:"Criminal Record",failure:""});
    }else{
      res.render("dashboard", {dashboardMessage: "",failureDashboardMessage:"Something went wrong. Try again later."});
    }
  })
});

app.get("/Suspects/:suspectId", function(req,res){
    Suspect.findOne({_id:req.params.suspectId}, function(err,suspect){
      if(!err){
          res.render("profileView", {profileDetails: suspect,pageHeading:"Suspect Record",failure:""});
      }else{
        res.render("dashboard", {dashboardMessage: "",failureDashboardMessage:"Something went wrong. Try again later."});
      }
    })
});

app.get("/addSuspect/:caseId",function(req,res){
    if(isLoggedIn){
      let caseId = req.params.caseId;
      res.render("newSuspectForm", {cid:caseId,newCaseMessage: ""});
    }else{
      res.render("login",{message: "*Please Login"});
    }
});


app.post("/newSuspectForm", function(req,res){
    let typeOfCrimeList = req.body.crime.split(",");
    let vehicleList = req.body.vehicle.split(",");
    let weaponORtoolList = req.body.weaponORtool.split(",");
    let chargesList = req.body.charges.split(",");
      const newSuspect= new Suspect({
        caseId: req.body.idCase,
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
        charges: chargesList,
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

      newSuspect.save(function(err, thisSuspect){
        if(!err){
          // res.redirect("/match/"+thisSuspect._id)
          res.render("dashboard", {dashboardMessage: "Suspect added succesfully!",failureDashboardMessage:""});
        }else{
          res.send(err);
        }
      });

});

app.get("/addCriminal/:caseId", function(req,res){
    if(isLoggedIn){
      let caseId = req.params.caseId;
      res.render("newCriminalForm", {cid:caseId,newCaseMessage: ""});
    }else{
      res.render("login",{message: "*Please Login"});
    }
});

app.post("/newCriminalForm", function(req,res){
  let typeOfCrimeList = req.body.crime.split(",");
  let vehicleList = req.body.vehicle.split(",");
  let weaponORtoolList = req.body.weaponORtool.split(",");
  let chargesList = req.body.charges.split(",");
  let partnerList = req.body.partnerInCrime.split(",");
    const newCriminal = new Criminal({
      caseId: req.body.idCase,
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
      caughtORarrestDate: req.body.caughtDate,
      weaponORtool: weaponORtoolList,
      charges: chargesList,
      partners: req.body.partnerList,
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
        res.render("dashboard", {dashboardMessage: "Criminal added succesfully!",failureDashboardMessage:""});
      }else{
        console.log(err);
        res.render("dashboard", {dashboardMessage: "",failureDashboardMessage:"Operation Failed."});
      }
    });
});

app.get("/criminals", function(req,res){
  if(isLoggedIn){
      Criminal.find(function(err,criminals){
        if(!criminals||err){
          res.render("dashboard", {dashboardMessage:"",failureDashboardMessage:"No record found!"});
        }else{
          res.render("profileList", {pageHeading:"Criminals",profiles:criminals});
        }
      })
  }
  else{
    res.render("login",{message: "*Please Login"});
  }
});

app.get("/suspects", function(req,res){
  if(isLoggedIn){
      Suspect.find(function(err,suspects){
        if(!suspects||err){
          res.render("dashboard", {dashboardMessage:"",failureDashboardMessage:"No record found!"});
        }else{
          res.render("profileList", {pageHeading:"Suspects",profiles:suspects});
        }
      })
  }
  else{
    res.render("login",{message: "*Please Login"});
  }
});


app.get("/suspectsOfCase/:caseId", function(req,res){
  if(isLoggedIn){
      Suspect.find({caseId: req.params.caseId},function(err,suspects){
        if(suspects.length===0){
          Case.findOne({_id:req.params.caseId}, function(err,foundCase){
              if(!err){
                res.render("viewCase", {caseDetails: foundCase, failure: "No suspects in the record. (If any, add them)"});
        }
      })
      }
      else{
          res.render("profileList", {pageHeading:"Suspects",profiles:suspects} );
        }
      });
    }else{
    res.render("login",{message: "*Please Login"});
};
});

app.get("/criminalsOfCase/:caseId", function(req,res){
  if(isLoggedIn){
      Criminal.find({caseId: req.params.caseId},function(err,criminals){
        if(criminals.length===0){
          Case.findOne({_id:req.params.caseId}, function(err,foundCase){
              if(!err){
                res.render("viewCase", {caseDetails: foundCase, failure: "No criminals in the record. (If any, add them)"});
        }
      })
  }
      else{
          res.render("profileList", {pageHeading:"Criminals",profiles:criminals} );
        }
      });
    }else{
    res.render("login",{message: "*Please Login"});
};
});

app.get("/operation", function(req, res){
  if(isLoggedIn){
    res.send("You can perform task")
  }else{
    // res.render("login",{message: "*Please Login"});
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
  if(isLoggedIn){
    let totalFields = 0, totalMatches=0;
    let suspectID=req.params.sentSuspect;
    let criminalID;
    let finalResult=[];
    let str1,str2;

        Suspect.findOne({_id: req.params.sentSuspect}, function(err,suspect){
          Criminal.find(function(err,criminals){
          if(criminals.length!==0){
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
                  console.log("eye color activated");
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
                  console.log("Hand activated");
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
                  console.log("body mark activated");
                  totalFields=totalFields+1;
                  if(suspect.bodyMark.mark===criminal.bodyMark.mark){
                    console.log("body mark equals");
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
              let percent = ((totalMatches/totalFields)*100).toFixed(2);
              let sendBodyMark = criminal.bodyMark.bodyPart+" "+criminal.bodyMark.mark;
              console.log(percent);

              let arrObj = {id: criminalID,firstName:criminal.name.fname,lastName:criminal.name.lname,crimes:criminal.typeOfCrime,bodyMark:sendBodyMark,shortAddress:criminal.address.saddress,  matchScore: percent}
              result.push(arrObj);
              // result = [...result, {id: criminalID,firstName:criminal.name.fname,lastName:criminal.name.lname,bodyMark:sendBodyMark,  matchScore: percent}];
              console.log("Total Comparisons of Not Null fields : " + totalFields);
              console.log("Total Match Found : " + totalMatches);
              console.log("Percent : " + percent+"%");

              //For Each loop ends here
            })
            function sort_result(a, b){
              if(a.matchScore < b.matchScore){
                      return 1;
              }else if(a.matchScore > b.matchScore){
                      return -1;
              }else{
                      return 0;
              }
            }

            finalResult = result.sort(sort_result);
            res.render("matchResult", {matchResultArray:finalResult});

            //Criminal Loop Ends Here
        } else{
          res.render("profileView", {profileDetails: suspect,pageHeading:"Suspect Record",failure:"No Criminal record to match with"});
        }
        })

        })
  }else{
    res.render("login",{message: "*Please Login"});
  }
});

app.listen(3000, function(err){
  if(!err){
    console.log("Server Started on Port 3000");
  }
});
