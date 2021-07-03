CREATE TABLE user (
	user_id INTEGER PRIMARY KEY,
	username TEXT NOT NULL,
	password TEXT NOT NULL,
    user_type INTEGER, --1: normal, 0: admin
	inserted_time INTEGER
);

CREATE TABLE list (
	list_id INTEGER PRIMARY KEY,
	list_name TEXT NOT NULL,
    description TEXT,
    list_type INTEGER, --0: public, 1:private
	inserted_time INTEGER,
    user_id INTEGER,
    FOREIGN KEY (user_id)
        REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
);

CREATE TABLE part_of_speech (
	part_of_speech_id INTEGER PRIMARY KEY,
	label TEXT NOT NULL
);

CREATE TABLE word (
	word_id INTEGER PRIMARY KEY,
	word TEXT NOT NULL,
    context TEXT,
    language_type INTEGER, --0: Vietnamese, 1: English
	inserted_time INTEGER,
    severity INTEGER, --0: has already remembered, 1: need learn more
    list_id INTEGER,
    FOREIGN KEY (list_id)
        REFERENCES list (list_id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
);

CREATE TABLE list_word(
    list_id INTEGER,
	word_id INTEGER,
    PRIMARY KEY (list_id, word_id),
    FOREIGN KEY (list_id)
        REFERENCES list (list_id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION,
    FOREIGN KEY (word_id)
        REFERENCES word (word_id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
);

CREATE TABLE part_of_speech_word(
    part_of_speech_id INTEGER,
	word_id INTEGER,
    PRIMARY KEY (part_of_speech_id, word_id),
    FOREIGN KEY (part_of_speech_id)
        REFERENCES part_of_speech (part_of_speech_id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION,
    FOREIGN KEY (word_id)
        REFERENCES word (word_id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
);

CREATE TABLE word_meaning (
    english_id INTEGER,
	vietnamese_id INTEGER,
    PRIMARY KEY (english_id, vietnamese_id),
    FOREIGN KEY (english_id) 
        REFERENCES word (word_id) 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION,
    FOREIGN KEY (vietnamese_id) 
        REFERENCES word (word_id) 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
);

--data
INSERT INTO user(`user_id`, `username`, `password`, `user_type`, `inserted_time`) values(1, "admin", '1', 0, strftime('%s', 'now'));
INSERT INTO list(`list_name`, `inserted_time`, `list_type`) values('3000 common words', strftime('%s', 'now'), 0);
INSERT INTO part_of_speech(`part_of_speech_id`, `label`) values(1, 'Noun');
INSERT INTO part_of_speech(`part_of_speech_id`, `label`) values(2, 'Verb');
INSERT INTO part_of_speech(`part_of_speech_id`, `label`) values(3, 'Adj');
INSERT INTO part_of_speech(`part_of_speech_id`, `label`) values(4, 'Adv');
INSERT INTO part_of_speech(`part_of_speech_id`, `label`) values(5, 'Determiner');
INSERT INTO part_of_speech(`part_of_speech_id`, `label`) values(6, 'Pronoun');
INSERT INTO part_of_speech(`part_of_speech_id`, `label`) values(7, 'Prep');
INSERT INTO part_of_speech(`part_of_speech_id`, `label`) values(8, 'Conjunction');
INSERT INTO part_of_speech(`part_of_speech_id`, `label`) values(9, 'Interjection');
