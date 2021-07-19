import datetime
from model.user import User, UserSchema
from utils.exceptions import (
    InvalidValueException,
    NotExistException,
    AlreadyExistException,
)
from constants.action_constants import DICTIONARY_TYPE, NORMAL_USER_TYPE
from main import db, bcrypt
from flask_login import UserMixin


class UserAction(UserMixin):
    @staticmethod
    def create(username, password, return_type=DICTIONARY_TYPE) -> dict:
        if " " in username:
            raise InvalidValueException("The space character does not allow")
        user = User.query.filter_by(username=username).first()
        if user:
            raise AlreadyExistException(
                "The username {} is already exists".format(username)
            )
        user = User(
            username=username,
            password=bcrypt.generate_password_hash(password).decode("utf-8"),
            user_type=NORMAL_USER_TYPE,
            inserted_time=int(datetime.datetime.now().timestamp()),
        )
        db.session.add(user)
        db.session.commit()
        return user.to_json() if return_type == DICTIONARY_TYPE else user

    @staticmethod
    def login(username, password) -> User:
        user_obj = User.query.filter_by(username=username).first()
        if not user_obj:
            raise NotExistException("The user does not exist.")
        if bcrypt.check_password_hash(user_obj.password, password):
            return user_obj
        return False

    @staticmethod
    def get_user_type(user_id):
        user_obj = User.query.filter_by(user_id=user_id).first()
        if not user_obj:
            raise NotExistException(
                "The user (user_id={}) does not exist".format(user_id)
            )
        return user_obj.user_type
