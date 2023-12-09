const express = require("express");
const path = require("path");


const app = express();
const port = 3001;
app.use( express.static('public'));
const { getFirestore,Filter} = require('firebase-admin/firestore');
const { initializeApp, cert } = require('firebase-admin/app');
var passwordHash = require('password-hash');
const bodyParser=require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extend:false}));

var serviceAccount = require("./key.json");
const { Console } = require("console");
initializeApp({
    credential: cert(serviceAccount)
  });
  
  const db = getFirestore();
app.get("/SharePlate",function(req,res){
    res.sendFile(path.join(__dirname+ "/home/main.html"));
   // res.sendFile(__dirname+"/home/main.html");
});

app.get('/SharePlate/aboutus',function(req,res){
    res.sendFile(__dirname+'/home/aboutus.html');
    
})

app.get('/SharePlate/signup',function(req,res){
    res.sendFile(__dirname+'/signup.html');
    
})

app.post('/updatedList',function(req,res){
    console.log(req.body);
    //res.send("hi")
    db.collection("Plate")
    .where(
        Filter.or(
            Filter.where("email","==",req.body.email),
            Filter.where("Username","==",req.body.Username)

        )

    )
    .get()
    .then((docs)=>{
        if(docs.size>0){
            res.send("New emailid and unique username should be used!!!");
        }
        else{
            db.collection("Plate").add({
                Username:req.body.Username,
                email:req.body.email,
                password:passwordHash.generate(req.body.password)
            
               
            }).then(()=>{
                res.sendFile(__dirname+'/login.html');
               
                //res.send("signup complted!!!!,Go to login page")
            })
        }
    });





   
})
app.get('/SharePlate/login',function(req,res){
    res.sendFile(__dirname+'/login.html');
    
})
app.get('/loginpage',function(req,res){

    console.log(req.query);
    
    db.collection("Plate")
    .where("email","==",req.query.email)
    
    .get()
    .then((docs)=>{
        let verified=false;
        docs.forEach((doc)=>{
            verified=passwordHash.verify(req.query.password,doc.data().password);
        });
        if(verified){
            res.sendFile(__dirname+'/dashboard.html');

        }else{
            res.send("LOGIN FAILED");
        }


      
    })
})

app.get('/SharePlate/contact',function(req,res){
    res.sendFile(__dirname+'/contact.html');
})

app.get('/api/profile', (req, res) => {
    const username = req.query.Username; 
    //console.log('Retrieved username:', username);
    res.json({ username });
});

// Endpoint to get and post messages
const userMessages = []; 

app.get('/api/messages', (req, res) => {
    // Send user-specific messages to the client
    res.json({ messages: userMessages });
});

app.post('/api/messages', (req, res) => {
    const { text } = req.body;
    if (text) {
        // Add the new message to the userMessages array
        userMessages.push({ text });
        res.json({ message: 'Message sent successfully.' });
    } else {
        res.status(400).json({ error: 'Invalid message.' });
    }
});

// ... your existing code ...




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});