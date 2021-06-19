from model.viet import Viet, VietSchema
from model.list import List, ListSchema
from model.eng import Eng, EngSchema
from utils.exceptions import NotExistException


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
