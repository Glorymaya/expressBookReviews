const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(u => u.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
}

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(!username || !password){
    return res.status(400).json({message: "Username and password required"});
  }
  if(authenticatedUser(username, password)){
    let token = jwt.sign({username: username}, "fingerprint_customer", {expiresIn: 60*60});
    req.session.authorization = {accessToken: token, username: username};
    return res.status(200).json({message: "User successfully logged in", token: token});
  }
  return res.status(401).json({message: "Invalid username or password"});
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
  if(books[isbn]){
    books[isbn].reviews[username] = review;
    return res.status(200).json({message: "Review added/updated successfully", reviews: books[isbn].reviews});
  }
  return res.status(404).json({message: "Book not found"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if(books[isbn]){
    delete books[isbn].reviews[username];
    return res.status(200).json({message: "Review deleted successfully"});
  }
  return res.status(404).json({message: "Book not found"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;