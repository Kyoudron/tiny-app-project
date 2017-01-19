var express = require("express");
var cookieParser = require("cookie-parser")

var app = express();
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");


function generateRandomString(length, sixChars) {
  var result = '';
  for (var i = length; i > 0; --i)
    result += sixChars[Math.floor(Math.random() * sixChars.length)];
  return result
}

// var randomString = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// app.get("/login", (req, res) =>{
//   res.cookie("username", "username");
//   res.render("_header");
// });


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


app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls")
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


//

// app.use(function(req, res){
//   res.status(404).send("Sorry, not found!");
// });



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
