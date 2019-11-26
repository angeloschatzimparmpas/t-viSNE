# first line: 185
def shepard_diagram_correlation(D_high, D_low):
    if len(D_high.shape) > 1:
        D_high = spatial.distance.squareform(D_high)
    if len(D_low.shape) > 1:
        D_low = spatial.distance.squareform(D_low)

    return stats.spearmanr(D_high, D_low)[0]
