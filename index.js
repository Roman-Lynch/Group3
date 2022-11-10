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

/* USERS TABLE EJS REFERENCE */
const users = {
    username:undefined,
    password:undefined,
}

/* FITNESS TABLE EJS REFERENCE */
const fitness = {
    day:undefined,              // filter by day
    muscle:undefined,           // filter by muscle
    exercise:undefined,         // filter by exercise  
    weight:undefined,
    sets:undefined,
    reps:undefined
}

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

app.get('/login', (req, res) => {               // navigate to the login page
    res.render("pages/login");
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
            users.username = values;
            users.password = data.password;

            req.session.user = users;
            req.session.save();
            
            res.redirect("/dashboard");         // once the data is inserted, render the proper page
        })
        .catch((err) => {
            console.log("Incorrect username or password.")
            console.log(err);
            res.redirect("/register");
        })
    
});

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


app.get('/daily_fitness', (req, res) => {             // navigate to the daily fitness page
    res.render("pages/dailyfitness");
});

app.get('/weekly_fitness', (req, res) => {
    res.render("pages/weeklyfitness");
})


app.get('/registrationSurvey', (req, res) => {  // navigate to the survey to intake and initialize data
    res.render("pages/registrationSurvey");
});

/* POST EXERCISE :: arr_exercise[{exercise}, {exercise}] ------------------------------ */
app.post('/fitness', (req, res) => {
    let query = "INSERT INTO fitness(day, muscle, exercise, sets, reps, weight) VALUES ('2022-02-20', $2, $3, $4, $5, $6);";
    const values = [req.body.day, req.body.muscle, req.body.exercise, req.body.sets, req.body.reps, req.body.weight];
    db.one(query, values)
        .then((data) => {
            fitness.day = values[0];
            fitness.muscle = values[1];
            fitness.exercise = values[2];
            fitness.sets = values[3];
            fitness.reps = values[4];
            fitness.weight = values[5];

            req.session.user = fitness;
            req.session.save();
        })
        .catch((error) => {
            console.log(error);
        })
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

app.get('/dashboard', (req, res) => {
    res.render("pages/dashboard", {username:req.session.user.username,})
});
/* ------------------------------------------------------------------------------------ */
app.listen(3000);