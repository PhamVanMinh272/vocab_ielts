import datetime
from model.viet import Viet, VietSchema
from model.list import List, ListSchema
from model.eng import Eng, EngSchema
from utils.exceptions import NotExistException, AlreadyExistException
from constants.action_constants import DICTIONARY_TYPE, OBJECT_TYPE
from main import db


class EngAction:
    @staticmethod
    def create(eng_word, return_type=DICTIONARY_TYPE) -> dict:
        eng = Eng.query.filter_by(eng_word=eng_word).first()
        if eng:
            raise AlreadyExistException("The English word {} already exists.".format(eng_word))
        inserted_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        eng = Eng(eng_word=eng_word, inserted_time=inserted_time)
        db.session.add(eng)
        db.session.commit()
        return eng.to_json() if return_type == DICTIONARY_TYPE else eng

    @staticmethod
    def update(eng_id, eng_word):
        eng_obj = Eng.query.filter_by(eng_id=eng_id).first()
        if not eng_obj:
            raise NotExistException("The English word (eng_id={}) does not exist".format(eng_id))
        eng_obj.eng_word = eng_word
        db.session.commit()
        return eng_obj.to_json()

    @staticmethod
    def delete(eng_id):
        eng_obj = Eng.query.filter_by(eng_id=eng_id).first()
        if not eng_obj:
            raise NotExistException("The English word (eng_id={}) does not exist".format(eng_id))
        eng_info = eng_obj.to_json()
        db.session.delete(eng_obj)
        db.session.commit()
        return eng_info

