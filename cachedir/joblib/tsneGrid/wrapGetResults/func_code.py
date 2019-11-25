# first line: 217
def wrapGetResults(listofParamsPlusData):
    pool = Pool()
    
    return zip(*pool.map(multi_run_wrapper, listofParamsPlusData))
