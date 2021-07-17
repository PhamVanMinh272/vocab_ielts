from flask import Flask
import secrets
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from flask_login import LoginManager

app = Flask(__name__)
app.secret_key = secrets.token_hex()
DATABASE = "db/vocab_test.db"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/vocab.db"
db = SQLAlchemy(app)
ma = Marshmallow(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = "/"
login_manager.login_message_category = "error"
