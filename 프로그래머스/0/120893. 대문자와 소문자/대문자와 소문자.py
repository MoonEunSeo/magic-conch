def solution(my_string):
    answer = ''
    for i in range(len(my_string)):
        if my_string[i].isupper() == True :
            answer += my_string.lower()[i]
            # print(answer)
        else :
            answer += my_string.upper()[i]
            
    return answer