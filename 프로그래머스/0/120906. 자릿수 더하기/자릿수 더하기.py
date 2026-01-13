def solution(n):
    n = str(n)
    answer = 0
    my_list = map(int, n)
    
    for i in my_list:
        answer += i
    return answer