import json

with open(r'Project\PROJECT_POLARIS_SIH.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

with open(r'scripts\notebook_summary.txt', 'w', encoding='utf-8') as out:
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

        out.write(f"\n{'='*70}\nCELL {idx} [{cell.get('cell_type')}]\n{'='*70}\n")
        out.write(f"SOURCE:\n{src}\n")
        if out_txt:
            out.write(f"\nOUTPUT:\n{'\n'.join(out_txt)}\n")

print("Exported complete notebook summary to scripts/notebook_summary.txt")
