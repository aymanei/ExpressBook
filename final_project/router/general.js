const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const axios = require('axios');

public_users.post("/register", (req,res) => {
  const username = req.body.username || req.query.username;
  const password = req.body.password || req.query.password;

  if (username && password) {
    if (isValid(username)) { 
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(400).json({message: "User already exists!"});    
    }
  } 
  return res.status(400).json({message: "Unable to register user. Provide both username and password."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const get_books = new Promise((resolve, reject) => {
    resolve(books);
  });
  get_books.then((bks) => {
    res.send(JSON.stringify(bks, null, 4));
  }, (err) => {
    res.status(500).json({message: err});
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const get_book = new Promise((resolve, reject) => {
    let book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });
  get_book.then(
    (bk) => res.send(JSON.stringify(bk, null, 4)),
    (err) => res.status(404).json({message: err})
  );
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const get_books_by_author = new Promise((resolve, reject) => {
    let results = [];
    for (let id in books) {
      if (books[id].author === author) {
        results.push({ isbn: id, ...books[id] });
      }
    }
    if (results.length > 0) {
      resolve(results);
    } else {
      reject("No books found by this author");
    }
  });

  try {
    const matchingBooks = await get_books_by_author;
    res.send(JSON.stringify(matchingBooks, null, 4));
  } catch (error) {
    res.status(404).json({message: error});
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const get_books_by_title = new Promise((resolve, reject) => {
    let results = [];
    for (let id in books) {
      if (books[id].title === title) {
        results.push({ isbn: id, ...books[id] });
      }
    }
    if (results.length > 0) {
      resolve(results);
    } else {
      reject("No books found with this title");
    }
  });

  try {
    const matchingBooks = await get_books_by_title;
    res.send(JSON.stringify(matchingBooks, null, 4));
  } catch (error) {
    res.status(404).json({message: error});
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

// Axios functions to demonstrate client-side retrieval (Tasks 10-13)
async function getAllBooksAxios() {
  try {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
  } catch (error) {
    console.error("Error fetching books with Axios:", error.message);
  }
}

function getBookByISBNAxios(isbn) {
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      console.log(`Book by ISBN ${isbn}:`, response.data);
    })
    .catch(error => {
      console.error(`Error fetching book with ISBN ${isbn} using Axios:`, error.message);
    });
}

async function getBooksByAuthorAxios(author) {
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by author ${author} with Axios:`, error.message);
  }
}

async function getBooksByTitleAxios(title) {
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by title ${title} with Axios:`, error.message);
  }
}

module.exports.general = public_users;
module.exports.getAllBooksAxios = getAllBooksAxios;
module.exports.getBookByISBNAxios = getBookByISBNAxios;
module.exports.getBooksByAuthorAxios = getBooksByAuthorAxios;
module.exports.getBooksByTitleAxios = getBooksByTitleAxios;
