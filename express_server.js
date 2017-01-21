const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
// const password = "purple-monkey-dinosaur"; // you will probably this from req.params
// const hashed_password = bcrypt.hashSync(password, 10);


const PORT = process.env.PORT || 8080; // default port 8080

const app = express();
app.use(cookieSession({
  name: "session",
  keys: ["secretkeysinhere"],
  // options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");


function generateRandomString(length, sixChars) {
  var result = '';
  for (var i = length; i > 0; --i)
    result += sixChars[Math.floor(Math.random() * sixChars.length)];
  return result
}

function generateRandomID(length, allID) {
  var result = '';
  for (var i = length; i > 0; --i)
    result += allID[Math.floor(Math.random() * allID.length)];
  return result
}

var urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com",
};

// let randomID = generateRandomID(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
var userDatabase = {
    id: {
      id: generateRandomID(4, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
      email: "lighthouseguy@gmail.com",
      password: "lighthouselabs"
  }
}

//

app.get("/register", (req, res)=> {
  res.render("register")
});

app.post("/register", (req, res) => {
  let userExists = false;
  let lengthOfPassword = 10;
  let addUserPassword = bcrypt.hashSync(req.body.password, lengthOfPassword);
  let randomID = (generateRandomID(4, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'));
  console.log(addUserPassword)
  for (var newUserVar in userDatabase) {
    if (userDatabase[newUserVar].email === req.body.email) {
    // console.log("it matched")
      userExists = true
    }
  }
  if (userExists) {
    res.status(400).send("Email user already exists!")
  } else if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email and/or password were left blank")
    } else {
      req.session.user_id = req.body.email
      const newUser = {
        id: randomID,
        email: req.body.email,
        password: addUserPassword,
        newUrls: {}
      };
      userDatabase[randomID] = newUser
      console.log(userDatabase)
      res.redirect("/urls")
    };
})

//

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.session.user_id
   };
  res.render("urls_index", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  var key = req.params.id
  delete urlDatabase[key]
  res.redirect(`/urls`)
});

//


app.get("/login", (req, res) => {
  res.render("urls_login")
})


app.post("/login", (req, res) => {
  console.log(userDatabase)
  let userLoginID = req.body.email
  let userLoginPassword = req.body.password
  for(let userID in userDatabase) {
    // when emails match
    if (userDatabase[userID].email === userLoginID) {
      console.log(userLoginID)
        console.log(userLoginPassword)
        console.log(userDatabase[userID].password)
      // when passwords match
      if (bcrypt.compareSync(userLoginPassword, userDatabase[userID].password)) {
        req.session.user_id = userLoginID
        res.redirect(`/urls`)
        return
      } else {
        return res.status(403).send("Not the right password!")
      }
    }
  }
    return res.status(403).send("User not found");
});

//

app.post("/logout", (req, res) =>{
  req.session = null
  res.redirect("/login")
});

//

app.get("/urls/new", (req, res) => {
  // let templateVars = {
  //   username: req.session.user_id
  // };
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
  // console.log(req.session.user_id)
  for (randomUserID in userDatabase) {
    if(req.session.user_id === userDatabase[randomUserID].email) {
    // console.log(userDatabase[randomUserID].id)
    userDatabase[randomUserID].newUrls[generateRandomID(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')] = req.body.longURL
    // console.log(userDatabase)
    }
  }
  res.redirect(`/urls`);
});

//

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.session.user_id
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req, res) =>{
  var shortURL = req.params.id
  var longURL = req.body.longURL
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});



//


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});



app.get("/", (req, res) => {
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// bcrypt.hach(req.body/password, 10, (err, hash)=> {
//   if (err) {
//     res.send ("error")
//     return
//   }
// })

// data.users.push()