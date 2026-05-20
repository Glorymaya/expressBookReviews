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

// Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
  try {
    const result = await new Promise((resolve) => resolve(books));
    return res.status(200).json(result);
  } catch(err) {
    return res.status(500).json({message: "Error retrieving books"});
  }
});

// Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const result = await new Promise((resolve, reject) => {
      if(books[isbn]) resolve(books[isbn]);
      else reject("Book not found");
    });
    return res.status(200).json(result);
  } catch(err) {
    return res.status(404).json({message: err});
  }
});

// Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const result = await new Promise((resolve, reject) => {
      const filtered = Object.values(books).filter(b => b.author.toLowerCase() === author.toLowerCase());
      if(filtered.length > 0) resolve(filtered);
      else reject("No books found for this author");
    });
    return res.status(200).json(result);
  } catch(err) {
    return res.status(404).json({message: err});
  }
});

// Get all books based on title using async/await
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const result = await new Promise((resolve, reject) => {
      const filtered = Object.values(books).filter(b => b.title.toLowerCase() === title.toLowerCase());
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