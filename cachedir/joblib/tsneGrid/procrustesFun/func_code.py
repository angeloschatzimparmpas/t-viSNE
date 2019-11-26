# first line: 189
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
