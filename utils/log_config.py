import logging
from logging import handlers


logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(levelname)s - %(asctime)s - %(name)s - %(message)s")
# stream logging
stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.DEBUG)
stream_handler.setFormatter(formatter)
logger.addHandler(stream_handler)
# rotate logging
log_file = "logs/vocab.log"
open(log_file, "a").close()
rotating_handler = handlers.TimedRotatingFileHandler(
    filename=log_file, when="midnight", interval=1, backupCount=30
)
rotating_handler.setFormatter(formatter)
logger.addHandler(rotating_handler)
