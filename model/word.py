from main import db, ma


class Word(db.Model):
    __tablename__ = "word"
    word_id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(200), nullable=False)
    context = db.Column(db.String(1000))
    language_type = db.Column(db.Integer)
    inserted_time = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.Integer)
    list_id = db.Column(db.Integer, db.ForeignKey('list.list_id'), nullable=False)

    def __repr__(self):
        return self.word

    def to_json(self):
        return WordSchema().dump(self)


class WordSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Word
