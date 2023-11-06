let express=require('express');
let bodyParser=require('body-parser');
let ejs = require("ejs");
const mongoose=require('mongoose');

let {Web3} = require('web3');

const organContract=require("./build/contracts/OrganDonation.json")
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
const contractAddress = '0x15D300649b505Fced6f9D1776543B24f32eC7e58'; //keep updating the CONTRACT address as soon as you deploy
const contractAbi = organContract.abi;
const contractInstance = new web3.eth.Contract(contractAbi, contractAddress);

const senderAddress = '0xEA6Cc325e6dCBF99AA4b1c82ba1F729dF914AA0C'; //Also don't forget to have a look at the SENDER address which is one of those accounts on Ganache GUI
const privateKey = process.env.PVT_KEY; 


let app=express();
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))

mongoose.set("strictQuery", false);
mongoose.connect('mongodb://127.0.0.1:27017/organDB');

let currUsers=[];
let foundDonor1;
let foundRecipient1;


const hospitaluserSchema={
  email:String,
  password:String
}
const userSchema = {
  name:String,
  email:{
    type: String,
   required:[true, ""],
   unique:true
   },
  createpwd:String,
  confirmpwd:String,
  aadhaar:Number,
  phone:Number,
  dob:Date,
  imgURL:String,
  addr1:String,
  addr2:String,
  city:String,
  state:String,
  country:String,
  pincode:Number,
  hospital:String,
  hospaddr:String,
  hospphno:String,
  bloodgrp:String,
  history_father:String,
  history_mother:String,
  history_sibling:String,
  hosprep:String,
  donate:[String],
  donatedeath:[String],
  misc:[String],
  donorno:Number
};

const donorSchema = {
  name:String,
  age:Number,
  dod:Date,
  deceased:String,
  cause:String,
  pincode:Number,
  donorno:Number,
  hospital:String,
  hospaddr:String,
  hospphno:String,
  bloodgrp:String,
  history_father:String,
  history_mother:String,
  history_sibling:String,
  tissuetype:String,
  diseases:String,
  heirname:String,
  heirphno:Number,
  donatedeath:[String],
  donate:[String],
  details:String,
  storage:String
};

const recipientSchema = {
  name:String,
  aadhaar:Number,
  phone:Number,
  dob:Date,
  pincode:Number,
  hospital:String,
  hospaddr:String,
  hospphno:String,
  bloodgrp:String,
  history:String,
  diagnosed:Date,
  receive:[String],
  urgency:String
};

const User = mongoose.model("User", userSchema);
const HospitalUser = mongoose.model("HospitalUser", hospitaluserSchema);
const Donor = mongoose.model("Donor", donorSchema);
const Recipient = mongoose.model("Recipient", recipientSchema);



const user1=new HospitalUser({
  email: "admin@kghospital.com",
  password:"password12345!"
})

const user2=new HospitalUser({
  email: "admin@raohospital.com",
  password:"password12345!"
})


app.get("/",function(req,res){
    res.render("index");

  });

  app.get("/register",function(req,res){
  

      res.render("register");

  });

  app.get("/login",function(req,res){
    res.render("login");

  });

  app.get("/login_hospital",function(req,res){
    res.render("login_hospital");

  });


function makeArray(value) {
  if (Array.isArray(value)) {
      return value;
  } else if (value) {
      return [value];
  } else {
      return [];
  }
}
  app.post("/register", async function(req, res) {
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        createpwd: req.body.createpwd,
        confirmpwd: req.body.confirmpwd,
        aadhaar: req.body.aadhaar,
        phone: req.body.phone,
        dob: req.body.dob,
        imgURL: req.body.imgURL,
        addr1: req.body.addr1,
        addr2: req.body.addr2,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pincode,
        hospital: req.body.hospital,
        hospaddr: req.body.hospaddr,
        hospphno: req.body.hospphno,
        hosprep: req.body.hosprep,
        bloodgrp: req.body.bloodgrp,
        history_father: req.body.history_father,
        history_mother: req.body.history_mother,
        history_sibling: req.body.history_sibling,
        donate: makeArray(req.body.donate),
        donatedeath: makeArray(req.body.donatedeath),
        misc: req.body.misc,
        donorno: parseInt(Math.random() * 1000000000)
    });
    
    let donate=newUser.donate;
    let donatedeath=newUser.donatedeath;
    await contractInstance.methods.registerUser(req.body.name,req.body.aadhaar,donate,donatedeath)
                .send({
                    from: senderAddress,
                    gas: 6721975
                }, function(error) {
                    if (!error) {
                        console.log("Done");
                    } else {
                        res.redirect("/register");
                    }
                });
    
    User.find({
        aadhaar: req.body.aadhaar
    }).then(function(foundItems) {

        if (foundItems.length === 0) {
            currUsers.push(newUser);
            newUser.save();
            res.redirect("/donor");

        } else
            res.redirect("/register");
    })
});


  app.get("/donor",function(req,res){
    res.render("donor",{currUser1:currUsers[currUsers.length-1]});

  });

