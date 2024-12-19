import re
import sys
import argparse

import pdfplumber

CLEANER_REGEX = r"^\d+(?:\s+|$)"


def main(pdf_path, out_file, start_page, stop_page, ignore):
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

        if (
            stop_page == -1 or stop_page > total_pages
        ):  # i.e. we want to analyze to the end
            stop_page = total_pages

        lines = []
        for i in range(start_page, stop_page):
            page = pdf.pages[i]
            print(f"\n--- Analyzing page {i+1}/{total_pages} ---")

            # Extract raw text:
            raw_text = page.extract_text()
            if raw_text:
                lines.extend(raw_text.split("\n"))
                continue
                print("Sample of Extracted Text:")
                print(raw_text[:500] + "...")  # Just show a snippet

            else:
                print(f"No text extracted on this page ({i+1}/{total_pages}).")

            # Inspect characters and fonts
            chars = page.chars
            if chars:
                # chars is a list of dicts with keys like text, fontname, size, x0, x1, top, bottom, etc.
                # Let's show unique fonts used on the page
                fonts_used = {char["fontname"] for char in chars if "fontname" in char}
                print(f"Fonts used on this page: {fonts_used}")

                # Show character positioning details for first few characters
                print("Character samples (x0, top, text, fontname):")
                for char in chars[:10]:
                    print(
                        (
                            char["x0"],
                            char["top"],
                            char["text"],
                            char.get("fontname", "Unknown"),
                        )
                    )
            else:
                print("No character-level data found on this page.")

            # If you want to analyze layout more, you can look at lines and words:
            # pdfplumber allows for extracting words as structured objects:
            words = page.extract_words()
            if words:
                print(f"Total words extracted on this page: {len(words)}")
                # Show a few sample words with their bounding boxes
                for w in words[:10]:
                    print((w["text"], w["x0"], w["top"], w["x1"], w["bottom"]))

            # You can also inspect any tables detected (if the layout is table-like)
            # This can help understand if you need special handling:
            tables = page.extract_tables()
            if tables and len(tables) > 0:
                print("Detected tables on this page. Sample table:")
                for row in tables[0]:
                    print(row)
            else:
                print("No tables detected on this page (or unable to parse as tables).")

    # Write the lines to the file, separated by a newline
    with open(out_file, "w", encoding="utf-8") as handle:  # as in file handle
        for line in lines:
            if "\\" in line:
                continue
            if ignore == "":
                pass  # do nothing
            elif ignore in line:
                continue
            cleaned_line = re.sub(CLEANER_REGEX, "", line)
            handle.write(cleaned_line)
            handle.write("\n")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", help="The path to the pdf file you want to parse.")
    parser.add_argument(
        "-o",
        "--out",
        type=str,
        default="out.txt",
        help="The filename for the output text.",
    )
    parser.add_argument(
        "--start_page",
        type=int,
        default=0,
        help="Start parsing with this page number (start counting at 0; i.e. page 1 is start_page 0).",
    )
    parser.add_argument(
        "--stop_page",
        type=int,
        default=-1,
        help="Stop parsing before this page number. Parsing does not include this page number. If not set, then the parsing will continue to the end of the document.",
    )
    parser.add_argument(
        "--ignore",
        default="",
        help="Ignore lines containing this string. If no string is passed, then no lines are ignored.",
    )
    args = parser.parse_args()
    pdf_path = args.pdf
    out_file = args.out
    start_page = args.start_page
    stop_page = args.stop_page
    ignore = args.ignore
    sys.exit(main(pdf_path, out_file, start_page, stop_page, ignore))
