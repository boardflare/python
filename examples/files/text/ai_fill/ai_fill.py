import requests
import json

def ai_fill(example_range, fill_range, temperature=0.0, model='mistral-small-latest', max_tokens=1500):
    """
    Uses AI to fill in missing data in a target range by learning patterns from an example range.
    
    Args:
        example_range (list): 2D list containing complete data as examples for the AI to learn from
        fill_range (list): 2D list containing data with missing values to be filled
        temperature (float, optional): Controls response creativity (0-2). Default is 0
        model (str, optional): ID of the model to use
        max_tokens (int, optional): Maximum tokens for response generation. Default is 1500
        
    Returns:
        list: 2D list with missing data filled in
    """
    # Validate inputs
    if not isinstance(example_range, list) or not example_range:
        return [["Error: Example range is empty or invalid."]]
    if not isinstance(fill_range, list) or not fill_range:
        return [["Error: Fill range is empty or invalid."]]
    
    # Using Boardflare API for demo purposes. Replace with any OpenAI compatible API endpoint.
    api_url = "https://llm.boardflare.com" # replace with "https://api.mistral.ai/v1/chat/completions"
    api_key = "cV4a59t1wjYGs...." # replace with your Mistral API key
    
    # Convert example_range and fill_range to JSON strings for the prompt
    example_json = json.dumps(example_range)
    fill_json = json.dumps(fill_range)
    
    # Construct a specific prompt for filling data
    fill_prompt = """Fill in the missing values in the target data based on patterns in the example data.
Example data (complete): {}\n\n
Target data (with missing values): {}\n\n
Study the patterns in the example data and complete the target data by filling in missing values. Preserve all existing values in the target data.""".format(
        example_json, fill_json
    )
    
    # Add instruction for structured output
    fill_prompt += "\n\nReturn ONLY a JSON array of arrays (2D array) with the completed target data. "
    fill_prompt += "Do not include any explanatory text, just the JSON array."
    
    # Prepare the API request payload
    payload = {
        "messages": [{"role": "user", "content": fill_prompt}],
        "temperature": temperature,
        "model": model,
        "max_tokens": max_tokens,
        "response_format": {
            "type": "json_object",
        }
    }
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        # Make the API request
        response = requests.post(api_url, headers=headers, json=payload)
        response.raise_for_status()
        
        # Extract the response content
        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]
        # print(content)
        
        # Extract the filled data from the response
        try:
            # Try to parse the content as JSON directly
            filled_data = json.loads(content)
            
            # If filled_data is a dictionary with a "data" or "filled_data" key, use that
            if isinstance(filled_data, dict):
                if "data" in filled_data:
                    filled_data = filled_data["data"]
                elif "filled_data" in filled_data:
                    filled_data = filled_data["filled_data"]
                elif "result" in filled_data:
                    filled_data = filled_data["result"]
            
            # Ensure the filled data is a 2D list
            if isinstance(filled_data, list) and all(isinstance(row, list) for row in filled_data):
                # Ensure the dimensions match the original fill_range
                if (len(filled_data) == len(fill_range) and 
                    all(len(row) == len(fill_range[i]) for i, row in enumerate(filled_data))):
                    return filled_data
                else:
                    return [["Error: AI response dimensions don't match the fill range."]]
            else:
                return [["Error: Unable to parse response. Expected a 2D array."]]
                
        except (json.JSONDecodeError, ValueError):
            # If JSON parsing fails, return an error message
            return [["Error: Unable to fill data. The AI response wasn't in the expected format."]]
             
    except requests.exceptions.RequestException as e:
        # Handle API request errors
        return [["Error: API request failed.", str(e)]]