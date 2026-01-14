def solution(num_list):
    answer = []
    cnt1, cnt2 = 0, 0
    
    for i in range(len(num_list)):
        if num_list[i] % 2 == 0 :
            cnt1 += 1
        
        else :
            cnt2 += 1
    
    answer.extend([cnt1,cnt2])
    
    return answer