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
