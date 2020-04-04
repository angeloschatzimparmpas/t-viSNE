# t-viSNE: Interactive Assessment and Interpretation of t-SNE Projections #
This Git repository contains the code that accompanies a research publication so-called "t-viSNE: Interactive Assessment and Interpretation of t-SNE Projections". The details of the experiments and the research outcome are described in [this paper](https://arxiv.org/abs/2002.06910).

**Note:** t-viSNE is optimized to work better for the 2560x1440 resolution. Any other resolution might need manual adjustment of your browser's zoom level to work properly.

**Note:** This repository contains a frozen version (commit id: 137) that matches the paper's implementation. However, we plan to further improve the implementation in the future.

# Data Sets #
The data sets are available online from the [UCI Machine Learning Repository](http://archive.ics.uci.edu/ml/index.php). We use the Iris data set, Breast Cancer Wisconsin (Original) data set, Pima Indians Diabetes data set, and the SPECTF Heart data set. All data sets are transformed in comma separated format (csv).

# Requirements #
For the backend:
- [Python3](https://www.python.org/downloads/)
- [Flask](https://palletsprojects.com/p/flask/)

For the frontend:
- [D3.js](https://d3js.org/)
- [Plotly.js](https://github.com/plotly/plotly.js/)

# Installation #
To install the project please run the following command in the main folder "t-viSNE": ```npm install```

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
The following instructions describe how to reach the results present in Figure 1 of the article. The aforementioned figure is connected with the Subsection 5.2 ("Use Case: Improving Diabetes Classification"). This is more or less the main use case described in the paper.

**Tip:** The "Reset Filters" button illustrated in Figure 1(h), resets all the applied interactions in case you made a mistake and you want to redraw something.

- Step 1: We press the "Execute new t-SNE analysis" button that is observable in Figure 1(a).
- Step 2: From the new pop-up tab named as "t-SNE Grid Search Resulting Diverse Projections [Sorting Projections According to Metric:" we select "Continuity (C)" quality metric.
- Step 3: From the five projections seen on the top (out of the 25), we choose the fourth projection with "Quality Metrics Average (QMA)" approximately 0.43 and rather high "Continuity (C)" (around 0.69). Next, we press the "Confirm" the projection and wait for the system to load all the views. The t-SNE overview is the same as in Figure 7(a) and the main projection can be seen in Figure 7(a). Also, Figures 7(b) and 7(d) show the exact same representations as you should have in front of you. 
- Step 4: To reproduce Figure 7(e), you have to use the "Group Selection" option from the "Interaction Modes" illustrated in Figure 1(h). Afterward, you should carefully select the areas depicted in red color in Figure 7(c). To select those areas, you hold the left mouse and draw a shape with the lasso interaction provided by the tool. The first area is "High remaining cost", the second is "Low-density ”tip”", and the third "Low-density cluster". Please note that the results in Figure 7(e) start from 20 to 40 k-values of nearest neighbors.
- Step 5: For Figure 7(g), you use the "Dimension Correlation" option from the "Interaction Modes" illustrated in Figure 1(h). Then you use left click to draw a point and once more another left click for another point until you have drawn precisely the line seen in Figure 7(g) and Figure 7(c) in blue. Afterward, with the right mouse click you confirm the drawn shape and observe in the "Dimension Correlation" view depicted in Figure 1(j) the values of Figure 7(f). Finally, if you click the "Insulin" dimension you get Figure 7(g). The exact values of "Insulin" are now shown in the legend of Figure 1(i) instead of the "Density" and the "Remaining Cost" as it was before in Figure 7(c, bottom-right corner).
- Step 6: The next step is to choose the "Quality Metrics Average (QMA)" option instead of "Continuity (C)" with the dropdown selection seen in Figure 1(e). This will sort the projections based on the average value of all the provided quality metrics.
- Step 7: To receive the image shown in Figure 1, you choose with the "Group Selection" described in Step 4 the third cluster named as "Low-density cluster" (cf. Figure 7(c)). Then you should click the "Optimize Selection" button (see Figure 1(e), which is going to resort all the projections. Afterward, you click and choose the first projection out of the six shown in Figure 1(e). Now Figure 1 is loaded for you.
- Step 7: Finally, you use the "Dimension Correlation" option from the "Interaction Modes" illustrated in Figure 1(h) and draw a line (i.e., click to place two individual points) as shown in Figure 1(f). Next, press right click to confirm the drawn shape as in Step 5. If the line is drawn correctly, then you just go to the "Visual Mapping" panel (cf. Figure 1(i)) and you select "KNN" instead of "Distance" for the "Correlation measurement". After this modification, you will find the "K-value (KNN)" field which should be set to 34 (see Figure 1(i)). 

**Outcome:** The above process describes how you will be able to reproduce precisely the results presented in Figures 1 and 7 of the paper. Thank you for your time!

# Corresponding Author #
For any questions with regard to the implementation or the paper, feel free to contact: angelos.chatzimparmpas@lnu.se.

