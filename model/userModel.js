const mongoose=require('mongoose');
const { boolean } = require('webidl-conversions');

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
    admin:{
        type:Boolean,
        required:false
    },
    blocked:{
        type:Boolean,
        required:false
    }
       
},
{
    timestamps: true
}

)

const User = mongoose.model('users',userSchema);
module.exports = User;