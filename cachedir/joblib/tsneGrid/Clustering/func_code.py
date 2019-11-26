# first line: 239
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
