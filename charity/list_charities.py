import os
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
import csv
import argparse
import threading

file_counter_local = threading.local()

def parse_xml_file(file_path, tax_year):
    """
    Parse a single XML file and extract the required fields:
      - filer_ein, filer_name
      - (grant_ein, grant_amt) for each valid recipient

    Returns:
        A list of tuples: [(filer_ein, filer_name, grant_ein, grant_amt), ...]
        May be empty if no grants found.
    """

    if not hasattr(file_counter_local, 'value'):
        file_counter_local.value = 0
        file_counter_local.entries = 0
    file_counter_local.value += 1

    if (file_counter_local.value % 1000)==0:
        print("Thread %s processed %s files, %s entries" % (threading.get_ident(), file_counter_local.value, file_counter_local.entries))

    # Attempt to parse the XML
    try:
        tree = ET.parse(file_path)
    except ET.ParseError:
        # If the file is malformed or unparseable, return nothing
        return []

    root = tree.getroot()

    tax_year_elem = root.find(".//{http://www.irs.gov/efile}ReturnHeader/{http://www.irs.gov/efile}TaxYr")
    if tax_year_elem is None:
        return []
    current_tax_year = tax_year_elem.text.strip()
    if current_tax_year != tax_year:
        return []

    # Extract filer EIN and filer name
    # We expect exactly one <Filer> block per file, but check gracefully
    filer = root.find(".//{http://www.irs.gov/efile}Filer")
    if filer is None:
        return []

    filer_ein_elem = filer.find("{http://www.irs.gov/efile}EIN")
    filer_name_elem = filer.find("./{http://www.irs.gov/efile}BusinessName/{http://www.irs.gov/efile}BusinessNameLine1Txt")

    filer_ein = filer_ein_elem.text.strip() if filer_ein_elem is not None else ""
    filer_name = filer_name_elem.text.strip() if filer_name_elem is not None else ""


    receipt_elem = root.find(".//{http://www.irs.gov/efile}GrossReceiptsAmt")
    if receipt_elem is None: 
        return []

    c3_elem = root.find(".//{http://www.irs.gov/efile}Organization501c3Ind")
    if c3_elem is None: 
        return []
    checked = c3_elem.text.strip().upper()
    if 'X' not in checked: 
        return []


    receipt_amt = int(float(receipt_elem.text.strip()))

    govt_amt = 0
    grant_elem = root.find(".//{http://www.irs.gov/efile}GovernmentGrantsAmt")
    if grant_elem is not None: 
        govt_amt = int(float(grant_elem.text.strip()))

    contrib_amt = 0
    contrib_elem = root.find(".//{http://www.irs.gov/efile}AllOtherContributionsAmt")
    if contrib_elem is not None: 
        contrib_amt = int(float(contrib_elem.text.strip()))

    results = []
    file_counter_local.entries += 1
    #print(filer_ein, filer_name, receipt_amt, govt_amt, contrib_amt)
    results.append((filer_ein, filer_name, receipt_amt, govt_amt, contrib_amt))

    return results


def main(tax_year, input_dir, output_csv, max_workers=8):
    """
    - Recursively find all .xml files under input_dir.
    - Parse each in parallel with max_workers threads.
    - Aggregate results and write to output_csv (filer_ein, filer_name, grant_ein, grant_amt).
    """

    # Collect all XML files
    xml_files = []
    for root, dirs, files in os.walk(input_dir):
        for f in files:
            if f.lower().endswith(".xml"):
                xml_files.append(os.path.join(root, f))

    # Process files in parallel
    all_grants = []
    #xml_files = xml_files[:10000]
    print(len(xml_files))
    print("Approximately %s files per worker" % (int(len(xml_files)/max_workers)))    

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(parse_xml_file, fp, tax_year): fp for fp in xml_files}

        for future in as_completed(futures):
            file_path = futures[future]
            try:
                results = future.result()
                all_grants.extend(results)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

    # Write aggregated results to CSV
    with open(output_csv, mode="w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["filer_ein", "filer_name", "receipt_amt", "govt_amt", "contrib_amt"])
        for row in all_grants:
            writer.writerow(row)


def valid_tax_year(year):
    try:
        year = int(year)
        if 2020 <= year <= 2024:
            return year
        else:
            raise argparse.ArgumentTypeError("Tax year must be between 2020 and 2024 (inclusive).")
    except ValueError:
        raise argparse.ArgumentTypeError("Tax year must be an integer.")

if __name__ == "__main__":
    # Example usage:
    #   python list_charities.py 2023
    # Download files at https://www.irs.gov/charities-non-profits/form-990-series-downloads
    parser = argparse.ArgumentParser(description="List charities by tax year. Searches XML files recursively in current directory.")
    parser.add_argument("tax_year", type=valid_tax_year, help="Search by tax year filing.")
    
    args = parser.parse_args()    

    # Change as appropriate 
    input_directory = "/Users/xero/charity"
    output_file = "/Users/xero/charity/charities_%s.csv" % args.tax_year

    main(str(args.tax_year), input_directory, output_file, max_workers=8)
