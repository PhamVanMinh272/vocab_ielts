from wtforms import Form, StringField, validators


class SaveWordsForm(Form):
    viet = StringField('Vietnamese word', [
        validators.DataRequired(),
        validators.Length(min=1, max=200)
    ])
    engs = StringField('English words', [
        validators.DataRequired(),
        validators.Length(min=1, max=200)
    ])
