const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { restart } = require('nodemon');
const bcrypt = require('bcryptjs');
const { generateRandomString, checkUserEmails, urlsForUser} = require('./helpers');
const PORT = 8080;

app.set("view engine", "ejs");

const users = {};

const urlDatabase = {};

//
// Middleware
//

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "tinyApp",
  keys: ['Usually', 'These', 'Are', 'a', 'secret'],
  maxAge: 60 * 60 * 1000 // This will make the cookie last 1hr
}));

//
// Routes: GET
//

// Hompage redirects to login page or urls depending on login status
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Redirect to a tinyURLs associated longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let keys = Object.keys(urlDatabase);
  if (keys.includes(shortURL)) {
    const longURL = urlDatabase[shortURL]["longURL"];
    res.redirect(longURL);
  } else {
    res.status(404).send("Tiny URL does not exist.");
  }
});

// View an accounts list of tinyURLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, userUrls: urlsForUser(req.session.userId, urlDatabase), userId: req.session.userId, users };
  res.render("urls_index", templateVars);
});

// Open the form to create a new tinyURL
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, userUrls: urlsForUser(req.session.userId, urlDatabase), userId: req.session.userId, users };
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

// View a tinyURL and it's associated longURL, and edit form
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, urls: urlDatabase, userUrls: urlsForUser(req.session.userId, urlDatabase), userId: req.session.userId, users };
  let shortURL = req.params.shortURL;
  let keys = Object.keys(urlDatabase);
  if (!keys.includes(shortURL)) {
    res.status(404).send("Tiny URL does not exist");
  } else if (req.session.userId !== urlDatabase[shortURL].userId) {
    res.status(401).send("You don't own this Tiny URL");
  } else {
    res.render("urls_show", templateVars);
  }
});

// Bring up the registraion form
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, userId: req.session.userId, users };
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    res.render("user_reg", templateVars);
  }
});

// Bring up the login form
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, userId: req.session.userId, users };
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    res.render("user_login", templateVars);
  }
});

//
// Routes: POST
//

// Create a new url
app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    res.status(400).send("Only registered users may create tiny URLs, please log in");
  } else {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {
      longURL: longURL,
      userId: req.session.userId
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// Delete a url from the database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!req.session.userId) {
    res.status(401).send("Only registered users may delete tiny URLs, please log in");
  } else if (req.session.userId !== urlDatabase[shortURL].userId) {
    res.status(401).send("You don't own this Tiny URL");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

// Edit a tiny urls associated longURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (!req.session.userId) {
    res.status(401).send("Only registered users may edit tiny URLs, please log in");
  } else {
    urlDatabase[shortURL] = urlDatabase[shortURL] = {
      longURL: longURL,
      userId: req.session.userId
    };
    res.redirect("/urls");
  }
});

// Send information to create a new user account
app.post("/register", (req, res) => {
  let newUserId = generateRandomString();
  let newUserEmail = req.body.email;
  let newUserPassword = req.body.password;
  let hashedPassword = bcrypt.hashSync(newUserPassword, 10);
  if (newUserEmail === '' || newUserPassword === '') {
    res.status(400).send("Email or Password field cannot be empty");
  }
  if (checkUserEmails(newUserEmail, users)) {
    res.status(400).send("User Email already exists");
  } else {
    users[newUserId] = {
      id: newUserId,
      email: newUserEmail,
      password: hashedPassword
    };
    req.session.userId = newUserId;
    res.redirect("/urls");
  }
});

// Send info to login to an existing user account
app.post("/login", (req, res) => {
  const candidateUserEmail = req.body.email;
  const candidatePassword = req.body.password;
  let user = checkUserEmails(candidateUserEmail, users);
  if (!user) {
    res.status(403).send("That user does not exist");
  } else {
    let hashCheck = bcrypt.compareSync(candidatePassword, user.password);
    if (candidateUserEmail === user.email &&
      hashCheck) {
      req.session.userId = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Your email or password was incorrect");
    }
  }
});

// Logout of a user account and clear session cookies
app.post("/logout", (req, res) => {
  // res.clearCookie("userId");
  req.session = null;
  res.redirect("/urls");
});

// Listen command to start server
app.listen(PORT, () => {
  console.log(`TinyAPP listening on port ${PORT}!`);
});