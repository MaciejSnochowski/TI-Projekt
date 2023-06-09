// npm run dev to run  nodemon
//npm rund build:css to reload tailwind components 
const express = require('express');
const app = express();
const path = require("path");
const bcrypt =require("bcrypt");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const request = require('request');

app.use(session({
    secret: "some secret",
    resave: false,
cookie: {maxAge: 30000},
saveUninitialized: false}));

const port = 3000;
const address='127.0.1.1';
app.listen(port,address)
{

    console.log("server running on port "+port);
 

}
app.use(express.urlencoded( { extended:false}));
app.use(express.json());
app.use(cookieParser());



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

let errorMsg=null;

app.set('src', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'public')));
let sessionUser;
let isAdmin;


app.get("/logowanie",(req,res)=>{

res.render("login",{errorMsg});
});

app.get("/rejestracja",(req,res)=>{

    res.render("register",{errorMsg})
 
});





app.get('/wyloguj',(req,res)=>{
req.session.destroy();
res.redirect('/');
});

app.post('/logowanie',async (req,res)=>{
  
   
try{

    const localUser = await User.findOne({username: req.body.username});
    console.log("username " +req.body.username)
    console.log("localUser "+localUser)
    
    if(localUser){
        if(localUser.blocked==true){
           //  res.status(400).json({error: "Twoje konto jest zablokowane"})
            errorMsg="Twoje konto jest zablokowane";
            return   res.redirect("/logowanie");
        }
        const result =  await bcrypt.compare(req.body.password, localUser.password);    
        if(result){
            console.log("you are logged")
            req.session.user = req.body.username;
            name= sessionUser = req.session.user;


            req.session.isAdmin=localUser.admin;
            isAdmin=req.session.isAdmin;
            req.session.save();
            console.log("localUser._id "+req.session.user+ "\n"+req.body.admin)
            errorMsg=null;
            res.render('index',{name,sessionUser,isAdmin,tabela})

        }
            else{
               // res.status(400).json({error: "Hasła nie pasują do siebie"})
                errorMsg="Hasła nie pasują do siebie";
                res.redirect("/logowanie");
            }
    }else{
      //  res.status(400).json({error:"Użytkownik nie istnieje"})
        errorMsg="Użytkownik nie istnieje";
        res.redirect("/logowanie");

        
    }
}catch(error){
//    res.status(400).json({ message: error.message+ " Catch error"} );
    console.log(error.message)
    errorMsg=error.message
    //res.status(500).json({message: error.message})
    res.redirect("/logowanie");
}
});
app.post('/rejestracja',  async (req,res)=>{
   try{
  
    if( req.body.password !=  req.body.password_sec){
        // return res.status(400).json({message: "Hasła muszą być takie same!"})
         errorMsg="Hasła muszą być takie same"

        console.log(errorMsg)

         return res.redirect("/rejestracja");
    }
    if(req.body.username.length <3){
        
        errorMsg="Podany login jest za krótki, musi mieć co najmniej 3 znaki "
        console.log(errorMsg)
        return  res.redirect("/rejestracja");
     }
    if( req.body.password.length <8){
       

        errorMsg="Podane hasło jest za krótkie, musi mieć co najmniej 8 znaków"
        console.log(errorMsg)
        return  res.redirect("/rejestracja");
    }

  
 //  console.log("dlugosc "+req.body.password.length)

    const usernameInDb = await User.findOne({username: req.body.username});
    
    if(usernameInDb == null || usernameInDb== undefined){
      console.log("created")

        const newPass = await bcrypt.hash(req.body.password, 10)
        const newUser= await User.create(
                               {username: req.body.username,
                                password: newPass,
                                admin:false,
                                blocked: false
                                })
                                let name=req.body.username;
                               sessionUser=name;
                               isAdmin=newUser.admin;
                                errorMsg=null;
                                res.render('index',{name,sessionUser,isAdmin,errorMsg,tabela})

                    }else {
                        // res.status(400).json({message: "Użytkownik o takim loginie już istnieje!"})
                         errorMsg="Użytkownik o takim loginie już istnieje"
                         res.redirect("/rejestracja");
                    }
      
   }catch{
  console.log(error.message)
  errorMsg=error.message
  //res.status(500).json({message: error.message})
  res.redirect("/rejestracja");
   }
  

    

})

