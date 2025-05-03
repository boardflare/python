import os
import inspect
import importlib.util
import json
import re
from pathlib import Path
import ast

def get_function_metadata(file_path):
    """Extract metadata from a Python function file."""
    try:
        # Import the module dynamically
        module_name = os.path.basename(file_path).replace('.py', '')
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # Find the main function (assuming it has the same name as the file)
        main_func = getattr(module, module_name, None)
        
        if not main_func or not callable(main_func):
            # Try to find any function in the module
            for name, obj in inspect.getmembers(module, inspect.isfunction):
                if obj.__module__ == module.__name__:
                    main_func = obj
                    break
        
        if not main_func:
            return None
            
        # Extract the function metadata
        docstring = inspect.getdoc(main_func)
        
        # Extract description from the first line of the docstring
        description = ""
        if docstring:
            description = docstring.split('\n')[0].strip()
        
        # Read the full file content to get the code
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        
        excel_example = get_excel_example(module_name, file_path)
        
        return {
            "name": module_name,
            "description": description,
            "code": code,
            "excelExample": excel_example
        }
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return None

def get_excel_example(module_name, function_file_path):
    """Finds the first test_<func>.py, parses the first test, and builds an Excel formula example."""
    test_file = os.path.join(os.path.dirname(function_file_path), f"test_{module_name}.py")
    if not os.path.exists(test_file):
        return None
    try:
        with open(test_file, 'r', encoding='utf-8') as f:
            source = f.read()
        tree = ast.parse(source)
        # Find the first function definition
        for node in tree.body:
            if isinstance(node, ast.FunctionDef):
                # Find the first call to the function under test
                for stmt in ast.walk(node):
                    if isinstance(stmt, ast.Call) and getattr(stmt.func, 'id', None) == module_name:
                        # Build argument list for Excel formula
                        args = []
                        for arg in stmt.args:
                            if isinstance(arg, ast.Str):
                                args.append(f'"{arg.s}"')
                            elif isinstance(arg, ast.Constant):
                                # Python 3.8+: ast.Constant
                                if isinstance(arg.value, str):
                                    args.append(f'"{arg.value}"')
                                else:
                                    args.append(str(arg.value))
                            elif isinstance(arg, ast.List):
                                # For lists, convert to Excel array constant syntax
                                try:
                                    val = ast.literal_eval(arg)
                                    if isinstance(val, list):
                                        # Detect 2D or 1D
                                        if all(isinstance(x, list) for x in val):
                                            # 2D list: {a1,b1; a2,b2}
                                            rows = []
                                            for row in val:
                                                row_str = ','.join(f'"{item}"' if isinstance(item, str) else str(item) for item in row)
                                                rows.append(row_str)
                                            array_str = '{' + ';'.join(rows) + '}'
                                        else:
                                            # 1D list: {a,b,c}
                                            array_str = '{' + ','.join(f'"{item}"' if isinstance(item, str) else str(item) for item in val) + '}'
                                        args.append(array_str)
                                    else:
                                        args.append(str(val))
                                except Exception as e:
                                    args.append(str(arg))
                            else:
                                args.append(ast.unparse(arg) if hasattr(ast, 'unparse') else str(arg))
                        return f'={module_name.upper()}({", ".join(args)})'
                break
    except Exception as e:
        print(f"Error parsing test file {test_file}: {e}")
    return None

def main():
    # Root directory for function files
    root_dir = Path(__file__).parent / "files"

    # List to store function metadata
    functions = []

    # Index for fileId
    index = 1

    # Recursively find all .py files that are not test files
    for py_file in root_dir.rglob("*.py"):
        if py_file.name.startswith("test_"):
            continue
        file_path = str(py_file)
        print(f"Processing {file_path}...")

        # Extract metadata
        metadata = get_function_metadata(file_path)

        if metadata:
            # Add fileId
            metadata["fileId"] = str(index)
            index += 1
            
            # Add to functions list
            functions.append(metadata)

    # Sort functions by name
    functions.sort(key=lambda x: x["name"])

    # Write to JSON file in the assets directory in the workspace root
    assets_dir = Path(__file__).resolve().parent.parent / "assets"
    assets_dir.mkdir(exist_ok=True)
    output_path = assets_dir / "example_functions.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(functions, f, indent=2)

    print(f"Generated {output_path} with {len(functions)} functions")

if __name__ == "__main__":
    main()