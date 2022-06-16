const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { restart } = require('nodemon');
const bcrypt = require('bcryptjs');
const { generateRandomString, checkUserEmails, urlsForUser} = require('./helpers')
const PORT = 8080;

app.set("view engine", "ejs");

const users = {};

const urlDatabase = {};

//
// Middleware
//

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession( {
  name: "tinyApp",
  keys: ['Ususally', 'These', 'Are', 'a', 'secret'],
  maxAge: 24 * 60 * 60 * 1000 // This will make the cookie last 24hrs
}));

//
// Routes: GET
//

app.get("/", (req, res) => {
  res.redirect("/urls");
});

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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, userUrls: urlsForUser(req.session.userId, urlDatabase), user_id: req.session.userId, users };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, userUrls: urlsForUser(req.session.userId, urlDatabase), user_id: req.session.userId, users };
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, urls: urlDatabase, userUrls: urlsForUser(req.session.userId, urlDatabase), user_id: req.session.userId, users };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.session.userId, users };
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    res.render("user_reg", templateVars);
  }
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.session.userId, users };
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    res.render("user_login", templateVars);
  }
});

//
// Routes: POST
//

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

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.userId) {
    res.status(401).send("Only registered users may delete tiny URLs, please log in")
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (!req.session.userId) {
    res.status(401).send("Only registered users may edit tiny URLs, please log in")
  } else {
    urlDatabase[shortURL] = urlDatabase[shortURL] = {
        longURL: longURL,
        userId: req.session.userId
      };;
    res.redirect("/urls");
  }
});

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
    // res.cookie("userId", newUserId);
    req.session.userId = newUserId;
    res.redirect("/urls");
  }
});

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
      // res.cookie("userId", user.id);
      req.session.userId = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Your email or password was incorrect");
    }
  }
});

app.post("/logout", (req, res) => {
  // res.clearCookie("userId");
  req.session = null;
  res.redirect("/urls");
});

// Listen command to start server
app.listen(PORT, () => {
  console.log(`TinyAPP listening on port ${PORT}!`);
});