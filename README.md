# t-viSNE: Interactive Assessment and Interpretation of t-SNE Projections #

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/46676a48c4b74fd88dd91b73e2c85403)](https://app.codacy.com/manual/Angelos-ChatzimparmpasOrganization/t-viSNE?utm_source=github.com&utm_medium=referral&utm_content=angeloschatzimparmpas/t-viSNE&utm_campaign=Badge_Grade_Settings)

This Git repository contains the code that accompanies the research paper "t-viSNE: Interactive Assessment and Interpretation of t-SNE Projections". The details of the experiments and the research outcome are described in [the paper](https://arxiv.org/abs/2002.06910) (soon to appear in IEEE Transactions on Visualization and Computer Graphics).

**Note:** t-viSNE is optimized to work better for the 2560x1440 resolution (1440p/QHD (Quad High Definition)). Any other resolution might need manual adjustment of your browser's zoom level to work properly.

**Note:** The tag `paper-version` matches the implementation at the time of the paper's publication. The current version might look significantly different depending on how much time has passed since then.

# Data Sets #
All data sets used in the paper are in the `data` folder, formatted as comma separated values (csv). 
Most of them are available online from the [UCI Machine Learning Repository](http://archive.ics.uci.edu/ml/index.php): Iris, Breast Cancer Wisconsin (Original), Pima Indians Diabetes, and SPECTF. We also used a custom-made data set with Gaussian clusters. 

# Requirements #
For the backend:
- [Python 3](https://www.python.org/downloads/)
- [Flask](https://palletsprojects.com/p/flask/)
- A modified version of [Barnes-Hut t-SNE](https://github.com/lvdmaaten/bhtsne)
- Other packages: `numpy`, `scipy`, `scikit-learn`, and `pandas`.

You can install all the backend requirements with the following command:
```
pip install -r requirements.txt
```

For the frontend:
- [Node.js](https://nodejs.org/en/)
- [D3.js](https://d3js.org/)
- [Plotly.js](https://github.com/plotly/plotly.js/)

There is no need to install anything for the frontend, since all modules are in the repository.


# Usage #
Below is an example of how you can get t-viSNE running using Python for both frontend and backend. The frontend is written in Javascript/HTML, so it could be hosted in any other web server of your preference. The only hard requirement (currently) is that both frontend and backend must be running on the same machine. 
```
# first terminal: hosting the visualization side (client)
# for Python3
python3 -m http.server 
```
or 
```
# for Python2
python -m SimpleHTTPServer 8000
```

```
# second terminal: hosting the computational side (server)
FLASK_APP=tsneGrid.py flask run
```
Then, open your browser and point it to `localhost:8000`. We recommend using an up-to-date version of Google Chrome.

# Reproducibility of the Results #
The following instructions describe how to reach the results present in Figure 1 of the article. The aforementioned figure is connected with the Subsection 5.2 (*Use Case: Improving Diabetes Classification*) and is the main use case described in the paper.

**Note:** We used OSX and Google Chrome in all our tests, so we cannot guarantee that it works in other OS or browser. However, since t-viSNE is written in JS and Python, it should work in all the most common platforms.

**Tip:** The *Reset Filters* button illustrated in Figure 1(h), resets all the applied interactions in case you made a mistake and you want to redraw something.

- Step 1: Make sure the "Pima Indian Diabetes" data set is selected (top-left corner), then press the *Execute new t-SNE analysis* button that is shown in Figure 1(a).
- Step 2: From the new pop-up tab named as *t-SNE Grid Search Resulting Diverse Projections*, you have to select the *Continuity (C)* quality metric. **Please note** that the first time you execute the analysis and, consequently, run the hyper-parameter search, it will take a few minutes before the different options of projections show up in the grid. After the first time, the results are cached and will be re-used to make the process faster.
- Step 3: From the five projections seen on the top row (out of the 25), choose the fourth projection with *Quality Metrics Average (QMA)* approximately 0.43 and rather high *Continuity (C)* (around 0.69) by clicking on one of its points (you will know it is selected when the border becomes red). Press *Confirm* and wait for the system to load all the views. The t-SNE overview is the same as in Figure 7(a) and the main projection can be seen in Figure 7(a). Also, Figures 7(b) and 7(d) show the same representations as you should have in your screen now. 
- Step 4: To reproduce Figure 7(e), you have to use the *Group Selection* option from the *Interaction Modes* illustrated in Figure 1(h). Carefully select the areas depicted in red color in Figure 7(c) by holding the left mouse button and drawing a shape with the lasso interaction provided by the tool. **Note that** the lasso only works correctly if you release the mouse near the starting point. The first area is "High remaining cost", the second is "Low-density ”tip”", and the third "Low-density cluster". Please note that the results in Figure 7(e) start from 20 to 40 k-values of nearest neighbors.
- Step 5: For Figure 7(g), you use the *Dimension Correlation* option from the *Interaction Modes* illustrated in Figure 1(h). You can draw the line seen in Figure 7(g) and Figure 7(c) in blue by left-clicking to position each point in sequence, one after the other. When it's done, with the right mouse click you confirm the drawn shape and observe in the *Dimension Correlation* view depicted in Figure 1(j) the values of Figure 7(f). Here, do not forget to adjust the correlation threshold in order to cover the entire cluster. Finally, if you click the bar for the "Insulin" dimension you get Figure 7(g). The exact values of "Insulin" are now shown in the legend of Figure 1(i) instead of the *Density* and the *Remaining Cost* as it was before in Figure 7(c, bottom-right corner).
- Step 6: To receive the image shown in Figure 1, you choose with the *Group Selection* described in Step 4 the third cluster named as "Low-density cluster" (cf. Figure 7(c)). Then you should click the *Optimize Selection* button (see Figure 1(e)), which is going to resort all the projections. 
- Step 7: The next step is to choose the *Quality Metrics Average (QMA)* option instead of *Continuity (C)* with the dropdown selection seen in Figure 1(e). This will sort the projections based on the average value of all the provided quality metrics. Afterward, you click and choose the first projection out of the six shown in Figure 1(e). Now Figure 1 is loaded for you.
- Step 8: Finally, you use the *Dimension Correlation* option from the *Interaction Modes* illustrated in Figure 1(h) and draw a line (i.e., click to place two individual points) as shown in Figure 1(f). Next, press right click to confirm the drawn shape as in Step 5. If the line is drawn correctly, then you just go to the *Visual Mapping* panel (cf. Figure 1(i)) and you select *KNN* instead of *Distance* for the *Correlation measurement*. After this modification, you will find the *K-value (KNN)* field which should be set to 34 (see Figure 1(i)). 

**Outcome:** The above process describes how you will be able to reproduce precisely the results presented in Figures 1 and 7 of the paper. Thank you for your time!

# Corresponding Author #
For any questions with regard to the implementation or the paper, feel free to contact [Angelos Chatzimparmpas](mailto:angelos.chatzimparmpas@lnu.se).