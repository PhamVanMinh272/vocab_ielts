from main import db, ma


class Eng(db.Model):
    __tablename__ = "eng_words"
    eng_id = db.Column(db.Integer, primary_key=True)
    eng_word = db.Column(db.String(200), unique=True, nullable=False)

    def __repr__(self):
        return self.eng_word

    def to_json(self):
        return EngSchema().dump(self)


class EngSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Eng
        include_fk = True
