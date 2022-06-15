const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = 8080;

app.set("view engine", "ejs");

const users = {
  "GtNXXT": {"id":"GtNXXT", "email":"test@test.com", "password":"12345"}
};

const urlDatabase = {
  "B2xVn2": {"longURL": "http://www.lighthouselabs.ca", "userId": "GtNXXT"},
  "9sm5xK": {"longURL": "http://www.google.com", "userId": "GtNXXT"}
};

const checkUserEmails = (userEmail) => {
  for (let u in users) {
    if (userEmail === users[u].email) {
      return users[u];
    }
  }
  return null;
};

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let string = '';
  for (let i = 0; i < 6; i++) {
    string += chars[Math.floor(Math.random() * chars.length)];
  }
  return string;
};

//
// Middleware
//

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//
// Routes: GET
//

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies["userId"], users };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies["userId"], users };
  if (!req.cookies["userId"]) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL, user_id: req.cookies["userId"], users };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies["userId"], users };
  if (req.cookies["userId"]) {
    res.redirect("/urls");
  }
  res.render("user_reg", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies["userId"], users };
  if (req.cookies["userId"]) {
    res.redirect("/urls");
  }
  res.render("user_login", templateVars);
});

//
// Routes: POST
//

app.post("/urls", (req, res) => {
  if (!req.cookies["userId"]) {
    res.status(400).send("Only registered users may create tiny URLs, please log in");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let newUserId = generateRandomString();
  let newUserEmail = req.body.email;
  let newUserPassword = req.body.password;
  if (newUserEmail === '' || newUserPassword === '') {
    res.status(400).send("Email or Password field cannot be empty");
  }
  if (checkUserEmails(newUserEmail)) {
    res.status(400).send("User Email already exists");
  } else {
    users[newUserId] = {
      id: newUserId,
      email: newUserEmail,
      password: newUserPassword
    };
    res.cookie("userId", newUserId);
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const candidateUserEmail = req.body.email;
  const candidatePassword = req.body.password;
  let user = checkUserEmails(candidateUserEmail);
  if (!user) {
    res.status(403).send("That user does not exist");
  } else {
    if (candidateUserEmail === user.email &&
      candidatePassword === user.password) {
      console.log("req.cookies", req.cookies);
      res.cookie("userId", user.id);
      res.redirect("/urls");
    } else {
      res.status(403).send("Your email or password was incorrect");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/urls");
});

// Listen command to start server
app.listen(PORT, () => {
  console.log(`TinyAPP listening on port ${PORT}!`);
});