#!flask/bin/python

from flask import Flask, request, jsonify
from flask_cors import CORS
from multiprocessing import Pool
from scipy.spatial import procrustes
from scipy.spatial import distance
from sklearn_extra.cluster import KMedoids
from sklearn.neighbors import KNeighborsClassifier
from scipy import spatial
from scipy import stats
from joblib import Memory


import numpy as np
import time
import pandas as pd
import json
import bhtsne

app = Flask(__name__)
CORS(app)

@app.route('/resetAll', methods = ['POST'])
def Reset():

    global dataProc
    dataProc = []

    global D_highSpace
    D_highSpace = []

    global overalProjectionsNumber
    overalProjectionsNumber = []

    global projectionsAll
    projectionsAll = []

    global betas
    betas = []

    global cpp
    cpp = []

    global cpi
    cpi = []

    global SelectedListofParams
    SelectedListofParams = []

    global SelectedProjectionsReturn
    SelectedProjectionsReturn = []

    global SelectedProjectionsBeta
    SelectedProjectionsBeta = []

    global SelectedProjectionsCPP
    SelectedProjectionsCPP = []

    global SelectedProjectionsCPI
    SelectedProjectionsCPI = []

    global clusterIndex
    clusterIndex = []

    global convertLabels
    convertLabels = []

    global D_lowSpaceList
    D_lowSpaceList = []

    global KeepKs 
    KeepKs = []

    global metricsMatrixEntire 
    metricsMatrixEntire = []

    global metricsMatrix
    metricsMatrix = []

    global metricsMatrixSel
    metricsMatrixSel = []

    global metricsMatrixEntireSel
    metricsMatrixEntireSel = []

    return 'Reset'

location = './cachedir'
memory = Memory(location, verbose=0)

# NOTE: Only works with labeled data
def neighborhood_hit(X, y, k, selected=None):
    # Add 1 to k because the nearest neighbor is always the point itself
    k += 1
    
    y = np.array(y)

    knn = KNeighborsClassifier(n_neighbors=k)
    knn.fit(X, y)

    if selected:        
        X = X[selected, :]

    neighbors = knn.kneighbors(X, return_distance=False)    

    score = np.mean((y[neighbors] == np.tile(y[selected].reshape((-1, 1)), k)).astype('uint8'))

    return score

neighborhood_hit = memory.cache(neighborhood_hit)

location = './cachedir'
memory = Memory(location, verbose=0)

def trustworthiness(D_high, D_low, k):
    n = D_high.shape[0]
    
    nn_orig = D_high.argsort()
    nn_proj = D_low.argsort()

    knn_orig = nn_orig[:, :k + 1][:, 1:]
    knn_proj = nn_proj[:, :k + 1][:, 1:]

    sum_i = 0

    for i in range(n):
        U = np.setdiff1d(knn_proj[i], knn_orig[i])

        sum_j = 0
        for j in range(U.shape[0]):
            sum_j += np.where(nn_orig[i] == U[j])[0] - k 
        
        sum_i += sum_j

    return float((1 - (2 / (n * k * (2 * n - 3 * k - 1)) * sum_i)).squeeze())

trustworthiness = memory.cache(trustworthiness)

location = './cachedir'
memory = Memory(location, verbose=0)

def continuity(D_high, D_low, k):
    n = D_high.shape[0]
    
    nn_orig = D_high.argsort()
    nn_proj = D_low.argsort()

    knn_orig = nn_orig[:, :k + 1][:, 1:]
    knn_proj = nn_proj[:, :k + 1][:, 1:]

    sum_i = 0

    for i in range(n):
        V = np.setdiff1d(knn_proj[i], knn_orig[i])

        sum_j = 0
        for j in range(V.shape[0]):
            sum_j += np.where(nn_proj[i] == V[j])[0] - k 
        
        sum_i += sum_j

    return float((1 - (2 / (n * k * (2 * n - 3 * k - 1)) * sum_i)).squeeze())

continuity = memory.cache(continuity)

location = './cachedir'
memory = Memory(location, verbose=0)

def normalized_stress(D_high, D_low):
    return (-1) * (np.sum((D_high - D_low)**2) / np.sum(D_high**2) / 100)

