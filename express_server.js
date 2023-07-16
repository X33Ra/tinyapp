/* eslint-env node */

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Helper function to generate a random alphanumeric string of 6 characters
const generateRandomString = () => {
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

// Helper function to check if a user exists in the users object
const getUserByEmail = (email) => {
  return Object.values(users).find((user) => user.email === email);
};

// Helper function to check if user credentials are valid
const validateCredentials = (email, password) => {
  const user = getUserByEmail(email);
  return user && user.password === password;
};

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
  const userId = req.cookies.user_id;
  if (!userId) {
    res.redirect("/login");
    return;
  }
  next();
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", requireLogin, (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {
    user: users[userId],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", requireLogin, (req, res) => {
  const randomString = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomString] = longURL;
  console.log(req.body);
  res.redirect(`/urls/${randomString}`);
});

app.get("/urls/new", requireLogin, (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {
    user: users[userId]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", requireLogin, (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userId]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", requireLogin, (req, res) => {
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

app.post("/urls/:id/delete", requireLogin, (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (validateCredentials(email, password)) {
    const user = getUserByEmail(email);
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid email or password");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {
    user: users[userId]
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send("Email and password are required.");
    return;
  }

  if (getUserByEmail(email)) {
    res.status(400).send("Email already exists.");
    return;
  }

  const userId = generateRandomString();
  const newUser = {
    id: userId,
    email,
    password
  };
  users[userId] = newUser;

  res.cookie("user_id", userId);

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;
  const templateVars = {
    user: users[userId]
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
