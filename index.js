/* DATABASE INITIALIZATION ------------------------------------------------------ */
/* INCLUDES */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const session = require("express-session");
app.use(bodyParser.json());
const bcrypt = require('bcryptjs');
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
    password:undefined
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

/* RECENT EXERCISES BY MUSCLE */
const muscle_recent = `
SELECT
    day, muscle, exercise, weight, sets, reps
FROM
    fitness
ORDER BY day DESC;`;

const muscle_bw = `
SELECT *
FROM fitness
INNER JOIN user_fitness ON user_fitness.fitness_id = fitness.fitness_id
INNER JOIN user_weight ON user_weight.bw_id = users.
ORDER BY day DESC;`;

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
app.get('/daily_fitness', (req, res) => {       // navigate to the daily fitness page
    res.render("pages/dailyfitness");
});
app.get('/registrationSurvey', (req, res) => {  // navigate to the survey to intake and initialize data
    res.render("pages/registrationSurvey");
});
/* GET MOST RECENT EXERCISE :: MODAL -------------------------------------------------- */
app.get('/recent_exercise', (req, res) => { // need to implement specific muscle
    db.one(muscle_recent, [req.body.muscle])
        .then((rows) => {
            res.send(rows);
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error );
        })
});
/* DASHBOARD EJS ---------------------------------------------------------------------- */
app.get('/dashboard', (req, res) => {
    db.any(muscle_recent, [req.body.muscle])
        .then((rows) => {
            console.log(rows);
            res.render("pages/dashboard", { username: req.session.user.username, rows});
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        })
});
/* WEEKLY FITNESS EJS ----------------------------------------------------------------- */
app.get('/weekly_fitness', (req, res) => {
    console.log("Route entry successful");

    /* DATE DEFINITION */
    let today = new Date;
    let tomorrow = new Date(today.getTime() + 86400000);
    let yesterday = new Date(today.getTime() - 86400000);
    /* TAKE ONLY: Mon Nov 15 2022 */
    let today1 = today.toString().substring(0, 15);
    let yesterday1 = yesterday.toString().substring(0, 15);
    let tomorrow1 = tomorrow.toString().substring(0, 15);
    /* CONSOLE LOG */
    console.log("Today: " + today1.toString());
    console.log("Yesterday: " + yesterday1.toString())
    console.log("Tomorrow: " + tomorrow1.toString())

    /* COMPARISON ENTRY */
    let month = today.getMonth() + 1;         // 0-11
    let year = today.getFullYear();           // 2022
    let yd_temp = yesterday.toString().substring(8, 10);  // 0-31
    let td_temp = today.toString().substring(8, 10);
    let tm_temp = tomorrow.toString().substring(8, 10);

    /* CONCATENATION */
    let yd = year + "-" + month + "-" + yd_temp;
    let td = year + "-" + month + "-" + td_temp;
    let tm = year + "-" + month + "-" + tm_temp;
    /* CONSOLE LOG */
    console.log("Today_Comparison: " + td.toString());
    console.log("Yesterday_Comparison: " + yd.toString())
    console.log("Tomorrow Comparison: " + tm.toString())

    console.log("Passed initialization")

    /* TO DO, check edge cases on day operations (ie. end of month into next month) */
    console.log("Passed Variables")

    /* ROUTE QUERY EXECUTION */
    db.any(muscle_recent)
        .then((rows) => {
            console.log(rows);
            res.render("pages/weeklyfitness", { username: req.session.user.username, yd: yd, td: td, tm: tm, yd_s: yesterday1, td_s: today1, tm_s: tomorrow1, rows });
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        })
});
/* EXERCISE HISTORY EJS ------------------------------------------------------------ */
app.get('/exercisehistory', (req, res) => {                    // upon entry user goes to login
    db.any(muscle_recent, [req.session.user.username])
        .then((fitness) => {
            console.log(fitness);
            res.render("pages/exercisehistory", { 
                username: req.session.user.username, 
                fitness: fitness,
                action: "delete",
            });
        })
        .catch((error) => {
            console.log("ERROR:", error.message || error);
        })
});
/* POST REGISTER : rediredct to login ---------------------------------------------- */
app.post('/register', async (req, res) => {

    const hash = await bcrypt.hash(req.body.password, 8);

    let query = `INSERT INTO users (username, password) VALUES ($1, $2);`;

    db.none(query, [
        req.body.username,
        hash
      ])
        .then(function (data) {

            /* start session */
            req.session.user = {};
            req.session.save();

            /* Bring to Post-Registration Survey */
            res.redirect('/registrationSurvey')
        })
        .catch(function (err) {
          res.redirect('/register');
          return console.log(err);
        }); 
});


