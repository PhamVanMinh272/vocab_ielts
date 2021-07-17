FROM python:3.6

COPY . /vocab/
WORKDIR /vocab/
RUN pip3 install -r requirements.txt

CMD ["python3", "app.py"]
