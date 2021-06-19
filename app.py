from flask import (
    render_template, request, flash
)
import random
import json
import datetime
import logging
from main import app, get_db_connection
from model.list import List
from model.viet import Viet
from model.eng import EngSchema
from action.list import ListAction
from utils.exceptions import (
    NotExistException, AlreadyExistException
)
from utils import utils

logging.basicConfig(filename='log/vocab.log', level=logging.DEBUG)


@app.route('/', methods=['GET'])
def home_page():
    lists = ListAction.get_all_lists()
    return render_template('home.html', page="home_page", lists=lists)


@app.route('/list', methods=['POST'])
def create_list():
    try:
        list_name = utils.rm_redundant_space(request.form['list_name'])
        if not list_name:
            return {"erMsg": "Failed to create your list. Your list's name is empty."}, 400
        new_list = ListAction.create(list_name)
        return new_list, 200
    except AlreadyExistException as ex:
        logging.exception(ex)
        return {"erMsg": "Duplicate list name."}, 400
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Failed to create your list."}, 500


@app.route('/list/<list_name>', methods=['DELETE'])
def delete_list(list_name):
    try:
        ListAction.delete(list_name=list_name)
        return {"message": "The list {} was deleted".format(list_name)}, 200
    except NotExistException as ex:
        logging.exception(ex)
        return {'erMsg': 'Failed to delete the list. The list was not found.'}, 400
    except Exception as ex:
        logging.exception(ex)
        return {'erMsg': 'Failed to delete the list.'}, 500


@app.route('/get-all-words-in-a-list', methods=['GET'])
def get_all_words_in_a_list():
    try:
        list_name = request.args["list_name"].strip()
        if not list_name:
            return {'erMsg': "List's name is required."}, 400
        list = List.query.filter_by(list_name=list_name).first()
        if not list:
            return {'erMsg': "The list does not exist."}, 404
        viets = list.list_and_viet
        viets_with_engs = []
        for viet in viets:
            item = viet.to_json()
            item.update({
                'eng_words':  EngSchema(many=True).dump(viet.english_words)
            })
            viets_with_engs.append(item)
        return {"viets": viets_with_engs}, 200
    except Exception as ex:
        return {'erMsg': 'Failed to get all lists.'}, 500


@app.route('/get-viet-word-in-a-list', methods=['GET'])
def get_viet_word_in_a_list():
    try:
        viet_id = request.args["viet_id"].strip()
        viet = Viet.query.filter_by(viet_id=viet_id).first()
        if viet:
            viet_with_engs = viet.to_json()
            viet_with_engs.update({
                'eng_words':  EngSchema(many=True).dump(viet.english_words)
            })
            return viet_with_engs, 200
        return {'erMsg': 'Cannot find the Vietnamese word.'}, 404
    except Exception as ex:
        return {'erMsg': 'Failed to get Vietnamese word.'}, 500


@app.route('/vocab_repository', methods=['GET'])
def vocab_repository_page():
    try:
        all_lists_with_num_viet = ListAction.get_all_lists_and_viet_words_quantity()
        return render_template(
            'vocab_repository.html',
            lists=all_lists_with_num_viet,
            page="vocab_repository_page"
        )
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Cannot render the page."}, 500


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
        list_name = request.args['list_name']
        db = get_db_connection()
        cur = db.cursor()
        if list_name:
            cur.execute('select list_id from list where list_name="{}"'.format(list_name))
            list_id = cur.fetchone()["list_id"]
            cur.execute("""
                select viet_words.viet_id, viet_word 
                from viet_words join list_and_viet on viet_words.viet_id = list_and_viet.viet_id
                where list_id={}""".format(list_id))
        else:
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
