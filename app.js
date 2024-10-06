require('dotenv').config();
const express = require('express');
const app=express();
const mongoose = require('mongoose');
const userModel = require("./models/user");
const jwt = require('jsonwebtoken');

const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs/dist/bcrypt');

app.set("view engine" , 'ejs');
app.use(express.json());
app.use(express.urlencoded ({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


app.get("/",function(req,res){
    res.render("index")
})

// app.post('/create',  (req,res) =>{
// let {username,email,password,age} = req.body;

// bcrypt.genSalt(10,(err,salt) =>{
//     bcrypt.hash(password,salt,async (err,hash)=>{
//         console.log(hash);
//         let createUser = await userModel.create({
//             username,
//             email,
//             password:hash,
//             age
//         })
//         let token = jwt.sign({email}, "shhhhhhh");
//         res.cookie("token",token);
//         res.send(createUser);
//     })
// })

// // $2a$10$0mgwU.0FEvAXcQoEExhyYuLyCSSXm9qiMwOU1DKq54WKneAwNCGNe string genrated over password

// })
app.post('/create', async (req, res) => {
    let { username, email, password, age } = req.body;

    bcrypt.genSalt(10, async (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let createUser = await userModel.create({
                username,
                email,
                password: hash,
                age
            });

            let token = jwt.sign({ email }, "shhhhhhh");
            res.cookie("token", token);

            // Redirect to the users list page
            res.redirect('/users');
        });
    });
});

app.get("/login" ,function(req,res){
    res.render("login");
})

app.post('/login', async function (req,res) {
    let user = await userModel.findOne({email:req.body.email});
    if(!user ) return res.send("Something went wrong !");
    
    bcrypt.compare(req.body.password,user.password,function(err,result){
        if(result){
            let token = jwt.sign({email:user.email}, "shhhhhhh");
        res.cookie("token",token);
            res.send("yes you can login now");
        }
        else res.send("somehting went wrong")
    })
})

app.get('/users', async (req, res) => {
    try {
        const users = await userModel.find(); // Fetch all users
        res.render('users', { users }); // Render the users page with the users data
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


app.get("/logout",function (req,res){
    res.cookie("token","");
    res.redirect('/');
})

app.listen(5050);