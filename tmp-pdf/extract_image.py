import fitz
doc = fitz.open('../004_BERITA ACARA.pdf')
page = doc.load_page(0)
images = page.get_images()
xref = images[0][0]
base_image = doc.extract_image(xref)
image_bytes = base_image["image"]
image_ext = base_image["ext"]
with open(f"logo.{image_ext}", "wb") as f:
    f.write(image_bytes)
print("Saved image as logo." + image_ext)
