# Set up individual args from the args array
if 'global_args' in globals():
    for index, value in enumerate(globals()['global_args']):
        if value is None:
            globals()[f'arg{index + 1}'] = None
            continue
        
        if len(value) == 1 and len(value[0]) == 1:
            globals()[f'arg{index + 1}'] = value[0][0]
        else:
            if hasattr(value, 'to_py') and callable(value.to_py):
                globals()[f'arg{index + 1}'] = value.to_py()
            else:
                globals()[f'arg{index + 1}'] = value  # Fallback to assigning value directly

# Set test_cases global to None
globals()['test_cases'] = None