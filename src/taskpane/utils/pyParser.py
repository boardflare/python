import inspect
import textwrap
import re
import json
import types
import base64

def parse_python_code_safe(encoded_code):
    """
    Parse safely encoded Python code to avoid issues with triple quotes
    
    Args:
        encoded_code: Base64 encoded Python code
        
    Returns:
        JSON string with parsed function metadata
    """
    try:
        # Decode the base64 encoded code
        decoded_bytes = base64.b64decode(encoded_code)
        code = decoded_bytes.decode('utf-8')
        return parse_python_code(code)
    except Exception as e:
        return json.dumps({"error": f"Failed to decode Python code: {str(e)}"})

def parse_python_code(code):
    try:
        code = textwrap.dedent(code)
        namespace = {}
        
        try:
            exec(code, namespace)
        except Exception as e:
            return json.dumps({"error": f"Code execution error: {str(e)}"})
        
        # Find function objects in the namespace
        functions = {name: obj for name, obj in namespace.items() 
                    if isinstance(obj, types.FunctionType)}
        
        if not functions:
            return json.dumps({
                "error": "No function definition found. Your code must be wrapped in a function, e.g. def my_function(first, second):"
            })
        
        # Use the first function found
        func_name, func = next(iter(functions.items()))
        sig = inspect.signature(func)
        
        # Extract all parameter info in one pass
        parameters = []
        for param_name, param in sig.parameters.items():
            # Validate parameter name
            if re.search(r'\d', param_name):
                return json.dumps({
                    "error": f"Parameter names cannot contain numbers. Issue causing error: {param_name}"
                })
            
            # Check for unsupported parameter types
            if param.kind in (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD):
                return json.dumps({
                    "error": "Variable arguments (*args/**kwargs) are not supported"
                })
            
            # Build parameter info directly
            param_info = {
                "name": param_name,
            }
            
            # Add type annotation if present
            if param.annotation != inspect.Parameter.empty:
                param_info["type"] = str(param.annotation).replace("<class '", "").replace("'>", "")
            
            # Add default value if present
            if param.default != inspect.Parameter.empty:
                param_info["has_default"] = True
                param_info["default"] = repr(param.default)
                
            parameters.append(param_info)
        
        # Get docstring and extract description in one step
        docstring = inspect.getdoc(func) or ""
        description = docstring.split('.')[0].strip() if docstring else "No description available"
        
        # Build and return the complete result
        return json.dumps({
            "name": func_name,
            "parameters": parameters,
            "docstring": docstring,
            "description": description,
            "error": None,
            "has_params": bool(parameters)
        })
        
    except Exception as e:
        return json.dumps({"error": str(e)})

# Set up global result variable
result = None
