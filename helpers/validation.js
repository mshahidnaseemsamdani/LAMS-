'use strict';

  module.exports = function(formidable, path) {
    return {
      getLoginValidation: (req, res, next) => {
        
        req.checkBody('email', 'Email is Invalid').isEmail();
        req.checkBody('email', 'Email must not be empty').notEmpty();
        req.checkBody('password', 'Password must not be empty').notEmpty();
        req.checkBody('password', 'Password must be 8 or more characters longer').isLength({min : 8});           

        req.getValidationResult().then((result) => {
          
          var errors = result.array();
          var messages = [];
          errors.forEach((error) => {
            messages.push(error.msg);
          });
		
          if(messages.length > 0) {
	    messages = messages.map((str, index) => ({ name: str}));
	    res.render("login", {hasErrors : true, messages : messages});
          }
          else {
            return next();
          }
        }).catch((err) => {
          throw err;
        })
      },

      getSignupValidation : function(req, res, next) {
      
        req.checkBody('first_name', 'First name is required').notEmpty();
	      req.checkBody('last_name', 'Last name is required').notEmpty();
        req.checkBody('email', 'Email is Invalid').isEmail();
        req.checkBody('email', 'Email must not be empty').notEmpty();
        req.checkBody('password', 'Password must not be empty').notEmpty();
        req.checkBody('password', 'Password must be 8 or more characters longer').isLength({min : 8});
            
	      
	      req.getValidationResult().then( (result) => {
	        var errors = result.array();
          var messages = [];
          errors.forEach(function(error){
            messages.push(error.msg);
          });

          if(messages.length > 0) {
             req.flash('errors', messages);
             res.redirect('/signup');
          }
          else {
            next();
          }
        }).catch( (err) => {
          if(err) 
            throw err;
        });
      },
		
      resetPassword : function(req, res, next) {
        req.checkBody('password', 'Password must not be empty').notEmpty();
        req.checkBody('confirm_password', 'Password must not be empty').notEmpty();
        req.checkBody('password', 'Password must be 6 or more characters longer').isLength({min: 8});
        req.checkBody('confirm_password', 'Confirm Password must be 6 or more characters longer').notEmpty({min: 8});
            
        req.getValidationResult().then((result) => {
          var errors = result.array();
          var messages = [];
          errors.forEach((error) => {
            messages.push(error.msg);
          });
	
	  if(req.body.password != req.body.confirm_password) {
	    messages.push("Password does not match");
	  }
					
          if(messages.length > 0) {
	    messages = messages.map((str, index) => ({ name: str}));
            res.render("reset_password", {hasErrors : true, messages : messages, user: req.body.user});
          }
          else {
            next();
          }
        }).catch((err) => {
          throw err;
        })
      }
    }
  }
