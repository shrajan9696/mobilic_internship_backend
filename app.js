const fs = require('fs')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const Users = require('./models/User')

const app = express()

app.use(express.static("public"));

app.use(express.json())
app.use(cors())

// connect to mongodb


const url = "mongodb+srv://Quotopedia24:shrajanjain@cluster0.6x9bzfs.mongodb.net/Mobilics_India_Internship?retryWrites=true&w=majority&ssl=true";

const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}

mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database ')

    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })
   var Schema = mongoose.Schema;
   const User =  mongoose.model('users',  new Schema({
    "id": Number,
    "first_name": String,
    "last_name": String,
    "email": String,
    "gender": String,
    "income": String,
    "city": String,
    "car": String,
    "quote":String,
    "phone_price":String
}));
    

    // import data to MongoDB

//     const user = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
// const importData = async () => {
//     try {
//       await Users.create(user)
//       console.log('data successfully imported')
     
//       process.exit()
//     } catch (error) {
//       console.log('error', error)
//     }
//   }

app.get('/query1', (req, res) => {
    

    User.find({
        // income: { $lt: "1" },
        $or: [
          { car: "BMW" },
          {car:"Mercedes-Benz"}
         
        ]
      }).then((data)=>{
        
        const result = data.filter(item=>{
         if((item.income.substring(1)) > "5"){
              
                // console.log(item);
                return item;
         }
        })

        res.send(result);

    }).catch(err=>{
        console.log(err);
    })
    console.log("get request");

   
});

app.get('/query2',function(req,res){
    User.find({
       
        $expr: {
            $gt: [
              { $toInt: "$phone_price" },
              10000
            ]
          },
          gender:"Male"
      }).then((data)=>res.send(data))
      .catch(err => console.log(err));
})

  app.get('/query3',function(req,res){
    User.find({
        last_name: /^M/,
        $expr: {
          $gt: [
            { $strLenCP: "$quote" },
            15
          ]
        }
       
      }).then(data => {
        const result = data.filter(item=>{
           if(item.email.includes(item.last_name.toLowerCase())){
                return item;
           }
           })
   
           res.send(result);
      });
  })


  app.get('/query4',function(req,res){
    User.find({
        $or:[
            {car:"BMW"},
            {car:"Mercedes-Benz"},
            {car:"Audi"}
        ]
    }).then((data)=>{
        const result = data.filter(item=>{
            if(/\d/.test(item.email)==false){
                 return item;
            }
            })
    
            res.send(result);
    })
  })

  app.get('/query5',function(req,res){
    User.aggregate([
        { $addFields: { income: { $toDouble: { $replaceOne: { input: "$income", find: {$literal:"$"}, replacement: "" } } } } },
        { $group: { _id: "$city", totalUsers: { $sum: 1 }, avgIncome: { $avg: "$income" } } },
        { $sort: { totalUsers: -1 } },
        { $limit: 10 }
      ]).then(data => res.send(data))
      .catch(err=> console.log(err));
  })









const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`listening to port ${PORT}`))