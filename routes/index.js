const express = require('express');
const router = express.Router();
const { body, validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")
const UserModel = require("../models/user")
const async = require("async")
const passport = require("passport")

// GET home page.
router.get('/', (req, res, next) => {
  res.render('index', { user: req.user, });
});

// GET registration page
router.get('/register', function(req, res, next) {
  res.render('register')
})

// POST new user info
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 6 })
    .escape()
    .withMessage("Name must be specified and at least 6 characters long."),
  body("surname")
    .trim()
    .isLength({ min: 6 })
    .escape()
    .withMessage("Surname must be specified and at least 6 characters long."),
  body("email")
    .trim()
    .isLength({ min: 1 })
    .isEmail()
    .escape()
    .withMessage("Email must be specified in the proper format."),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .escape()
    .withMessage("Password must be specified and at least 8 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      res.render("register", {
        user: req.body,
        errors: errors.array(),
      });
      return;
    }
    async.parallel({
      hashedPassword(callback) {
        bcrypt.hash(req.body.password, 10, callback)
      },
    }, (err, results) => {
      if (err) {
        return next(err)
      }

      const user = new UserModel({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        password: results.hashedPassword,
        membership: false
      })
      
      user.save(err => {
        if (err) { 
          return next(err);
        }
        res.redirect("/");
      })
    })
  }
])

// GET login page
router.get('/login', (req, res, next) => {
  console.log(req.session.messages)
  res.render('login')
})

// POST login details and log the user in
router.post('/login', 
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureMessage: true
    })
, (req, res, next) => {
  res.redirect('/')
})

// GET logout and log the user out
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if(err) {
      return next(err)
    }
    res.redirect('/')
  })
})

module.exports = router;
