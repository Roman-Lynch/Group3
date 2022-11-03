CREATE TABLE users(
	username VARCHAR(50) PRIMARY KEY,
	password CHAR(60) NOT NULL
);

CREATE TABLE fitness(
	fitness_id INT PRIMARY KEY,
	day DATE,
	muscle TEXT,
	exercise TEXT,
	sets INT,
	reps INT,
	weight FLOAT
);

CREATE TABLE nutrition(
	nutrition_id INT PRIMARY KEY,
	day DATE,
	meal TEXT,
	calories INT
);

CREATE TABLE water(
	water_id INT PRIMARY KEY,
	day DATE,
	milliliters INT
);

CREATE TABLE user_fitness(
	username VARCHAR(50) REFERENCES users(username),
	fitness_id INT NOT NULL REFERENCES fitness(fitness_id)
);

CREATE TABLE user_nutrition(
	username VARCHAR(50) REFERENCES users(username),
	nutrition_id INT NOT NULL REFERENCES nutrition(nutrition_id)
);

CREATE TABLE user_water(
	username VARCHAR(50) REFERENCES users(username),
	water_id INT NOT NULL REFERENCES water(water_id)
);