import ast
import textwrap
import re
import json
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
        tree = ast.parse(code)
        
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                name = node.name
                
                # Check for *args and **kwargs
                if node.args.vararg or node.args.kwarg:
                    return json.dumps({
                        "name": name,
                        "parameters": [],
                        "docstring": "",
                        "description": "",
                        "error": "Variable arguments (*args/**kwargs) are not supported"
                    })
                
                # Process parameters
                parameters = []
                if not node.args.args:
                    # Explicitly handle no parameters case
                    parameters = []
                else:
                    for arg in node.args.args:
                        param_name = arg.arg
                        
                        # Check for numbers in parameter names
                        if re.search(r'\d', param_name):
                            return json.dumps({
                                "name": name,
                                "parameters": [],
                                "docstring": "",
                                "description": "",
                                "error": f"Parameter names cannot contain numbers. Issue causing error: {param_name}"
                            })
                        
                        param_dict = {"name": param_name}
                        if arg.annotation:
                            param_dict["type"] = ast.unparse(arg.annotation)
                        parameters.append(param_dict)
                
                # Check for default values
                defaults = node.args.defaults
                if defaults:
                    offset = len(parameters) - len(defaults)
                    for i, default in enumerate(defaults):
                        parameters[offset + i]["has_default"] = True
                        parameters[offset + i]["default"] = ast.unparse(default)
                
                # Get docstring
                docstring = ast.get_docstring(node)
                description = docstring.split('.')[0].strip() if docstring else "No description available"
                
                return json.dumps({
                    "name": name,
                    "parameters": parameters,
                    "docstring": docstring or "",
                    "description": description,
                    "error": None,
                    "has_params": len(parameters) > 0
                })
        
        return json.dumps({
            "name": "",
            "parameters": [],
            "docstring": "",
            "description": "",
            "error": "No function definition found. Your code must be wrapped in a function, e.g. def my_function(first, second):"
        })
        
    except Exception as e:
        return json.dumps({
            "name": "",
            "parameters": [],
            "docstring": "",
            "description": "",
            "error": str(e)
        })

# Set up global result variable
result = None
