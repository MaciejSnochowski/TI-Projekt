const express = require('express')
const app = express()
const moongose = require('mongoose')
const User = require('./model/userModel')

app.get("/",(req,res)=>{
    res.send()
})

app.post('/user', async (req,res)=>{
    try{
        const user= await User.create(req.body)
        res.status(200).json(user) 

    }catch(error){
        console.log(error.message);
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

moongose.connect('mongodb+srv://root:aeuWsd3RhckwEik2@ti-project-api.ly7jac8.mongodb.net/Node-API?retryWrites=true&w=majority')
    .then(()=>{
        app.listen(3000,()=>{
            console.log("start  !")
        })
            console.log("connected to mongoDB")})
            .catch(()=>{
                console.log('smth went wrong')
            });