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
    res.render("pages/dashboard");
});

app.get('/register', (req, res) => {
    res.render("pages/register");
});

app.get('/login', (req, res) => {
    res.render("pages/login");
});

app.post('/register', (req, res) => {
    let query = `INSERT INTO users(username, password) VALUES ($1, $2);`;
    const values = [req.body.username, req.body.password];
    db.any(query, values)
        .then((rows) => {
            res.render("pages/login");              // once the data is inserted, navigate to the login page
        })
        .catch((error) => {
            res.render("pages/register");
        });
});

app.post('/login', (req, res) => {
    let query = `SELECT * FROM users WHERE username = $1;`;
    const values = [req.body.username];
    db.one(query, values)
        .then((data) => {
            res.render("pages/dashboard.ejs");         // once the data is inserted, render the proper page
        })
        .catch((err) => {
            console.log("Incorrect username or password.")
            console.log(err);
            res.redirect("pages/register");
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
app.get('/fitness', (req, res) => {
    res.render("pages/dailyfitness");
});

/* GET MOST RECENT EXERCISE :: MODAL -------------------------------------------------- */

app.get('/recent_exercise', (req, res) => { // need to implement specific muscle
    new Date();
    var day = Date.getFullYear();   // gets the current date
    var query = "SELECT TOP 1 * FROM fitness WHERE fitness.day < " + day + " ORDER BY fitness.day DESC;";
    db.one(query)
        .then((rows) => {
            res.send(rows);
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error );
        })
});

/* GET USERNAME ---------------------------------------------------------------------- */
// app.get('/get_username', (req, res) => { // need to implement specific muscle
//     var query = "SELECT username FROM users WHERE username = $1;";
//     var values = [req.body.username]
//     db.one(query, values)
//         .then((rows) => {
//             res.send(rows);
//         })
//         .catch((error) => {
//             console.log("ERROR:", error.message || error );
//         })
// });
/* ------------------------------------------------------------------------------------ */
app.listen(3000);