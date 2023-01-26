const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080;

const bcrypt = require("bcryptjs");
const { urlDatabase, users } = require("./databases");
const {
  generateRandomString,
  getUserByEmail,
  getUserByID,
  urlsForUser,
  checkIfURLIsVald,
  checkIfUserHasPostPrivledges,
} = require("./serverHelpers");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["keyyyy"],
  })
);

//-------- /url routes --------//

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const foundUser = getUserByID(users, req.session.user_id);

  let urls;
  if (foundUser) {
    urls = urlsForUser(urlDatabase, foundUser.id);
    console.log("urls", urls);
  }

  const templateVars = {
    urls: urls,
    user: foundUser,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const foundUser = getUserByID(users, req.session.user_id);
  const templateVars = {
    user: foundUser,
  };
  if (!foundUser) {
    res.redirect("/urls");
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const { id } = req.params;
  const foundUser = getUserByID(users, req.session.user_id);
  const canView = checkIfUserHasPostPrivledges(id, foundUser);
  let url;

  if (!canView) {
    return res.redirect(403, "/urls");
  }

  if (foundUser) {
    let urls = urlsForUser(urlDatabase, foundUser.id);
    url = urls[id].longURL;
  }

  const templateVars = {
    id,
    longURL: url,
    user: foundUser,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = checkIfURLIsVald(req.params.id);
  const errorMessage =
    "<p>This URL does not exist! Please submit a valid URL.</>";
  if (!longURL) {
    return res.status(404).send(`${errorMessage}`);
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  const foundUser = getUserByID(users, req.session.user_id);
  const errorMessage =
    "<p>Please log in to use the url shortening function!</p> <p>Click <a href='/url>here</a> to return to home page.</p>";
  if (!foundUser) {
    return res.status(404).send(`${errorMessage}`);
  }

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:id/update", (req, res) => {
  const { newLongURL } = req.body;
  const { id } = req.params;
  const foundUser = getUserByID(users, req.session.user_id);
  const canUpdate = checkIfUserHasPostPrivledges(id, foundUser);
  if (!canUpdate) {
    return res.redirect(403, "/urls");
  }

  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;

  const foundUser = getUserByID(users, req.session.user_id);
  const canDelete = checkIfUserHasPostPrivledges(id, foundUser);
  if (!canDelete) {
    return res.redirect(403, "/urls");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

//-----------/login/out routes ------------//

app.get("/login", (req, res) => {
  const foundUser = getUserByID(users, req.session.user_id);
  let templateVars = {
    user: getUserByEmail(users, req.body.email),
  };
  if (foundUser) {
    return res.redirect("/urls");
  }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(users, email);
  const doesPasswordMatch = bcrypt.compareSync(password, user.password);
  if (!user) {
    console.log("Error 403. This user does not exist");
    return res.redirect(403, "/login");
  }
  if (!doesPasswordMatch) {
    console.log("Error 403. The password does not match.");
    return res.redirect(403, "/login");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//-------- /registration routes --------//

app.get("/register", (req, res) => {
  const foundUser = getUserByID(users, req.session.user_id);
  let templateVars = {
    user: getUserByEmail(users, req.body.email),
  };
  if (foundUser) {
    return res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.password === "") {
    console.log("Password form field was blank. No new user object created");
    return res.redirect(400, "/register");
  }

  const id = generateRandomString();
  const { email } = req.body;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  if (email === "") {
    console.log("Email form field was blank. No new user object created");
    return res.redirect(400, "register");
  }

  if (getUserByEmail(users, email)) {
    console.log("This email is already taken. No new user object created");
    return res.redirect(400, "/register");
  }

  users[id] = {
    id,
    email,
    password: hashedPassword,
  };

  req.session.user_id = id;
  res.redirect("urls");
});

//---- will log once server connects ----//
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
