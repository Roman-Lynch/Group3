/* DATABASE INITIALIZATION ------------------------------------------------------ */
/* INCLUDES */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const session = require("express-session");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 80;

/* DATABSE CONFIGURATION */
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};

const db = pgp(dbConfig);

/* TEST DATABASE CONNECTION */
db.connect()
    .then(obj => {
        console.log('Database connection successful');
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

/* SET THE VIEW ENGINE TO EJS */
app.set("view engine", "ejs");

/* INITIALIZE SESSION VARIABLES */
app.use(
    session({
        secret: "XASDASDA",
        saveUninitialized: true,
        resave: true,
    })
);

/* HASH FUNCTION */
// String.hashKey = function() {
//     var hash = 0;
//     var i, char;

//     if(this.length === 0)
//         return hash;

//     for(i = 0; i < this.length; i++) {
//         char = this.charCodeAt(i);
//         hash = ((hash << 5) - hash) + char;
//         hash = hash | 0;
//     }
//     return hash;
// }
/* Usage:  
    req.password = ralphie   // hash encrypts with a corresponding code
    console.log(req.password, req.password.hashCode());   // store hashCode
*/

/* NAVIGATION ROUTES -------------------------------------------------------------- */
app.get('/', (req, res) => {                    // upon entry user goes to login
    res.render("pages/login");
});

app.get('/register', (req, res) => {            // navigate to register page
    res.render("pages/register");
});

app.get('/register_survey', (req, res) => {     // navigate to the survey to intake and initialize data
    res.render("pages/registrationSurvey");
});

app.get('/login', (req, res) => {               // navigate to the login page
    res.render("pages/login");
});

app.get('/fitness', (req, res) => {             // navigate to the fitness page
    res.render("pages/dailyfitness");
});
/* ---------------------------------------------------------------------------------- */
app.get('/:username', (req, res) => {
    res.render('dashboard', req.body.username);                    // links ejs scripts to dashboard.ejs
});


/* ---------------------------------------------------------------------------------- */
app.post('/register', (req, res) => {
    let query = `INSERT INTO users(username, password) VALUES ($1, $2);`;
    // var password = req.body.password;

    // const hash = password.hashKey();
    const values = [req.body.username, req.body.password];

    db.any(query, values)
        .then((rows) => {
            res.render('pages/login');              // once the data is inserted, navigate to the login page
        })
        .catch((error) => {
            res.render('pages/register');
        });
});

/* POST LOGIN : redirect to register ? survey? ------------------------------------- */
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
app.get('/get_username', (req, res) => { // need to implement specific muscle
    var query = "SELECT username FROM users WHERE username = $1;";
    var values = [req.body.username]
    db.one(query, values)
        .then((rows) => {
            res.send(rows);
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error );
        })
});
/* ------------------------------------------------------------------------------------ */
app.listen(3000);