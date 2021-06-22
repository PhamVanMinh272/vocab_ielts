import datetime
import logging
import random

from model.viet import Viet, VietSchema
from model.list import List, ListSchema
from model.eng import Eng, EngSchema
from action.eng import EngAction
from utils.utils import rm_redundant_space
from utils.exceptions import NotExistException, AlreadyExistException
from constants.action_constants import DICTIONARY_TYPE, OBJECT_TYPE
from main import db


class VietAction:
    @staticmethod
    def get_words_for_a_lesson(list_id=None, quantity=20) -> list:
        """
        Get Vietnamese words for a lesson.
        :param list_id: list_id=0 means get words in all lists.
        :param quantity: quantity of words will be returned.
        :return: a list of Vietnamese words. The words have the order randomly and have a number order to show in UI.
        """
        if list_id and list_id != '0':
            viet_words = VietAction.get_words_by_list_id(list_id=list_id)
        else:
            viet_words = VietAction.get_all_words()
        if not viet_words:
            logging.info("No words for a lesson.")
            return []
        random.shuffle(viet_words)
        if quantity < len(viet_words):
            viet_words = viet_words[:quantity]
        data = []
        no = [i for i in range(1, len(viet_words) + 1)]
        random.shuffle(no)
        for i, row in enumerate(viet_words):
            data.append({"id": row["viet_id"], "viet_word": row["viet_word"], 'no': no[i]})
        return data

    @staticmethod
    def get_all_words():
        vietnamese_words = Viet.query.all()
        return VietSchema(many=True).dump(vietnamese_words)

    @staticmethod
    def get_words_by_list_id(list_id):
        list_obj = List.query.filter_by(list_id=list_id).first()
        if not list_obj:
            raise NotExistException("The list (list_id={}) does not exist.".format(list_id))
        vietnamese_words = list_obj.list_and_viet
        viets_with_engs = []
        for vietnamese_word in vietnamese_words:
            item = vietnamese_word.to_json()
            item.update({
                'eng_words': EngSchema(many=True).dump(vietnamese_word.english_words)
            })
            viets_with_engs.append(item)
        return viets_with_engs

    @staticmethod
    def get_word_by_word_id(word_id):
        vietnamese_word = Viet.query.filter_by(viet_id=word_id).first()
        if vietnamese_word:
            viet_with_engs = vietnamese_word.to_json()
            viet_with_engs.update({
                'eng_words': EngSchema(many=True).dump(vietnamese_word.english_words)
            })
            return viet_with_engs
        raise NotExistException("The word does not exist.")

    @staticmethod
    def create(list_id: str, viet_word: str, eng_words: list, return_type=DICTIONARY_TYPE):
        inserted_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        vietnamese_word = Viet.query.filter_by(viet_word=viet_word).first()
        list_obj = List.query.filter_by(list_id=list_id).first()
        if not list_obj:
            raise NotExistException("The list does not exist.")
        if not vietnamese_word:
            vietnamese_word = Viet(viet_word=viet_word, inserted_time=inserted_time)
            db.session.add(vietnamese_word)
        list_obj.list_and_viet.append(vietnamese_word)
        eng_words = [rm_redundant_space(i) for i in eng_words]
        # remove duplicate eng_words
        eng_words = set(eng_words)
        for eng in eng_words:
            eng_obj = Eng.query.filter_by(eng_word=eng).first()
            if not eng_obj:
                eng_obj = EngAction.create(eng_word=eng, return_type=OBJECT_TYPE)
                vietnamese_word.english_words.append(eng_obj)
            else:
                vietnamese_word.english_words.append(eng_obj)
        db.session.commit()
        if return_type == DICTIONARY_TYPE:
            vietnamese_word = vietnamese_word.to_json()
        return vietnamese_word

    @staticmethod
    def check_english_words(viet_id, eng_words: list) -> dict:
        """
        Check English answers of users.
        :param viet_id: id of Viet Object
        :param eng_words: list English answers of users
        :return: English words in DB and a list of user's checked English words
        """
        vietnamese_word = Viet.query.filter_by(viet_id=viet_id).first()
        if not vietnamese_word:
            raise NotExistException("The Vietnamese word does not exist.")
        data = {}
        if vietnamese_word.english_words:
            for row in vietnamese_word.english_words:
                data.update({row.eng_id: row.eng_word})
        for i, user_answer in enumerate(eng_words):
            if user_answer["eng_word"] in data.values():
                eng_words[i].update({"status": 1})
            else:
                eng_words[i].update({"status": 0})
        return {"eng_data": data, "eng_words": eng_words}
