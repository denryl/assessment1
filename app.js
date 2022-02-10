// Initial Code
var express = require('express');
var bodyParser = require('body-parser');
const mysql = require('mysql')
var app = express();
const path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!",saveUninitialized:true, resave: false}));


app.use(express.static(path.join(__dirname, '/public')));
// Initial Code end

// Database Start
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'assessment1'
});

db.connect((err)=>{
    if(err) throw err
    console.log("Connected to db")
})
// Database End

//Routing Start
 
app.all("/signin",(req,res)=>{
    if(req.method=="GET"){
        res.render("signin",{error:null})

    }else if(req.method=="POST"){

        const params=req.body //access post_request values. 
        console.log("Username:"+params.username+" "+"Passowrd"+params.password)
        const sql= `SELECT * FROM users WHERE username="${params.username}" and password= "${params.password}"`
        db.query(sql,(err,results)=>{
            if (err) throw err;
            console.log(results)
            if (results.length==0){
                res.render("signin",{error:true})
 
            }else{
                var session=req.session
                session.userid={id:results[0].id}
                console.log("Signed In"+session)
                res.redirect("/admindashboard")
            }
        })
    }
});

app.get("/signout",(req,res)=>{
    req.session.destroy();
    res.redirect('/');
});

app.get("/product",(req,res)=>{
    
    const sql= `SELECT * FROM products`;
    var session=req.session;
  
    db.query(sql,(err,results)=>{
        if (err) throw err;
        if(results.length==0){
            results=null
        }
        if(req.session.userid!=null){  
            res.render("product",{user_data:session,data:results})
         }else{ 
            res.render("product",{user_data:null,data:results})
         }
    })

    

});

app.get("/admindashboard",(req,res)=>{
    if(req.session.userid!=null){
        var session=req.session
        const sql= `SELECT * FROM products`
        db.query(sql,(err,results)=>{
            if (err) throw err;
        
            if (results.length!=0){ 
                res.render("admindashboard",{user_data:session,products:results})
 
            }else{
                res.render("admindashboard",{user_data:session,products:null})
            }
        })
    }else{
        res.redirect("/")
    }
});

app.all("/addproduct",(req,res)=>{
    if(req.session.userid!=null){
        if(req.method=="POST"){
        var params=req.body;
       
        console.log(params)
        const sql="INSERT INTO products SET ?";
        
        db.query(sql,params,(err1,results1)=>{
            if (err1) throw err1;
           res.redirect("/admindashboard")
        })
                //run code
        }else{
            var session=req.session
            res.render("addproduct",{user_data:session})
        }
    }else{
        res.redirect("/")
    }
});

app.all("/editproduct/:id",(req,res)=>{
    if(req.session.userid!=null){
        var session= req.session;
    if(req.method=="POST"){
        var form_params=req.body;
        var id_param=req.params.id;
        console.log(require('util').inspect(form_params, {showHidden: false, depth: null}))
        const sql=`UPDATE products SET pname='${form_params.pname}',description='${form_params.description}',status='${form_params.status}',pprogress='${form_params.pprogress}',picture='${form_params.picture}',plink='${form_params.plink}',date=NOW() WHERE id= '${id_param}'`;
        db.query(sql,(err1,results1)=>{
            console.log(sql)
            if (err1) throw err1;
           res.redirect("/admindashboard")
        })
    }else{
        var id_param=req.params.id;
        const sql=`SELECT * FROM products WHERE id= '${id_param}'`;
        db.query(sql,(err1,results1)=>{
            console.log(sql)
            if (err1) throw err1;
           res.render("editproduct",{user_data:session,products:results1})
        })
    }
}else{
    res.redirect("/")
}
});

app.get("/deleteproject/:id",(req,res)=>{
    if(req.session.userid!=null){
    id_params=req.params.id;

    const sql=`DELETE FROM products WHERE id='${id_params}'`;
        db.query(sql,(err1,results1)=>{
            console.log(sql)
            if (err1) throw err1;
           res.redirect("/admindashboard")
          
        })
    }else{
        res.redirect("/admindashboard");
    }
   
});

app.get("/",(req,res)=>{
    res.redirect("/main");
});

app.get("/main",(req,res)=>{
    res.render("landing");
});

//Routing End

app.listen(process.env.PORT || port, () => console.log(`Example app listening at http://localhost:${port}`));
