/* eslint-env node */

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Generate a random alphanumeric string of 6 characters
const generateRandomString = function() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {}; // User object to store registered users

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const username = req.cookies.username;
  const templateVars = {
    username,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomString] = longURL;
  console.log(req.body);
  res.redirect(`/urls/${randomString}`);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies.username;
  const templateVars = {
    username
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const username = req.cookies.username;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL] = updatedLongURL;
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL not found");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if the username exists in the users object
  const user = Object.values(users).find(user => user.username === username);

  if (user && user.password === password) {
    res.cookie("username", username);
    res.redirect("/urls");
  } else {
    res.status(401).send("Invalid username or password");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const username = req.cookies.username;
  const templateVars = {
    username
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if the username or password is empty
  if (!username || !password) {
    res.status(400).send("Username and password are required.");
    return;
  }

  // Check if the username already exists
  const user = Object.values(users).find(user => user.username === username);
  if (user) {
    res.status(400).send("Username already exists.");
    return;
  }

  // Create a new user object and add it to the users object
  const userId = generateRandomString();
  const newUser = {
    id: userId,
    username,
    password
  };
  users[userId] = newUser;

  res.cookie("username", username);

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const username = req.cookies.username;
  const templateVars = {
    username
  };
  res.render("login", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
