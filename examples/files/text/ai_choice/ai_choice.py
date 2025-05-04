import requests
import json

def ai_choice(text, choices, temperature=0.2, model='mistral-small-latest'):
    """
    Uses AI to select the most appropriate choice from a list of options based on the given context.
    
    Args:
        text (str or list): The context, question, or scenario used for decision-making
        choices (str or list): A string with comma-separated options or a 2D list of options
        temperature (float, optional): Controls randomness in the selection (0-1). Default is 0.2
        model (str, optional): ID of the AI model to use
        
    Returns:
        str: The selected choice from the options provided
    """
    # Input validation
    if not text or (isinstance(text, list) and (len(text) == 0 or len(text[0]) == 0)):
        return "Error: Empty input text."
    
    if not choices or (isinstance(choices, list) and (len(choices) == 0 or len(choices[0]) == 0)):
        return "Error: No valid choices provided."
    
    # Normalize text to string if it's a 2D list
    if isinstance(text, list):
        text_str = "\n".join([item[0] if isinstance(item[0], str) else str(item[0]) for item in text if len(item) > 0])
    else:
        text_str = text
    
    # Normalize choices to a list of strings
    if isinstance(choices, list):
        choices_list = [item[0] if isinstance(item, list) and len(item) > 0 else str(item) for item in choices]
    else:
        choices_list = [choice.strip() for choice in str(choices).split(',')]
    
    # Construct the AI prompt
    prompt = f"""Based on the following context, select the single most appropriate option from the choices provided.
    
Context:
{text_str}

Choices:
{json.dumps(choices_list, indent=2)}

Provide ONLY your selected choice without explanation or additional text. Return the exact text of the selected choice."""

    # Using Boardflare API for demo purposes. Replace with any OpenAI compatible API endpoint.
    # Sign up for your free Mistral API account at https://console.mistral.ai/ then replace the following:
    
    api_url = "https://llm.boardflare.com" # replace with "https://api.mistral.ai/v1/chat/completions"
    api_key = "cV4a59t1wjYGs...." # replace with your Mistral API key
    
    # Prepare the API request payload
    payload = {
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "model": model,
        "max_tokens": 200
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
        
        # Extract and return the response content
        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"].strip()
        
        # Validate that the response is one of the choices
        for choice in choices_list:
            if choice in content or content in choice:
                return choice
        
        # If no exact match, return the AI's response (which may be a paraphrase)
        return content
        
    except Exception as e:
        return f"Error: Failed to get AI recommendation. {str(e)}"