from flask import (
    render_template, request, flash
)
import random
import json
from main import app, get_db_connection
from action.list import ListAction
from action.viet import VietAction
from utils.exceptions import (
    NotExistException, AlreadyExistException
)
from utils.utils import rm_redundant_space
from utils.log_config import logging


@app.route('/', methods=['GET'])
def home_page():
    lists = ListAction.get_all_lists()
    return render_template('home.html', page="home_page", lists=lists)


@app.route('/vocab-repository', methods=['GET'])
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


@app.route('/lists', methods=['POST'])
def create_list():
    try:
        list_name = rm_redundant_space(request.form['list_name'])
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


@app.route('/lists/<list_name>', methods=['DELETE'])
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


@app.route('/lists/<list_id>/words', methods=['GET'])
def get_words(list_id):
    try:
        viets_with_engs = VietAction.get_words_by_list_id(list_id)
        return {"viets": viets_with_engs}, 200
    except NotExistException as ex:
        logging.exception(ex)
        return {'erMsg': 'The list does not exist.'}, 404
    except Exception as ex:
        logging.exception(ex)
        return {'erMsg': 'Failed to get all lists.'}, 500


@app.route('/words/<word_id>', methods=['GET'])
def get_vietnamese_word(word_id):
    try:
        viet_with_engs = VietAction.get_word_by_word_id(word_id=word_id)
        return viet_with_engs, 200
    except NotExistException as ex:
        logging.exception(ex)
        return {'erMsg': 'Cannot find the Vietnamese word.'}, 404
    except Exception as ex:
        logging.exception(ex)
        return {'erMsg': 'Failed to get Vietnamese word.'}, 500


@app.route('/lists/<list_id>/words', methods=['POST'])
def save_words(list_id):
    try:
        viet_value = request.form['viet']
        engs_value = request.form['engs']
        engs_value = json.loads(engs_value)
        if not viet_value or not engs_value:
            return {'erMsg': 'Failed to save. The words are empty.'}, 404
        VietAction.create(list_id=list_id, viet_word=viet_value, eng_words=engs_value)
        return {"message": 'The words {} - {} were saved successfully.'.format(
            viet_value, " - ".join(engs_value)
        )}, 200
    except Exception as ex:
        logging.exception(ex)
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
