import requests
import json

def ai_format(text, format_instruction, temperature=0.0, model='mistral-small-latest', max_tokens=1500):
    """
    Uses AI to format text according to a specific structure or pattern.
    
    Args:
        text (str or list): The text to format (string or 2D list with a single cell)
        format_instruction (str): Instructions describing the desired format
        temperature (float, optional): Controls response creativity (0-2). Default is 0
        model (str, optional): ID of the model to use
        max_tokens (int, optional): Maximum tokens for response generation. Default is 1500
        
    Returns:
        str: The formatted text according to the specified format
    """
    # Handle 2D list input (flatten to a single string)
    if isinstance(text, list):
        if len(text) > 0 and len(text[0]) > 0:
            text = str(text[0][0])
        else:
            return "Error: Empty input text."
    
    # Using Boardflare API for demo purposes. Replace with any OpenAI compatible API endpoint.
    api_url = "https://llm.boardflare.com" # replace with "https://api.mistral.ai/v1/chat/completions"
    api_key = "cV4a59t1wjYGs...." # replace with your Mistral API key
    
    # Construct a specific prompt for formatting
    format_prompt = f"Format the following text according to this format instruction: {format_instruction}\n\nText to format: {text}"
    
    # Remove JSON object instructions, just ask for plain formatted text
    format_prompt += "\n\nReturn ONLY the formatted text. Do not include any explanatory text, just the formatted result."
    
    # Prepare the API request payload
    payload = {
        "messages": [{"role": "user", "content": format_prompt}],
        "temperature": temperature,
        "model": model,
        "max_tokens": max_tokens
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
        
        # Return the plain formatted text
        return content.strip()
        
    except requests.exceptions.RequestException as e:
        # Handle API request errors
        return f"Error: API request failed. {str(e)}"