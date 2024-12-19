import pdfplumber
import re

PDF_PATH = "CR.pdf"
lines = []

def analyze_pdf_structure(pdf_path, sample_pages=25):
    # Open the PDF
    with pdfplumber.open(pdf_path) as pdf:
        # Basic PDF info
        total_pages = len(pdf.pages)
        print(f"Total Pages: {total_pages}")

        # PDF metadata, if available
        metadata = pdf.metadata
        if metadata:
            print("Metadata:")
            for key, value in metadata.items():
                print(f"  {key}: {value}")
        else:
            print("No metadata found.")

        # Limit the number of pages we inspect to avoid huge output
        pages_to_inspect = min(sample_pages, total_pages)
        
        for i in range(sample_pages): #replace with total_pages when ready to parse the whole thing
            page = pdf.pages[i]
            print(f"\n--- Analyzing page {i+1}/{total_pages} ---")

            # Extract raw text:
            raw_text = page.extract_text()
            if raw_text:
                lines.extend(raw_text.split('\n'))
                continue
                print("Sample of Extracted Text:")
                print(raw_text[:500] + "...")  # Just show a snippet


            else:
                print("No text extracted on this page.")

            # Inspect characters and fonts
            chars = page.chars
            if chars:
                # chars is a list of dicts with keys like text, fontname, size, x0, x1, top, bottom, etc.
                # Let's show unique fonts used on the page
                fonts_used = {char['fontname'] for char in chars if 'fontname' in char}
                print(f"Fonts used on this page: {fonts_used}")
                
                # Show character positioning details for first few characters
                print("Character samples (x0, top, text, fontname):")
                for char in chars[:10]:
                    print((char['x0'], char['top'], char['text'], char.get('fontname', 'Unknown')))
            else:
                print("No character-level data found on this page.")
            
            # If you want to analyze layout more, you can look at lines and words:
            # pdfplumber allows for extracting words as structured objects:
            words = page.extract_words()
            if words:
                print(f"Total words extracted on this page: {len(words)}")
                # Show a few sample words with their bounding boxes
                for w in words[:10]:
                    print((w['text'], w['x0'], w['top'], w['x1'], w['bottom']))
            
            # You can also inspect any tables detected (if the layout is table-like)
            # This can help understand if you need special handling:
            tables = page.extract_tables()
            if tables and len(tables) > 0:
                print("Detected tables on this page. Sample table:")
                for row in tables[0]:
                    print(row)
            else:
                print("No tables detected on this page (or unable to parse as tables).")

    cleaned = []
    for line in lines:
        if '\\' in line: 
            continue
        if 'December 17' in line: # Replace with something else
            continue
        cleaned_line = re.sub(r'^\d+(?:\s+|$)', '', line)
        cleaned.append(cleaned_line)

    # Specify the filename you want to write to
    filename = "CR.txt"

    # Write the lines to the file, separated by a newline
    with open(filename, 'w', encoding='utf-8') as f:
        for line in cleaned:
            f.write(line + "\n")

if __name__ == "__main__":
    analyze_pdf_structure(PDF_PATH, sample_pages=25)
