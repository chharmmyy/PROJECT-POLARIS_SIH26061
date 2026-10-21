import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\ritik\OneDrive\Desktop\polaris-web\Project\PROJECT_POLARIS_SIH.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

print("=" * 80)
print("PROJECT POLARIS - SMART INDIA HACKATHON (SIH) COMPREHENSIVE BREAKDOWN")
print("=" * 80)

for idx, cell in enumerate(nb['cells']):
    src = ''.join(cell.get('source', []))
    outs = cell.get('outputs', [])
    out_txt = []
    for o in outs:
        t = o.get('text', [])
        if isinstance(t, list):
            out_txt.append(''.join(t))
        elif isinstance(t, str):
            out_txt.append(t)
        data = o.get('data', {})
        plain = data.get('text/plain', [])
        if plain:
            out_txt.append(''.join(plain) if isinstance(plain, list) else str(plain))

    # Print markdown headers
    if cell['cell_type'] == 'markdown':
        first_line = src.splitlines()[0] if src.splitlines() else ''
        if any(first_line.startswith(h) for h in ['# Section', '## ', '### ']):
            print(f"\n>>> [CELL {idx} - {first_line}]")
            for line in src.splitlines()[1:]:
                if any(line.strip().startswith(x) for x in ['#', '-', '*', '1.', '2.', '3.']):
                    print(f"    {line.strip()}")
    
    # Key outputs
    if cell['cell_type'] == 'code' and any(k in src.lower() for k in ['performance =', 'r2_score', 'isolationforest', 'gwo_dispatch', 'sfc_curve', 'def grey_wolf', 'summary_df', 'dashboard_export', 'to_csv']):
        print(f"\n[Code Cell {idx} Summary]")
        for l in src.splitlines()[:6]:
            print(f"  | {l}")
        if out_txt:
            print("  | OUTPUT:")
            for ol in ('\n'.join(out_txt)).splitlines()[:10]:
                print(f"  |   {ol}")
