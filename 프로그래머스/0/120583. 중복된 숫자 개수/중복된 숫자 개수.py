def solution(array, n):
    cnt =0
    
    for i in range(len(array)):
        if array[i] == n:
            cnt += 1
            
    return cnt