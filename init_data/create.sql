CREATE TABLE users(
	username VARCHAR(50) PRIMARY KEY NOT NULL,
	password CHAR(60) NOT NULL
);

CREATE TABLE fitness(
	fitness_id SERIAL PRIMARY KEY,
	day DATE NOT NULL,
	muscle TEXT NOT NULL,
	exercise TEXT NOT NULL,
	weight FLOAT NOT NULL,
	sets INT NOT NULL,
	reps INT NOT NULL
);

CREATE TABLE water(
	water_id INT PRIMARY KEY,
	day DATE NOT NULL,
	cups INT NOT NULL
);

CREATE TABLE bodyWeight(
	day DATE NOT NULL,
	body_weight FLOAT NOT NULL
);

CREATE TABLE goals(
	body_weight_goal INT,
	water_intake_goal INT
);

CREATE TABLE user_fitness(
	username VARCHAR(50) REFERENCES users(username),
	fitness_id INT NOT NULL REFERENCES fitness(fitness_id) 
);

CREATE TABLE user_weight(
	username VARCHAR(50) REFERENCES users(username)
);

CREATE TABLE user_water(
	username VARCHAR(50) REFERENCES users(username),
	water INT NOT NULL REFERENCES water(water_id) 
);


-- -- Views to simplify queires in the server --
-- CREATE OR REPLACE VIEW 
-- 	Fitness_Today AS
-- SELECT
-- 	day,
-- 	exercise,
-- 	sets,
-- 	reps,
-- 	weight
-- FROM
-- 	fitness
-- WHERE day = GETDATE() AS DATE;
