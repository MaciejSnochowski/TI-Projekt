const mongoose=require('mongoose')

const userSchema= mongoose.Schema(

{
    username:{
        type:String,
       
        required: [true,"Enter username"]
      // required: false
    },
    password:{
        type:String,
        required: [true,"Enter password"]
     //  required: false
    },
       
},
{
    timestamps: true
}

)
const User = mongoose.model('User',userSchema);
module.exports = User;