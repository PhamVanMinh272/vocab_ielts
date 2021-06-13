from main import db, ma


class List(db.Model):
    list_id = db.Column(db.Integer, primary_key=True)
    list_name = db.Column(db.String(200), unique=True, nullable=False)

    def __repr__(self):
        return self.list_name

    def to_json(self):
        return ListSchema().dump(self)


class ListSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = List
        include_fk = True
