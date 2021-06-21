from main import db, ma


class User(db.Model):
    __tablename__ = "user"
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(200), unique=True, nullable=False)
    password = db.Column(db.String(200), unique=True, nullable=False)
    inserted_time = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return self.username

    def to_json(self):
        return UserSchema().dump(self)


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        include_fk = True
