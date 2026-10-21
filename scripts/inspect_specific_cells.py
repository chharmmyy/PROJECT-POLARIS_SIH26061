import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\ritik\OneDrive\Desktop\polaris-web\Project\PROJECT_POLARIS_SIH.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

cells_to_inspect = [100, 102, 105, 107, 116, 118, 126, 140, 142, 144, 160, 162, 167, 171]

for c_idx in cells_to_inspect:
    if c_idx < len(nb['cells']):
        c = nb['cells'][c_idx]
        src = ''.join(c.get('source', []))
        outs = c.get('outputs', [])
        print(f"=== CELL {c_idx} ({c['cell_type']}) ===")
        print("SOURCE:\n" + src.strip())
        for o in outs:
            t = o.get('text', [])
            if t:
                print("OUTPUT:\n" + (''.join(t) if isinstance(t, list) else str(t)).strip())
            data = o.get('data', {})
            plain = data.get('text/plain', [])
            if plain:
                print("OUTPUT PLAIN:\n" + (''.join(plain) if isinstance(plain, list) else str(plain)).strip())
        print("\n" + "="*80 + "\n")
