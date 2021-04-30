const express = require('express');
const ejs = require('ejs');
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const mongo = require('mongodb')

const mongo_url = "mongodb+srv://aitvikram:aitvikram@cluster0.uuzka.mongodb.net/gamezone?retryWrites=true&w=majority";


const app = express();
const port = 8080;

app.use(bodyParser.json());
app.set('view engine','ejs');
app.use(express.static('static'));
app.use(cookieParser())


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(express.static(path.resolve(__dirname,'assets')));


// app.use(bodyParser.urlencoded({extended:false}));
/// main logic code

const database_name = "gamezone";
const post_collec = "posts";
const user_collec = "users";
const comment_collec = "comments";


app.listen(port,() =>{
    console.log(`Server has started listening for request on ${port}`);
})

app.get("/",(req,res) => {
    

    MongoClient.connect(mongo_url,function(err,db){
        var dbo = db.db(database_name);
        dbo.collection(post_collec).find({}).toArray(function(err, results){
            console.log(results)
            res.render("gamezone_home",{records:results})
            db.close();
        });
    });

    // res.render('gamezone_home',{});
});

// below is used for angular
app.get("/api/",(req,res) => {

    MongoClient.connect(mongo_url,function(err,db){
        var dbo = db.db(database_name);
        dbo.collection(post_collec).find({}).toArray(function(err, results){
            console.log(results)
            // res.render("gamezone_home",{records:results})
            db.close();
            res.status(200).send(results)
        });
    });
    // res.render('gamezone_home',{});
});

app.get("/api/:username",(req,res) => {

    var myUser = {"user_name":req.params["username"]}

    MongoClient.connect(mongo_url,function(err,db){
        var dbo = db.db(database_name);
        dbo.collection(post_collec).find(myUser).toArray(function(err, results){
            console.log(results)
            // res.render("gamezone_home",{records:results})
            db.close();
            res.status(200).send(results)
        });
    });
    // res.render('gamezone_home',{});
});

app.get('/api/detail/:post_id', (req,res) =>{
    console.log(req.params);
    var lastGameChoosen = req.params["post_id"]
    res.cookie("lastPostVisited",lastGameChoosen)
    console.log("Cookies that have been set=",req.cookies)
    // res.render('gamezone_comments',{});

    MongoClient.connect(mongo_url,function(err,db){
        var dbo = db.db(database_name);

        dbo.collection(post_collec).findOne(mongo.ObjectId(lastGameChoosen), function(err, result) {
            if (err) throw err;
            console.log(result.post_title);
            res.status(200).send(result)
            db.close();
          });
    });
})

app.get('/api/comments/:post_object_id', (req,res) =>{

    console.log("Getting comments ")

    var myPost = {"post_object_id":req.params["post_object_id"]}
    MongoClient.connect(mongo_url,function(err,db){
        var dbo = db.db(database_name);
        dbo.collection(comment_collec).find(myPost).toArray(function(err, results){
            console.log(results)
            // res.render("gamezone_home",{records:results})
            db.close();
            res.status(200).send(results);
        });
    });
});

app.post('/api/open_post', (req,res) =>{
    // INserting received data into mongo client
    console.log("Data that is received is: ");
    console.log(req.body);
    var myPost = {post_title: req.body.post_title, post_description: req.body.post_description,user_name: req.body.user_name}
    MongoClient.connect(mongo_url,function(err,db){
        if (err) throw err;
        var dbo = db.db(database_name);

        console.log("receieved following data:");
        console.log(myPost);

        dbo.collection(post_collec).insertOne(myPost,function(err,result){
            if (err) throw err;
            console.log("Data inserted");
            db.close();
            res.status(200).send(result)
        })
    });
});

app.get('/api/delete/comment/:comment_object_id',(req,res)=>{
    var comment_id = req.params["comment_object_id"];
    console.log(`Comment to delete is ${comment_id}`);

    var comObj = {"_id":mongo.ObjectId(comment_id)};

    MongoClient.connect(mongo_url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(database_name);

        dbo.collection(comment_collec).deleteOne(comObj, function(err, obj) {
          if (err) throw err;
          console.log("The record has been deleted.");
          db.close();
          res.status(200).send(obj);
        });
    });
})

app.post('/api/put_comment', (req,res) =>{
    // INserting received data into mongo client
    console.log("Data that is received is: ");
    console.log(req.body);
    var myComment = {by_user: req.body.by_user, comment: req.body.comment,post_object_id: req.body.post_object_id}
    MongoClient.connect(mongo_url,function(err,db){
        if (err) throw err;
        var dbo = db.db(database_name);

        console.log("receieved following data:");
        console.log(myComment);

        dbo.collection(comment_collec).insertOne(myComment,function(err,result){
            if (err) throw err;
            console.log("Data inserted");
            db.close();
            res.status(200).send(result)
        })
    });
});

app.post("/api/update", function(req,res){
    console.log(req.body);
    // INserting received data into mongo client
    
    MongoClient.connect(mongo_url,function(err,db){
        if (err) throw err;
        var dbo = db.db(database_name);
        var myPost = {post_title: req.body.post_title, post_description: req.body.post_description}

        // console.log("receieved following data for updation:");
        // console.log(myPost);

        dbo.collection(post_collec).updateOne({post_title:req.body.post_title},{$set: myPost},function(err,result){
            if (err) throw err;
            console.log("Data Updated.");
            db.close();
            res.status(200).send(result);
        })
    });
});

