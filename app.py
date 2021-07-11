from flask import render_template, request, flash, redirect, url_for
import json
from flask_login import login_user, login_required, logout_user, current_user
from main import app
from action.list import ListAction
from action.word import WordAction
from action.user import UserAction
from utils.exceptions import InvalidValueException, NotExistException, AlreadyExistException
from utils.utils import rm_redundant_space
from utils.log_config import logging
from constants.route_constants import (
    SUCCESS_FLASH_MESSAGE_TYPE,
    ERROR_FLASH_MESSAGE_TYPE,
)


@app.route("/register", methods=["POST"])
def register():
    try:
        if request.content_length > 500:
            return {"erMsg": "The input data is too large"}, 400
        data = request.get_data()
        try:
            json_data = json.loads(data)
            username = json_data.get("username")
            password = json_data.get("password")
            confirm_password = json_data.get("confirm_password")
        except Exception as ex:
            logging.exception(ex)
            return {"erMsg": "Cannot read the input data as a json"}, 400
        if not username or not password or not confirm_password:
            return {"erMsg": "The input data is invalid"}, 400
        if password != confirm_password:
            return {"erMsg": "The confirm-password does not match the password"}, 400
        UserAction.create(username=username, password=password)
        login()
        return {"message": "Create your account successfully"}, 200
    except AlreadyExistException as ex:
        logging.exception(ex)
        return {"erMsg": "The username has already existed"}, 400
    except InvalidValueException as ex:
        logging.error(ex)
        return {"erMsg": "The input data is invalid"}, 400
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Failed to register"}, 500


@app.route("/login", methods=["POST"])
def login():
    try:
        if request.content_length > 500:
            return {"erMsg": "The input data is too large"}, 400
        if request.content_type == 'application/x-www-form-urlencoded':
            data = request.form
        else:
            data = request.get_data(parse_form_data=True)
            try:
                data = json.loads(data)
            except Exception as ex:
                logging.exception(ex)
                return {"erMsg": "Cannot read the input data as a json"}, 400
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            return {"erMsg": "The input data is invalid"}, 400
        user = UserAction.login(username, password)
        if user:
            login_user(user)
            return {"message": "Login successfully"}
        return {"erMsg": "Password is incorrect"}, 400
    except NotExistException as ex:
        logging.exception(ex)
        return {"erMsg": "Username is incorrect"}, 400
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Login failed"}, 500


@app.route("/logout", methods=["GET"])
@login_required
def logout():
    logout_user()
    # flash("Logout successfully", SUCCESS_FLASH_MESSAGE_TYPE)
    return redirect(url_for("home_page"))


@app.route("/profile", methods=["GET"])
@login_required
def profile_page():
    return render_template("profile.html", page="profile_page")


@app.route("/", methods=["GET"])
def home_page():
    try:
        user_id = current_user.user_id if current_user.is_authenticated else None
        lists = ListAction.get_all_lists_and_words_quantity(user_id=user_id)
        return render_template("home.html", page="home_page", lists=lists)
    except Exception as ex:
        logging.exception(ex)
        flash("Failed to load the page", ERROR_FLASH_MESSAGE_TYPE)
        return render_template("home.html", page="home_page", lists=[])


@app.route("/lesson/<list_id>", methods=["GET"])
def lesson_page(list_id):
    try:
        user_id = current_user.user_id if current_user.is_authenticated else None
        list_dict = ListAction.get_list_by_id(user_id=user_id, list_id=list_id)
        # use home_page to show lesson
        return render_template("lesson.html", page="home_page", list=list_dict)
    except Exception as ex:
        logging.exception(ex)
        flash("Failed to load the page", ERROR_FLASH_MESSAGE_TYPE)
        return render_template("home.html", page="home_page", lists=[])


@app.route("/search/lists", methods=["GET"])
def search_lists():
    try:
        list_name = rm_redundant_space(request.args.get("list_name"))
        user_id = current_user.user_id if current_user.is_authenticated else None
        lists = ListAction.search_lists_by_name(user_id=user_id, list_name=list_name)
        return {"lists": lists}
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Failed to search the lists"}, 500


@app.route("/lists", methods=["POST"])
def create_list():
    try:
        if not current_user.is_authenticated:
            return {"erMsg": "Please login to create your own list"}, 401
        list_name = rm_redundant_space(request.form["list_name"])
        if not list_name:
            return {
                "erMsg": "Failed to create your list. Your list's name is empty."
            }, 400
        new_list = ListAction.create(list_name=list_name, user_id=current_user.user_id)
        return new_list, 200
    except AlreadyExistException as ex:
        logging.exception(ex)
        return {"erMsg": "Duplicate list name."}, 400
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Failed to create your list."}, 500


