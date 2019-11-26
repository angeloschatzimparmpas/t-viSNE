# first line: 198
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
