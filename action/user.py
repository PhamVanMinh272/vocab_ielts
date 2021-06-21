import datetime
from model.user import User, UserSchema
from utils.exceptions import NotExistException, AlreadyExistException
from constants.action_constants import DICTIONARY_TYPE, OBJECT_TYPE
from main import db, bcrypt


class UserAction:
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
