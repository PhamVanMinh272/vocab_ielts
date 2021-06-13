from main import db, ma


class Viet(db.Model):
    __tablename__ = "viet_words"
    viet_id = db.Column(db.Integer, primary_key=True)
    viet_word = db.Column(db.String(200), unique=True, nullable=False)

    def __repr__(self):
        return self.viet_word

    def to_json(self):
        return VietSchema().dump(self)


class VietSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Viet
        include_fk = True
