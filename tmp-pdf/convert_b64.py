import base64
with open("logo.png", "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode()
    with open("logo_b64.txt", "w") as out:
        out.write(encoded_string)
