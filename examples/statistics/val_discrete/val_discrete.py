import random
from typing import List, Any, Optional

def val_discrete(values: List[List[Any]], distribution: List[List[float]]) -> Optional[Any]:
    """
    Selects a value from a list based on a discrete probability distribution.

    Args:
        values (list of lists): 2D list of possible values (Excel range or Python 2D list)
        distribution (list of lists): 2D list of probabilities (must sum to 1)

    Returns:
        The selected value (scalar), or None if input is invalid.
    """
    # Input validation
    if not values or not distribution:
        return None
    if not isinstance(values, list) or not isinstance(distribution, list):
        return None
    if not values or not values[0] or not distribution or not distribution[0]:
        return None
    if len(values[0]) != len(distribution[0]):
        return None
    weights = distribution[0]
    # Check if all weights are numbers and sum to 1 (±0.01)
    try:
        total = sum(float(w) for w in weights)
        if abs(total - 1.0) > 0.01:
            return None
    except Exception:
        return None
    # Use random.choices to select
    try:
        return random.choices(values[0], weights=weights)[0]
    except Exception:
        return None
