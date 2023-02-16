require('dotenv').config()
const express = require('express');
const router = express.Router();
const { body, validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")
const UserModel = require("../models/user")
const MessageModel = require("../models/message")
const async = require("async")
const passport = require("passport")

// GET home page.
router.get('/', async (req, res, next) => {
  let usersArray = []
  const posts = await MessageModel.find().sort({ date: 'desc' })
  for (const post of posts) {
    let user = await UserModel.findById(post.user)
    usersArray.push(`${user.name} ${user.surname}`)
  }
  res.render('index', { posts: posts, usernames: usersArray });
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

// GET new post page
router.get('/new-post', (req, res, next) => {
  res.render('new-post')
})

/// POST new post
router.post('/new-post', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Title must be specified and be between 1 and 20 characters long."),
  body("text")
    .trim()
    .isLength({ min: 5 })
    .withMessage("The post must be at least 5 characters long."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("new-post", {
        post: req.body,
        errors: errors.array(),
      });
      return;
    }
    const post = new MessageModel({
      title: req.body.title,
      user: res.locals.currentUser._id,
      date: new Date(),
      text: req.body.text
    })
      
    post.save(err => {
      if (err) { 
        return next(err);
      }
      res.redirect("/");
    })
  }
])

// GET Profile page
router.get("/profile", (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.redirect("/login");
  }
  res.render("profile", {error: req.query.error})
})

// POST membership change
router.post("/profile", async (req, res, next) => {
  if (req.body.membership_code == process.env.MEMBERSHIP_CODE) {
    await UserModel.findOneAndUpdate({ _id: res.locals.currentUser._id }, { membership: true } )
    res.redirect("/")
  }
  res.redirect(`/profile?error=membership`)
})

// POST admin status change
router.post("/admin", async (req, res, next) => {
  if (req.body.admin_code == process.env.ADMIN_CODE) {
    await UserModel.findOneAndUpdate({ _id: res.locals.currentUser._id }, { isAdmin: true } )
    res.redirect("/")
  }
  res.redirect(`/profile?error=admin`)
})

// POST deletion of a post
router.post("/", async (req, res, next) => {
  if (res.locals.currentUser.isAdmin) {
    await MessageModel.findByIdAndDelete(req.body.post_id)
    res.redirect("/")
  }
})

module.exports = router;
