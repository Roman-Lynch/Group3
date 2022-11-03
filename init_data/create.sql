CREATE TABLE users(
	user_id SERIAL PRIMARY KEY,
	username VARCHAR(50),
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
	user_id INT NOT NULL REFERENCES users(user_id),
	fitness_id INT NOT NULL REFERENCES fitness(fitness_id)
);

CREATE TABLE user_nutrition(
	user_id INT NOT NULL REFERENCES users(user_id),
	nutrition_id INT NOT NULL REFERENCES nutrition(nutrition_id)
);

CREATE TABLE user_water(
	user_id INT NOT NULL REFERENCES users(user_id),
	water_id INT NOT NULL REFERENCES water(water_id)
);