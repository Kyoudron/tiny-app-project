const express = require("express");
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 8080; // default port 8080

const app = express();
app.use(cookieParser())

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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// let randomID = generateRandomID(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
var userDatabase = {
    id: {
      id: generateRandomID(4, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
      email: "kapish.k.1@gmail.com",
      password: "lighthouselabs"
  }
}

//

app.get("/register", (req, res)=> {
  res.render("register")
});

app.post("/register", (req, res) => {
  let userExists = false
  let randomID = (generateRandomID(4, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'))

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
  res.cookie("userEmail", req.body.email)
  const newUser = {
    id: randomID,
    email: req.body.email,
    password: req.body.password,
    }
    userDatabase[randomID] = newUser
    res.redirect("/urls")
  }
})

//

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
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
  res.cookie("username", req.body.username)
  res.render("urls_login")
})


app.post("/login", (req, res) => {
  let foundUser = null
  for(let userID in userDatabase) {
    if (userDatabase[userID].email === req.body.email) {
      foundUser = userDatabase[userID];
      break;
    }
  }
  if(!foundUser) {
    return res.status(403).send("User not found");
  }
  if(foundUser.password !== req.body.password){
    return res.status(403).send("Not the right password :(")
  }
  res.cookie("user_id", req.body.email)
  res.redirect(`/urls`)
});


app.post("/logout", (req, res) =>{
  res.clearCookie("username")
  res.redirect("/urls")
});

//

app.get("/urls/new", (req, res) => {
  let templateVars = {
  username: req.cookies["username"]
  };

  res.render("urls_new", templateVars);

});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let shortURL = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[shortURL] = req.body.longURL
                                              // debug statement to see POST parameters
  res.redirect(`urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

//

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req, res) =>{
  var shortURL = req.params.id
  var longURL = req.body.longURL
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});



//


app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});



app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
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