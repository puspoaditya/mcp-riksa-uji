import fitz
doc = fitz.open('../004_BERITA ACARA.pdf')
page = doc.load_page(0)
images = page.get_images()
print("Images:", images)