app.get("/adminPanel",async(req,res)=>{
    
  const  users= await User.find();
  
 

    var name =req.session.user;
    var sessionUser=name;
    isAdmin=req.session.isAdmin
    res.render("adminPanel",{name,sessionUser,isAdmin,users})
 
});
app.post("/zablokujUzytkownika", async(req,res)=>{
    
    let isBlocked =  await req.body.blocked;
    const user=  await req.body.user_name; 
    const usernameInDb = await User.findOne({username: user});

    await User.findOne({username: usernameInDb.username}).then((user)=>{
        console.log("before "+user.username+" "+user.blocked);
    if(user.blocked==true){
        user.blocked=false;
        user.save();
    }
    else{
        user.blocked=true;
        user.save();
    }
    
      
    if(usernameInDb.username== req.session.user){
        req.session.destroy();
        return res.redirect("/")
    }


        console.log("after "+user.username+" "+user.blocked);
        res.redirect("/adminPanel");
    
    })

});
app.post("/zmienUprawnienia",async (req,res)=>{
let permissions =  await req.body.permissions;
const user=  await req.body.user_name;
console.log(permissions);
const usernameInDb = await User.findOne({username: user});

if(permissions=="true"){
    permissions=false;
}else{ permissions=true;}
console.log("user "+usernameInDb.username)

await User.findOne({username: usernameInDb.username}).then((user)=>{
    console.log("before "+user.username+" "+user.admin);
    user.admin=permissions;
    user.save();
    console.log("after "+user.username+" "+user.admin);
    permissions=user.admin;



}) 
console.log("zminaa: "+usernameInDb.admin)
if(usernameInDb.username== req.session.user && permissions==false){
    req.session.destroy();
        return res.redirect("/")
};
res.redirect("/adminPanel");
});
app.post("/usunUzytkownika",async(req,res)=>{
    const user=  await req.body.user_name;
    const usernameInDb = await User.findOne({username: user});
    console.log("clicked user: "+ usernameInDb.username)
    if(usernameInDb.username== req.session.user){
        await User.deleteOne({username: user});
        req.session.destroy();
             res.redirect("/")
    }else{
        await User.deleteOne({username: user});
        res.redirect("/adminPanel");
    }
   
});
let ikony=["https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/1/2021_2022/clubs/12_Rakow_Czestochowa.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/Herb_Legia_Warszawa_2.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2022_23/clubs/05_Lech_Pozna%C5%84.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/10_Pogon_Szczecin.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/09_Piast_Gliwice.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/04_Gornik_Zabrze.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/02_Cracovia.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/15_Warta_Poznan.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/18_Zaglebie_Lubin.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/11_Radomiak_Radom.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/14_Stal_Mielec.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2022_23/clubs/Widzew-Lodz-herb.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2022_23/clubs/Korona-Kielce-herb.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/05_Jagiellonia_Bialystok.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/13_Slask_Wroclaw.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/17_Wisla_Plock.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2021_2022/clubs/07_Lechia_Gdansk.png",
"https://d2vzq0pwftw3zc.cloudfront.net/fit-in/100x100/filters:quality(30)/de5a136b-59d1-40ce-8b51-c043a004751b/2022_23/clubs/miedz_legnica_herb.png"
];
let punktyArr=    [75,66,61,60,53,48,46,45,45,44,43,41,41,41,38,37,30,23];
let zwyciestwaArr=[23,19,17,17,15,13,12,12,12,12,11,11,11,9 ,9 ,10,8 ,4 ];
let remisyArr=    [ 6, 9,10, 9, 8, 9,10, 9, 9, 8,10, 8, 8,14,11, 7,6 ,11];
let porazkiArr=   [ 5, 6, 7, 8,11,12,12,13,13,14,13,15,15,11,14,17,20,19];
let bramkiArr=    ["63:24","57:37","51:29","57:46","40:31","45:43","41:35"
,"37:35","35:44","34:41","36:40","38:47","39:48","48:49","35:48","41:50","28:56","33:55"];
let druzyny= ["Raków Częstochowa","Legia Warszawa","Lech Poznań","Pogoń Szczecin","Piast Gliwice",
"Górnik Zabrze","Cracovia","Warta Poznań","KGHM Zagłębie Lubin","Radomiak Radom","PGE FKS Stal Mielec",
"Widzew Łódź","Korona Kielce","Jagiellonia Bialystok","Śląsk Wrocław","Wisła Płock","Lechia Gdańsk","Miedź Legnica"];
let tabela= []

  
request('https://ekstraklasa.konektorn.pl/get/ekstraklasa/kursy', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonOutput = JSON.parse(body)
      // do more stuff
   
     let  arrValues =Object.values(jsonOutput)
      for(var i=0;i<druzyny.length;i++){
        let druzyna={
            ranking: i+1,
            druzyna: druzyny[i],
            ikona: ikony[i],
            rozegraneMecze: 34,
            punkty: punktyArr[i],
            zwyciestwa: zwyciestwaArr[i],
            remisy: remisyArr[i],
            porazki: porazkiArr[i],
            bramki: bramkiArr[i],
            kursy: arrValues[i]
        }
        tabela.push(druzyna);
      }

    }
  
  })




app.get("/",async (req,res)=>{
    const name=null
    errorMsg=null
    sessionUser=req.session.user
    isAdmin=req.session.isAdmin

    
    res.render('index',{name,sessionUser,isAdmin,tabela})
   
});
app.get("/api2",(req,res)=>{
  
    request('https://ekstraklasa.konektorn.pl/get/ekstraklasa/kursy', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var jsonOutput = JSON.parse(body)
          // do more stuff
       
          arr = Object.values(jsonOutput);
        

    console.log("array : "+arr)
        }
        
      })
    
    res.status(200).json( {message: 'aa'});
    
    });
    

moongose.
connect('mongodb+srv://root:aeuWsd3RhckwEik2@ti-project-api.ly7jac8.mongodb.net/Node-API?retryWrites=true&w=majority')
    .then(()=>{
       
            console.log("connected to mongoDB")})
            .catch(()=>{
                console.log('smth went wrong')
            });


