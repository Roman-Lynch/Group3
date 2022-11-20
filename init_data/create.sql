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
	milliliters INT NOT NULL
);

CREATE TABLE body_weight(
	bw_id INT PRIMARY KEY,
	bw_day DATE NOT NULL,
	body_weight FLOAT NOT NULL
);


CREATE TABLE goals(
	body_weight_goal INT NOT NULL,
	water_intake_goal INT NOT NULL
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
