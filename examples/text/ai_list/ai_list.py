import requests
import json

def ai_list(prompt, values=None, temperature=0.0, model='mistral-small-latest', max_tokens=1000):
    """
    Uses AI to generate a list of items based on the prompt and optional values data.
    
    Args:
        prompt (str): Instruction for AI to create a list
        values (list, optional): 2D list containing additional data to append to prompt
        temperature (float, optional): Controls response creativity (0-2). Default is 0
        model (str, optional): ID of the model to use
        max_tokens (int, optional): Maximum tokens for response generation. Default is 1000
        
    Returns:
        list: 2D list representing the generated list data as a single column
    """
    # Using Boardflare API for demo purposes. Replace with any OpenAI compatible API endpoint.
    api_url = "https://llm.boardflare.com" # replace with "https://api.mistral.ai/v1/chat/completions"
    api_key = "cV4a59t1wjYGs...." # replace with your Mistral API key
    
    # Construct a specific prompt for list generation
    list_prompt = f"Generate a list based on this request: {prompt}"
    
    # Add values information if provided
    if values is not None:
        values_str = "\n".join([str(item[0]) for item in values]) if len(values) > 0 and len(values[0]) > 0 else ""
        if values_str:
            list_prompt += f"\n\nUse this information to help create the list:\n{values_str}"
    
    # Add instruction for structured output
    list_prompt += "\nReturn ONLY a JSON object with a key 'items' whose value is a JSON array of the items for the list. "
    list_prompt += "Each item should be a single value. "
    list_prompt += "Do not include any explanatory text, just the JSON object. "
    list_prompt += "For example: {\"items\": [\"item1\", \"item2\", \"item3\"]}"
    
    # Prepare the API request payload
    payload = {
        "messages": [{"role": "user", "content": list_prompt}],
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
            list_data = json.loads(content)
            
            # Always look for the 'items' key as per the prompt
            if isinstance(list_data, dict) and "items" in list_data:
                list_data = list_data["items"]
            # Legacy fallback for older keys (optional)
            elif isinstance(list_data, dict):
                if "list" in list_data:
                    list_data = list_data["list"]
                else:
                    # Check for any array key in the response
                    for key, value in list_data.items():
                        if isinstance(value, list):
                            list_data = value
                            break
            
            # Convert the list to a 2D list (single column)
            if isinstance(list_data, list):
                # Ensure each item is a string and properly formatted as a single-item list
                result = []
                for item in list_data:
                    if isinstance(item, list):
                        # If item is already a list, ensure it has exactly one element
                        if len(item) >= 1:
                            result.append([str(item[0])])
                        else:
                            result.append([""])
                    else:
                        # If item is not a list, make it a single-item list
                        result.append([str(item)])
                return result
            else:
                return [["Error: Unable to parse response. Expected a list."]]
                
        except (json.JSONDecodeError, ValueError):
            # If JSON parsing fails, return an error message as a single cell
            return [["Error: Unable to generate list. The AI response wasn't in the expected format."]]
             
    except requests.exceptions.RequestException as e:
        # Handle API request errors
        return [["Error: API request failed.", str(e)]]