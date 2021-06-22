CREATE TABLE user (
	user_id INTEGER PRIMARY KEY,
	username TEXT NOT NULL,
	password TEXT NOT NULL,
	inserted_time TEXT
);

CREATE TABLE list (
	list_id INTEGER PRIMARY KEY,
	list_name TEXT NOT NULL,
	inserted_time TEXT,
    user_id INTEGER,
    FOREIGN KEY (user_id)
        REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
);

CREATE TABLE class (
	class_id INTEGER PRIMARY KEY,
	class_name TEXT NOT NULL
);

CREATE TABLE viet_words (
	viet_id INTEGER PRIMARY KEY,
	viet_word TEXT NOT NULL,
	inserted_time TEXT
);

CREATE TABLE eng_words(
    eng_id INTEGER PRIMARY KEY,
	eng_word TEXT NOT NULL,
	inserted_time TEXT
);

CREATE TABLE list_and_viet(
    list_id INTEGER,
	viet_id INTEGER,
    PRIMARY KEY (list_id, viet_id),
    FOREIGN KEY (list_id)
        REFERENCES list (list_id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION,
    FOREIGN KEY (viet_id)
        REFERENCES viet_words (viet_id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
);

CREATE TABLE class_and_viet(
    class_id INTEGER,
	viet_id INTEGER,
    PRIMARY KEY (class_id, viet_id),
    FOREIGN KEY (class_id)
        REFERENCES class (class_id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION,
    FOREIGN KEY (viet_id)
        REFERENCES viet_words (viet_id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
);

CREATE TABLE viet_eng(
    eng_id INTEGER,
	viet_id INTEGER,
    PRIMARY KEY (eng_id, viet_id),
    FOREIGN KEY (eng_id) 
        REFERENCES eng_words (eng_id) 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION,
    FOREIGN KEY (viet_id) 
        REFERENCES viet_words (viet_id) 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
);

--data
INSERT INTO user(`user_id`, `username`, `password`, `inserted_time`) values(1, "general_user", '1', datetime());
INSERT INTO list(`list_name`, `inserted_time`, `user_id`) values('3000 common words', datetime(), 1);
