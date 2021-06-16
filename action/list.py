from model.list import List, ListSchema
from exceptions import NotExistException, InvalidValueException
from main import db


class ListAction:
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
