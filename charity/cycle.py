#!/usr/bin/env python3

import sys
import csv
from collections import defaultdict, deque
from graphviz import Digraph

# Global cap for BFS in each direction
BFS_CAP = 50

def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <root_ein>")
        sys.exit(1)

    root_ein = sys.argv[1]

    # 1) Read charities.csv as nodes
    charities = {}
    with open('charities.csv', 'r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ein = row['filer_ein'].strip()
            charities[ein] = {
                'name': row['filer_name'].strip(),
                'receipt_amt': row['receipt_amt'].strip()
            }

    # 2) Read grants.csv and accumulate the amounts
    #    Keep edge data only if both filer_ein and grant_ein exist in charities
    edge_accumulator = defaultdict(int)

    with open('grants.csv', 'r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            filer = row['filer_ein'].strip()
            grantee = row['grant_ein'].strip()
            grant_amt = int(row['grant_amt'].strip())

            if filer in charities and grantee in charities:
                edge_accumulator[(filer, grantee)] += grant_amt

    # If the requested root EIN is not in the dictionary, bail out
    if root_ein not in charities:
        print(f"Root EIN '{root_ein}' not found in charities.csv")
        sys.exit(1)

    # 3) Build adjacency lists to represent the graph in memory
    #    For forward BFS, we need adjacency_fwd[s] -> list of successors
    #    For reverse BFS, we need adjacency_rev[t] -> list of predecessors
    adjacency_fwd = defaultdict(list)
    adjacency_rev = defaultdict(list)

    for (filer, grantee), total_amt in edge_accumulator.items():
        adjacency_fwd[filer].append(grantee)
        adjacency_rev[grantee].append(filer)

    # 4) Forward BFS: collect nodes reachable from root_ein, up to BFS_CAP
    forward_visited = set()
    queue = deque([root_ein])
    while queue and len(forward_visited) < BFS_CAP:
        current = queue.popleft()
        if current not in forward_visited:
            forward_visited.add(current)
            for neighbor in adjacency_fwd[current]:
                if neighbor not in forward_visited and len(forward_visited) < BFS_CAP:
                    queue.append(neighbor)

    print(len(forward_visited))

    # 5) Reverse BFS: collect nodes that can eventually reach root_ein, up to BFS_CAP
    reverse_visited = set()
    queue = deque([root_ein])
    while queue and len(reverse_visited) < BFS_CAP:
        current = queue.popleft()
        if current not in reverse_visited:
            reverse_visited.add(current)
            for neighbor in adjacency_rev[current]:
                if neighbor not in reverse_visited and len(reverse_visited) < BFS_CAP:
                    queue.append(neighbor)

    print(len(reverse_visited))

    # 6) Union forward and reverse sets
    subgraph_nodes = forward_visited.union(reverse_visited)
    print(len(subgraph_nodes))

    # Build a subgraph of edges as well
    # We only keep edges where both endpoints are in subgraph_nodes
    subgraph_edges = []
    for (filer, grantee), total_amt in edge_accumulator.items():
        if filer in subgraph_nodes and grantee in subgraph_nodes:
            subgraph_edges.append((filer, grantee, total_amt))
    print(len(subgraph_edges))

    # 7) Create a Digraph in Graphviz
    dot = Digraph(comment=f"Charity Graph Rooted at EIN: {root_ein}")
    # Optionally orient left->right instead of top->bottom
    dot.attr('graph', rankdir='LR')
    print("seven")

    # 8) Add nodes. Label them with 'NAME (receipt_amt)'
    for ein in subgraph_nodes:
        name = charities[ein]['name']
        amt = charities[ein]['receipt_amt']
        dot.node(
            ein,
            label=f"{name} ({amt})",
            shape='ellipse',
            style='filled',
            fillcolor='lightblue',
            color='black'
        )
    print("eight")

    # 9) Add edges. Label them with accumulated grant_amt
    for filer, grantee, total_amt in subgraph_edges:
        dot.edge(
            filer,
            grantee,
            label=f"${total_amt}"
        )

    # 10) Render the graph to a file (PDF, PNG, etc.)
    # You can change format='pdf' or 'png' below as you prefer
    output_filename = f"charity_graph_{root_ein}"
    dot.render(filename=output_filename, format='pdf', cleanup=True)
    print(f"Graph rendered to {output_filename}.pdf")

    # If you want to debug or see the raw DOT, uncomment:
    # print(dot.source)

if __name__ == "__main__":
    main()
