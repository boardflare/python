import textdistance

def text_distance(needle, haystack, algorithm='jaccard', top_n=1):
    """Calculate text similarity scores between needle(s) and haystack items.
    
    Args:
        needle: String or 2D list of strings to search for
        haystack: 2D list of strings to search within
        algorithm (str): Algorithm name from textdistance library (default: 'jaccard')
        top_n (int): Number of top matches to return (default: 1).
    
    Returns:
        list: 2D list where each inner list contains the top N matches as [position, score] pairs.
    """
    # Get the algorithm function from textdistance
    algo_func = getattr(textdistance, algorithm)
    
    # Handle needle as either string or 2D list
    needle_flat = []
    if isinstance(needle, str):
        needle_flat = [needle] if needle.strip() else []
    else:
        # Flatten 2D lists and filter out None values
        needle_flat = [item for sublist in needle for item in sublist if item is not None]
    
    # Flatten haystack 2D list
    haystack_flat = [item for sublist in haystack for item in sublist if item is not None]
    
    if not haystack_flat:
        return [[] for _ in needle_flat] # Return empty lists if haystack is empty
        
    results = []
    for needle_item in needle_flat:
        if not str(needle_item).strip():
            results.append([])  # Handle empty needle values by returning an empty list for that needle
            continue
            
        # Calculate similarity scores with normalization and round to 2 decimal places
        # Adjust index to be 1-based
        scores = [(index + 1, round(algo_func.normalized_similarity(str(needle_item), str(item)), 2)) 
                 for index, item in enumerate(haystack_flat)]
        # Sort based on scores in descending order
        scores.sort(key=lambda x: x[1], reverse=True)
        # Get the top N matches (index and score)
        top_matches = [list(score) for score in scores[:top_n]]
        results.append(top_matches)

    return results