const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/User');

const app = express();
const PORT = 3000;

const chatRoutes = require('./routes/chat');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(chatRoutes);


// Middleware for parsing data
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/trekking-app' })
}));

// Database connection
mongoose.connect('mongodb://localhost:27017/trekking-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));

app.use(chatRoutes);

// Route to render the chatbot UI
app.get('/chat-page', (req, res) => {
  res.render('chat');
});


// Root route
app.get('/', (req, res) => {
  res.render('home');
});



app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
