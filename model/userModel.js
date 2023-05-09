const mongoose=require('mongoose')

const userSchema= mongoose.Schema(

{
    name:{
        type:String,
       // required: [true,"Enter username"]
       required: false
    },
    password:{
        type:String,
       // required: [true,"Enter password!"]
       required: false
    },
    ratio:{ //total win or lose 
        type: Number,
        required: false
    },cash:{
        type: Number,
        require: [true,0]
    }
},
{
    timestamps: true
}

)
const User = mongoose.model('User',userSchema);
module.exports = User;