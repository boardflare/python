# Gradio demo for ai_ask
import gradio as gr
import pandas as pd
from ai_ask import ai_ask
import json
import os

def run_ai_ask(prompt, data, temperature, max_tokens, model):
    # Convert DataFrame to list of lists if not empty
    data_list = data.values.tolist() if data is not None and not data.empty else None
    return ai_ask(prompt, data=data_list, temperature=temperature, max_tokens=max_tokens, model=model)

# Load demo examples from test_cases.json
def load_demo_examples():
    test_cases_path = os.path.join(os.path.dirname(__file__), "test_cases.json")
    with open(test_cases_path, "r", encoding="utf-8") as f:
        cases = json.load(f)
    # Only include cases where demo is true
    examples = []
    for case in cases:
        if case.get("demo"):
            args = case["arguments"]
            prompt = args.get("prompt", "")
            data = args.get("data", None)
            temperature = args.get("temperature", 0.5)
            max_tokens = args.get("max_tokens", 250)
            model = args.get("model", "mistral-small-latest")
            # Convert data to DataFrame if present
            data_df = pd.DataFrame(data) if data is not None else None
            examples.append([
                prompt,
                data_df,
                temperature,
                max_tokens,
                model
            ])
    return examples

examples = load_demo_examples()

with gr.Blocks() as demo:
    gr.Markdown("# AI Ask Demo\nEnter a prompt and optional data for analysis.")
    with gr.Row():
        prompt = gr.Textbox(label="Prompt", lines=2)
    with gr.Row():
        data = gr.Dataframe(label="Data (optional)", headers=None, datatype="str", row_count=(1, "dynamic"), col_count=(1, "dynamic"))
    with gr.Row():
        temperature = gr.Slider(0.0, 2.0, value=0.5, step=0.01, label="Temperature")
        max_tokens = gr.Number(value=250, label="Max Tokens")
        model = gr.Textbox(value="mistral-small-latest", label="Model")
    output = gr.Textbox(label="AI Response")
    submit = gr.Button("Run")
    submit.click(run_ai_ask, inputs=[prompt, data, temperature, max_tokens, model], outputs=output)
    gr.Examples(
        examples=examples,
        inputs=[prompt, data, temperature, max_tokens, model],
        outputs=output,
        label="Demo Examples"
    )

demo.launch()
