from model.list import List, ListSchema
from utils.exceptions import (
    NotExistException, AlreadyExistException, InvalidValueException
)
from main import db


class ListAction:
    @staticmethod
    def get_all_lists():
        all_list_objects = List.query.all()
        all_list_dicts = ListSchema().dump(all_list_objects, many=True)
        return all_list_dicts

    @staticmethod
    def create(list_name):
        list_obj = List.query.filter_by(list_name=list_name).first()
        if list_obj:
            raise AlreadyExistException("The list {} already exists.")
        new_list_obj = List(list_name=list_name)
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
