export const convert_result_pandas = `
import datetime
import pandas as pd
import numpy as np

def to_excel_serial(date):
    base_date = datetime.datetime(1970, 1, 1)
    delta_days = (date - base_date).days + 25569
    return delta_days

def convert_result():
    result = globals()['result']

    if result is None:
        raise ValueError("Your function returned None. If you wanted a blank cell, return an empty string ('') instead.")

    # Handle datetime objects
    if isinstance(result, (datetime.datetime, datetime.date)):
        return [[to_excel_serial(result)]]

    if isinstance(result, (int, float, str, bool)):
        return [[result]]

    if isinstance(result, pd.DataFrame):
        # Convert any datetime columns to Excel serial format
        for col in result.select_dtypes(include=['datetime64']).columns:
            result[col] = result[col].apply(to_excel_serial)
        return result.values.tolist()

    if isinstance(result, pd.Series):
        if result.dtype.kind == 'M':  # M is the kind code for datetime64
            result = result.apply(to_excel_serial)
        return [[x] for x in result.values.tolist()]

    if isinstance(result, np.ndarray):
        if result.ndim == 0:
            return [[result.item()]]
        elif result.ndim == 1:
            return [result.tolist()]
        else:
            return np.array(result, dtype=object).tolist()

    if isinstance(result, (np.integer, np.floating)):
        return [[result.item()]]

    if isinstance(result, list):
        if not result:
            raise ValueError("Result cannot be an empty list")

        # Convert any datetime objects in a 1D list
        if not any(isinstance(x, list) for x in result):
            result = [to_excel_serial(x) if isinstance(x, (datetime.datetime, datetime.date))
                      else x for x in result]
            if not all(isinstance(x, (int, float, str, bool)) for x in result):
                raise ValueError("All elements must be scalar types (int, float, str, bool)")
            return [result]

        if not all(isinstance(row, list) for row in result):
            raise ValueError("Result must be a valid 2D list")

        width = len(result[0])
        if not all(len(row) == width for row in result):
            raise ValueError("All rows must have the same length")

        # Convert any datetime objects in a 2D list
        result = [[to_excel_serial(x) if isinstance(x, (datetime.datetime, datetime.date))
                   else x for x in row] for row in result]

        if not all(isinstance(x, (int, float, str, bool)) 
                  for row in result for x in row):
            raise ValueError("All elements must be scalar types (int, float, str, bool)")

        return result

    raise ValueError("Result must be a scalar or 2D list. Other types including dicts are not supported.")
`;

export const convert_result_list = `
import datetime

def to_excel_serial(date):
    base_date = datetime.datetime(1970, 1, 1)
    delta_days = (date - base_date).days + 25569
    return delta_days

def convert_result():
    result = globals()['result']

    if result is None:
        raise ValueError("Your function returned None. If you wanted a blank cell, return an empty string ('') instead.")

    # Handle datetime objects
    if isinstance(result, (datetime.datetime, datetime.date)):
        return [[to_excel_serial(result)]]

    if isinstance(result, (int, float, str, bool)):
        return [[result]]

    if isinstance(result, list):
        if not result:
            raise ValueError("Result cannot be an empty list")

        # Convert any datetime objects in a 1D list
        if not any(isinstance(x, list) for x in result):
            result = [to_excel_serial(x) if isinstance(x, (datetime.datetime, datetime.date))
                      else x for x in result]
            if not all(isinstance(x, (int, float, str, bool)) for x in result):
                raise ValueError("All elements must be scalar types (int, float, str, bool)")
            return [result]

        if not all(isinstance(row, list) for row in result):
            raise ValueError("Result must be a valid 2D list")

        width = len(result[0])
        if not all(len(row) == width for row in result):
            raise ValueError("All rows must have the same length")

        # Convert any datetime objects in a 2D list
        result = [[to_excel_serial(x) if isinstance(x, (datetime.datetime, datetime.date))
                   else x for x in row] for row in result]

        if not all(isinstance(x, (int, float, str, bool)) 
                  for row in result for x in row):
            raise ValueError("All elements must be scalar types (int, float, str, bool)")

        return result

    raise ValueError("Result must be a scalar or 2D list. Other types including dicts are not supported.")
`;