import csv

with open("award_batch_101.csv", mode="r", encoding="utf-8", newline="") as f:
    reader = csv.reader(f)
    all_rows = list(reader)  # Convert the CSV reader to a list of rows
    
# all_rows[0] is the header row
# all_rows[278] is the 278th line in the file (including the header)
if len(all_rows) > 278:
    row_278 = all_rows[278]
    print(row_278)
else:
    print("The file does not have 278 lines.")
