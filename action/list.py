from datetime import datetime
from model.list import List, ListSchema
from model.word import Word, WordSchema
from action.user import UserAction
from utils.exceptions import (
    NotExistException,
    AlreadyExistException,
    InvalidValueException,
)
from main import db
from constants.action_constants import (
    GENERAL_USER_ID,
    ADMIN_USER_TYPE,
    PRIVATE_LIST_TYPE,
    PUBLIC_LIST_TYPE,
    DICTIONARY_TYPE,
    OBJECT_TYPE,
    VIETNAMESE_LANGUAGE_TYPE,
)


class ListAction:
    @staticmethod
    def get_list_by_id(user_id, list_id, return_type=DICTIONARY_TYPE):
        if not list_id:
            raise InvalidValueException("The list id is required.")
        if not user_id:
            list_entity = List.query.filter_by(
                list_id=list_id, list_type=PUBLIC_LIST_TYPE
            ).first()
        elif UserAction.get_user_type(user_id=user_id) == ADMIN_USER_TYPE:
            list_entity = List.query.filter_by(list_id=list_id).first()
        else:
            list_entity = List.query.filter_by(list_id=list_id, user_id=user_id).first()
            if not list_entity:
                list_entity = List.query.filter_by(
                    list_id=list_id, list_type=PUBLIC_LIST_TYPE
                ).first()
        if not list_entity:
            raise NotExistException(
                "The list (list_id={}) does not exist.".format(list_id)
            )
        return list_entity.to_json() if return_type == DICTIONARY_TYPE else list_entity

    @staticmethod
    def get_lists(user_id, return_type=DICTIONARY_TYPE) -> list:
        if not user_id:
            all_lists = List.query.filter_by(list_type=PUBLIC_LIST_TYPE).all()
        elif UserAction.get_user_type(user_id=user_id) == ADMIN_USER_TYPE:
            all_lists = List.query.all()
        else:
            all_lists = List.query.filter_by(list_type=PUBLIC_LIST_TYPE).all()
            all_lists.extend(List.query.filter_by(user_id=user_id).all())
        if return_type == DICTIONARY_TYPE:
            all_lists = ListSchema().dump(all_lists, many=True)
        return all_lists

    @staticmethod
    def get_all_lists_and_words_quantity(user_id) -> list:
        all_lists = ListAction.get_lists(user_id=user_id)
        all_lists_with_words_quanity = []
        for list_info in all_lists:
            words = Word.query.filter_by(list_id=list_info["list_id"]).all()
            vietnamese_words_quantity = len(
                [i for i in words if i.language_type == VIETNAMESE_LANGUAGE_TYPE]
            )
            list_info.update(
                {
                    "num_viets": vietnamese_words_quantity,
                    "num_engs": len(words) - vietnamese_words_quantity,
                }
            )
            all_lists_with_words_quanity.append(list_info)
        return all_lists_with_words_quanity

    @staticmethod
    def search_lists_by_name(user_id, list_name: str = ""):
        if not list_name.strip():
            raise InvalidValueException("List name is required")
        all_lists = ListAction.get_lists(user_id=user_id)
        data = []
        for list_info in all_lists:
            if list_name in list_info["list_name"]:
                words = Word.query.filter_by(list_id=list_info["list_id"]).all()
                vietnamese_words_quantity = len(
                    [
                        i
                        for i in words
                        if i.language_type == VIETNAMESE_LANGUAGE_TYPE
                    ]
                )
                list_info.update(
                    {
                        "num_viets": vietnamese_words_quantity,
                        "num_engs": len(words) - vietnamese_words_quantity
                    }
                )
                data.append(list_info)
        return data

    @staticmethod
    def create(list_name, user_id) -> dict:
        list_objs = List.query.filter_by(
            list_name=list_name, list_type=PUBLIC_LIST_TYPE
        ).all()
        list_objs.extend(
            List.query.filter_by(list_name=list_name, user_id=user_id).all()
        )
        if list_objs:
            raise AlreadyExistException("The list {} already exists")
        new_list_obj = List(
            list_name=list_name,
            inserted_time=int(datetime.now().timestamp()),
            user_id=user_id,
            list_type=PRIVATE_LIST_TYPE
        )
        db.session.add(new_list_obj)
        db.session.commit()
        return ListSchema().dump(new_list_obj)

    @staticmethod
    def delete(user_id, list_id):
        if not user_id or not list_id:
            raise InvalidValueException("list_id and user_id are required")
        elif UserAction.get_user_type(user_id=user_id) == ADMIN_USER_TYPE:
            list_obj = List.query.filter_by(list_id=list_id).first()
        else:
            list_obj = List.query.filter_by(user_id=user_id, list_id=list_id).first()
        if list_obj:
            list_info = list_obj.to_json()
            db.session.delete(list_obj)
            db.session.commit()
            return list_info
        else:
            raise NotExistException("The list not found")
