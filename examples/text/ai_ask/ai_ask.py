import requests
import json

def ai_ask(prompt, data=None, temperature=0.5, max_tokens=250, model='mistral-small-latest'):
    """
    Uses AI to generate responses based on prompts and optional data ranges.

    Args:
        prompt (str): The question, task, or analysis to perform
        data (list, optional): 2D list containing data from Excel range to analyze
        temperature (float, optional): Controls response creativity (0-2). Default is 0.5
        max_tokens (int, optional): Maximum tokens for response generation
        model (str, optional): ID of the model to use
        # Note: API key is hardcoded for this example, replace with secure handling in production

    Returns:
        str: The AI-generated response
    """
    
    # Using Boardflare API for demo purposes. Replace with any OpenAI compatible API endpoint.
    # Sign up for your free Mistral API account at https://console.mistral.ai/ then replace the following:
    
    api_url = "https://llm.boardflare.com" # replace with "https://api.mistral.ai/v1/chat/completions"
    api_key = "cV4a59t1wjYGs...." # replace with your Mistral API key
    
    # Construct the message incorporating both prompt and data if provided
    message = prompt
    if data is not None:
        data_str = json.dumps(data, indent=2)
        message += f"\n\nData to analyze:\n{data_str}"
    
    # Remove array-specific instructions; just request a direct answer
    
    # Prepare the API request payload
    payload = {
        "messages": [{"role": "user", "content": message}],
        "temperature": temperature,
        "model": model,
        "max_tokens": max_tokens
    }
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    # Make the API request
    response = requests.post(api_url, headers=headers, json=payload)
    response.raise_for_status()
    
    # Extract and return the response content
    response_data = response.json()
    content = response_data["choices"][0]["message"]["content"]

    return content