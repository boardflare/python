import os
import inspect
import importlib.util
import json
import re
from pathlib import Path

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
        
        return {
            "name": module_name,
            "description": description,
            "code": code
        }
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
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