normalized_stress = memory.cache(normalized_stress)

location = './cachedir'
memory = Memory(location, verbose=0)

def shepard_diagram_correlation(D_high, D_low):
    if len(D_high.shape) > 1:
        D_high = spatial.distance.squareform(D_high)
    if len(D_low.shape) > 1:
        D_low = spatial.distance.squareform(D_low)

    return stats.spearmanr(D_high, D_low)[0]

shepard_diagram_correlation = memory.cache(shepard_diagram_correlation)

location = './cachedir'
memory = Memory(location, verbose=0)

def preprocess(data):
    dataPandas = pd.DataFrame(data)
    dataPandas.dropna()
    for column in dataPandas:
        if ('*' in column):
            gatherLabels = dataPandas[column]
            del dataPandas[column]
    length = len(dataPandas.columns)
    dataNP = dataPandas.to_numpy()
    return dataNP, length, gatherLabels

preprocess = memory.cache(preprocess)

def multi_run_wrapper(args):
    projectionsAllLoc, betasL, cppL, cpiL = bhtsne.run_bh_tsne(*args)
    return projectionsAllLoc, betasL, cppL, cpiL

location = './cachedir'
memory = Memory(location, verbose=0)

def procrustesFun(projections):
    similarityList = []
    for proj1 in projections:
        disparityList = []
        for proj2 in projections:
            mtx1, mtx2, disparity = procrustes(proj1, proj2)
            if np.array_equal(proj1, proj2):
                disparityList.append(0)
            else:
                disparityList.append(1/disparity)
        similarityList.append(disparityList)
    clusterIndex = Clustering(similarityList)

    return clusterIndex
    
procrustesFun = memory.cache(procrustesFun)

location = './cachedir'
memory = Memory(location, verbose=0)

def Clustering(similarity):
    similarityNP = np.array(similarity)
    n_clusters = 25 # change that to send less diverse projections
    kmedoids = KMedoids(n_clusters=n_clusters, random_state=0, metric='precomputed').fit(similarityNP)   
    global dataProc 
    clusterIndex = []
    for c in range(n_clusters):
        cluster_indices = np.argwhere(kmedoids.labels_ == c).reshape(-1,)
        D_c = similarityNP[cluster_indices][:, cluster_indices]
        center = np.argmin(np.sum(D_c, axis=0))
        clusterIndex.append(cluster_indices[center])

    return clusterIndex

Clustering = memory.cache(Clustering)

location = './cachedir'
memory = Memory(location, verbose=0)

def wrapGetResults(listofParamsPlusData):
    pool = Pool()
    
    return zip(*pool.map(multi_run_wrapper, listofParamsPlusData))

wrapGetResults = memory.cache(wrapGetResults)

