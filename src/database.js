const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/AdminDB",{}).then(db=>console.log("Conectado a la db")).catch(err=>console.log(err))