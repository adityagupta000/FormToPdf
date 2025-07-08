import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

def get_code_files(directory, excluded_files=None, excluded_dirs=None):
    """Fetch all project files except specified exclusions."""
    if excluded_files is None:
        excluded_files = {'package.json', 'package-lock.json'}
    
    if excluded_dirs is None:
        excluded_dirs = {'node_modules', '.git', '__pycache__', 'build', '.next', 'dist'}
    
    code_files = {}
    
    for root, dirs, files in os.walk(directory):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        
        # Skip if current directory is an excluded directory
        if any(excluded_dir in root.split(os.sep) for excluded_dir in excluded_dirs):
            continue
            
        for file in files:
            # Skip excluded files
            if file in excluded_files:
                continue
                
            file_path = os.path.join(root, file)
            
            # Get file extension
            _, ext = os.path.splitext(file)
            
            try:
                # Try to read as text file first
                if ext.lower() in {'.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.sass', '.less', 
                                 '.html', '.htm', '.json', '.md', '.txt', '.xml', '.yaml', '.yml', 
                                 '.config', '.gitignore', '.env', '.py', '.sh', '.bat', '.cmd',
                                 '.svg', '.dockerfile', '.editorconfig', '.eslintrc', '.prettierrc'}:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        code_files[file_path] = f.readlines()
                else:
                    # For binary files, just note them as binary
                    code_files[file_path] = [f"[Binary file - {ext} format]"]
                        
            except Exception as e:
                print(f"❌ Error reading {file_path}: {e}")
                code_files[file_path] = [f"[Error reading file: {str(e)}]"]
    
    return code_files


def create_pdf(code_data, output_pdf="Frontend_Code_Export.pdf"):
    c = canvas.Canvas(output_pdf, pagesize=A4)
    width, height = A4
    margin = 20 * mm
    line_height = 10
    y = height - margin

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(margin, y, "📁 Project Code Export")
    y -= 2 * line_height
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "📁 Frontend File List:")
    y -= 2 * line_height

    file_paths = sorted(list(code_data.keys()))

    # 1. File list (original simple format)
    c.setFont("Courier", 8)
    for path in file_paths:
        if y < margin:
            c.showPage()
            c.setFont("Courier", 8)
            y = height - margin
        
        display_path = os.path.relpath(path)
        c.drawString(margin, y, f"- {display_path}")
        y -= line_height

    # Add page break before code content
    c.showPage()
    y = height - margin

    # 2. File contents
    for file_path in file_paths:
        lines = code_data[file_path]
        print(f"📄 Adding: {file_path}")

        if y < margin + 3 * line_height:
            c.showPage()
            y = height - margin

        # File header
        rel_path = os.path.relpath(file_path)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(margin, y, f"📄 File: {rel_path}")
        y -= line_height
        
        # Add separator line
        c.setFont("Courier", 8)
        c.drawString(margin, y, "=" * 80)
        y -= line_height

        # File content
        for line_num, line in enumerate(lines, 1):
            if y < margin:
                c.showPage()
                c.setFont("Courier", 8)
                y = height - margin
            
            # Clean and truncate line
            line = line.strip("\n").encode("latin-1", "replace").decode("latin-1")
            
            # Add line numbers for code files
            if rel_path.endswith(('.js', '.jsx', '.ts', '.tsx', '.css', '.py', '.html', '.json')):
                display_line = f"{line_num:3d}: {line[:280]}"
            else:
                display_line = line[:300]
            
            c.drawString(margin, y, display_line)
            y -= line_height

        # Add spacing between files
        y -= line_height
        if y > margin:
            c.setFont("Courier", 8)
            c.drawString(margin, y, "-" * 80)
            y -= 2 * line_height

    c.save()
    print(f"✅ PDF successfully created: {output_pdf}")
    print(f"📊 Total files processed: {len(code_data)}")


def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Files to exclude (including package.json as requested)
    excluded_files = {
        'package.json', 
        'package-lock.json',
        'yarn.lock',
        'README.md',
        '.DS_Store',
        'Thumbs.db',
        'Desktop.ini'
    }
    
    # Directories to exclude 
    excluded_dirs = {
        'node_modules',
        '.git', 
        '__pycache__',
        'build',
        'dist',
        '.next',
        'coverage',
        '.nyc_output',
        'logs',
        '*.log'
    }
    
    print("🔍 Scanning project files...")
    code_files = get_code_files(root_dir, excluded_files, excluded_dirs)
    
    if not code_files:
        print("❌ No files found to process!")
        return
    
    print(f"📁 Found {len(code_files)} files to include in PDF")
    create_pdf(code_files)


if __name__ == "__main__":
    main()