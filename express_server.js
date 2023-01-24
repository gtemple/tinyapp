const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const generateRandomString = () => {
  let string = '';
  const cipher = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let i = 0;
  while (i < 6) {
    string += cipher.charAt(Math.floor(Math.random() * cipher.length));
    i++;
  }
  return string;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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

//-----------login opperations ------------//

app.post("/login", (req, res) => {
  console.log(req.body.username);
  const username = req.body.username;

  res.cookie('name', username);
  res.redirect('/urls');
});


//---- will log once server connects ----//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
