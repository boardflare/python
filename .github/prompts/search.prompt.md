---
mode: 'agent'
tools: ['read_file', 'insert_edit_into_file', 'create_file', 'fetch_webpage', 'think', 'get_errors', 'browser_navigate', 'browser_press_key', 'browser_screenshot', 'browser_snapshot', 'browser_type', 'browser_wait']
description: 'Search Google for information'
---

Search for the user's query on Google by performing the following steps: 

1. **Navigate to Search Engine**
   - Use the `browser_navigate` tool to go to `https://www.google.com`.

2. **Execute Search Query**
   - Use the `browser_snapshot` tool to capture a snapshot and identify the search bar.
   - Use the `browser_type` tool to input the search query provided by the user into the search bar.
   - Use the `browser_press_key` tool to press Enter and submit the search query.

3. **Gather Search Results**
   - Use the `browser_snapshot` tool to capture a snapshot of the search results.
   - Use the `browser_navigate` tool to go to the next page of results as needed until you have collected URLs for all 20 links.
   - Make sure to collect exactly 20 links before proceeding to the next step.
   - For each link, extract:
     - The URL
     - The title of the page
     - The snippet description
     - The domain name (extracted from the URL)
     - Without retrieving the content of the page, estimate if it is a product page (e.g. from a company) or an information page (e.g. a blog) based on the title and snippet.

6. **Write to Markdown File**
   - Summarize the search results in a markdown table with columns for the title with link, snippet description, domain name, and type (information or product) for each link.  Use the `create_file` tool to save the markdown file in `docs/searches/` with a descriptive but short filename based on the search query.  Use the `think` tool to review your work and ensure the file is well-formatted and contains all necessary information.

## Example Query

- Search Query: "Latest advancements in AI technology 2025"
- Expected Output: A markdown file named `ai-advancements-2025.md` in the `docs/searches/` directory. Each link's details are in a separate section, followed by a summary section at the end, covering the latest advancements in AI technology as of 2025, including key breakthroughs, companies involved, and potential applications.