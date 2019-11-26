python3 -m http.server & 
pid1=$!
FLASK_APP=tsneGrid.py flask run
kill $pid1
