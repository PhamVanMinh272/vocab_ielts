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


class ListForm(Form):
    list_name = StringField("List's Name", [
        validators.DataRequired(),
        validators.Length(min=1, max=200)
    ], render_kw={"placeholder": "Enter your list's name here"})
