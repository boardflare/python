from smolagents import CodeAgent, InferenceClientModel, tool

def smolagents_hello(prompt, model_id = "https://llm.boardflare.com", token = "cV4a59t1wjYGs...."):
    """
    Uses a code agent from smolagents to run a simple tool (hello) using an LLM model.

    Args:
        prompt (str): The instruction or request for the agent (e.g., "Get a greeting for Mike") that uses the hello tool.
        model_id (str, optional): The model_id to use. Defaults to 'https://llm.boardflare.com' to make this work in a demo, but this is heavily rate-limited, an not for production use.
        token (str, optional): The API token for the LLM provider.

    Returns:
        str: The agent's response as a string, or an error message if something fails.
    """
    if not isinstance(prompt, str) or not prompt.strip():
        return "Invalid prompt. Please provide a non-empty string."

    # See https://huggingface.co/docs/smolagents/main/en/reference/models#smolagents.InferenceClientModel for instuctions on how to set up your own model.
    model = InferenceClientModel(
        model_id=model_id,
        token=token
    )

    # Define a simple tool that returns a greeting
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
