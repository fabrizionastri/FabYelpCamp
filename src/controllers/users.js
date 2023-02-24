

const { User } = require('../models/user')  // User Model
const passport = require('passport') // Passport

// FUNCTIONS

const controller = {}

controller.renderRegisterForm = (req, res) => {
  // res.send('• GET /register page');
  res.render('users/register');
}

controller.register =  async (req, res, next) => { // you need to add next as an argument to the callback function. This is required because we are using async/await, instead of the standard catchAsync middleware. If we don't use any error handling, the app will crash if an error occurs.
  try { // a custome try/catch block is used to catch the error. This is required because we are using async/await, instead of the standard catchAsync middleware. If we don't use any error handling, the app will crash if an error occurs.
    console.log('• POST /register page data = username: ' + req.body.username + ', password:' + req.body.password + ', email: ' + req.body.email + '');
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    console.log('user :>> ', user);
    const registeredUser = await User.register(user, password); // User.register() is a static method provided by passport-local-mongoose. It takes two arguments: the user object and the password. It will hash the password and store the user in the database.  The register() method returns a promise. We can use await to wait for the promise to resolve. Once the promise is resolved, we will have the user object stored in the MongoDB database. 
    console.log('registeredUser :>> ', registeredUser);
    req.flash('success', `Welcome to YelpCamp  ${username} !`); 
    // The session is automatically created and the user is logged in. We can access the user object using req.user. The user object is stored in the session. The session is stored in the cookie. The cookie is sent to the browser. The browser stores the cookie. The cookie is sent back to the server with every request. The server can access the session using the cookie. The user object contains the username and the id of the user. We can use this information to display the username on the page.
    req.login(registeredUser, err => { // this requires a call back function. This is required because we are using async/await, instead of the standard catchAsync middleware. If we don't use any error handling, the app will crash if an error occurs.
      if (err) { 
        return next(err);
      }
      res.redirect('/users/login'); 
    }); // req.login() is a method provided by passport. It takes two arguments: the user object and a callback function. The callback function is optional. It is called after the user is logged in. The user object is stored in the session. The session is stored in the cookie. The cookie is sent to the browser. The browser stores the cookie. The cookie is sent back to the server with every request. The server can access the session using the cookie. The session contains the user object. The user object contains the username and the id of the user. We can use this information to display the username on the page.
  }
  catch (e) {
    req.flash('error', e.message);
    res.redirect('register');
  }
}

controller.renderLoginForm =  (req, res) => {
  // res.send('• GET /login page');
  res.render('users/login');
}

controller.login =  (req, res) => {
    console.log('• POST /login page. Data: ' + req.body.username + ', ' + req.body.password + '')
    req.session.returnTo = req.session.returnTo || req.headers.referer || '/campgrounds'; // We store the url of the page the user was trying to access before they were redirected to the /login route. We store this url in the returnTo property of the session. The session is stored in the cookie. The cookie is sent to the browser. The browser stores the cookie. The cookie is sent back to the server with every request. The server can access the session using the cookie. The session contains the returnTo property. The returnTo property contains the url of the page the user was trying to access before they were redirected to the /login route.
    req.flash('success', `Welcome back ${req.body.username} !`);  // The session is automatically created and the user is logged in. We can access the user object using req.user. The user object is stored in the session. The session is stored in the cookie. The cookie is sent to the browser. The browser stores the cookie. The cookie is sent back to the server with every request. The server can access the session using the cookie. The user object contains the username and the id of the user. We can use this information to display the username on the page.
    const redirectUrl = req.session.returnTo || '/campgrounds'; 
    delete req.session.returnTo; // We delete the returnTo property from the session. This is required because we don't want to redirect the user to the /login route after they have logged in. We want to redirect them to the page they were trying to access before they were redirected to the /login route.
    res.redirect('/campgrounds'); // We redirect the user to the page they were trying to access before they were redirected to the /login route.
}

controller.logout = (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); } // req.logout() is a method provided by passport. It removes the user object from the session. The session is stored in the cookie. The cookie is sent to the browser. The browser stores the cookie. The cookie is sent back to the server with every request. The server can access the session using the cookie. The session contains the user object. The user object contains the username and the id of the user. We can use this information to display the username on the page.
      req.flash('success', 'Successfully logged out!')
      res.redirect('/campgrounds');
  });
}

module.exports = controller

