import sys

input = lambda : sys.stdin.readline().rstrip()

def bfs(nodes, index, visted):
    visted[0] = True
    queue = [index+1]

    while len(queue) !=0:
        pop_value = queue[0]
        queue = queue[1:]
        for i in nodes[pop_value-1]:
            if not visted[i-1] :
                visted[i-1] = True
                queue.append(i)


def solve():
    N = int(input())
    iteration_cnt = int(input())

    nodes = [set() for _ in range(N)]
    visited = [False for _ in range(N)]

    # 그래프 생성
    for i in range(iteration_cnt):
        num1, num2 = list(map(int, input().split(' ')))
        nodes[num1-1].add(num2)
        nodes[num2-1].add(num1)

    bfs(nodes, 0, visited)
    print(len([boolean for boolean in visited if boolean])-1)

solve()
