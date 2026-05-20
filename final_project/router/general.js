const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(!username || !password){
    return res.status(400).json({message: "Username and password required"});
  }
  if(isValid(username)){
    return res.status(400).json({message: "User already exists"});
  }
  users.push({"username":username,"password":password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get all books using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books/all');
    return res.status(200).json(response.data);
  } catch(err) {
    return res.status(200).json(books);
  }
});

// Get book by ISBN using async/await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost:5000/books/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch(err) {
    if(books[isbn]){
      return res.status(200).json(books[isbn]);
    }
    return res.status(404).json({message: "Book not found"});
  }
});

// Get books by author using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const result = await new Promise((resolve, reject) => {
      const filtered = Object.values(books).filter(b => 
        b.author.toLowerCase() === author.toLowerCase()
      );
      if(filtered.length > 0) resolve(filtered);
      else reject("No books found for this author");
    });
    return res.status(200).json(result);
  } catch(err) {
    return res.status(404).json({message: err});
  }
});

// Get books by title using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const result = await new Promise((resolve, reject) => {
      const filtered = Object.values(books).filter(b => 
        b.title.toLowerCase() === title.toLowerCase()
      );
      if(filtered.length > 0) resolve(filtered);
      else reject("No books found for this title");
    });
    return res.status(200).json(result);
  } catch(err) {
    return res.status(404).json({message: err});
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(book){
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({message: "Book not found"});
});

module.exports.general = public_users;