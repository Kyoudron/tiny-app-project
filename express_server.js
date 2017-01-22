const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cookieSession({
  name: "session",
  keys: ["secretkeysinhere"],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

function generateRandomString() {
   var text = "";
   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   for( var i=0; i < 6; i++ )
       text += possible.charAt(Math.floor(Math.random() * possible.length));
   return text;
};

function generateRandomID(length, allID) {
  var result = '';
  for (var i = length; i > 0; --i)
    result += allID[Math.floor(Math.random() * allID.length)];
  return result;
};

var userDatabase = {
  //   id: {
  //     id: generateRandomID(4, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
  //     email: "lighthouseguy@gmail.com",
  //     password: "lighthouselabs",
  //     newUrls: {}
  // }
};


app.get("/register", (req, res)=> {
  if(req.session.user_id) {
    res.redirect("/")
  } else {
  res.status(200).render("register")
  }
});

app.post("/register", (req, res) => {
  let userExists = false;
  let lengthOfPassword = 10;
  let addUserPassword = bcrypt.hashSync(req.body.password, lengthOfPassword);
  let randomID = (generateRandomID(4, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'));
  for (var newUserVar in userDatabase) {
    if (userDatabase[newUserVar].email === req.body.email) {
      userExists = true
    }
  }
  if (userExists) {
    res.status(400).send("Email user already exists!")
  } else if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email and/or password were left blank")
    } else {
      req.session.user_id = randomID
      const newUser = {
        id: randomID,
        email: req.body.email,
        password: addUserPassword,
        newUrls: {}
    };
    userDatabase[randomID] = newUser
    res.redirect("/urls")
    }
});

app.get("/urls", (req, res) => {
  if (req.session.user_id === undefined) {
    res.status(401).send(`Error: User not logged in <br> <br> <a href="/login"> Link to Login </a>`)
  } else {
  let templateVars = {
    username: userDatabase[req.session.user_id].email,
    urls: userDatabase[req.session.user_id].newUrls
  }
  res.status(200).render("urls_index", templateVars);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  var key = req.params.id
  for (display in userDatabase){
    delete userDatabase[display].newUrls[key]
  }
  res.redirect(`/urls`)
});

app.get("/login", (req, res) => {
  res.render("urls_login")
});

app.post("/login", (req, res) => {
  let userLoginID = req.body.email
  let userLoginPassword = req.body.password
  for(let userID in userDatabase) {
    if (userDatabase[userID].email === userLoginID) {
      if (bcrypt.compareSync(userLoginPassword, userDatabase[userID].password)) {
        req.session.user_id = userDatabase[userID].id
        res.redirect(`/`)
        return
      } else {
        res.status(401).send("The email and password put in do not match.")
      }
    }
  }
    return res.status(403).send("User not found");
});

app.post("/logout", (req, res) =>{
  req.session = null
  res.redirect("/")
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.status(401).send(`Error: User not logged in <br> <br> <a href="/login"> Link to Login </a>`)
  } else {
  res.status(200).render("urls_new");
  }
});

app.post("/urls", (req, res) => {
  if(userDatabase[req.session.user_id]) {
    let shortURL = generateRandomString()
    userDatabase[req.session.user_id].newUrls[shortURL] = req.body.longURL
    let agony = "/urls/" + shortURL
    res.redirect(agony);
  } else {
    res.status(401).send(`Error: User not logged in <br> <br> <a href="/login"> Link to Login </a>`)
  }
});

app.get("/urls/:id", (req, res) => {
  console.log(userDatabase)
  if (!req.params.id) {
    res.status(404).send(`URL does not exist`)
  } if (req.session.user_id === undefined) {
    res.status(401).send(`Error: User not logged in <br> <br> <a href="/login"> Link to Login </a>`)
  } if (userDatabase[req.session.user_id].newUrls[req.params.id] === undefined) {
    res.status(403).send(`URL does not match with the right user`)
  } else {
  let templateVars = {
    shortURL: req.params.id,
    longURL: userDatabase[req.session.user_id].newUrls[req.params.id],
    username: req.session.user_id
  }
  res.render("urls_show", templateVars);
  };
});

app.post("/urls/:id/update", (req, res) =>{
  if (!userDatabase[req.session.user_id].newUrls[req.params.id]) {
    res.status(404).send("This ShortURL does not exist!")
  } if  (req.session.user_id === undefined) {
    res.status(401).send(`Error: User not logged in <br> <br> <a href="/login"> Link to Login </a>`)
  } if (userDatabase[req.session.user_id].newUrls[req.params.id] === undefined) {
    res.status(403).send(`URL does not match with the right user`)
  } else {
    var shortURL = req.params.id
    var longURL = req.body.longURL
    userDatabase[req.session.user_id].newUrls[shortURL] = longURL;
    res.redirect(`/urls`);
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (!req.session.user_id){
    res.status(401).send(`Error: User not logged in <br> <br> <a href="/login"> Link to Login </a>`)
  } else {
  let longURL = userDatabase[req.session.user_id].newUrls[req.params.shortURL]
  res.redirect(longURL);
  }
});

app.get("/", (req, res) => {
      if (req.session.user_id) {
        res.redirect(`/urls`)
      } else {
        res.redirect(`/login`)
      };
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
