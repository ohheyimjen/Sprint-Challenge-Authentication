const axios = require('axios');
const router = require('express').Router();

const { authenticate, jwtKey } = require('../auth/authenticate');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../users/users-model');


module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
}

function login(req, res) {
  // implement user login
  let { username, password } = req.body;
console.log(1);
  Users.findBy({ username })
    .first()
    .then(user => { 
      console.log(2);
      if(user && bcrypt.compareSync(password, user.password)) { console.log(3);
        const token = generateToken(user);
        console.log(4);
        res.status(200).json({
          message: `Well hello ${user.username}! Take a token!`, token,
        });
      } else {
        res.status(401).json({ message: 'Sorry, Charlie. You need a token to get in' })
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
};

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}

// function for generating token
function generateToken(user) { console.log(user);
  const payload = {
    subject: user.id,
    username: user.username,
  }
  const options = {
    expiresIn: '1d',
  }
  return jwt.sign(payload, jwtKey, options);
}

// module.exports = router;