//   app.get("/editprofile",function(req,res){
//     res.render("editprofile",{currUser1:currUsers[currUsers.length-1]});

//   });

//   app.post("/login_hospital",function(req,res){
//     HospitalUser.find({
//       email: req.body.email,
//       password: req.body.password
//     }).then(function(foundItems){
//       if(!(foundItems)){
//         res.redirect("/login_hospital")
//       }
//       else{
//         res.redirect("/dashboard");
//       }
//     })


//   });
  
//   app.post("/login",function(req,res){
    
//     User.findOne({email: req.body.email,createpwd: req.body.password}).then(function(foundItems){
//       if(!(foundItems)){
//       res.redirect("/login");
//       }
//         else{console.log(foundItems);
//       currUsers.push(foundItems);
//       res.redirect("/donor")
//         }
//     })
//   });

//   app.get("/dashboard",function(req,res){
//     res.render("dashboard");

//   });

//   app.get("/donor_register",function(req,res){
//     res.render("donor_register");

//   });

//   app.get("/recipient_register",function(req,res){
//     res.render("recipient_register");

//   });

//   app.post("/donor_register",function(req,res){
//     //the donor should have already registered
//     User.find({donorno:req.body.donorno,name:req.body.name}).then(function(foundItems){
//       if(foundItems.length!=0){
//         const newUser=new Donor({
//           name:req.body.name,
//           age:req.body.age,
//           deceased:req.body.deceased,
//           dod:req.body.dod,
//           cause:req.body.cause,
//           pincode:req.body.pincode,
//           donorno:req.body.donorno,
//           hospital:req.body.hospital,
//             hospaddr:req.body.hospaddr,
//             hospphno:req.body.hospphno,
//             bloodgrp:req.body.bloodgrp,
//             history_father:req.body.history_father,
//             history_mother:req.body.history_mother,
//             history_sibling:req.body.history_sibling,
//             tissuetype:req.body.tissuetype,
//             diseases:req.body.diseases,
//             heirname:req.body.heirname,
//             heirphno:req.body.heirphno,
//             donatedeath:req.body.donatedeath,
//             donate:req.body.donate,
//             details:req.body.details,
//             storage:req.body.storage      
//          });
      
//          //to avoid duplication
//          Donor.find({donorno:req.body.donorno}).then(function(foundUsers){
//           if(foundUsers.length===0){
//             console.log(newUser);
//             newUser.save();
//             res.redirect("/dashboard");
//           }
//           else{
//             res.redirect("/donor_register")
//           }
      
//          })

//       }
//       else
//       {
//         res.redirect("/donor_register")
//       }
//     })
   

//   });

//   app.post("/recipient_register",function(req,res){
//     User.find({aadhaar:req.body.aadhaar,name:req.body.name}).then(function(foundItems){
//       if(foundItems.length!=0){
//         const newUser=new Recipient({
//           name:req.body.name,
//           dob:req.body.dob,
//           aadhaar:req.body.aadhaar,
//           pincode:req.body.pincode,
//           phone:req.body.phone,
//           hospital:req.body.hospital,
//             hospaddr:req.body.hospaddr,
//             hospphno:req.body.hospphno,
//             bloodgrp:req.body.bloodgrp,
//             history:req.body.history,
//             diagnosed:req.body.diagnosed,
//             receive:req.body.receive,
//             urgency:req.body.urgency
      
//          });
      
//          Recipient.find({aadhaar:req.body.aadhaar}).then(function(foundUsers){
//           if(foundUsers.length===0){
//             console.log(newUser);
//             newUser.save();
//             res.redirect("/dashboard");
//           }
//           else{
//            res.redirect("/recipient_register")
//           }
      
//          })


//       }
//       else{
//         res.redirect("/recipient_register")
//       }
//     })
//    });

