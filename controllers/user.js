'use strict';

module.exports = function(passport, validation, email, User, Lawyer) {
  return {
    setRouting : function(router) {
      router.get('/', this.homePage);
       //about
       router.get('/about', this.about);

        //services
        router.get('/services', this.services);

          //case studies
          router.get('/cases', this.cases);


          //signup
          
           //registerationform
           router.get('/registractionform', this.registractionform);

           //blog
                    router.get('/blog', this.blog);

                    //blog-details
        router.get('/blog_details', this.blog_details);

            //elements
        router.get('/elements', this.elements);

                    //case-details
        router.get('/cases_details', this.cases_details);

         
        //contact
          router.get('/contact', this.contact);

        //facebook

         router.get('/auth/facebook', this.authFacebook);
      
      router.get('/auth/facebook/callback', this.facebookLoginCallback);

  //profile
  router.get('/profile', this.profile);



    //dashboard
     //router.get('/dashboard', this.dashboard);


      
      router.get('/auth/google', this.googleLoginRedirect);
      router.get('/auth/google/callback', this.googleLoginCallback);
			
      router.get('/login', this.loginView);
      router.post('/login', validation.getLoginValidation, this.login);
            
      router.get('/signup', this.lawyerSignupView);
      router.post('/signup', validation.getSignupValidation, this.lawyerSignup);			
      
      router.get('/forgot_password', this.forgotPasswordView);
      router.post('/forgot_password', this.forgotPassword);
      router.get('/auth/reset/:token', this.verifyToken);
			
      router.post('/reset_password', validation.resetPassword, this.resetPassword);
			
			
      router.get('/dashboard', this.dashboard);
      router.get('/logout', this.logOut);
    },
    
    homePage : function(req, res) {
      res.render("index.ejs");
    },
//route of about
    about : function(req, res){
      res.render('about.ejs');
    },

     //route of services
      services : function(req, res){
         res.render('services.ejs');
    },

    //route of case studies
   cases : function(req, res){
  res.render('cases.ejs');
    },


    //route of signup
   lawyerSignupView : function(req, res){
      let errors = req.flash('errors');
      console.log(errors);
      res.render("signup", {hasErrors: errors.length > 0, errors: errors});
    },
    lawyerSignup: function(req, res) {
      let lawyer = new Lawyer();
      
      lawyer.first_name = req.body.first_name;
      lawyer.last_name = req.body.last_name;
      lawyer.email = req.body.email;
      
      lawyer.password = lawyer.encryptPassword(req.body.password);
      
      lawyer.cnic = req.body.cnic;
      lawyer.contact_number = req.body.contact_number;

      lawyer.save().then( savedLawyer => {
        console.log(savedLawyer);
      }).catch( e => {
        console.log(e);
      });
    },


          //route of registractionform
          registractionform : function(req, res){
    res.render('registractionform.ejs');
      },


         //route of blog
         blog : function(req, res){
          res.render('blog.ejs');
     },

     //route of blog_details
     blog_details : function(req, res){
      res.render('blog_details.ejs');
    },


    //route of elements
    elements : function(req, res){
      res.render('elements.ejs');
    },


    //route of case-details
    cases_details : function(req, res){
      res.render('cases_details.ejs');
    },



 
          //route of contact
          contact : function(req, res){
            res.render('contact.ejs');
       },
   

       //route of facebook
      authFacebook : passport.authenticate('facebook', {
        scope : 'email'  
    }),

        //route profile
   profile : function(req, res){
    res.render('profile.ejs');
      },
  
//route dashboard
   dashboard : function(req, res){
  res.render('dashboard.ejs');
    },
     
    facebookLoginCallback : passport.authenticate('facebook', {
      successRedirect: '/dashboard',
      failureRedirect : '/'
  }),

  
    loginView : function(req, res) {
      let messages = req.flash('error');
      messages = messages.map((str, index) => ({ name: str}));
      res.render("login", {hasErrors : (messages.length > 0) ? true : false, messages : messages});
    },

    login : passport.authenticate('local.login', {
      successRedirect : '/dashboard',
      failureRedirect : '/login',
      failureFlash : true
    }),

    signUpView : function(req, res) {
      let messages = req.flash('error');
      messages = messages.map((str, index) => ({ name: str}));
      res.render('signup', { hasErrors: (messages.length > 0) ? true : false, messages: messages});
    },
    //HI
    signUp : passport.authenticate('local.signup', {
      successRedirect : '/login',
      failureRedirect : '/signup',
      failureFlash : true
    }),
		
    googleLoginRedirect : passport.authenticate('google', {
      scope: ['email', 'profile']
    }),
	
    googleLoginCallback : passport.authenticate('google', {
      successRedirect: '/dashboard',
      failureRedirect : '/login'
    }),
		
    forgotPasswordView: function(req, res) {
      let messages = req.flash('error');
      messages = messages.map((str, index) => ({ name: str}));
      res.render("forgot_password", {hasErrors : (messages.length > 0) ? true : false,hasSuccess: false, messages : messages});
    },
	  
    forgotPassword: function(req, res) {
      User.findOne({email: req.body.email}).then(function(user){
        if(!user) {
	  req.flash('error', ['User with this email does not exist']);
	  res.redirect('/forgot_password');
	}
	else if(user) {
	  user.generatePasswordReset();
	  user.save().then(function(savedUser) {
	    let link = "http://" + req.headers.host + "/auth/reset/" + savedUser.resetPasswordToken;
						
            let mailSender = new email.MailSender();
            const mailOptions = {
	      from: 'rajivkumar.mel@gmail.com',
	      to: savedUser.email,
	      subject: "ICrowd Web Application",
	      text: `Hi ${user.fullname} \n Please click on the following link ${link} to reset your password. \n\n If you did not request this, please ignore this email and your password will remain unchanged.\n`
	    };
						
            mailSender.sendMail(mailOptions, function(error, info){
	      if(info) {
                res.render("forgot_password", {hasErrors: false, hasSuccess: true, messages: [{name:'Reset link sent successfully. Check your email'}]});
	      }
	      if(error) {
	        console.log(error);
	      }
	    });
	  });
	}
	else {}
      })
    },
		
    verifyToken: function(req, res) {
      User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}).then(function(user) {
        if(!user) {
	  res.render('error404');
 	}
	else if(user) {
	  res.render("reset_password", {user: user._id, hasErrors: false});
	}
	else {
	}
      });
    },
		
    resetPassword: function(req, res){
      User.findOne({_id: req.body.user}).then(function(user) {
	user.password = user.encryptPassword(req.body.password);
	user.resetPasswordToken = '';
	user.resetPasswordExpires = '';
				
	user.save().then( (savedUser) => {
	  res.redirect('/login');
      	});
      }).catch(function(err) {
        res.render("error404");
      });
    },
		
    dashboard: function(req, res) {
      res.render("dashboard.ejs", {user: req.user});
    },	    
    
    logOut: function (req, res) {
      req.logout();
      req.session.destroy((err) => {
      res.clearCookie('connect.sid', { path: '/' });
        res.redirect('/');
      });
    },
  }
}
