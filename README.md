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

The code comes with wrappers for Matlab and Python. These wrappers write your data to a file called `data.dat`, run the `bh_tsne` binary, and read the result file `result.dat` that the binary produces. There are also external wrappers available for [Torch](https://github.com/clementfarabet/manifold), [R](https://github.com/jkrijthe/Rtsne), and [Julia](https://github.com/zhmz90/BHTsne.jl). Writing your own wrapper should be straightforward; please refer to one of the existing wrappers for the format of the data and result files.

Demonstration of usage in Python:

```
# first terminal: hosting the visualization side (client)
python3 -m http.server # for Python3
#or 
python -m SimpleHTTPServer 8000 # for Python2

# second terminal: hosting the computational side (server)
FLASK_APP=tsneGrid.py flask run
```

# Reproducability #
