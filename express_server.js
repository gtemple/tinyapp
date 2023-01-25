const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const generateRandomString = () => {
  let string = '';
  const cipher = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let i = 0;
  while (i < 6) {
    string += cipher.charAt(Math.floor(Math.random() * cipher.length));
    i++;
  }

  if (urlDatabase.hasOwnProperty(string)) { //checks if the id already exists. If so, runs the function again
    generateRandomString();
  }

  return string;
};

//--------- "databases" --------//

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

//-------- /url routes --------//

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:id/update", (req, res) => {
  const newLongURL = req.body.newLongURL;
  urlDatabase[req.params.id] = newLongURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params);
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//-----------login/logout opperations ------------//

app.post("/login", (req, res) => {
  const username = req.body.username;

  res.cookie('name', username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  const username = req.body.username;
  
  res.clearCookie('name', username)
  res.redirect('/urls');
});

//-------- registration routes --------//

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies,
  };
  res.render('register', templateVars)
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email
  const password = req.body.password;

  users[id] = { id, email, password };
  res.cookie('name', id);
  console.log(users[id]);
  console.log(users);
  res.redirect("urls");

});

//---- will log once server connects ----//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});