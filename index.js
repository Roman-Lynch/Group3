const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const session = require("express-session");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 80;

const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);
db.connect()
    .then(obj => {
        console.log('Database connection successful');
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });
app.set("view engine", "ejs");
app.use(
    session({
        secret: "XASDASDA",
        saveUninitialized: true,
        resave: true,
    })
);
app.get('/', (req, res) => {
    res.render("pages/register");
});

app.get('/register', (req, res) => {
    res.render("pages/register");
});

app.get('/login', (req, res) => {
    res.render("pages/login");
});

app.post('/register', (req, res) => {
    let query = `CREATE TABLE IF NOT EXISTS users(
	username VARCHAR(50) PRIMARY KEY,
	password CHAR(60) NOT NULL
);INSERT INTO users(username, password) VALUES ($1, $2);`;
    const values = [req.body.username, req.body.password];
    db.any(query, values)
        .then((rows) => {
            res.send({ "message": "Data inserted successfully" });
        })
        .catch((error) => {
            res.send({ 'message': error });
        });
});

app.post('/login', (req, res) => {
    let query = `SELECT * FROM users WHERE username = $1;`;
    const values = [req.body.username];
    db.one(query, values)
        .then((data) => {
            res.send({ "message": "Data inserted successfully" });
        })
        .catch((err) => {
            console.log("Incorrect username or password.")
            res.send({ 'message': error });
        })
    // Authentication Middleware.
    const auth = (req, res, next) => {
        if (!req.session.user) {
            // Default to register page.
            return res.redirect('/register');
        }
        next();
    };

    // Authentication Required
    app.use(auth);
});
app.listen(3000);