@app.route('/receiver', methods = ['POST'])
def calculateGrid():
    data = request.get_data().decode('utf8').replace("'", '"')
    data = json.loads(data)
    global dataProc
    dataProc, length, labels = preprocess(data)

    global D_highSpace
    D_highSpace = distance.squareform(distance.pdist(dataProc))

    DEFAULT_NO_DIMS = 2
    VERBOSE = False
    DEFAULT_USE_PCA = True
    randseed=1137

    # all other data sets
    perplexity = [5,10,15,20,25,30,35,40,45,50] # 10 perplexity

    # iris data set
    if (labels[0] == 'Iris-setosa'):
        perplexity = [5,10,15,20,25,28,32,35,40,45] # 10 perplexity

     # breast cancer data set
    if (labels[0] == 'Benign'):
        perplexity =[30,35,40,45,50,55,60,65,70,75] # 10 perplexity

    # diabetes data set
    if (labels[0] == 1):
        perplexity = [10,15,20,25,30,35,40,45,50,55] # 10 perplexity

    learning_rate = [1,10,20,30,40,50,60,70,80,90] # 10 learning rate
    n_iter = [200,250,350,400,450] # 5 iterations

    global overalProjectionsNumber
    overalProjectionsNumber = 0
    overalProjectionsNumber = len(perplexity)*len(learning_rate)*len(n_iter)
    
    global projectionsAll

    listofParamsPlusData = []
    listofParamsAll= []
    for k in n_iter:
        for j in learning_rate:
            for i in perplexity:
                listofParamsPlusData.append((dataProc,DEFAULT_NO_DIMS,i,j,randseed,VERBOSE,length,DEFAULT_USE_PCA,k,True,True,True))
                listofParamsAll.append((i,j,k)) 

    projectionsAll, betas, cpp, cpi = wrapGetResults(listofParamsPlusData)

    global SelectedListofParams
    SelectedListofParams = []

    global SelectedProjectionsReturn
    SelectedProjectionsReturn = []

    global SelectedProjectionsBeta
    SelectedProjectionsBeta = []

    global SelectedProjectionsCPP
    SelectedProjectionsCPP = []

    global SelectedProjectionsCPI
    SelectedProjectionsCPI = []
    
    global clusterIndex
    clusterIndex = procrustesFun(projectionsAll)

    metricNeigh = []
    metricTrust = []
    metricCont = []
    metricStress = []
    metricShepCorr = []
    metricsAverage = []

    global convertLabels
    convertLabels = []
    for index, label in enumerate(labels):
        if (label == 0):
            convertLabels.append(0)
        elif (label == 1):
            convertLabels.append(1)
        elif (label == 'Benign'):
            convertLabels.append(0)
        elif (label == 'Malignant'):
            convertLabels.append(1)
        elif (label == 'Iris-setosa'):
            convertLabels.append(0)
        elif (label == 'Iris-versicolor'):
            convertLabels.append(1)
        elif (label == 'Iris-virginica'):
                convertLabels.append(2)
        else:
            pass

    global D_lowSpaceList
    D_lowSpaceList = []

    global KeepKs
    KeepKs = []



    for index in clusterIndex:
        SelectedProjectionsReturn.append(projectionsAll[index].tolist())
        SelectedListofParams.append(listofParamsAll[index])

        SelectedProjectionsBeta.append(betas[index].tolist())

        SelectedProjectionsCPP.append(cpp[index].tolist())

        SelectedProjectionsCPI.append(cpi[index].tolist())

        D_lowSpace = distance.squareform(distance.pdist(projectionsAll[index]))
        D_lowSpaceList.append(D_lowSpace)

        k = listofParamsAll[index][0] # k = perplexity
        KeepKs.append(k)
    
        resultNeigh = neighborhood_hit(np.array(projectionsAll[index]), convertLabels, k)
        resultTrust = trustworthiness(D_highSpace, D_lowSpace, k)
        resultContinuity = continuity(D_highSpace, D_lowSpace, k)
        resultStress = normalized_stress(D_highSpace, D_lowSpace)
        resultShep = shepard_diagram_correlation(D_highSpace, D_lowSpace) 

        metricNeigh.append(resultNeigh)
        metricTrust.append(resultTrust)
        metricCont.append(resultContinuity)
        metricStress.append(resultStress)
        metricShepCorr.append(resultShep)

    max_value_neigh = max(metricNeigh)
    min_value_neigh = min(metricNeigh)

    max_value_trust = max(metricTrust)
    min_value_trust = min(metricTrust)

    max_value_cont = max(metricCont)
    min_value_cont = min(metricCont)

    max_value_stress = max(metricStress)
    min_value_stress = min(metricStress)

    max_value_shep = max(metricShepCorr)
    min_value_shep = min(metricShepCorr)

    global metricsMatrixEntire
    metricsMatrixEntire = []

    for index, data in enumerate(metricTrust):
        valueNeigh = (metricNeigh[index] - min_value_neigh) / (max_value_neigh - min_value_neigh) 
        valueTrust = (metricTrust[index] - min_value_trust) / (max_value_trust - min_value_trust) 
        valueCont = (metricCont[index] - min_value_cont) / (max_value_cont - min_value_cont) 
        valueStress = 1 - ((metricStress[index]*(-1) - max_value_stress*(-1)) / (min_value_stress*(-1) - max_value_stress*(-1))) # we need the opposite
        valueShep = (metricShepCorr[index] - min_value_shep) / (max_value_shep - min_value_shep) 
        average = (valueNeigh + valueTrust + valueCont + valueStress + valueShep) / 5

        metricsAverage.append(average)
        metricsMatrixEntire.append([average,valueNeigh,valueTrust,valueCont,valueStress,valueShep])

    sortMetricsAverage = sorted(range(len(metricsAverage)), key=lambda k: metricsAverage[k], reverse=True)
    sortNeigh = sorted(range(len(metricNeigh)), key=lambda k: metricNeigh[k], reverse=True)
    sortTrust = sorted(range(len(metricTrust)), key=lambda k: metricTrust[k], reverse=True)
    sortCont = sorted(range(len(metricCont)), key=lambda k: metricCont[k], reverse=True)
    sortStress = sorted(range(len(metricStress)), key=lambda k: metricStress[k], reverse=True)
    sortShepCorr = sorted(range(len(metricShepCorr)), key=lambda k: metricShepCorr[k], reverse=True)

    global metricsMatrix
    metricsMatrix = []

    metricsMatrix.append(sortMetricsAverage)
    metricsMatrix.append(sortNeigh)
    metricsMatrix.append(sortTrust)
    metricsMatrix.append(sortCont)
    metricsMatrix.append(sortStress)
    metricsMatrix.append(sortShepCorr)

    return 'OK'

