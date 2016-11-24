// app/routes.js
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);

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
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		var info = JSON.parse(req.user.roles).roles;
		info = info.split(';');
		var indexOfE = info.indexOf('');
		if(indexOfE == 0){
			info.splice(indexOfE, 1);
		}
		req.user.roles = info;
		for (var i in info){
			if(info[i] == 'SUPER_ADMIN')
				req.user.isSuperAdmin = true;
		}
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// =====================================
	// ADMIN ==============================
	// =====================================
	app.post('/showAdmin', isLoggedIn, function(req, res) {
		// console.log(res.locals.user.username);
		connection.query("SELECT user_id, username, roles FROM users, user_roles WHERE users.id = user_roles.user_id", function(err, rows){
			var userDetails = [];
			var allRoles = ['SUPER_ADMIN', 'ADMIN', 'USER'];
			for (var i = 0; i < rows.length; i++) {
				var info = JSON.parse(rows[i].roles).roles;
				info = info.split(';');
				var indexOfE = info.indexOf('');
				if(indexOfE == 0){
					info.splice(indexOfE, 1);
				}
				rows[i].roles = info;
				rows[i].canRoles = allRoles.filter(x => info.indexOf(x) < 0 );
				if(rows[i].username !== 'root')
					userDetails.push(rows[i]);
			}
			res.render('admin.ejs', {
				user : res.locals.user.username,
				details : userDetails
			});
		});
	});


	app.post('/changeRole/:id', isLoggedIn, function(req, res) {
		var role = Object.keys(req.body)[0];
		var id = req.url.split('/')[2];

		// toggle the role of this id according to the role
		connection.query("SELECT * from user_roles WHERE user_id = ?",[id], function(err, roles){
				var info = JSON.parse(roles[0].roles).roles;
				info = info.split(';');
				var newInfo = [];
				var indexOfRole = info.indexOf(role);
				if(indexOfRole >= 0){
					info.splice(indexOfRole, 1);
				} else {
					info.push(role);
				}
				var newEntry = {
					roles:`${info.join(';')}`
				}
				newEntry = JSON.stringify(newEntry);
				connection.query("UPDATE user_roles SET roles= ? WHERE user_id=?",[newEntry, id],function(err, roles) {
						connection.query("SELECT user_id, username, roles FROM users, user_roles WHERE users.id = user_roles.user_id", function(err, rows){
							var userDetails = [];
							var allRoles = ['SUPER_ADMIN', 'ADMIN', 'USER'];
							for (var i = 0; i < rows.length; i++) {
								var info = JSON.parse(rows[i].roles).roles;
								info = info.split(';');

								var indexOfE = info.indexOf('');
								if(indexOfE == 0){
									info.splice(indexOfE, 1);
								}
								rows[i].roles = info;
								rows[i].canRoles = allRoles.filter(x => info.indexOf(x) < 0 );
								if(rows[i].username !== 'root')
								userDetails.push(rows[i]);
							}
							res.render('admin.ejs', {
								user : res.locals.user.username,
								details : userDetails
							});
						});
				});
		});

	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
