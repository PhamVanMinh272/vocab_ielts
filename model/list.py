from main import db, ma
from .word import Word


class List(db.Model):
    __tablename__ = "list"
    list_id = db.Column(db.Integer, primary_key=True)
    list_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(1000))
    inserted_time = db.Column(db.String(100), nullable=False)
    list_type = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    words = db.relationship("Word", backref="list", cascade="all, delete", lazy=True)

    def __repr__(self):
        return self.list_name

    def to_json(self):
        return ListSchema().dump(self)


class ListSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = List
        include_fk = True