@app.route('/sender')
def background_process():
    global SelectedProjectionsReturn
    global projectionsAll
    global overalProjectionsNumber
    global metricsMatrix
    global metricsMatrixEntire
    global SelectedProjectionsBeta
    global SelectedProjectionsCPP
    global SelectedProjectionsCPI

    while (len(projectionsAll) != overalProjectionsNumber):
        pass
    return jsonify({ 'projections': SelectedProjectionsReturn, 'parameters': SelectedListofParams, 'metrics': metricsMatrix, 'metricsEntire': metricsMatrixEntire, 'betas': SelectedProjectionsBeta, 'cpp': SelectedProjectionsCPP, 'cpi': SelectedProjectionsCPI})

@app.route('/receiverOptimizer', methods = ['POST'])
def OptimizeSelection():
    dataReceived= request.get_data().decode('utf8').replace("'", '"')
    dataReceived = json.loads(dataReceived)
    dataSelected = []
    for data in dataReceived:
        if data != None:
            dataSelected.append(data)

    metricNeigh = []
    metricTrust = []
    metricCont = []
    metricStress = []
    metricShepCorr = []
    metricsAverage = []

    for index, loop in enumerate(clusterIndex):
        resultNeigh = neighborhood_hit(np.array(projectionsAll[index]), convertLabels, KeepKs[index], dataSelected)
        resultTrust = trustworthiness(D_highSpace[dataSelected, :], D_lowSpaceList[index][dataSelected, :], KeepKs[index])
        resultContinuity = continuity(D_highSpace[dataSelected, :], D_lowSpaceList[index][dataSelected, :], KeepKs[index])
        resultStress = normalized_stress(D_highSpace[dataSelected, :], D_lowSpaceList[index][dataSelected, :])
        resultShep = shepard_diagram_correlation(D_highSpace[dataSelected][:, dataSelected], D_lowSpaceList[index][dataSelected][:, dataSelected]) 


        metricNeigh.append(resultNeigh)
        metricTrust.append(resultTrust)
        metricCont.append(resultContinuity)
        metricStress.append(resultStress)
        metricShepCorr.append(resultShep)

    max_value_neigh = max(metricNeigh)
    min_value_neigh = min(metricNeigh)

    max_value_trust = max(metricTrust)
    min_value_trust = min(metricTrust)

    max_value_cont = max(metricCont)
    min_value_cont = min(metricCont)

    max_value_stress = max(metricStress)
    min_value_stress = min(metricStress)

    max_value_shep = max(metricShepCorr)
    min_value_shep = min(metricShepCorr)

    global metricsMatrixEntireSel
    metricsMatrixEntireSel = []

    for index, data in enumerate(metricTrust):
        valueNeigh = (metricNeigh[index] - min_value_neigh) / (max_value_neigh - min_value_neigh) 
        valueTrust = (metricTrust[index] - min_value_trust) / (max_value_trust - min_value_trust) 
        valueCont = (metricCont[index] - min_value_cont) / (max_value_cont - min_value_cont) 
        valueStress = 1 - ((metricStress[index]*(-1) - max_value_stress*(-1)) / (min_value_stress*(-1) - max_value_stress*(-1))) # we need the opposite
        valueShep = (metricShepCorr[index] - min_value_shep) / (max_value_shep - min_value_shep) 
        average = (valueNeigh + valueTrust + valueCont + valueStress + valueShep) / 5
        
        metricsAverage.append(average)
        metricsMatrixEntireSel.append([average,valueNeigh,valueTrust,valueCont,valueStress,valueShep])

    sortMetricsAverage = sorted(range(len(metricsAverage)), key=lambda k: metricsAverage[k], reverse=True)
    sortNeigh = sorted(range(len(metricNeigh)), key=lambda k: metricNeigh[k], reverse=True)
    sortTrust = sorted(range(len(metricTrust)), key=lambda k: metricTrust[k], reverse=True)
    sortCont = sorted(range(len(metricCont)), key=lambda k: metricCont[k], reverse=True)
    sortStress = sorted(range(len(metricStress)), key=lambda k: metricStress[k], reverse=True)
    sortShepCorr = sorted(range(len(metricShepCorr)), key=lambda k: metricShepCorr[k], reverse=True)

    global metricsMatrixSel
    metricsMatrixSel = []

    metricsMatrixSel.append(sortMetricsAverage)
    metricsMatrixSel.append(sortNeigh)
    metricsMatrixSel.append(sortTrust)
    metricsMatrixSel.append(sortCont)
    metricsMatrixSel.append(sortStress)
    metricsMatrixSel.append(sortShepCorr)

    return 'OK'

