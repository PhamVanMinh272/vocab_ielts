from main import db, ma, login_manager
from flask_login import UserMixin


@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(user_id=user_id).first()


class User(UserMixin, db.Model):
    __tablename__ = "user"
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(200), unique=True, nullable=False)
    password = db.Column(db.String(200), unique=True, nullable=False)
    user_type = db.Column(db.Integer)
    inserted_time = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return self.username

    def to_json(self):
        return UserSchema().dump(self)

    def get_id(self):
        return self.user_id


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
