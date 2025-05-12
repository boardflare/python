import sys
from typing import Optional

def smolagents(prompt: str, model_id: Optional[str] = None):
    """
    Uses a code agent from smolagents to run a simple tool (hello) using an LLM model.

    Args:
        prompt (str): The instruction or request for the agent (e.g., "Get a greeting for Mike").
        model_id (str, optional): The HuggingFace model ID to use. Defaults to 'Qwen/Qwen2.5-Coder-32B-Instruct'.

    Returns:
        str: The agent's response as a string.
    """
    try:
        from smolagents import CodeAgent, InferenceClientModel, tool
    except ImportError:
        return "smolagents package is not installed."

    if not isinstance(prompt, str) or not prompt.strip():
        return "Invalid prompt. Please provide a non-empty string."

    model_id = model_id or "Qwen/Qwen2.5-Coder-32B-Instruct"
    # Replace with your own Hugging Face token for production
    api_token = "hf_pQnrSUXkgDxDfln....."
    try:
        model = InferenceClientModel(model_id=model_id, token=api_token)
    except Exception as e:
        return f"Model initialization failed: {e}"

    @tool
    def hello(name: str) -> str:
        """
        Returns a greeting.

        Args:
            name: The name of the person that you want a greeting for.
        """
        return f"Hello {name}!"

    try:
        agent = CodeAgent(tools=[hello], model=model, add_base_tools=False)
        result = agent.run(prompt)
        if isinstance(result, str):
            return result
        return str(result)
    except Exception as e:
        return f"Agent error: {e}"
