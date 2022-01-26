// Use Express
const express = require('express');
const app = express();

// Server has cors enabled
const cors = require('cors');
app.use(cors());


// Set 'path' to use 'public' for static assets
const path  = require('path');
app.use(express.static(path.join(__dirname,'public')));

// bodyParser config
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Resources
app.use(require('./resources.js'));

const PORT = process.env.PORT || 8000

// Listen for environment port or default to 8000
app.listen(PORT, () => console.log('Server is listening on port ', PORT));

