/* eslint-env node */

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser"); // Import cookie-parser package

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie-parser middleware

// didn't use compass's example cause eslint keeps messing me up
const generateRandomString = function() {
  // Generate a random alphanumeric string of 6 characters
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomString] = longURL; // Add the new key-value pair to urlDatabase
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${randomString}`); // Redirect to the newly created URL
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  console.log(req.params.id);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL] = updatedLongURL; // Update the longURL value for the given shortURL
  res.redirect("/urls"); // Redirect back to the urls_index page
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
  delete urlDatabase[shortURL]; // Delete the URL resource from urlDatabase
  res.redirect("/urls"); // Redirect back to the urls_index page
});

app.post("/login", (req, res) => {
  const username = req.body.username; // Get the username from the request body
  res.cookie("username", username); // Set the "username" cookie with the value
  res.redirect("/urls"); // Redirect back to the /urls page
});

app.post("/logout", (req, res) => {
  res.clearCookie("username"); // Clear the "username" cookie
  res.redirect("/urls"); // Redirect back to the /urls page
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
