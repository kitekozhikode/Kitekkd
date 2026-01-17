import csv
import re

csv_file = "School Charges 2024-25.csv"
sql_file = "school_charges.sql"
table_name = "school_charges"

def clean_column_name(name):
    name = name.lower()
    name = re.sub(r'[^a-z0-9_]', '_', name)
    name = re.sub(r'_+', '_', name)
    return name.strip('_')

def escape_sql(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"

with open(csv_file, mode='r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    
    clean_headers = [clean_column_name(h) for h in headers]
    
    with open(sql_file, mode='w', encoding='utf-8') as sql_f:
        # Create Table Statement
        create_table = f"CREATE TABLE IF NOT EXISTS {table_name} (\n"
        columns_def = []
        for col in clean_headers:
            if "number" in col or "code" in col or col == "sl_no":
                columns_def.append(f"  {col} INTEGER")
            else:
                columns_def.append(f"  {col} TEXT")
        create_table += ",\n".join(columns_def)
        create_table += "\n);\n\n"
        sql_f.write(create_table)
        
        # Insert Statements
        for row in reader:
            if not any(row): continue # Skip empty rows
            
            # Pad row if it has fewer columns than headers
            if len(row) < len(clean_headers):
                row.extend([None] * (len(clean_headers) - len(row)))
            
            escaped_values = [escape_sql(val) if val else "NULL" for val in row[:len(clean_headers)]]
            insert_stmt = f"INSERT INTO {table_name} ({', '.join(clean_headers)}) VALUES ({', '.join(escaped_values)});\n"
            sql_f.write(insert_stmt)

print(f"Successfully generated {sql_file}")
