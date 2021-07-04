class NotExistException(Exception):
    """
    Cannot find DB object. Does not exist in DB.
    """
    pass


class AlreadyExistException(Exception):
    """
    Objects already exist in DB.
    """
    pass


class InvalidValueException(Exception):
    """
    Receive unexpected values.
    """
    pass


class UserPermissionException(Exception):
    """
    The user does not have permission to access a resource.
    """
    pass
