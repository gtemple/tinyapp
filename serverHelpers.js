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

module.exports = { generateRandomString, findUserByEmail, findUserByID, urlsForUser, checkIfURLIsVald }