# first line: 100
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
