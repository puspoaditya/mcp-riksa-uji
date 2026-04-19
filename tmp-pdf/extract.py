import fitz
import json

doc = fitz.open('../004_BERITA ACARA.pdf')

for page_num in range(len(doc)):
    page = doc.load_page(page_num)
    blocks = page.get_text("dict")["blocks"]
    text = page.get_text("text")
    print(f"--- PAGE {page_num+1} TEXT ---")
    print(text)
    print(f"--- PAGE {page_num+1} BLOCKS/LAYOUT ---")
    for b in blocks:
        if b['type'] == 0:
            for l in b['lines']:
                for s in l['spans']:
                    # Extract text and properties like font size to infer layout
                    print(f"({s['bbox'][0]:.1f}, {s['bbox'][1]:.1f}) size={s['size']:.1f} font={s['font']}: {s['text']}")
