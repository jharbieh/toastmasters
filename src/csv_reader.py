# Ref. https://docs.python.org/3/library/csv.html

# Division,Area,ID,Name,Status,Date
import csv
with open('clubs.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        _division = row['Division']
        _area = row['Area']
        _id = row['ID']
        _name = row['Name']
        _status = row['Status']
        _charter = row['Date']
        print(row['Division'], row['Area'], row['ID'], row['Name'], row['Status'], row['Date'])