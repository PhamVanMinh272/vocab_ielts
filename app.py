from flask import (
    Flask, render_template, request, redirect, flash
)
import json

app = Flask(__name__)
app.secret_key = 'aksna'

@app.route('/', methods=['GET'])
def home_page():
    return render_template('home.html')


@app.route('/save_words', methods=['POST'])
def save_words():
    try:
        viet = request.form['viet']
        eng = request.form['eng']
        with open('data/viet_eng_words.json', 'r+') as f:
            data = json.loads(f.read())
        engs = eng.split(',')
        current_engs = data.get(viet, [])
        for i in engs:
            if i and i not in current_engs:
                current_engs.append(i)
        data.update({viet: current_engs})
        with open('data/viet_eng_words.json', 'w') as f:
            json.dump(data, f, ensure_ascii=False)
        flash('The words {} - {} were saved successfully'.format(viet, eng), 'success')
        return redirect('/')
    except Exception as ex:
        flash('The words {} - {} were failed to save'.format(viet, eng), 'error')
        return redirect('/')



if __name__ == "__main__":
    app.run()