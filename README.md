# t-viSNE: Interactive Assessment and Interpretation of t-SNE Projections #

This Git repository contains the code that accompanies a research publication so-called "t-viSNE: Interactive Assessment and Interpretation of t-SNE Projections". The details of the experiments and the research outcome are described in [this paper](https://arxiv.org/abs/2002.06910).

**Note:** This repository contains a frozen version (commit id: 127) that matches the paper's implementation. However, we plan to improve the implementation in the future.

# Data Sets #
The data sets are available online from the [UCI Machine Learning Repository](http://archive.ics.uci.edu/ml/index.php). We use the Iris data set, Breast Cancer Wisconsin (Original) data set, Pima Indians Diabetes data set, and the SPECTF Heart data set. All data sets are transformed in comma separated format (csv).

# Requirements #
For the backend:
- [Python3](https://www.python.org/downloads/)
- [Flask](https://palletsprojects.com/p/flask/)

For the frontend:
- [D3.js](https://d3js.org/)
- [Plotly.js](https://github.com/plotly/plotly.js/)

# Usage #
Demonstration of usage in Python:

```
# first terminal: hosting the visualization side (client)
# for Python3
python3 -m http.server 
#or 
# for Python2
python -m SimpleHTTPServer 8000

# second terminal: hosting the computational side (server)
FLASK_APP=tsneGrid.py flask run
```

# Reproducability of the Results #
