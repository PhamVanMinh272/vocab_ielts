import re


def rm_redundant_space(input_str):
    return re.sub(" +", " ", input_str).strip()
