# vocab_ielts
This application will help you save and get testing your vocabulary.

[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

## Requirements
### List
Users want to have a list of words. The list have a bunch of words, users can add a Vietnamese word and its meaning. They can update or delete Vietnamese words and its meaning. Show the list of Vietnamese words and its meaning or English words and its Vietnamese meaning are supported too. They can delete their lists of they want, when the list was deleted the words belong to its will be deleted as well.

Users can search their lists and sort by inserted time or amount of words.

### Words
We have too type of words: Vietnamse and English.
Each words belong to a list, parts of speech and severity, context, inserted time. In a list, words should be unique. 

Parts of speech: Noun, Verb, Adj, Adv, determiner, Pronoun, Preposition, Conjunction, Interjection.

### Lesson
Users can start a lesson with some requirements: amount of words, list information, time limit, from Vietnamese to English or English to Vietnamese. The test can include the words in a list or in all the lists.
Users can save status of a test then re-test the test later. The scores are saved with some information: the lists, amount of words, time limit, from Vietnamese to English or English to Vietnamese, score and the words which users have answered wrong, status (finish or not). 

## Docker image
**Use public image**: 

_docker run -d -p 8000:5000 \
-v db_file:/vocab/db/ \
-v vocab_log:/vocab/log \
--name vocab_instance1 \
phamvanminh272/vocab:1_

**Build**: _docker build -t [image-name] ._

Example: docker build -t phamvanminh272/vocab:1 .

**Run**: _docker run -d -p [host-available-port]:5000 -v db_file:/vocab/db/ -v vocab_log:/vocab/log --name [container-name] [image-name]_

Example:

_docker run -d -p 8000:5000 \
-v db_file:/vocab/db/ \
-v vocab_log:/vocab/log \
--name vocab_instance1 \
phamvanminh272/vocab:1_



