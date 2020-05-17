const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require("body-parser");
const md5 = require("md5");

const app = express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

let isLoggedIn = false;
let result=[];
let retainedSearch;
let retainedCaseId;
let retainedCrimes=[];
let retainedCharges=[];
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
  caseId: [],
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
  caughtORarrestDate: [
    {
      forCase: String,
      caughtDate: Date
    }
  ],
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
  fname: String,
  lname: String,
  username : String,
  password: String,
  type: String,
  documentType: String,
  documentId: String
};

const rejectedSchema = {
  username: String,
  comment: String
}

const Case = mongoose.model("case", caseSchema);
const Suspect = mongoose.model("suspect", suspectSchema);
const Criminal = mongoose.model("criminal", criminalSchema);
const User = mongoose.model("user", userSchema);
const JoinRequest = mongoose.model("joinRequest",userSchema);
const Admin = mongoose.model("admin",userSchema);
const Police = mongoose.model("police",userSchema);
const Public = mongoose.model("public",userSchema);
const RejectList = mongoose.model("reject",rejectedSchema);


app.get("/",function(req,res){
    res.render("home", {successMessage: ""});
});

app.get("/login",function(req,res){
    res.render("login", {message: ""});
});

app.get("/newUser",function(req,res){
    res.render("registrationForm", {message: ""});
});

app.post("/addUser",function(req,res){
  let password = md5(req.body.password)
  const newUserRequest = new JoinRequest({
    fname: req.body.fname,
    lname: req.body.lname,
    username : req.body.email,
    documentType: req.body.documentType,
    documentId: req.body.documentId,
    password: password,
    type: req.body.searchOption
  });
    newUserRequest.save(function(err){
      if(!err){
        res.render("home", {successMessage:"Request submitted Succesfully. Once your request is approved, you will be able to Login with registered credentials."})
      }else{
        res.send(err);
      }
    });
});

app.post("/acceptRequest/:userId", function(req,res){
  if(isLoggedIn){
    let userId = req.params.userId;
      JoinRequest.findOne({_id:userId}, function(err,user){
        JoinRequest.deleteOne({_id:userId}, function(err){
          if(err){
            console.log(err);
          }
        });
        if(user.type==="Admin"){
              const newUser = new Admin({
                _id:userId,
                fname: user.fname,
                lname: user.lname,
                username : user.username,
                documentType: user.documentType,
                documentId: user.documentId,
                password: user.password,
                type: user.searchOption
              });
              newUser.save(function(err){
                  if(!err){
                    JoinRequest.deleteOne({})
                    res.redirect("/pendingUsers");
                  }
          });
      }
          else if(user.type==="Police"){
            const newUser = new Police({
          _id:userId,
          fname: user.fname,
          lname: user.lname,
          username : user.username,
          documentType: user.documentType,
          documentId: user.documentId,
          password: user.password,
          type: user.searchOption
          });
        newUser.save(function(err){
            if(!err){
              JoinRequest.deleteOne({})
              res.redirect("/pendingUsers");
            }
          });
  }
    else if(user.type==="Public"){
    const newUser = new Public({
      _id:userId,
      fname: user.fname,
      lname: user.lname,
      username : user.username,
      documentType: user.documentType,
      documentId: user.documentId,
      password: user.password,
      type: user.searchOption
    });
    newUser.save(function(err){
        if(!err){
          JoinRequest.deleteOne({})
          res.redirect("/pendingUsers");
        }
      });
    }
  })
}else{
    res.render("login", {message: "*Please Login"});
  }
});

