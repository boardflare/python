import textdistance

def text_distance(needle, haystack, algorithm='jaccard', top_n=1):
    """Calculate text similarity scores between needle(s) and haystack items.
    
    Args:
        needle: String or 2D list of strings to search for
        haystack: 2D list of strings to search within
        algorithm (str): Algorithm name from textdistance library (default: 'jaccard')
        top_n (int): Number of top matches to return (default: 1).
    
    Returns:
        list: For each needle, a flat list of [position, score, position, score, ...] for the top N matches (row format).
    """
    algo_func = getattr(textdistance, algorithm)

    # Handle needle as either string or 2D list
    if isinstance(needle, str):
        needle_flat = [needle] if needle.strip() else []
    else:
        # Flatten 2D lists and filter out None values
        needle_flat = [item for sublist in needle for item in sublist if item is not None]

    haystack_flat = [item for sublist in haystack for item in sublist if item is not None]

    if not haystack_flat:
        return [[] for _ in needle_flat] if needle_flat else []

    results = []
    for needle_item in needle_flat:
        if not str(needle_item).strip():
            results.append([])
            continue
        scores = [(index + 1, round(algo_func.normalized_similarity(str(needle_item), str(item)), 2))
                  for index, item in enumerate(haystack_flat)]
        scores.sort(key=lambda x: x[1], reverse=True)
        # Flatten the top matches into a single row
        row = []
        for score in scores[:top_n]:
            row.extend(list(score))  # [position, score, ...]
        results.append(row)

    # If only one needle, return just the row for that needle
    if len(results) == 1:
        return results[0]
    return results