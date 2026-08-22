import os
import subprocess
import re

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
docs_dir = r"d:\project HLD\docs"
root_dir = r"d:\project HLD"
output_pdf_dir = r"d:\project HLD\pdf_export"

os.makedirs(output_pdf_dir, exist_ok=True)

files_to_convert = [
    ("README.md", os.path.join(root_dir, "README.md"), "Online_Judge_Platform_README.pdf"),
    ("1_High_Level_Design.md", os.path.join(docs_dir, "1_High_Level_Design.md"), "Online_Judge_Platform_HLD.pdf"),
    ("2_Low_Level_Design.md", os.path.join(docs_dir, "2_Low_Level_Design.md"), "Online_Judge_Platform_LLD.pdf"),
    ("3_Software_Requirement_Specification.md", os.path.join(docs_dir, "3_Software_Requirement_Specification.md"), "Online_Judge_Platform_SRS.pdf"),
    ("4_API_Documentation.md", os.path.join(docs_dir, "4_API_Documentation.md"), "Online_Judge_Platform_API_Docs.pdf"),
    ("5_Database_Design.md", os.path.join(docs_dir, "5_Database_Design.md"), "Online_Judge_Platform_Database_Design.pdf"),
    ("6_System_Diagrams.md", os.path.join(docs_dir, "6_System_Diagrams.md"), "Online_Judge_Platform_System_Diagrams.pdf"),
]

def markdown_to_html(title, content):
    # Simple converter for clean HTML formatting
    lines = content.split('\n')
    html_lines = []
    in_code = False
    code_block = []

    for line in lines:
        if line.startswith('```'):
            if in_code:
                in_code = False
                code_content = "\n".join(code_block)
                code_content_escaped = code_content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                html_lines.append(f'<pre><code>{code_content_escaped}</code></pre>')
                code_block = []
            else:
                in_code = True
            continue

        if in_code:
            code_block.append(line)
            continue

        if line.startswith('# '):
            html_lines.append(f'<h1>{line[2:]}</h1>')
        elif line.startswith('## '):
            html_lines.append(f'<h2>{line[3:]}</h2>')
        elif line.startswith('### '):
            html_lines.append(f'<h3>{line[4:]}</h3>')
        elif line.startswith('#### '):
            html_lines.append(f'<h4>{line[5:]}</h4>')
        elif line.startswith('- ') or line.startswith('* '):
            html_lines.append(f'<li>{line[2:]}</li>')
        elif line.startswith('> '):
            html_lines.append(f'<div class="alert"><div class="alert-title">Note</div>{line[2:]}</div>')
        elif line.strip() == '---':
            html_lines.append('<hr>')
        elif line.strip() != '':
            html_lines.append(f'<p>{line}</p>')

    body_html = "\n".join(html_lines)

    # Basic markdown inline styling fixes
    body_html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', body_html)
    body_html = re.sub(r'`(.*?)`', r'<code>\1</code>', body_html)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
    <style>
        @page {{
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
        }}
        body {{
            font-family: 'Segoe UI', -apple-system, sans-serif;
            font-size: 10pt;
            line-height: 1.6;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
        }}
        h1 {{ font-size: 20pt; color: #0052cc; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 25px; }}
        h2 {{ font-size: 14pt; color: #2d3748; border-bottom: 1px solid #edf2f7; padding-bottom: 4px; margin-top: 20px; }}
        h3 {{ font-size: 12pt; color: #2b6cb0; margin-top: 15px; }}
        table {{ width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 9.5pt; page-break-inside: avoid; }}
        th, td {{ border: 1px solid #cbd5e0; padding: 7px 10px; text-align: left; }}
        th {{ background-color: #ebf8ff; color: #2b6cb0; }}
        tr:nth-child(even) {{ background-color: #f7fafc; }}
        pre {{ background-color: #1a202c; color: #f7fafc; padding: 12px; border-radius: 6px; font-size: 9pt; white-space: pre-wrap; word-break: break-all; margin: 12px 0; page-break-inside: avoid; }}
        code {{ background-color: #edf2f7; color: #c53030; padding: 2px 5px; border-radius: 4px; font-size: 9pt; }}
        pre code {{ background-color: transparent; color: inherit; padding: 0; }}
        .alert {{ background-color: #f7fafc; border-left: 4px solid #3182ce; padding: 10px 14px; margin: 14px 0; border-radius: 0 4px 4px 0; font-size: 9.5pt; }}
        .alert-title {{ font-weight: bold; color: #2b6cb0; margin-bottom: 4px; }}
    </style>
</head>
<body>
    <div style="margin-bottom: 30px; border-bottom: 3px solid #0052cc; padding-bottom: 10px;">
        <div style="font-size: 22pt; font-weight: bold; color: #0052cc;">Online Judge Platform</div>
        <div style="font-size: 12pt; color: #4a5568;">Prepared By: Kuswanth Tumma</div>
    </div>
    {body_html}
</body>
</html>"""

print("Starting PDF Export for all 7 documentation files...")

for name, src_file, pdf_name in files_to_convert:
    if os.path.exists(src_file):
        with open(src_file, "r", encoding="utf-8") as f:
            content = f.read()

        html_str = markdown_to_html(name, content)
        temp_html_path = os.path.join(output_pdf_dir, f"{name}.html")
        dest_pdf_path = os.path.join(output_pdf_dir, pdf_name)

        with open(temp_html_path, "w", encoding="utf-8") as f:
            f.write(html_str)

        cmd = [
            edge_path,
            "--headless",
            "--disable-gpu",
            f"--print-to-pdf={dest_pdf_path}",
            temp_html_path
        ]
        subprocess.run(cmd, capture_output=True, text=True)
        if os.path.exists(dest_pdf_path):
            print(f"Generated: {pdf_name} ({os.path.getsize(dest_pdf_path)} bytes)")
        else:
            print(f"Failed to generate: {pdf_name}")

print("\nPDF Generation process complete. All PDFs are saved in d:\\project HLD\\pdf_export\\")
