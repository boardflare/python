import requests
import json
import re

def ai_choice(text, choices, temperature=0.0, model='mistral-small-latest', max_tokens=500):
    """
    Uses AI to select the most appropriate value from a list of choices based on the input text.
    
    Args:
        text (str or list): The text to analyze (string or 2D list with a single cell)
        choices (str or list): String with comma-separated choices or 2D list of choices
        temperature (float, optional): Controls response creativity (0-2). Default is 0
        model (str, optional): ID of the model to use
        max_tokens (int, optional): Maximum tokens for response generation. Default is 500
        
    Returns:
        str: The selected choice from the provided options
    """
    # Handle 2D list input for text (flatten to a single string)
    if isinstance(text, list):
        if len(text) > 0 and len(text[0]) > 0:
            text = str(text[0][0])
        else:
            return "Error: Empty input text."
    
    # Process choices input
    choices_list = []
    if isinstance(choices, str):
        # Parse comma-separated string of choices
        choices_list = [choice.strip() for choice in choices.split(',') if choice.strip()]
    elif isinstance(choices, list):
        # Extract choices from 2D list
        for row in choices:
            if row and len(row) > 0:
                choices_list.append(str(row[0]))
    
    # Validate choices
    if not choices_list:
        return "Error: No valid choices provided."
    
    # Using Boardflare API for demo purposes. Replace with any OpenAI compatible API endpoint.
    api_url = "https://llm.boardflare.com" # replace with "https://api.mistral.ai/v1/chat/completions"
    api_key = "cV4a59t1wjYGs...." # replace with your Mistral API key
    
    # Construct a specific prompt for selecting a choice
    choices_formatted = ", ".join([f"\"{choice}\"" for choice in choices_list])
    choice_prompt = f"Select the most appropriate option from these choices: {choices_formatted}\n\nInput text: {text}"
    
    # Add instruction for structured output
    choice_prompt += "\n\nReturn ONLY a JSON object with a 'selected_choice' field containing the exact choice you selected from the provided options. "
    choice_prompt += "The selected choice must match exactly one of the provided options. "
    choice_prompt += "Do not include any explanatory text, just the JSON object."
    
    # Prepare the API request payload
    payload = {
        "messages": [{"role": "user", "content": choice_prompt}],
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
        
        # Extract the selected choice from the response
        try:
            # Try to parse the content as JSON directly
            choice_data = json.loads(content)
            
            # Get the selected choice from the JSON object
            if isinstance(choice_data, dict) and "selected_choice" in choice_data:
                selected = choice_data["selected_choice"]
                
                # Verify the selected choice is in the original choices list
                if selected in choices_list:
                    return selected
                else:
                    # Try case-insensitive matching as fallback
                    for choice in choices_list:
                        if choice.lower() == selected.lower():
                            return choice
                    return "Error: AI selected a choice that wasn't in the original options."
            else:
                return "Error: Unable to parse response. Expected a JSON object with 'selected_choice' field."
                
        except (json.JSONDecodeError, ValueError):
            # If JSON parsing fails, return an error message
            return "Error: Unable to determine choice. The AI response wasn't in the expected format."
             
    except requests.exceptions.RequestException as e:
        # Handle API request errors
        return f"Error: API request failed. {str(e)}"