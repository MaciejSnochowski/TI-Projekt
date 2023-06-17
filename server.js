// npm run dev to run  nodemon
//npm rund build:css to reload tailwind components 
const express = require('express')
const app = express()
const path = require("path");
const bcrypt =require("bcrypt");
const passport = require('passport')

const session = require('express-session')
const inializePassport =require('./passport-config')
inializePassport(passport)
app.use(express.urlencoded( { extended:false}));
app.use(express.json())


//cors
const cors = require("cors");
const corOptions = {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  };
  
  app.use(cors(corOptions));

//baza danych
const moongose = require('mongoose')
const User = require('./model/userModel');
const { error } = require('console');
//informacje na temat serwera
const port = 3000;
const address='127.0.1.1';
app.listen(port,address)
{

    console.log("server running on port "+port);
 

}


app.set('src', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'public')));


app.get("/",(req,res)=>{
    let name=null
    res.render('index',{name})
});
app.get("/logowanie",(req,res)=>{
res.render("login")
});
app.get("/rejestracja",(req,res)=>{
    
    res.render("register")
 
});

//walidacja hasła
function validatePassword(passwd) {
    var p =passwd;
        errors = [];
    if (p.length < 8) {
        errors.push("Your password must be at least 8 characters"); 
    }
    if (p.search(/[a-z]/i) < 0) {
        errors.push("Your password must contain at least one letter.");
    }
    if (p.search(/[0-9]/) < 0) {
        errors.push("Your password must contain at least one digit."); 
    }
    if (errors.length > 0) {
        alert(errors.join("\n"));
        return false;
    }
    return true;
}


app.post('/rejestracja',  async (req,res)=>{
   try{
    if(!  validatePassword(req.body.password)){
        return await res.status(400).json({message: "Hasło musi spełniac polityke haseł!"})
    }
    if(req.body.password != req.body.password_sec){
        return res.status(400).json({message: "Hasła muszą być takie same!"})
    }
   const newPass = await bcrypt.hash(req.body.password, 10)
   const newUser= await User.create({username: req.body.username,
                        password: newPass
                        })
                        let name=req.body.username;
                        console.log(name);
                        res.render("index", {name})

   
      
   }catch{
  console.log(error.message)
  res.status(500).json({message: error.message})
   }
  

    

})

app.get('/users',async(req,res)=>{
    try{
const users = await User.find({});
res.status(200).json(users)
    }catch{
        res.status(500).json({message: error.message})
    }
})

moongose.
connect('mongodb+srv://root:aeuWsd3RhckwEik2@ti-project-api.ly7jac8.mongodb.net/Node-API?retryWrites=true&w=majority')
    .then(()=>{
        app.listen(3000,()=>{
            console.log("start  !")
        })
            console.log("connected to mongoDB")})
            .catch(()=>{
                console.log('smth went wrong')
            });


