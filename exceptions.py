class NotExistException(Exception):
    """
    Cannot find DB object. Does not exist in DB.
    """
    pass


class InvalidValueException(Exception):
    """
    Receive unexpected values.
    """
    pass
