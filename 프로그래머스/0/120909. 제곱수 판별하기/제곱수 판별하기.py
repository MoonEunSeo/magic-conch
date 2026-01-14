import math 

def solution(n):
    k = int(math.sqrt(n))
    
    if k*k == n :
        return 1
    return 2