app.post("/rejectRequest/:userId",function(req,res){
    if(isLoggedIn){
      let userId = req.params.userId;
        JoinRequest.findOne({_id:userId}, function(err,user){

          JoinRequest.deleteOne({_id:userId}, function(err){
            if(err){
              console.log(err);
            }
          })
        })
      }
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

app.get("/pendingUsers",function(req,res){
    if(isLoggedIn){
      JoinRequest.find(function(err, allRequests){
        if(allRequests.length===0){
          res.render("requestList",{requests:"",failure:"No pending request"});
        }else{
        res.render("requestList",{requests:allRequests,failure:""});
      }
      })
    } else{
      res.render("login",{message: "*Please Login"});
    }
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
      retainedCaseId = caseId;
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
                  res.render("postNewCase", {newCaseMessage: "Case registered successfully!",failure:"",profiles:"",cid:caseId});
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

app.get("/updateCriminalRecord/:criminalId", function(req,res){
    res.render("updateCriminalForm", {criminalId: req.params.criminalId, cid: retainedCaseId});
});


app.post("/updateCriminalForm/:criminalId", function(req,res){
      let thisCaseId = req.body.idCase;
      let crimeList = req.body.crime.split(",");
      let chargesList = req.body.charges.split(",");
      let date = {
        forCase: thisCaseId,
        caughtDate: req.body.anotherCaughtDate
      };
      let weaponOrToolList = req.body.weaponORtool.split(",");
      let partnersList = req.body.partnerInCrime.split(",");
      let vehicleList = req.body.vehicle.split(",");

      Criminal.updateOne(
            {_id:req.params.criminalId},
            {$push: {
              caseId:thisCaseId,
              typeOfCrime:crimeList,
              charges:chargesList,
              caughtORarrestDate: {forCase:thisCaseId,caughtDate:date.caughtDate},
              weaponORtool:weaponOrToolList,
              partners:partnersList,
              vehicle: vehicleList
            }
            },function(err){
              if(err){
                console.log(err);
              }else{
                res.redirect("/dashboard");
              }
            }
          );
});

app.get("/newCriminalForm/:caseId", function(req,res){
  res.render("newCriminalForm", {cid:req.params.caseId});
});

app.post("/postNewCase", function(req,res){
  let firstName = req.body.fname, middleName = req.body.mname, lastName = req.body.lname;
  if(middleName===""&&lastName!==""){

      Criminal.find({'name.fname':firstName,'name.lname':lastName},function(err,criminals){
          if(criminals.length===0){
              res.render("postNewCase", {profiles:criminals, failure:"No record found for "+firstName+" "+middleName+" "+lastName,newCaseMessage:"",cid:retainedCaseId});
          }else{
              res.render("postNewCase", {profiles:criminals, failure:"", newCaseMessage:"",cid:retainedCaseId});
        }
  })} else if(middleName===""&&lastName===""){
    Criminal.find({"name.fname":firstName},function(err,criminals){
        if(criminals.length===0||err){
              res.render("postNewCase", {profiles:criminals, failure:"No record found for "+firstName+" "+middleName+" "+lastName,newCaseMessage:"",cid:retainedCaseId});
        }else{
            res.render("postNewCase", {profiles:criminals, failure:"", newCaseMessage:"",cid:retainedCaseId});
      }
      })
    }
});


app.get("/cases", function(req,res){
  if(isLoggedIn){
      Case.find(function(err,cases){
        if(!cases||err){
          res.render("dashboard", {dashboardMessage:"",failureDashboardMessage:"No record found!"});
        }else{
          retainedSearch=cases;
          res.render("caseList", {cases:cases, failure:""});
        }
      })
  }
  else{
    res.render("login",{message: "*Please Login"});
  }
});

app.post("/cases", function(req,res){
    let typeOfOption = req.body.searchOption;
      if(typeOfOption==="caseId"){
        Case.findOne({_id:req.body.searchValue},function(err,cases){
          if(!cases||err){
            res.render("caseList", {cases:retainedSearch,failure:"No record found for ID "+req.body.searchValue});
          }else{
            res.render("caseList", {cases:cases, failure:""});
          }
        })
      } else if(typeOfOption==="caseTitle"){
        Case.findOne({subjectOrTitle:req.body.searchValue},function(err,cases){
          if(!cases||err){
            res.render("caseList", {cases:retainedSearch,failure:"No record found for tittle "+req.body.searchValue});
          }else{
            res.render("caseList", {cases:cases, failure:""});
          }
        })
      }
      else if(!typeOfOption){
        res.redirect("/dashboard");
      }
});

app.post("/criminals", function(req,res){
  let firstName = req.body.fname, middleName = req.body.mname, lastName = req.body.lname;
  if(middleName===""&&lastName!==""){
      Criminal.find({'name.fname':firstName,'name.lname':lastName},function(err,criminals){
        console.log("After Search : "+criminals);
          if(!criminals||err){
                res.render("profileList", {pageHeading:"Criminals",profiles:criminals, failure:"No record found for "+firstName+" "+middleName+" "+lastName});
          }else{
            console.log(criminals);
              res.render("profileList", {pageHeading:"Criminals",profiles:criminals, failure:""});
        }
  })} else if(middleName===""&&lastName===""){
    Criminal.find({"name.fname":firstName},function(err,criminals){
        if(criminals.length===0||err){
              res.render("profileList", {pageHeading:"Criminals",profiles:criminals, failure:"No record found for "+firstName+" "+middleName+" "+lastName});
        }else{
          console.log(criminals);
            res.render("profileList", {pageHeading:"Criminals",profiles:criminals, failure:""});
      }
      })
    }
});

app.post("/findCaseByFilter", function(req,res){
    let key = req.body.searchOption;
    if(!key){
        res.render("profileList", {pageHeading:"Criminals",profiles:retainedSearch, failure:"Please select an option first"});
    }else{
      let value = req.body.searchValue;
      console.log(key +" "+value);
      Criminal.find({[key]:value},function(err,criminals){
      if(criminals.length===0||err){
            res.render("profileList", {pageHeading:"Criminals",profiles:criminals, failure:"No record found for "+value});
          }else{
          res.render("profileList", {pageHeading:"Criminals",profiles:criminals, failure:""});
    }
    });
    }
});

app.get("/criminals", function(req,res){
  retainedSearch=[];
  if(isLoggedIn){
      Criminal.find(function(err,criminals){
        if(!criminals||err){
          res.render("dashboard", {dashboardMessage:"",failureDashboardMessage:"No record found!"});
        }else{
          retainedSearch=criminals;
          res.render("profileList", {pageHeading:"Criminals",profiles:criminals,failure:""});
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

////////////////////////////////////////////////////////////////////////////////
app.get("/addCriminal/:caseId", function(req,res){
    if(isLoggedIn){
        retainedCaseId = req.params.caseId;
        res.render("postNewCase", {newCaseMessage: "",failure:"",profiles:"",cid:retainedCaseId});
    }else{
      res.render("login",{message: "*Please Login"});
    }
});
////////////////////////////////////////////////////////////////////////////////

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
      caughtORarrestDate: [
        {
          forCase: req.body.idCase,
          caughtDate: req.body.caughtDate
        }
      ],
      // caughtORarrestDate: req.body.caughtDate,
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


app.get("/suspects", function(req,res){
  if(isLoggedIn){
      Suspect.find(function(err,suspects){
        if(!suspects||err){
          res.render("dashboard", {dashboardMessage:"",failureDashboardMessage:"No record found!"});
        }else{
          res.render("profileList", {pageHeading:"Suspects",profiles:suspects,failure:""});
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
          res.render("profileList", {pageHeading:"Suspects",profiles:suspects, failure:""} );
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
          res.render("profileList", {pageHeading:"Criminals",profiles:criminals,failure:""} );
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
    result = [];
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
