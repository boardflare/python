import ast
import textwrap
import re
import json

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
                    for i, default in enumerate(defaults):
                        idx = len(parameters) - len(defaults) + i
                        param_name = parameters[idx]["name"]
                        return json.dumps({
                            "name": name,
                            "parameters": [],
                            "docstring": "",
                            "description": "",
                            "error": f"Default values are not supported for function parameters at this time. Issue causing error: {param_name}={ast.unparse(default)}"
                        })
                
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
