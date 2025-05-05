import requests
import json

def ai_table(prompt, header=None, source=None, temperature=0.0, model='mistral-small-latest', max_tokens=1500):
    """
    Uses AI to generate a structured table based on the prompt and optional header/source data.
    
    Args:
        prompt (str): Instruction for AI to create a table
        header (list, optional): 2D list containing table header (column names)
        source (list, optional): 2D list containing source data used to create the table
        temperature (float, optional): Controls response creativity (0-2). Default is 0
        model (str, optional): ID of the model to use
        max_tokens (int, optional): Maximum tokens for response generation. Default is 1500
        
    Returns:
        list: 2D list representing the generated table data
    """
    # Using Boardflare API for demo purposes. Replace with any OpenAI compatible API endpoint.
    api_url = "https://llm.boardflare.com" # replace with "https://api.mistral.ai/v1/chat/completions"
    api_key = "cV4a59t1wjYGs...." # replace with your Mistral API key
    
    # Construct a specific prompt for table generation
    table_prompt = f"Generate a well-organized table based on this request: {prompt}"
    
    # Add header information if provided
    if header is not None:
        # Assuming header is a 2D list with a single row for column names
        if header and len(header) > 0:
            header_str = ", ".join(str(col) for col in header[0])
            table_prompt += f"\nUse exactly these columns: {header_str}"
    
    # Add source data information if provided
    if source is not None:
        source_str = json.dumps(source, indent=2)
        table_prompt += f"\n\nUse this source data to create the table:\n{source_str}"
    
    # Add instruction for structured output
    table_prompt += "\nReturn ONLY a JSON array of arrays (2D array) with the table data. "
    table_prompt += "The first row should contain column headers if not provided. "
    table_prompt += "Each subsequent row should contain data that fits the columns. "
    table_prompt += "Do not include any explanatory text, just the JSON array."
    
    # Prepare the API request payload
    payload = {
        "messages": [{"role": "user", "content": table_prompt}],
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
        
        # Extract the JSON array from the response
        try:
            # Try to parse the content as JSON directly
            table_data = json.loads(content)
            return table_data
        except (json.JSONDecodeError, ValueError):
            # If JSON parsing fails, return an error message as a single cell
            return [["Error: Unable to generate table. The AI response wasn't in the expected format."]]
             
    except Exception as e:
        # Handle any exception, including API request errors
        return [["Error: API request failed.", str(e)]]