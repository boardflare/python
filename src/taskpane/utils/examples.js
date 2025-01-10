export const exampleFunctions = [
    {
        code: `def calculate_area(length, width):
    """Calculate area of rectangle.
    Args:
        length (float): Length of rectangle
        width (float): Width of rectangle
    Returns:
        float: Area of rectangle
    """
    return length * width

test_cases = [
    [5, 3],      # -> 15
    [2.5, 4],    # -> 10
    [10, 10],    # -> 100
    [1, 1],      # -> 1
    [0.5, 2]     # -> 1
]`,
        excel_example: '=CALCULATE_AREA(5, 3)'
    },
    {
        code: `def join_strings(first_str, second_str, separator):
    """Join two strings with a separator.
    Args:
        first_str (str): First string
        second_str (str): Second string
        separator (str): Separator between strings
    Returns:
        str: Joined string
    """
    return f"{first_str}{separator}{second_str}"

test_cases = [
    ["hello", "world", " "],      # -> "hello world"
    ["first", "last", "-"],       # -> "first-last"
    ["a", "b", "_"],             # -> "a_b"
    ["python", "code", "::"],     # -> "python::code"
    ["x", "y", ""]               # -> "xy"
]`,
        excel_example: '=JOIN_STRINGS("hello", "world", " ")'
    },
    {
        code: `def in_range(number, min_val, max_val):
    """Check if number is in range [min_val, max_val].
    Args:
        number (float): Number to check
        min_val (float): Minimum value
        max_val (float): Maximum value
    Returns:
        bool: True if in range, False otherwise
    """
    return min_val <= number <= max_val

test_cases = [
    [5, 0, 10],       # -> True
    [-1, 0, 100],     # -> False
    [50, 50, 50],     # -> True
    [25, 0, 20],      # -> False
    [3.14, 3, 4]      # -> True
]`,
        excel_example: '=IN_RANGE(5, 0, 10)'
    },
    {
        code: `def to_power(base, exponent, round_to):
    """Calculate power with rounding.
    Args:
        base (float): Base number
        exponent (float): Exponent
        round_to (int): Decimal places to round to
    Returns:
        float: Result rounded to specified decimals
    """
    return round(base ** exponent, round_to)

test_cases = [
    [2, 3, 0],        # -> 8
    [5, 2, 1],        # -> 25.0
    [3, 0.5, 2],      # -> 1.73
    [10, -1, 3],      # -> 0.100
    [2.5, 2, 2]       # -> 6.25
]`,
        excel_example: '=TO_POWER(2, 3, 0)'
    }
];