import io
import base64
import xlsxwriter

def create_worksheet():
    output = io.BytesIO()
    workbook = xlsxwriter.Workbook(output)
    worksheet = workbook.add_worksheet()
    
    # Start of where to modify code.

    header_format = workbook.add_format({
        'bold': True,
        'font_color': 'white',
        'bg_color': '#4472C4',
        'align': 'center'
    })
    
    worksheet.write('A1', 'Header', header_format)
    worksheet.write('A2', 10)
    worksheet.write_formula('B2', '=A2*2')

    # End of where to modify code.
    
    workbook.close()
    xlsx_data = output.getvalue()
    b64_data = base64.b64encode(xlsx_data).decode('utf-8')
    return b64_data

result = create_worksheet()