from flask import (
    render_template, request, flash, redirect, url_for
)
import json
from flask_login import login_user, login_required, logout_user, current_user
from main import app, login_manager
from action.list import ListAction
from action.viet import VietAction
from action.user import UserAction
from utils.exceptions import (
    NotExistException, AlreadyExistException
)
from utils.utils import rm_redundant_space
from utils.log_config import logging


@app.route('/login', methods=['POST'])
def login():
    try:
        username = request.form.get("username")
        password = request.form.get("password")
        user = UserAction.login(username, password)
        if user:
            login_user(user)
            flash("Login successfully", "success")
            return redirect(url_for("home_page"))
        flash("The password is wrong")
        return redirect(url_for("home_page"))
    except NotExistException as ex:
        logging.exception(ex)
        flash("The user does not exist")
        return redirect(url_for("home_page"))
    except Exception as ex:
        logging.exception(ex)
        flash("Login failed")
        return redirect(url_for("home_page"))


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return {"message": "Logout successfully"}


@app.route('/profile', methods=['GET'])
@login_required
def profile_page():
    return render_template('profile.html', page="profile_page")


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
        lesson = request.args.get("lesson")
        if lesson:
            try:
                number_of_words = int(request.args['number_of_words'])
            except Exception as ex:
                logging.exception(ex)
                return {'erMsg': 'The number of words is invalid.'}, 400
            data = VietAction.get_words_for_a_lesson(list_id=list_id, quantity=number_of_words)
        else:
            data = VietAction.get_words_by_list_id(list_id)
        return {"viets": data}, 200
    except NotExistException as ex:
        logging.exception(ex)
        return {'erMsg': 'The list does not exist.'}, 404
    except Exception as ex:
        logging.exception(ex)
        return {'erMsg': 'Failed to get all lists.'}, 500


@app.route('/words/<word_id>', methods=['GET'])
def get_a_vietnamese_word(word_id):
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
        viet_value = rm_redundant_space(request.form['viet'])
        engs_value = rm_redundant_space(request.form['engs'])
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


@app.route('/words/<viet_id>/check-vocab', methods=['GET'])
def check_vocab(viet_id):
    try:
        eng_words = request.args["eng_words"]
        eng_words = json.loads(eng_words)
        data = VietAction.check_english_words(viet_id=viet_id, eng_words=eng_words)
        return {"eng_data": data, "eng_words": eng_words}
    except Exception as ex:
        logging.exception(ex)
        return {}


@app.route("/register", methods=["POST"])
def register():
    try:
        username = request.form.get("username")
        password = request.form.get("password")
        confirm_password = request.form.get("confirm_password")
        if not username or not password or not confirm_password:
            return {'erMsg': 'The input data are not valid.'}, 400
        if password != confirm_password:
            return {'erMsg': 'The confirm-password does not match the password.'}, 400
        UserAction.create(username=username, password=password)
        return {}
    except AlreadyExistException as ex:
        logging.exception(ex)
        return {'erMsg': 'The username has already existed.'}, 400
    except Exception as ex:
        logging.exception(ex)
        return {'erMsg': 'Failed to register.'}, 500


if __name__ == "__main__":
    app.run()
