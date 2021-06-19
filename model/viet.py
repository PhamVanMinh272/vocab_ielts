from main import db, ma
from model.eng import Eng


english_words = db.Table('viet_eng',
    db.Column('eng_id', db.Integer, db.ForeignKey('eng_words.eng_id'), primary_key=True),
    db.Column('viet_id', db.Integer, db.ForeignKey('viet_words.viet_id'), primary_key=True)
)


class Viet(db.Model):
    __tablename__ = "viet_words"
    viet_id = db.Column(db.Integer, primary_key=True)
    viet_word = db.Column(db.String(200), unique=True, nullable=False)
    inserted_time = db.Column(db.String(100), nullable=False)
    english_words = db.relationship('Eng', secondary=english_words, lazy='subquery')

    def __repr__(self):
        return self.viet_word

    def to_json(self):
        return VietSchema().dump(self)


class VietSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Viet
        include_fk = True
