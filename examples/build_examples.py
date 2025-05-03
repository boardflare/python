import os
import inspect
import importlib.util
import json
import re
from pathlib import Path
import ast # Keep ast for potential future use or other metadata extraction if needed

def get_function_metadata(file_path):
    """Extract metadata from a Python function file and its corresponding test_cases.json."""
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
            print(f"Warning: Could not find main function in {file_path}")
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

        # --- Removed: Code block for reading example.json ---

        # --- Changed: Load test cases from test_cases.json and extract first as example ---
        primary_example_data = None
        all_test_cases = None
        test_cases_file_path = Path(file_path).parent / "test_cases.json"
        if test_cases_file_path.exists():
            try:
                with open(test_cases_file_path, 'r', encoding='utf-8') as f_test_cases:
                    test_data = json.load(f_test_cases)
                    # Expecting the list under a "test_cases" key
                    if "test_cases" in test_data and isinstance(test_data["test_cases"], list):
                         all_test_cases = test_data["test_cases"]
                         if all_test_cases: # Check if the list is not empty
                             primary_example_data = all_test_cases[0] # Use the first test case as the primary example
                         else:
                             print(f"Warning: 'test_cases' list is empty in {test_cases_file_path}")
                    else:
                         print(f"Warning: 'test_cases' key (list) not found or invalid in {test_cases_file_path}")
            except json.JSONDecodeError as e:
                print(f"Error reading or parsing {test_cases_file_path}: {e}")
            except Exception as e:
                 print(f"Error processing {test_cases_file_path}: {e}")
        else:
            print(f"Warning: No test_cases.json found for {module_name}")
        # --- End Changed ---
        
        return {
            "name": module_name,
            "description": description,
            "code": code,
            # Removed the 'example' key as requested
            "test_cases": all_test_cases 
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
        # Skip __init__.py files and test files
        if py_file.name.startswith("test_") or py_file.name == "__init__.py":
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
        # Use compact separators for potentially large test case data
        json.dump(functions, f, indent=2) 

    print(f"Generated {output_path} with {len(functions)} functions")

if __name__ == "__main__":
    main()