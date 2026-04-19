import fitz
doc = fitz.open('../004_BERITA ACARA.pdf')
page = doc.load_page(0)
for info in page.get_image_info():
    print(info)
