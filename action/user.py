import datetime
from model.user import User, UserSchema
from utils.exceptions import NotExistException, AlreadyExistException
from constants.action_constants import DICTIONARY_TYPE
from main import db, bcrypt
from flask_login import UserMixin


class UserAction(UserMixin):
    user_id = None

    def __init__(self, user_id):
        self.user_id = user_id

    @staticmethod
    def create(username, password, return_type=DICTIONARY_TYPE) -> dict:
        user = User.query.filter_by(username=username).first()
        if user:
            raise AlreadyExistException("The username {} is already exists.".format(username))
        inserted_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        user = User(
            username=username,
            password=bcrypt.generate_password_hash(password).decode('utf-8'),
            inserted_time=inserted_time
        )
        db.session.add(user)
        db.session.commit()
        return user.to_json() if return_type == DICTIONARY_TYPE else user

    @staticmethod
    def login(username, password) -> (User, bool):
        user_obj = User.query.filter_by(username=username).first()
        if not user_obj:
            raise NotExistException("The user does not exist.")
        if bcrypt.check_password_hash(user_obj.password, password):
            return user_obj
        return False


