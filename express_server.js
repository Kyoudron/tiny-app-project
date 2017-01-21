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


function generateRandomString() {
   var text = "";
   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   for( var i=0; i < 6; i++ )
       text += possible.charAt(Math.floor(Math.random() * possible.length));
   return text;
}

function generateRandomID(length, allID) {
  var result = '';
  for (var i = length; i > 0; --i)
    result += allID[Math.floor(Math.random() * allID.length)];
  return result
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// let randomID = generateRandomID(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
var userDatabase = {
  //   id: {
  //     id: generateRandomID(4, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
  //     email: "lighthouseguy@gmail.com",
  //     password: "lighthouselabs",
  //     newUrls: {}
  // }
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
  // console.log(addUserPassword)
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
      req.session.user_id = randomID
      const newUser = {
        id: randomID,
        email: req.body.email,
        password: addUserPassword,
        newUrls: {}
      };
      userDatabase[randomID] = newUser
      res.redirect("/urls")
    };
})

//

app.get("/urls", (req, res) => {
  let templateVars = {
    username: userDatabase[req.session.user_id].email,
    urls: userDatabase[req.session.user_id].newUrls
  }
  res.render("urls_index", templateVars);
});


app.post("/urls/:id/delete", (req, res) => {
  var key = req.params.id
  for (display in userDatabase){
  delete userDatabase[display].newUrls[key]
  }
  res.redirect(`/urls`)
});

//


app.get("/login", (req, res) => {
  res.render("urls_login")
})


app.post("/login", (req, res) => {
  let userLoginID = req.body.email
  let userLoginPassword = req.body.password
  for(let userID in userDatabase) {
    // when emails match
    if (userDatabase[userID].email === userLoginID) {
      // when passwords match
      if (bcrypt.compareSync(userLoginPassword, userDatabase[userID].password)) {
        req.session.user_id = userDatabase[userID].id
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
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  for (randomUserID in userDatabase) {
    if(req.session.user_id === userDatabase[randomUserID].id) {
    // console.log(userDatabase[randomUserID].id)
    let shortURL = generateRandomString()
    userDatabase[randomUserID].newUrls[shortURL]
    userDatabase[randomUserID].newUrls[shortURL] = req.body.longURL
    // userDatabase[randomUserID].newUrls
    }
  }
  res.redirect(`/urls`);
});

//

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: userDatabase[req.session.user_id].newUrls[shortURL],
    username: req.session.user_id
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req, res) =>{
  var shortURL = req.params.id
  var longURL = req.body.longURL
  userDatabase[req.session.user_id].newUrls[shortURL] = longURL;
  res.redirect(`/urls`);
});



//


app.get("/u/:shortURL", (req, res) => {
  let longURL = userDatabase[req.session.user_id].newUrls[req.params.shortURL]
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