@app.route("/lists/<list_id>", methods=["DELETE"])
@login_required
def delete_list(list_id):
    try:
        if not current_user.is_authenticated:
            return {"erMsg": "Please login to delete your list"}, 401
        list_info = ListAction.delete(user_id=current_user.user_id, list_id=list_id)
        return {
            "message": "The list {} was deleted".format(list_info["list_name"])
        }, 200
    except NotExistException as ex:
        logging.exception(ex)
        return {"erMsg": "The list was not found"}, 400
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Failed to delete the list"}, 500


@app.route("/lists/<list_id>/words", methods=["GET"])
def get_words(list_id):
    try:
        user_id = current_user.user_id if current_user.is_authenticated else None
        lesson = request.args.get("lesson")
        if lesson:
            try:
                number_of_words = int(request.args["number_of_words"])
            except Exception as ex:
                logging.exception(ex)
                return {"erMsg": "The number of words is invalid."}, 400
            data = WordAction.get_words_for_a_lesson(
                user_id=user_id, list_id=list_id, quantity=number_of_words
            )
        else:
            data = WordAction.get_words_by_list_id(user_id=user_id, list_id=list_id)
        return {"viets": data}, 200
    except NotExistException as ex:
        logging.exception(ex)
        return {"erMsg": "The list does not exist"}, 404
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Failed to get all lists."}, 500


@app.route("/words/<word_id>", methods=["GET"])
def get_a_vietnamese_word(word_id):
    try:
        user_id = current_user.user_id if current_user.is_authenticated else None
        viet_with_engs = WordAction.get_word_by_word_id(
            user_id=user_id, word_id=word_id
        )
        return viet_with_engs, 200
    except NotExistException as ex:
        logging.exception(ex)
        return {"erMsg": "Cannot find the Vietnamese word."}, 404
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Failed to get Vietnamese word."}, 500


@app.route("/lists/<list_id>/words", methods=["POST"])
def save_words(list_id):
    try:
        if not current_user.is_authenticated:
            return {"erMsg": "Please login to create your words"}, 401
        viet_value = rm_redundant_space(request.form["viet"])
        engs_value = rm_redundant_space(request.form["engs"])
        engs_value = json.loads(engs_value)
        if not viet_value or not engs_value:
            return {"erMsg": "Failed to save. The words are empty."}, 404
        WordAction.create(
            user_id=current_user.user_id,
            list_id=list_id,
            viet_word=viet_value,
            eng_words=engs_value,
        )
        return {
            "message": "The words {} - {} were saved successfully.".format(
                viet_value, " - ".join(engs_value)
            )
        }, 200
    except NotExistException as ex:
        logging.exception(ex)
        return {"erMsg": "The list does not exist"}, 500
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Failed to save."}, 500


@app.route("/words/<word_id>", methods=["PUT"])
def update_word(word_id):
    try:
        if not current_user.is_authenticated:
            return {"erMsg": "Please login to update your word"}, 401
        if not word_id:
            return {"erMsg": "Failed to save. Please provide a word"}, 404
        viet_word = request.form.get("viet_word")
        eng_words = request.form.get("eng_words")
        eng_words = json.loads(eng_words)
        new_eng_words = request.form.get("new_eng_words")
        new_eng_words = json.loads(new_eng_words)
        WordAction.update(
            user_id=current_user.user_id,
            viet_id=word_id,
            viet_word=viet_word,
            list_engs=eng_words,
            list_new_engs=new_eng_words,
        )
        return {"message": "The words were updated"}, 200
    except NotExistException as ex:
        logging.exception(ex)
        return {"erMsg": "The word does not exist"}, 500
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Failed to update the word."}, 500


@app.route("/words/<word_id>", methods=["DELETE"])
def delete_word(word_id):
    try:
        if not current_user.is_authenticated:
            return {"erMsg": "Please login to delete your words"}, 401
        if not word_id:
            return {"erMsg": "Please provide a word"}, 404
        deleted_word = WordAction.delete(user_id=current_user.user_id, viet_id=word_id)
        return {
            "message": "The words {} were deleted".format(deleted_word.get("word"))
        }, 200
    except NotExistException as ex:
        logging.exception(ex)
        return {"erMsg": "The word does not exist"}, 500
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Failed to delete words"}, 500


@app.route("/words/<viet_id>/check-vocab", methods=["GET"])
def check_vocab(viet_id):
    try:
        user_id = current_user.user_id if current_user.is_authenticated else None
        eng_words = request.args["eng_words"]
        eng_words = json.loads(eng_words)
        data = WordAction.check_english_words(
            user_id=user_id, viet_id=viet_id, eng_words=eng_words
        )
        return data, 200
    except Exception as ex:
        logging.exception(ex)
        return {"erMsg": "Failed to check answers"}, 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)
