import datetime
import logging
import random

from model.word import Word, WordSchema, WordMeaning
from model.list import List, ListSchema
from model.eng import Eng, EngSchema
from action.eng import EngAction
from action.list import ListAction
from action.user import UserAction
from utils.utils import rm_redundant_space
from utils.exceptions import (
    NotExistException, AlreadyExistException, InvalidValueException,
    UserPermissionException
)
from constants.action_constants import (
    DICTIONARY_TYPE, OBJECT_TYPE, ADMIN_USER_TYPE, VIETNAMESE_LANGUAGE_TYPE,
    ENGLISH_LANGUAGE_TYPE, NORMAL_USER_TYPE
)
from main import db


class WordAction:
    @staticmethod
    def get_words_for_a_lesson(user_id, list_id=None, quantity=20) -> list:
        """
        Get Vietnamese words for a lesson.
        :param user_id: user_id to check user's permission
        :param list_id: list_id=0 means get words in all lists.
        :param quantity: quantity of words will be returned.
        :return: a list of Vietnamese words. The words have the order randomly and have a number order to show in UI.
        """
        if list_id and list_id != '0':
            viet_words = WordAction.get_words_by_list_id(user_id=user_id, list_id=list_id)
        else:
            # currently just support create a lesson for a list
            viet_words = WordAction.get_all_words()
        if not viet_words:
            logging.info("No words for a lesson")
            return []
        random.shuffle(viet_words)
        if quantity < len(viet_words):
            viet_words = viet_words[:quantity]
        data = []
        no = [i for i in range(1, len(viet_words) + 1)]
        random.shuffle(no)
        for i, row in enumerate(viet_words):
            data.append({"id": row["word_id"], "word": row["word"], 'no': no[i]})
        return data

    @staticmethod
    def get_all_words():
        vietnamese_words = Word.query.all()
        return WordSchema(many=True).dump(vietnamese_words)

    @staticmethod
    def get_words_by_list_id(user_id, list_id):
        list_obj = ListAction.get_list_by_id(user_id=user_id, list_id=list_id, return_type=OBJECT_TYPE)
        vietnamese_words = Word.query.filter_by(list_id=list_obj.list_id, language_type=VIETNAMESE_LANGUAGE_TYPE).all()
        viets_with_engs = []
        for vietnamese_word in vietnamese_words:
            if vietnamese_word.language_type == VIETNAMESE_LANGUAGE_TYPE:
                english_word_ids = WordMeaning.query.filter_by(vietnamese_id=vietnamese_word.word_id).all()
                english_words = []
                for english_word_id in english_word_ids:
                    english_words.append(Word.query.filter_by(word_id=english_word_id.english_id).first())
                item = vietnamese_word.to_json()
                item.update({
                    'eng_words': WordSchema(many=True).dump(english_words)
                })
                viets_with_engs.append(item)
        return viets_with_engs

    @staticmethod
    def get_word_by_word_id(user_id, word_id):
        vietnamese_word = Word.query.filter_by(word_id=word_id).first()
        if vietnamese_word:
            if UserAction.get_user_type(user_id=user_id) == NORMAL_USER_TYPE:
                list_obj = ListAction.get_list_by_id(user_id=user_id, list_id=vietnamese_word.list_id)
                if not list_obj:
                    raise UserPermissionException("The word does not belong to the user with id {}".format(user_id))
            viet_with_engs = vietnamese_word.to_json()
            english_word_ids = WordMeaning.query.filter_by(vietnamese_id=vietnamese_word.word_id).all()
            english_words = []
            for english_word_id in english_word_ids:
                english_words.append(Word.query.filter_by(word_id=english_word_id.english_id).first())
            viet_with_engs.update({
                'eng_words': WordSchema(many=True).dump(english_words)
            })
            return viet_with_engs
        raise NotExistException("The word does not exist")

    @staticmethod
    def create(user_id, list_id: str, viet_word: str, eng_words: list, return_type=DICTIONARY_TYPE):
        inserted_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if UserAction.get_user_type(user_id=user_id) == ADMIN_USER_TYPE:
            list_obj = List.query.filter_by(list_id=list_id).first()
        else:
            list_obj = List.query.filter_by(user_id=user_id, list_id=list_id).first()
        if not list_obj:
            raise NotExistException("The list does not exist")
        vietnamese_word = Word.query.filter_by(
            word=viet_word,
            list_id=list_id,
            language_type=VIETNAMESE_LANGUAGE_TYPE
        ).first()
        if not vietnamese_word:
            vietnamese_word = Word(
                word=viet_word,
                list_id=list_id,
                language_type=VIETNAMESE_LANGUAGE_TYPE,
                inserted_time=inserted_time
            )
            db.session.add(vietnamese_word)
        eng_words = [rm_redundant_space(i) for i in eng_words]
        # remove duplicate eng_words
        eng_words = set(eng_words)
        for eng in eng_words:
            eng_obj = Word.query.filter_by(word=eng, language_type=ENGLISH_LANGUAGE_TYPE).first()
            if not eng_obj:
                eng_obj = Word(
                    word=eng,
                    list_id=list_id,
                    inserted_time=inserted_time,
                    language_type=ENGLISH_LANGUAGE_TYPE
                )
                db.session.add(eng_obj)
                db.session.commit()
            WordAction.create_meaning(
                vietnamese_id=vietnamese_word.word_id,
                english_id=eng_obj.word_id
            )
        db.session.commit()
        if return_type == DICTIONARY_TYPE:
            vietnamese_word = vietnamese_word.to_json()
        return vietnamese_word

    @staticmethod
    def create_meaning(vietnamese_id, english_id):
        meaning = WordMeaning.query.filter_by(vietnamese_id=vietnamese_id, english_id=english_id).first()
        if meaning:
            logging.info("The meaning exists")
            return True
        meaning = WordMeaning(vietnamese_id=vietnamese_id, english_id=english_id)
        db.session.add(meaning)
        db.session.commit()

    @staticmethod
    def update(user_id, viet_id, viet_word, list_engs: dict, list_new_engs: list):
        viet_obj = Word.query.filter_by(word_id=viet_id).first()
        if viet_obj:
            # need check user's permission to update words
            if UserAction.get_user_type(user_id=user_id) == NORMAL_USER_TYPE:
                list_obj = ListAction.get_list_by_id(user_id=user_id, list_id=viet_obj.list_id)
                if not list_obj:
                    raise UserPermissionException("The word does not belong to the user with id {}".format(user_id))
            viet_obj.word = viet_word  # update Vietnamese word
            # update English meaning
            for eng_id, eng_word in list_engs.items():
                try:
                    eng_obj = Word.query.filter_by(word_id=eng_id).first()
                    if eng_word:
                        eng_obj.word = eng_word
                    else:
                        db.session.delete(eng_obj)
                except Exception as ex:
                    logging.exception(ex)
            # add new meaning
            # remove duplicate eng_words
            eng_words = set(list_new_engs)
            for eng in eng_words:
                eng_obj = Word.query.filter_by(word=eng, list_id=viet_obj.list_id).first()
                if not eng_obj:
                    eng_obj = Word(word=eng, list_id=viet_obj.list_id, language_type=ENGLISH_LANGUAGE_TYPE)
                    db.session.add(eng_obj)
                    db.session.commit()
                    WordAction.create_meaning(vietnamese_id=viet_id, english_id=eng_obj.word_id)
                else:
                    WordAction.create_meaning(vietnamese_id=viet_id, english_id=eng_obj.word_id)
            db.session.commit()
            return True
        raise NotExistException("The word (word_id={}) does not exist".format(viet_id))

    @staticmethod
    def delete(user_id, viet_id) -> dict:
        if not viet_id:
            raise InvalidValueException("The viet_id is required")
        viet_obj = Word.query.filter_by(word_id=viet_id).first()
        if not viet_obj:
            raise NotExistException("The Vietnamese word (word_id={}) does not exist".format(viet_id))
        if UserAction.get_user_type(user_id=user_id) == NORMAL_USER_TYPE:
            list_obj = ListAction.get_list_by_id(user_id=user_id, list_id=viet_obj.list_id)
            if not list_obj:
                raise UserPermissionException("The word does not belong to the user with id {}".format(user_id))
        viet_info = viet_obj.to_json()
        db.session.delete(viet_obj)
        db.session.commit()
        return viet_info

    @staticmethod
    def check_english_words(user_id, viet_id, eng_words: list) -> dict:
        """
        Check English answers of users.
        :param user_id: to check user's permission
        :param viet_id: id of Word Object. Use to get the object
        :param eng_words: list English answers of users
        :return: English words in DB and a list of user's checked English words
        """
        vietnamese_word = Word.query.filter_by(word_id=viet_id).first()
        if not vietnamese_word:
            raise NotExistException("The Vietnamese word does not exist")
        if UserAction.get_user_type(user_id=user_id) == NORMAL_USER_TYPE:
            list_obj = List.query.filter_by(user_id=user_id, list_id=vietnamese_word.list_id).first()
            if not list_obj:
                raise UserPermissionException("The word does not belong to the user with id {}".format(user_id))
        data = {}
        for row in WordAction.get_meaning(vietnamese_word):
            data.update({row.word_id: row.word})
        for i, user_answer in enumerate(eng_words):
            if user_answer["eng_word"] in data.values():
                eng_words[i].update({"status": 1})
            else:
                eng_words[i].update({"status": 0})
        return {"eng_data": data, "eng_words": eng_words}

    @staticmethod
    def get_meaning(word_obj: Word):
        if word_obj.language_type == VIETNAMESE_LANGUAGE_TYPE:
            meaning_ids = WordMeaning.query.filter_by(vietnamese_id=word_obj.word_id).all()
            meanings = []
            for meaning_id in meaning_ids:
                meanings.append(Word.query.filter_by(word_id=meaning_id.english_id).first())
            return meanings
        else:
            meaning_ids = WordMeaning.query.filter_by(english_id=word_obj.word_id).all()
            meanings = []
            for meaning_id in meaning_ids:
                meanings.append(Word.query.filter_by(word_id=meaning_id.vietnamese_id).first())
            return meanings


