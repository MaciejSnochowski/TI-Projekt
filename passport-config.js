const localStrategy = require('passport-local').Strategy
function inializePassport(passport){
    passport.use(new localStrategy())
}