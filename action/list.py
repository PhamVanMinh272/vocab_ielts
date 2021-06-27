from datetime import datetime
from model.list import List, ListSchema
from utils.exceptions import (
    NotExistException, AlreadyExistException, InvalidValueException
)
from main import db
from constants.action_constants import GENERAL_USER_ID


class ListAction:
    @staticmethod
    def get_lists_by_user_id(user_id) -> list:
        all_list_objects = List.query.filter_by(user_id=GENERAL_USER_ID).all()
        if user_id:
            all_list_objects.extend(List.query.filter_by(user_id=user_id).all())
        all_list_dicts = ListSchema().dump(all_list_objects, many=True)
        return all_list_dicts

    @staticmethod
    def get_all_lists_and_viet_words_quantity(user_id) -> list:
        all_lists = List.query.filter_by(user_id=GENERAL_USER_ID).all()
        all_lists.extend(List.query.filter_by(user_id=user_id).all())
        all_lists_with_num_viet = []
        for list_entity in all_lists:
            item = list_entity.to_json()
            item.update({
                "num_viets": len(list_entity.list_and_viet)
            })
            all_lists_with_num_viet.append(item)
        return all_lists_with_num_viet

    @staticmethod
    def search_lists_by_name(user_id, list_name: str = ''):
        if not list_name.strip():
            raise InvalidValueException("List name is required")
        all_lists = List.query.filter_by(user_id=GENERAL_USER_ID).all()
        all_lists.extend(List.query.filter_by(user_id=user_id).all())
        data = []
        for list_entity in all_lists:
            if list_name in list_entity.list_name:
                item = list_entity.to_json()
                item.update({
                    "num_viets": len(list_entity.list_and_viet)
                })
                data.append(item)
        return data

    @staticmethod
    def create(list_name, user_id) -> dict:
        list_objs = List.query.filter_by(list_name=list_name, user_id=GENERAL_USER_ID).all()
        list_objs.extend(List.query.filter_by(list_name=list_name, user_id=user_id).all())
        if list_objs:
            raise AlreadyExistException("The list {} already exists")
        inserted_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        new_list_obj = List(list_name=list_name, inserted_time=inserted_time, user_id=user_id)
        db.session.add(new_list_obj)
        db.session.commit()
        return ListSchema().dump(new_list_obj)

    @staticmethod
    def delete(list_id=None, list_name=None):
        if list_id:
            list_obj = List.query.filter_by(list_id=list_id).first()
        elif list_name:
            list_obj = List.query.filter_by(list_name=list_name).first()
        else:
            raise InvalidValueException("Either list_id or list_name is required")
        if list_obj:
            db.session.delete(list_obj)
            db.session.commit()
        else:
            raise NotExistException("The list not found")
