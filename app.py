from flask import (
    Flask, render_template, request, redirect, flash, g
)
import random
import json
import sqlite3
import datetime
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
    db = get_db_connection()
    cur = db.cursor()
    cur.execute('select * from list')
    rs = cur.fetchall()
    lists = []
    for row in rs:
        lists.append(
            {
                "list_id": row["list_id"],
                "list_name": row["list_name"]
            }
        ) 
    return render_template('home.html', page="home_page", lists=lists)


@app.route('/create-list', methods=['POST'])
def create_list():
    try:
        list_name = request.form['list_name'].strip()
        if not list_name:
            return {"erMsg": "Failed to create your list. Your list's name is empty."}, 400
        db = get_db_connection()
        cur = db.cursor()
        cur.execute('select * from list where list_name="{}"'.format(list_name))
        rs = cur.fetchall()
        if rs:
            cur.close()
            return {"erMsg": "Duplicate list name."}, 400
        cur.execute('insert into list("list_name") values("{}") '.format(list_name))
        list_id = cur.lastrowid
        cur.close()
        db.commit()
        return {'list_id': list_id, 'list_name': list_name}, 200
    except Exception as ex:
        return {"erMsg": "Failed to create your list."}, 500


@app.route('/vocab_repository', methods=['GET'])
def vocab_repository_page():
    form = SaveWordsForm()
    db = get_db_connection()
    cur = db.cursor()
    cur.execute('select * from list')
    rs = cur.fetchall()
    lists = []
    for row in rs:
        lists.append(
            {
                "list_id": row["list_id"],
                "list_name": row["list_name"]
            }
        )
    return render_template(
        'vocab_repository.html',
        form=form,
        lists=lists,
        page="vocab_repository_page"
    )


@app.route('/save-words', methods=['POST'])
def save_words():
    try:
        list_name_value = request.form['list_name']
        viet_value = request.form['viet']
        engs_value = request.form['engs']
        engs_value = json.loads(engs_value)
        if not viet_value or not engs_value or not list_name_value:
            return {'erMsg': 'Failed to save. The words are empty.'}, 400
        inserted_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db = get_db_connection()
        cur = db.cursor()
        cur.execute('select viet_id from viet_words where viet_word="{}"'.format(viet_value))
        rs = cur.fetchall()
        if rs:
            viet_id = rs[0]["viet_id"]
        else:
            cur.execute('insert into viet_words("viet_word", "inserted_time") values("{}", "{}")'.format(viet_value, inserted_time))
            viet_id = cur.lastrowid
        # check list and vietnamese words. Create the relationship if it does not exist
        cur.execute('select list_id from list where list_name="{}"'.format(list_name_value))
        list_id = cur.fetchone()["list_id"]
        cur.execute('select * from list_and_viet where list_id={} and viet_id={}'.format(list_id, viet_id))
        if not cur.fetchall():
            cur.execute('insert into list_and_viet("list_id", "viet_id") values({}, {})'.format(list_id, viet_id))
        for eng in engs_value:
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
                    cur.execute(
                        'insert into eng_words("eng_word", "inserted_time") values("{}", "{}")'.format(
                            eng, inserted_time
                        )
                    )
                    eng_id = cur.lastrowid
                    cur.execute('insert into viet_eng("viet_id", "eng_id") values({}, {})'.format(viet_id, eng_id))
        cur.close()
        db.commit()
        return {"message": 'The words {} - {} in list {} were saved successfully.'.format(
            viet_value, " - ".join(engs_value), list_name_value
        )}, 200
    except Exception as ex:
        flash('Failed to save', 'error')
        return {'erMsg': 'Failed to save.'}, 500


@app.route('/learn_vocab', methods=['GET'])
def learn_vocab():
    try:
        number_of_words = int(request.args['number_of_words'])
        db = get_db_connection()
        cur = db.cursor()
        cur.execute('select * from viet_words')
        viet_words = cur.fetchall()
        cur.close()
        if not viet_words:
            return {}
        if number_of_words < len(viet_words):
            viet_words = viet_words[:number_of_words]
        data = {}
        random.shuffle(viet_words)
        no = [i for i in range(1, len(viet_words)+1)]
        random.shuffle(no)
        for i, row in enumerate(viet_words):
            data.update({no[i]: {"id": row["viet_id"], "viet_word": row["viet_word"]}})
        return data
    except Exception as ex:
        return {"erMsg": "Failed to start a lesson."}


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
