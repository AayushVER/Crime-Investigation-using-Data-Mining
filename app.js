const express = require('express');
const mongoose = require('mongoose');

const app = express();

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

const Criminal = mongoose.model("criminal", criminalSchema);

app.get("/",function(req,res){
  let totalFieds = 0, totalMatches=0;

      Criminal.findOne({_id: "5eb6af0dc9387bccf45257ea"}, function(err, suspect){
        Criminal.find(function(err,criminals){
        if(suspect.name.fname!==null||criminals[1].name.fname!==null)
        {
          totalFieds=totalFieds+1;
            if(suspect.name.fname===criminals[1].name.fname)
            {
                totalMatches=totalMatches+1;
            }
        }
        if(suspect.name.mname!==null||criminals[1].name.mname!==null)
        {
          totalFieds=totalFieds+1;
            if(suspect.name.mname===criminals[1].name.mname)
            {
                totalMatches=totalMatches+1;
            }
        }
        if(suspect.name.lname!==null||criminals[1].name.lname!==null)
        {
          totalFieds=totalFieds+1;
            if(suspect.name.lname===criminals[1].name.lname)
            {
                totalMatches=totalMatches+1;
            }
        }
        if(suspect.details.skinTone!==null||criminals[1].details.skinTone!==null)
        {
          totalFieds=totalFieds+1;
            if(suspect.details.skinTone===criminals[1].details.skinTone)
            {
                totalMatches=totalMatches+1;
            }
        }
        if(suspect.details.eyeColor!==null||criminals[1].details.eyeColor!==null)
        {
          totalFieds=totalFieds+1;
            if(suspect.details.eyeColor===criminals[1].details.eyeColor)
            {
                totalMatches=totalMatches+1;
            }
        }
        if(suspect.details.handed!==null||criminals[1].details.handed!==null)
        {
          totalFieds=totalFieds+1;
            if(suspect.details.handed===criminals[1].details.handed)
            {
                totalMatches=totalMatches+1;
            }
        }
        if(suspect.vehicle[0]!==null||criminals[1].vehicle[0]!==null)
        {
            suspect.vehicle.forEach(function(veh){
              totalFieds=totalFieds+1;
                criminals[1].vehicle.forEach(function(vehi){
                  if(veh===vehi){
                    totalMatches=totalMatches+1;
                  }
                })
            })
            // if(suspect.vehicle[0]===criminals[1].vehicle[0])
            // {
            //     totalMatches=totalMatches+1;
            // }
        }
        if(suspect.nationality!==null||criminals[1].nationality!==null)
        {
          totalFieds=totalFieds+1;
            if(suspect.nationality===criminals[1].nationality)
            {
                totalMatches=totalMatches+1;
            }
        }
      let percent = ((totalMatches/totalFieds)*100);
      console.log("Total Comparisons of Not Null fields : " + totalFieds);
      console.log("Total Match Found : " + totalMatches);
      console.log("Percent : " + percent+"%");
  });
});
});

app.listen(3000, function(err){
  if(!err){
    console.log("Server Started on Port 3000");
  }
})
