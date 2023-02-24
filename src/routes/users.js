const express = require('express') // Express
const router = express.Router() // Router
const passport = require('passport') // Passport

const { catchAsync } = require('../utils/errors'); // import the catchAsync function

const users = require('../controllers/users'); // import the users controller

// ROUTES

router.route('/register')
  .get(users.renderRegisterForm)
  .post(catchAsync(users.register));


router.route('/login')
  .get(users.renderLoginForm)
  .post(passport.authenticate('local', {failureFlash:true, failureRedirect:"/home"}), users.login) // passport.authenticate() is a middleware that authenticates the user. It takes two arguments: the strategy and an object with options. The strategy is the name of the strategy we want to use. In this case, we are using the local strategy. The options object is optional. We are using it to set the failureFlash option to true. This will allow us to display flash messages using the message option. The message option is set to 'Invalid username or password'. The failureRedirect option is set to '/login'. This will redirect the user to the /login route if authentication fails.


router.route('/logout')
  .get(users.logout);

module.exports = router;
