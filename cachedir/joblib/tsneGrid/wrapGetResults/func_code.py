# first line: 198
def wrapGetResults(listofParamsPlusData):
    pool = Pool()
    
    return pool.map(multi_run_wrapper, listofParamsPlusData)
