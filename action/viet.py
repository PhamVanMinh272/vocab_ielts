import datetime
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
