sqlite3 ./db/vocab.db < ./db/vocab_db_scripts.sql
docker build -t vocab:2 .
rm ./db/vocab.db