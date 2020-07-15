const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    email: {
        type: String,
        required :true,
    },
    username :{
        type : String,
        required: true
    },
    password: {
        type :String,
         required :true
    },
    name : {
        type :String,
    },
    phone :{
        type : String,
    },
    git :{
        type :String,
    },
    image:{
      type : Buffer
    },
    messages : {
        type: String,
    }
});


module.exports = new mongoose.model('user',userschema);