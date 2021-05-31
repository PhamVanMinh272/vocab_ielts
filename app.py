from flask import (
    Flask, render_template, request, redirect, flash, g
)
import random
import json
import sqlite3
from forms import SaveWordsForm

app = Flask(__name__)
app.secret_key = 'why_do_we_need_this?'
DATABASE = 'db/vocab_test.db'


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db


def get_db_connection():
    try:
        with app.app_context():
            db = get_db()
            db.row_factory = sqlite3.Row
            return db
    except Exception:
        return None


@app.route('/', methods=['GET'])
def home_page():
    return render_template('home.html', page="home_page")


@app.route('/vocab_repository', methods=['GET'])
def vocab_repository_page():
    form = SaveWordsForm()
    return render_template('vocab_repository.html', form=form, page="vocab_repository_page")


@app.route('/save_words', methods=['POST'])
def save_words():
    try:
        viet_value = request.form['viet']
        engs_value = request.form['engs']
        if not viet_value or not engs_value:
            flash('Failed to save. The words are empty.', 'error')
            return redirect('/vocab_repository')
        engs = engs_value.split(',')
        db = get_db_connection()
        cur = db.cursor()
        cur.execute('select viet_id from viet_words where viet_word="{}"'.format(viet_value))
        rs = cur.fetchall()
        if rs:
            viet_id = rs[0]["viet_id"]
        else:
            cur.execute('insert into viet_words("viet_word") values("{}")'.format(viet_value))
            viet_id = cur.lastrowid
        for eng in engs:
            if eng:
                cur.execute('select eng_id from eng_words where eng_word="{}"'.format(eng))
                rs = cur.fetchall()
                if rs:
                    eng_id = rs[0]["eng_id"]
                    cur.execute('select viet_id from viet_eng where eng_id={} and viet_id={}'.format(eng_id, viet_id))
                    rows = cur.fetchall()
                    if not rows:
                        cur.execute('insert into viet_eng("viet_id", "eng_id") values({}, {})'.format(viet_id, eng_id))
                    else:
                        flash('Already exists', 'success')
                        return redirect('/vocab_repository')
                else:
                    cur.execute('insert into eng_words("eng_word") values("{}")'.format(eng))
                    eng_id = cur.lastrowid
                    cur.execute('insert into viet_eng("viet_id", "eng_id") values({}, {})'.format(viet_id, eng_id))
        cur.close()
        db.commit()
        flash('The words {} - {} were saved successfully.'.format(viet_value, engs_value), 'success')
        return redirect('/vocab_repository')
    except Exception:
        flash('Failed to save', 'error')
        return redirect('/vocab_repository')


@app.route('/learn_vocab', methods=['GET'])
def learn_vocab():
    db = get_db_connection()
    cur = db.cursor()
    cur.execute('select * from viet_words')
    viet_words = cur.fetchall()
    cur.close()
    if not viet_words:
        return {}
    data = {}
    random.shuffle(viet_words)
    no = [i for i in range(1, len(viet_words)+1)]
    random.shuffle(no)
    for i, row in enumerate(viet_words):
        data.update({no[i]: {"id": row["viet_id"], "viet_word": row["viet_word"]}})
    return data


@app.route('/check_vocab', methods=['GET'])
def check_vocab():
    try:
        viet_id = request.args["viet_id"]
        eng_words = request.args["eng_words"]
        eng_words = json.loads(eng_words)
        db = get_db_connection()
        cur = db.cursor()
        cur.execute("""
            select viet_eng.eng_id, eng_word 
            from viet_eng, eng_words 
            where viet_eng.eng_id=eng_words.eng_id and viet_id={}""".format(viet_id))
        rows = cur.fetchall()
        data = {}
        if rows:
            for row in rows:
                data.update({row["eng_id"]: row["eng_word"]})
        for i, user_answer in enumerate(eng_words):
            if user_answer["eng_word"] in data.values():
                eng_words[i].update({"status": 1})
            else:
                eng_words[i].update({"status": 0})
        return {"eng_data": data, "eng_words": eng_words}
    except Exception as ex:
        return {}


if __name__ == "__main__":
    app.run()
