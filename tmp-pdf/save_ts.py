b64 = open('logo_b64.txt','r').read()
with open('../src/lib/logoBase64.ts','w') as f:
    f.write(f"export const LOGO_BASE64 = 'data:image/png;base64,{b64}';\n")