app.post("/api/delete",(req,res)=>{


    MongoClient.connect(mongo_url, function(err, db) {
        if (err) throw err;

        var dbo = db.db(database_name);
        var myPost = {post_title: req.body.post_title}

        dbo.collection(post_collec).deleteOne(myPost, function(err, obj) {
          if (err) throw err;
          console.log("The record has been deleted.");
          db.close();
          res.status(200).send(obj);
        });
    });

});

app.post('/api/register', (req,res) =>{
    // INserting received data into mongo client
    console.log("Data that is received is: ");
    console.log(req.body);
    var myUser = {name: req.body.name, password: req.body.password}
    MongoClient.connect(mongo_url,function(err,db){
        if (err) throw err;
        var dbo = db.db(database_name);

        console.log("receieved following data:");
        console.log(myUser);

        dbo.collection(user_collec).insertOne(myUser,function(err,result){
            if (err) throw err;
            console.log("Data inserted");
            res.status(200).send(result)
            db.close();
        })
    });
});

// above code is used for angular
app.post('/api/login/', (req,res) =>{
    console.log(req.params);

    var user = {name: req.body.name, password: req.body.password}
    console.log(`User found is ${user}`)
    
    MongoClient.connect(mongo_url,function(err,db){
        var dbo = db.db(database_name);
        
        dbo.collection(user_collec).findOne(user, function(err, result) {
            if (err){
                res.status(409).send({"Error":"No user found"});
            } 
            
            console.log(result.name);
            res.status(200).send(result)
            db.close();
          });
    });
})

app.get('/detail/:game',(req,res) =>{
    console.log(req.params);
    var lastGameChoosen = req.params["game"]
    res.cookie("lastPostVisited",lastGameChoosen)
    console.log("Cookies that have been set=",req.cookies)
    res.render('gamezone_comments',{});
})

app.get('/dy_detail/:post_id', (req,res) =>{
    console.log(req.params);
    var lastGameChoosen = req.params["post_id"]
    res.cookie("lastPostVisited",lastGameChoosen)
    console.log("Cookies that have been set=",req.cookies)
    // res.render('gamezone_comments',{});

    MongoClient.connect(mongo_url,function(err,db){
        var dbo = db.db(database_name);

        dbo.collection(post_collec).findOne(mongo.ObjectId(lastGameChoosen), function(err, result) {
            if (err) throw err;
            console.log(result.post_title);
            res.render("up_gamezone_comments",{records:result})
            db.close();
          });
    });
})

app.get('/user/:userid/',(req,res) =>{
    console.log(req.params);

    res.render('gamezone_home',{});
})

app.post("/register",(req,res) =>{
    console.log(req.body);
});

app.get('/login',(req,res) =>{
    res.render('login',{});
})

app.get('/new_discussion',(req,res) =>{
    res.render('upload_post',{});
})

app.get('/delete/:post',(req,res) =>{

})

app.get("/update/:postid",(req,res) =>{
    console.log(req.params);
    var gameChoosen = req.params["postid"]
    // console.log(`Data ID recieved is : ${gameChoosen}`)
    // res.render('gamezone_comments',{});

    MongoClient.connect(mongo_url,function(err,db){
        var dbo = db.db(database_name);

        dbo.collection(post_collec).findOne(mongo.ObjectId(gameChoosen), function(err, result) {
            if (err) throw err;
            console.log(result.post_title);
            res.render("update_post",{records:result})
            db.close();
          });
    });
})

app.get("/deleteu/:postid",(req,res) =>{
    console.log(req.params);
    console.log("inside delete function")
    var gameChoosen = req.params["postid"]
    console.log(`Data ID recieved is : ${gameChoosen}`)
    // res.render('gamezone_comments',{});

    MongoClient.connect(mongo_url,function(err,db){
        var dbo = db.db(database_name);

        dbo.collection(post_collec).findOne(mongo.ObjectId(gameChoosen), function(err, result) {
            if (err) throw err;
            console.log(result.post_title);
            res.render("delete_post",{records:result})
            db.close();
          });
    });
})

app.post("/update", function(req,res){
    console.log(req.body);
    // INserting received data into mongo client
    
    MongoClient.connect(mongo_url,function(err,db){
        if (err) throw err;
        var dbo = db.db(database_name);
        var myPost = {post_title: req.body.post_title, post_description: req.body.post_description}

        // console.log("receieved following data for updation:");
        // console.log(myPost);

        dbo.collection(post_collec).updateOne({post_title:req.body.post_title},{$set: myPost},function(err,res){
            if (err) throw err;
            console.log("Data Updated.");
            db.close();
        })
    });
    res.redirect("/");
});

app.post("/delete",(req,res)=>{
    MongoClient.connect(mongo_url, function(err, db) {
        if (err) throw err;

        var dbo = db.db(database_name);
        var myPost = {post_title: req.body.post_title}

        dbo.collection(post_collec).deleteOne(myPost, function(err, obj) {
          if (err) throw err;
          console.log("The record has been deleted.");
          db.close();
        });
      });

      res.redirect("/");
});

app.post('/open_post', (req,res) =>{
    // INserting received data into mongo client
    console.log(req.body);
    var myPost = {post_title: req.body.post_title, post_description: req.body.post_description}
    
    MongoClient.connect(mongo_url,function(err,db){
        if (err) throw err;
        var dbo = db.db(database_name);


        // console.log("receieved following data:");
        // console.log(myPost);

        dbo.collection(post_collec).insertOne(myPost,function(err,res){
            if (err) throw err;
            console.log("Data inserted");
            db.close();
        })
    });
    res.redirect("/");
});

// for final 404 page.
app.get('*',(req,res) =>{
    res.render('404_page',{});
})

