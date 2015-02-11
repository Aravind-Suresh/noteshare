// app/routes.js
var bcrypt = require('bcrypt-nodejs');
var mysql = require('mysql');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);
var multer  = require('multer');
var done=false;
var fs=require('fs');
module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("hello");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/auth/facebook', passport.authenticate('facebook'));
	app.get('/auth/facebook/callback', 
            passport.authenticate('facebook', { successRedirect: '/profile',
                                     failureRedirect: '/login' }));
	app.get('/auth/facebook',
           passport.authenticate('facebook', { scope: 'read_stream' })
    );
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});
    app.get('/auth/google',
         passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' })
         );

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));
    app.get('/auth/google/callback', 
        passport.authenticate('google', { failureRedirect: '/login' }),
        function(req, res) {
    // Successful authentication, redirect home.
        res.redirect('/');
  });
	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		var pwd =req.user.password;
		debugger;
		if(bcrypt.compareSync("nothing",pwd)){
                var deleteQuery = "DELETE FROM users WHERE username='"+req.user.username+"';";
                debugger;
                 connection.query(deleteQuery,function(err,rows,fields){
                 	debugger;
                 	if(err)
                     return;
             });
		}
	    debugger;		
		req.logout();
		user=null;
		res.redirect('/');
	});
	


 app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
 
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));

 app.get('/upload',function(req,res){
fs.readFile('./views/upload.html', function (err, html) {
    if (err) {
        throw err; 
    }  
    
      res.writeHeader(200, {"Content-Type": "text/html"});  
        res.write(html);  
       
});
});

app.post('/api/photo',function(req,res){
  
  if(done==true){
    console.log(req.files);
    debugger;
          User.update({
        _id: user._id
    }, {
        $addToSet: {
            uploads:req.files.userPhoto.name
        }
    }, function (err, num, raw) {
        debugger;
        if (err) console.log(err + ' num : ' + num + ' raw : ' + raw);
        else {
            res.send({
                result: true,
                data:raw
            });
        }
    })
   res.end("File uploaded.");
  }
});

};


/*Handling routes.*/


    
// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
