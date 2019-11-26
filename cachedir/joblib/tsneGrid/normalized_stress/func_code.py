# first line: 177
def normalized_stress(D_high, D_low):
    return (-1) * (np.sum((D_high - D_low)**2) / np.sum(D_high**2) / 100)