@app.route('/senderOptimizer')
def SendOptimizedProjections():
    global metricsMatrixSel
    global metricsMatrixEntireSel

    return jsonify({'metrics': metricsMatrixSel, 'metricsEntire': metricsMatrixEntireSel })

@app.route('/receiverSingle', methods = ['POST'])
def singleParameters():
    data = request.get_data().decode('utf8').replace("'", '"')
    data = json.loads(data)

    global dataProc
    dataProc, length, labels = preprocess(data[3])

    DEFAULT_NO_DIMS = 2
    VERBOSE = False
    DEFAULT_USE_PCA = True
    randseed=1137

    perplexity = int(data[0])
    learning_rate = int(data[1])
    n_iter = int(data[2])

    global projectionsAll

    listofParamsPlusData = []
    listofParamsAll= []
    listofParamsPlusData.append((dataProc,DEFAULT_NO_DIMS,perplexity,learning_rate,randseed,VERBOSE,length,DEFAULT_USE_PCA,n_iter,True,True,True))
    listofParamsAll.append((perplexity,learning_rate,n_iter)) 

    projectionsAll, betas, cpp, cpi = wrapGetResults(listofParamsPlusData)


    global SelectedProjectionsReturn
    SelectedProjectionsReturn = []

    global SelectedProjectionsBeta
    SelectedProjectionsBeta = []

    global SelectedProjectionsCPP
    SelectedProjectionsCPP = []

    global SelectedProjectionsCPI
    SelectedProjectionsCPI = []

    SelectedProjectionsReturn.append(projectionsAll[0].tolist())

    SelectedProjectionsBeta.append(betas[0].tolist())

    SelectedProjectionsCPP.append(cpp[0].tolist())

    SelectedProjectionsCPI.append(cpi[0].tolist())

    return 'OK'

@app.route('/senderSingle')
def sendSingle():

    global projectionsAll
    global SelectedProjectionsReturn
    global SelectedProjectionsBeta 
    global SelectedProjectionsCPP
    global SelectedProjectionsCPI
    while (len(projectionsAll) != 1):
        pass
    return jsonify({ 'projections': SelectedProjectionsReturn, 'betas': SelectedProjectionsBeta, 'cpp': SelectedProjectionsCPP, 'cpi': SelectedProjectionsCPI})


if __name__ == '__main__':
    app.run("0.0.0.0", "5000")


