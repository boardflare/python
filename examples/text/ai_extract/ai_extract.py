import requests
import json

def ai_extract(text, extract_type, temperature=0.0, model='mistral-small-latest', max_tokens=1000):
    """
    Uses AI to extract specific types of information from text.
    
    Args:
        text (str or list): The text to analyze (string or 2D list with a single cell)
        extract_type (str): Type of information to extract (e.g., 'emails', 'dates', 'action items')
        temperature (float, optional): Controls response creativity (0-2). Default is 0
        model (str, optional): ID of the model to use
        max_tokens (int, optional): Maximum tokens for response generation. Default is 1000
        
    Returns:
        list: 2D list representing the extracted data as a single column
    """
    # Handle 2D list input (flatten to a single string)
    if isinstance(text, list):
        if len(text) > 0 and len(text[0]) > 0:
            text = str(text[0][0])
        else:
            return [["Error: Empty input text."]]
    
    # Using Boardflare API for demo purposes. Replace with any OpenAI compatible API endpoint.
    api_url = "https://llm.boardflare.com" # replace with "https://api.mistral.ai/v1/chat/completions"
    api_key = "cV4a59t1wjYGs...." # replace with your Mistral API key
    
    # Construct a specific prompt for data extraction
    extract_prompt = f"Extract the following from the text: {extract_type}\n\nText: {text}"
    
    # Add instruction for structured output
    extract_prompt += "\n\nReturn ONLY a JSON object with a key 'items' whose value is a JSON array of the items you extracted. "
    extract_prompt += "Each item should be a single value representing one extracted piece of information. "
    extract_prompt += "Do not include any explanatory text, just the JSON object. "
    extract_prompt += "For example: {\"items\": [\"item1\", \"item2\", \"item3\"]}"
    
    # Prepare the API request payload
    payload = {
        "messages": [{"role": "user", "content": extract_prompt}],
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
        
        # Extract the JSON array from the response
        try:
            # Try to parse the content as JSON directly
            extracted_data = json.loads(content)
            
            # Always look for the 'items' key as per the prompt
            if isinstance(extracted_data, dict) and "items" in extracted_data:
                extracted_data = extracted_data["items"]
            # Legacy fallback for older keys (optional)
            elif isinstance(extracted_data, dict):
                if "extracted" in extracted_data:
                    extracted_data = extracted_data["extracted"]
                elif "results" in extracted_data:
                    extracted_data = extracted_data["results"]
            
            # Convert the list to a 2D list (single column)
            if isinstance(extracted_data, list):
                return [[item] for item in extracted_data]
            else:
                return [["Error: Unable to parse response. Expected a list."]]
                
        except (json.JSONDecodeError, ValueError):
            # If JSON parsing fails, return an error message as a single cell
            return [["Error: Unable to extract data. The AI response wasn't in the expected format."]]
             
    except requests.exceptions.RequestException as e:
        # Handle API request errors
        return [["Error: API request failed.", str(e)]]