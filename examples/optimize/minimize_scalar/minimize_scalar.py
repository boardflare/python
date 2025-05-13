# Minimize Scalar Function

from scipy.optimize import minimize_scalar
import math


def minimize_scalar_function(func_expr, bounds=None, method=None):
    """
    Minimizes a scalar function using scipy.optimize.minimize_scalar.

    Args:
        func_expr (str): A string representing the function to minimize, e.g., 'x**2 + 3*x + 2'.
        bounds (list, optional): A 2D list [[min, max]] specifying the bounds for bounded methods.
        method (str, optional): Optimization method: 'brent', 'bounded', or 'golden'.

    Returns:
        list: [[x, fun]] where x is the location of minimum and fun is the minimum value
    """
    # Define the function from the string expression
    def func(x):
        return eval(func_expr, {"x": x, "math": math})

    # Check if 'x' is present in the function expression
    if 'x' not in func_expr:
        raise ValueError("Function expression must contain the variable 'x'.")

    kwargs = {}
    # Accept bounds as a 2D list [[min, max]] or as a scalar (not tuple)
    if bounds is not None:
        # If bounds is a 2D list (e.g., [[0, 10]]), extract min and max
        if isinstance(bounds, list) and len(bounds) == 1 and isinstance(bounds[0], list) and len(bounds[0]) == 2:
            min_val, max_val = bounds[0][0], bounds[0][1]
            kwargs['bounds'] = [min_val, max_val]
        else:
            kwargs['bounds'] = bounds
    if method is not None:
        kwargs['method'] = method

    result = minimize_scalar(func, **kwargs)
    # Return as a 2D list: [[x, fun]]
    return [[float(result.x), float(result.fun)]]