/* POST LOGIN : redirect to register ? survey? ------------------------------------- */
app.post('/login', async (req, res) => {

    let query = `SELECT * FROM users WHERE username = $1;`;

    db.one(query, [
        req.body.username,
        req.body.password
    ])
    .then(async (user) => {

        const match = await bcrypt.compare(req.body.password, user.password);

        if (match)
        {
            users.username = req.body.username;
            users.password = req.body.password;
            req.session.user = users;
            req.session.save();
            res.redirect('/dashboard');
        }

        else 
        {
            res.redirect('pages/login', {message: "Incorrect Password", error: true});
        }
    })

    .catch (function (err) {

        res.redirect('/register');

        return console.log(err);
    });
});

/* AUTHENTICATION ---------------------------------------------------------------------  */
const auth = (req, res, next) => {
    if (!req.session.user) {
        // Default to register page.
        return res.redirect('/register');
    }
    next();
};

// Authentication Required
app.use(auth);

/* POST EXERCISE :: arr_exercise[{exercise}, {exercise}] ------------------------------ */
app.post('/fitness', (req, res) => {
    let query = "INSERT INTO fitness (day, muscle, exercise, weight, sets, reps) VALUES ($1, $2, $3, $4, $5, $6);";
    const values = [req.body.day, req.body.muscle, req.body.exercise, req.body.weight, req.body.sets, req.body.reps];
    db.none(query, values)
        .then((data) => {
            fitness.day = values[0];
            fitness.muscle = values[1];
            fitness.exercise = values[2];
            fitness.weight = values[3];
            fitness.sets = values[4];
            fitness.reps = values[5];
            req.session.save();

            console.log("Successful Exercise Entry");
            res.render('pages/dailyfitness');
        })
        .catch((error) => {
            console.log(error);
        })
});

/* EDIT EXERCISE ---------------------------------------------------------------------- */
app.put('/edit_workout', (req, res) => {
    const query = `
    UPDATE fitness 
        SET day = `+ fitness.day + `
        AND exercise = $2 
        AND muscle = $3 
        AND weight = $4 
        AND sets = $4 
        AND reps = $5
        WHERE;`;
    const values = [req.body.day, req.body.muscle, req.body.exercise, req.body.weight, req.body.sets, req.body.reps];
    db.any(query, values)
        .then((data) => {
            fitness.day = values[0];
            fitness.muscle = values[1];
            fitness.exercise = values[2];
            fitness.weight = values[3];
            fitness.sets = values[4];
            fitness.reps = values[5];

            req.session.user = fitness;
            req.session.save();
            
            console.log("Exercise Successfully Updated");
            res.render('pages/dailyfitness', {data});
        })
        .catch((error) => {
            console.log(error);
        })
});

/* DELETE EXERCISE ------------------------------------------------------------ */
app.delete("/delete_exercise", (req, res) => {
    const query = 
    `DELETE FROM
        fitness
     WHERE
        day = $1
        AND muscle = $2
        AND exercise = $3
        AND weight = $4
        AND sets = $5
        AND reps = $6;`;

    db.any(query, [req.body.day, req.body.muscle, req.body.exercise, req.body.weight, req.body.sets, req.body.reps])
        .then((rows) => {
            res.render("pages/exercisehistory", { 
                username: req.session.user.username, 
                fitness: rows,
                action: "delete",
                });
        })
        .catch((err) => {
            res.render("pages/exercisehistory", {
                username: req.session.user.username,
                fitness: [],
                error: true,
                message: err.message,
            });
        });
});
app.post("/delete_exercise", (req, res) => {
    db.task("delete-exercise", (task) => {
      return task.batch([
        task.none(
          `DELETE FROM
              fitness
            WHERE
              day = $1
              AND muscle = $2
              AND exercise = $3
              AND weight = $4
              AND sets = $5
              AND reps = $6;`,
          [req.body.day, req.body.muscle, req.body.exercise, req.body.weight, req.body.sets, req.body.reps]
        ),
        task.any(fitness, [req.session.user.username]),
      ]);
    })
      .then((fitness) => {
        console.info(fitness);
        res.render("pages/exercisehistory", { 
            username: req.session.user.username, 
            fitness: fitness,
            action: "delete",
        });
      })
      .catch((err) => {
        res.render("pages/exercisehistory", {
            username: req.session.user.username,
            fitness: [],
            error: true,
            message: err.message,
        });
      });
  });
// /* ------------------------------------------------------------------------------------ */
app.listen(3000);