import json

with open(r'Project\PROJECT_POLARIS_SIH.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

print(f"Total cells: {len(nb['cells'])}")
print("=" * 80)

for idx, cell in enumerate(nb['cells']):
    cell_type = cell.get('cell_type')
    source = ''.join(cell.get('source', []))
    if cell_type == 'markdown':
        headers = [line.strip() for line in source.split('\n') if line.strip().startswith('#')]
        if headers:
            print(f"\n[Cell {idx} - Markdown]:")
            for h in headers:
                print(f"  {h}")
        else:
            first_few = [l.strip() for l in source.split('\n') if l.strip()][:2]
            if first_few:
                print(f"[Cell {idx} - Text]: {' '.join(first_few)[:120]}...")
    elif cell_type == 'code':
        # print function definitions, class definitions, key assignments
        code_lines = [l.rstrip() for l in source.split('\n')]
        key_lines = [l for l in code_lines if any(l.strip().startswith(kw) for kw in ['def ', 'class ', 'import ', 'from ', 'def_'])]
        if key_lines:
            print(f"[Cell {idx} - Code]: {', '.join(key_lines[:3])}")
        
        # Check outputs for metrics, accuracies, fuel savings
        outputs = cell.get('outputs', [])
        for out in outputs:
            text = out.get('text', [])
            if isinstance(text, list):
                text_str = ''.join(text)
                for line in text_str.split('\n'):
                    if any(kw in line.lower() for kw in ['save', 'saving', 'rmse', 'mae', 'accuracy', 'fuel', 'optimal', 'diesel', 'bharati', 'maitri', 'gwo', 'r2', 'score']):
                        print(f"    >> Output: {line.strip()[:140]}")
