import requests
import json

def ai_summarize(text, max_length="medium", format="paragraph", temperature=0.0, model='mistral-small-latest', max_tokens=1000):
    """
    Uses AI to generate a concise summary of the provided text.
    
    Args:
        text (str or list): The text to summarize (string or 2D list with a single cell)
        max_length (str or int): Target length for summary ("short", "medium", "long" or word/sentence count)
        format (str): Output format ("paragraph", "bullets", "key_points")
        temperature (float, optional): Controls response creativity (0-2). Default is 0
        model (str, optional): ID of the model to use
        max_tokens (int, optional): Maximum tokens for response generation. Default is 1000
        
    Returns:
        list: 2D list representing the summary (single cell for paragraph format,
              single column for bullets or key_points format)
    """
    # Handle 2D list input (flatten to a single string)
    if isinstance(text, list):
        if len(text) > 0 and len(text[0]) > 0:
            # If it's a 2D range with multiple cells, concatenate the content
            full_text = []
            for row in text:
                for cell in row:
                    if cell:  # Skip empty cells
                        full_text.append(str(cell))
            text = " ".join(full_text)
        else:
            return [["Error: Empty input text."]]
    
    # Validate format
    valid_formats = ["paragraph", "bullets", "key_points"]
    if format.lower() not in valid_formats:
        return [[f"Error: Invalid format. Choose from {', '.join(valid_formats)}"]]
    
    # Using Boardflare API for demo purposes. Replace with any OpenAI compatible API endpoint.
    api_url = "https://llm.boardflare.com" # replace with "https://api.mistral.ai/v1/chat/completions"
    api_key = "cV4a59t1wjYGs...." # replace with your Mistral API key
    
    # Construct a specific prompt for summarization
    length_instruction = ""
    if isinstance(max_length, int):
        length_instruction = f"in approximately {max_length} words"
    elif isinstance(max_length, str):
        if max_length.lower() == "short":
            length_instruction = "in a very concise way, focusing only on the most critical points"
        elif max_length.lower() == "medium":
            length_instruction = "in a moderately detailed way, covering the main points"
        elif max_length.lower() == "long":
            length_instruction = "in a comprehensive way, covering all significant details"
        else:
            # Treat as a word count if it's a numeric string
            try:
                word_count = int(max_length)
                length_instruction = f"in approximately {word_count} words"
            except ValueError:
                length_instruction = "in a moderately detailed way"
    
    format_instruction = ""
    if format.lower() == "paragraph":
        format_instruction = "as a single coherent paragraph"
    elif format.lower() == "bullets":
        format_instruction = "as a bulleted list of key points"
    elif format.lower() == "key_points":
        format_instruction = "as an organized list of key points grouped by categories"
    
    summary_prompt = f"Summarize the following text {length_instruction} {format_instruction}:\n\n{text}"
    
    # Add instruction for structured output
    if format.lower() == "paragraph":
        summary_prompt += "\n\nReturn ONLY a JSON object with a 'summary' field containing the paragraph summary. "
        summary_prompt += "Do not include any explanatory text, just the JSON object."
    else:  # bullets or key_points
        summary_prompt += "\n\nReturn ONLY a JSON object with a 'summary_points' field containing an array of summary points. "
        summary_prompt += "Each point should be a string in the array. "
        summary_prompt += "Do not include any explanatory text, just the JSON object."
    
    # Prepare the API request payload
    payload = {
        "messages": [{"role": "user", "content": summary_prompt}],
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
        
        # Extract the summary from the response
        try:
            # Try to parse the content as JSON directly
            summary_data = json.loads(content)
            
            if format.lower() == "paragraph":
                # Get the paragraph summary
                if isinstance(summary_data, dict) and "summary" in summary_data:
                    return [[summary_data["summary"]]]
                else:
                    return [["Error: Unable to parse response. Expected a JSON object with 'summary' field."]]
            else:  # bullets or key_points
                # Get the bullet points or key points
                if isinstance(summary_data, dict) and "summary_points" in summary_data:
                    points = summary_data["summary_points"]
                    if isinstance(points, list):
                        return [[point] for point in points]
                    else:
                        return [["Error: Unable to parse response. Expected an array of summary points."]]
                else:
                    return [["Error: Unable to parse response. Expected a JSON object with 'summary_points' field."]]
                
        except (json.JSONDecodeError, ValueError):
            # If JSON parsing fails, return an error message
            return [["Error: Unable to generate summary. The AI response wasn't in the expected format."]]
             
    except requests.exceptions.RequestException as e:
        # Handle API request errors
        return [[f"Error: API request failed. {str(e)}"]]