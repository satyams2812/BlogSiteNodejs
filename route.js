const express = require('express');
const routes =  express.Router();
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const user  = require('./models.js');
var nodemailer = require('nodemailer');
const flash = require('connect-flash');
const passport = require('passport');
const bycrpt = require('bcryptjs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
var multer = require('multer');
var path = require('path');
var logger = require('morgan');



routes.use(cookieParser('secret'));
routes.use(session({
    secret:'secret',
    maxAge:3600000,
    resave:true,
    saveUninitialized:true,
}))

routes.use(passport.initialize());
routes.use(passport.session());



routes.use(bodyparser.urlencoded({extended:true}));




routes.use(flash());
//Global Variable
routes.use(function(req,res,next){
  res.locals.success_message = req.flash('success_message');
  res.locals.error_message = req.flash('error_message');
  res.locals.error = req.flash('error');
  next(); 
})

const checkAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
    } else {
        res.redirect('/');
    }
}
let transporter = nodemailer.createTransport({
    service : 'gmail',
    secure:false,
    port:25,
    auth:{
        user : 'satyamtesting2812@gmail.com',
        pass: 'satyam@2812'
    },
    tis:{
        rejectUnauthorized : false
    }
});
 
mongoose.connect('mongodb+srv://first:satyam@2812@cluster0-ziri6.mongodb.net/userDB?retryWrites=true&w=majority',{
    useNewUrlParser : true,
    useUnifiedTopology:true
}).then(()=>console.log("Database Connected"));




routes.get('/register',(req,res)=>{
    res.render('register');
})

routes.post('/register',(req,res)=>{
    var {email,username,password} = req.body;
     var err;
     if(!email || !username || !password)
     {
         err = "Please Fill All Details";
         res.render('register',{'err': err});
     }

     if(typeof err =='undefined'){
        user.findOne({email:email}, function(err,data){
            if(data)
            {
                console.log("User Exists");
                err = "User Already Exists With This Email Id";
                res.render('register',{'err':err, 'email':email, 'username': username});
            }else{
                bycrpt.genSalt(10,(err,salt)=>{
                    if(err)
                    throw err;
                    bycrpt.hash(password,salt, (err,hash)=>{
                        if(err) throw err;
                        password = hash;
                        user({
                            email,
                            username,
                            password
                        }).save((err,data)=>{
                            if(err) throw err;

                           req.flash('success_message',"Registred Successfully.. Login To Continue");
                            
//                             let HelperOptions = {
//                              from : '"Satyam Sharma" <satyamtesting2812@gmail.com',
//                              to : email,
//                              subject: 'Testing Message',
//                              text : 'Thanks For Registration on our site' 
//                          };
 
   
//                          transporter.sendMail(HelperOptions,(err,info)=>{
//                               if(err){
//                            return console.log(err);
//                                }
//                     console.log("This Message Was Sent");
//                             console.log(info);
 
//  })
 
                            res.redirect('/');
                        });
                    })
                })
            }
        })
    }
 });

 var localStrategy = require('passport-local').Strategy;
 passport.use(new localStrategy({usernameField: 'email'},(email,password,done)=>{
 user.findOne({email: email},(err,data)=>{
     if(err) throw err;
     if(!data){
         return done(null,false,{message : "Username Doesn't Exists..."});
     }
     bycrpt.compare(password,data.password,(err,match)=>{
         if(err){
             return done(null,false);
         }
         if(!match){
             return done(null,false,{message : "Password Doesn't Match "});
         }
         if(match){
             return done(null,data);
         }
     })
 })
 }));

 passport.serializeUser(function(user,cb){
    cb(null,user.id);
})



passport.deserializeUser(function(id,cb){
    user.findById(id,function(err,user){
        cb(err,user);
    })
})


routes.get('/',(req,res)=>{
    res.render('index');
    });

    
    routes.post('/login',(req,res,next)=>{
        passport.authenticate('local',{
            failureRedirect:'/',
         successRedirect:'/dashboard/',        
          failureFlash:true,
        })(req,res,next);
    });
    
    


    // routes.get('/dashboard', checkAuthenticated ,(req,res)=>{
    //     res.render('dashboard',{'user': req.user});
    // })
    
       routes.get("/dashboard",checkAuthenticated,  (req, res) =>{
        res.render("dashboard",{ user: req.user })
        })
    
    
     


    
   
   
    routes.get('/logout',(req,res)=>
{
    req.logout();
    res.redirect('/')
})


routes.post('/addmsg', checkAuthenticated ,(req,res)=>{
    user.findOneAndUpdate(
        {email:req.user.email},
        {$push :{
            message : req.body['msg']
        
        },
     
     },(err,suc)=>{
            if(err) throw err;
            if(suc) console.log("Added Succesfully");
        }
    )
    res.redirect('/dashboard');
 });


  


routes.get("/",checkAuthenticated,  (req, res) =>{
    res.render("home",{ user: null })
    })


    routes.get("/home", checkAuthenticated, (req, res)=> {   
    user.find({}, function (err, users) {
        if (err) {
            console.log(err);
        } else {
            res.render("home", { user: users })
 
        }
    })
    })

  

    // routes.get('/editprofile',checkAuthenticated,(req,res)=>{
    //     var id = req.params.id;
        
    //      res.render('editprofile',{'user' : req.user}  );
       
    
    //  })

    

    routes.get("/",checkAuthenticated,  (req, res) =>{
        res.render("editprofile",{ user: null })
        })
    
    
  routes.get("/editprofile", checkAuthenticated, (req, res)=> {   
       
  user.find({email:req.user.email},function(err,users){
                 if(err)
                 {
                      console.log(err);

                 }
                 else{
                     res.render('editprofile',{user : req.user});
                 }
             })
     
        })

        

     
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "uploads/");
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    });
    
    var upload = multer({storage: storage}).single('myimage');
    

    routes.post('/image', checkAuthenticated, (req, res) => {
        upload(req, res, (err) => {
            if (err) {
                return res.end('error request file');
            }
       else{
        user.findOneAndUpdate({email:req.user.email},
            {$set : {image :  req.file.originalname,
              },
           
            },
             
             (err,succ)=>{
                if(err) throw err;
                if(succ) console.log("Image Uploaded Succesfully");
            }
            )
            res.redirect('/editprofile');
    
       }
           
         })
   
        
    });



    routes.post('/edit',checkAuthenticated,(req,res)=>{

        var id = req.params.id;
         const name = req.body.identity;
         const username = req.body.username;
         const password = req.body.password;
         const phone = req.body.phone;
         const git = req.body.git;
     
     
         user.findOneAndUpdate({email:req.user.email},
             {$set : {name : name,
                 phone : phone,
                 git: git ,
                 
               },
            
             },
              
              (err,succ)=>{
                 if(err) throw err;
                 if(succ) console.log("Added Succesfully");
             }
             )
             res.redirect('/dashboard');
     
     
      })



    

  



module.exports = routes;

