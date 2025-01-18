import csv

def combine_charities(output_file):
    # This is the order we want to read files (from newest to oldest),
    # so that 2023 overrides 2022/2021, and 2022 overrides 2021.
    files = [
        ('charities_2023.csv', 2023),
        ('charities_2022.csv', 2022),
        ('charities_2021.csv', 2021),
    ]

    # Dictionary to store the latest data keyed by EIN.
    # Key: filer_ein, Value: dict with the row plus a 'tax_year' key.
    charities = {}

    # Read files in order: 2023 -> 2022 -> 2021
    for filename, year in files:
        with open(filename, mode='r', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                ein = row['filer_ein']
                # If the EIN is not already in the dictionary,
                # then add it from this (year) file.
                if ein not in charities:
                    # Include a new 'tax_year' key for clarity
                    row['tax_year'] = year
                    charities[ein] = row

    # Now write all unique EIN rows to the output CSV
    fieldnames = ['filer_ein', 'filer_name', 'receipt_amt', 'govt_amt', 'contrib_amt', 'tax_year']

    with open(output_file, mode='w', newline='', encoding='utf-8') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()

        # Write rows from the dictionary
        for ein, data in charities.items():
            # Build a dict that only includes the fields we want to output
            out_data = {
                'filer_ein': data['filer_ein'],
                'filer_name': data['filer_name'],
                'receipt_amt': data['receipt_amt'],
                'govt_amt': data['govt_amt'],
                'contrib_amt': data['contrib_amt'],
                'tax_year': data['tax_year'],
            }
            writer.writerow(out_data)


# Example usage:
if __name__ == '__main__':
    combine_charities('charities_by_latest.csv')
    print("Combined CSV file created: charities_by_latest.csv")

