from flask import (
    Flask, g
)
import sqlite3
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

app = Flask(__name__)
app.secret_key = 'why_do_we_need_this?'
DATABASE = 'db/vocab_test.db'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/vocab_test.db'
db = SQLAlchemy(app)
ma = Marshmallow(app)


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
