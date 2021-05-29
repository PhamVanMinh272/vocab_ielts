from flask import (
    Flask, render_template, request, redirect, flash
)
import json
from forms import SaveWordsForm
from exceptions import NotExistException

app = Flask(__name__)
app.secret_key = 'why_do_we_need_this?'

@app.route('/', methods=['GET'])
def home_page():
    form = SaveWordsForm()
    return render_template('home.html', form=form)


@app.route('/save_words', methods=['POST'])
def save_words():
    try:
        viet_value = request.form['viet'].strip()
        engs_value = request.form['engs'].strip()
        if not viet_value or not engs_value:
            raise NotExistException("The words are empty")
        with open('data/viet_eng_words.json', 'r+') as f:
            data = json.loads(f.read())
        engs = engs_value.split(',')
        current_engs = data.get(viet_value, [])
        for i in engs:
            if i and i not in current_engs:
                current_engs.append(i)
        data.update({viet_value: current_engs})
        with open('data/viet_eng_words.json', 'w') as f:
            json.dump(data, f, ensure_ascii=False)
        flash('The words {} - {} were saved successfully.'.format(viet_value, engs_value), 'success')
        return redirect('/')
    except NotExistException as ex:
        flash('Failed to save. The words are empty.', 'error')
        return redirect('/')
    except Exception as ex:
        flash('Failed to save', 'error')
        return redirect('/')


if __name__ == "__main__":
    app.run()