//    app.post("/editprofile",function(req,res){
//     const editedUser={
//       name:req.body.name,
//       email:req.body.email,
//       aadhaar:req.body.aadhaar,
//       phone:req.body.phone,
//       dob:req.body.dob,
//       imgURL:req.body.imgURL,
//       addr1:req.body.addr1,
//       addr2:req.body.addr2,
//       city:req.body.city,
//       state:req.body.state,
//       country:req.body.country,
//       pincode:req.body.pincode,
//       hospital:req.body.hospital,
//       hospaddr:req.body.hospaddr,
//       hospphno:req.body.hospphno,
//       bloodgrp:req.body.bloodgrp,
//       history:req.body.history,
//       donate:req.body.donate,
//       misc:req.body.misc,
//       hosprep:req.body.hosprep,
//       history_father:req.body.history_father,
//       history_mother:req.body.history_mother,
//       history_sibling:req.body.history_sibling,
//       donatedeath:req.body.donatedeath,
//     };
//     User.findOne({aadhaar:req.body.submit}).then(function(foundUsers){
//       if(foundUsers.length!=0){
//         User.updateOne({aadhaar:req.body.submit},editedUser).then(function(){
//             User.findOne({aadhaar:req.body.aadhaar}).then(function(foundUser){
//               console.log(foundUser);
//               currUsers.push(foundUser);
//               res.redirect("/donor");
//             })
//         }) 
//       }
//     })
//   });


//   app.get("/view_donor",function(req,res){
//     Donor.find().then(function(donors){
//       res.render("viewdonor",{donors1:donors})
//     })
//   })

//   app.post("/view_donor",function(req,res){
//     Donor.find({donorno:req.body.donors}).then(function(foundDonor){
//       foundDonor1=foundDonor;
//       res.redirect("/edit_donor")
//     })
//   })

//   app.get("/edit_donor",function(req,res){
//     // console.log(foundDonor1);
    
//       res.render("editdonor",{donor1:foundDonor1[0]})
//   })


//   app.post("/edit_donor",function(req,res){
//     const editedDonor={
//       name:req.body.name,
//           age:req.body.age,
//           dod:req.body.dod,
//           deceased:req.body.deceased,
//           cause:req.body.cause,
//           pincode:req.body.pincode,
//           donorno:req.body.donorno,
//           hospital:req.body.hospital,
//             hospaddr:req.body.hospaddr,
//             hospphno:req.body.hospphno,
//             bloodgrp:req.body.bloodgrp,
//             history_father:req.body.history_father,
//             history_mother:req.body.history_mother,
//             history_sibling:req.body.history_sibling,
//             tissuetype:req.body.tissuetype,
//             diseases:req.body.diseases,
//             heirname:req.body.heirname,
//             heirphno:req.body.heirphno,
//             donatedeath:req.body.donatedeath,
//             donate:req.body.donate,
//             details:req.body.details,
//             storage:req.body.storage      
  
//      }
//      Donor.updateOne({donorno:req.body.submit},editedDonor).then(function(){
//       res.redirect("/dashboard");
//      })
//     // console.log(editedDonor);
//   })

//   app.get("/view_recipient",function(req,res){
//     Recipient.find().then(function(recipients){
//       res.render("viewrecipient",{recipients1:recipients})
//     })
//   })

//   app.post("/view_recipient",function(req,res){
//     Recipient.find({aadhaar:req.body.recipients}).then(function(foundRecipient){
//       foundRecipient1=foundRecipient;
//       res.redirect("/edit_recipient")
//     })
//   })

//   app.get("/edit_recipient",function(req,res){
    
//       res.render("editrecipient",{recipient1:foundRecipient1[0]})
//   })

//   app.post("/edit_recipient",function(req,res){
    
//     const editedRecipient={
//       name:req.body.name,
//           dob:req.body.dob,
//           aadhaar:req.body.aadhaar,
//           phone:req.body.phone,
//           pincode:req.body.pincode,
//           hospital:req.body.hospital,
//             hospaddr:req.body.hospaddr,
//             hospphno:req.body.hospphno,
//             bloodgrp:req.body.bloodgrp,
//             history:req.body.history,
//             diagnosed:req.body.diagnosed,
//             receive:req.body.receive,
//             urgency:req.body.urgency

//     };
//     Recipient.updateOne({aadhaar:req.body.submit},editedRecipient).then(function(){
//       res.redirect("/dashboard");
//      })
// })

  

app.listen(3000, ()=>{
    console.log("Join ThriveLife to donate! Head to http://localhost:3000");
})