const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//--------- "databases" --------//

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "test",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "test2",
  },
};

//-------- Helper Functions --------//


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

const findUserByEmail = (userDatabase, email) => {
  for (let user in userDatabase) {
    if (email === userDatabase[user].email) {
      return userDatabase[user];
    }
  }
  return null;
};

const findUserByID = (userDatabase, id) => {
  for (let user in userDatabase) {
    if (id === userDatabase[user].id) {
      return userDatabase[user];
    }
  }
  return false;
};

const urlsForUser = (urlDatabase, user) => {
  userUrls = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === user) {
      userUrls[urlId] = {
        longURL: urlDatabase[urlId].longURL
      }
    }
  }
  return userUrls;
};

const checkIfURLIsVald = (url) => {
  return urlDatabase.hasOwnProperty(url) ? urlDatabase[url].longURL : false;
};


//-------- /url routes --------//

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  console.log(urlDatabase);
  const foundUser = findUserByID(users, req.cookies['user_id']);
  let urls; 
  if (foundUser) {
    urls = urlsForUser(urlDatabase, foundUser.id);
    console.log('urls', urls);
  }
  const templateVars = {
    urls: urls,
    user: foundUser
  };
  console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const foundUser = findUserByID(users, req.cookies['user_id']);
  const templateVars = {
    user: foundUser
  };
  if (!foundUser) {
    res.redirect('/urls')
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const foundUser = findUserByID(users, req.cookies['user_id']);
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: foundUser,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = checkIfURLIsVald(req.params.id)
  const errorMessage = "<p>This URL does not exist! Please submit a valid URL.</>";
  if (!longURL) {
    return res.status(404).send(`${errorMessage}`);
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  const foundUser = findUserByID(users, req.cookies['user_id'])
  const errorMessage = "<p>Please log in to use the url shortening function!</p> <p>Click <a href='/url>here</a> to return to home page.</p>"
  if (!foundUser) {
    return res.status(404).send(`${errorMessage}`)
  }

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:id/update", (req, res) => {
  const newLongURL = req.body.newLongURL;
  urlDatabase[req.params.id].longURL = newLongURL;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//-----------/login/out routes ------------//

app.get("/login", (req, res) => {
  const foundUser = findUserByID(users, req.cookies['user_id']);
  let templateVars = {
    user: findUserByEmail(users, req.body.email),
  };
  if (foundUser) {
    return res.redirect('/urls')
  }
  res.render('login', templateVars)
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  let user = findUserByEmail(users, userEmail);
  if (!user) {
    console.log('Error 403. This user does not exist')
    return res.redirect(403, '/login');
  }
  if (userPassword !== user.password || userPassword === '') {
    console.log('Error 403. The password does not match.')
    return res.redirect(403, '/login');
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/login');
});

//-------- /registration routes --------//


app.get("/register", (req, res) => {
  const foundUser = findUserByID(users, req.cookies['user_id']);
  let templateVars = {
    user: findUserByEmail(users, req.body.email),
  };
  if (foundUser) {
    return res.redirect('/urls')
  }
  res.render('register', templateVars)
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
 
  if (email === '') {
    console.log("Email form field was blank. No new user object created")
    return res.redirect(400, "register")
  };
  if (password === '') {
    console.log("Password form field was blank. No new user object created")
    return res.redirect(400, "/register")
  };
  if (findUserByEmail(users, email)) {
    console.log("This email is already taken. No new user object created")
    return res.redirect(400, "/register")
  }

  users[id] = { id, email, password };
  res.cookie('name', id);
  res.redirect("urls");

});

//---- will log once server connects ----//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});