import pyodide_http
pyodide_http.patch_all()

# Set up individual args from the args array
if 'args' in globals():
    for index, value in enumerate(globals()['args']):
        if value is None:
            globals()[f'arg{index + 1}'] = None
            continue
        
        if len(value) == 1 and len(value[0]) == 1:
            globals()[f'arg{index + 1}'] = value[0][0]
        else:
            globals()[f'arg{index + 1}'] = value
