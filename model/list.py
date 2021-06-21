from main import db, ma
from .viet import Viet


list_and_viet = db.Table('list_and_viet',
    db.Column('list_id', db.Integer, db.ForeignKey('list.list_id'), primary_key=True),
    db.Column('viet_id', db.Integer, db.ForeignKey('viet_words.viet_id'), primary_key=True)
)


class List(db.Model):
    __tablename__ = "list"
    list_id = db.Column(db.Integer, primary_key=True)
    list_name = db.Column(db.String(200), unique=True, nullable=False)
    list_and_viet = db.relationship('Viet', secondary=list_and_viet, lazy='subquery')

    def __repr__(self):
        return self.list_name

    def to_json(self):
        return ListSchema().dump(self)


class ListSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = List
        include_fk = True
