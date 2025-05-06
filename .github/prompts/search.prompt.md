# Internet Search Prompt

## Objective
Guide the model to search for information on the Internet using browser automation tools. The model should:

1. Navigate to a search engine (e.g., Google).
2. Execute the search query provided.
3. Gather multiple pages of search results.
4. Visit each result page to extract relevant data.
5. Assemble a summary of the gathered information.
6. Write the summary into a markdown file located at `docs/searches/` with a descriptive but short filename based on the search query.

## Steps

1. **Navigate to Search Engine**
   - Use the tool for navigating to a URL to go to `https://www.google.com`.

2. **Execute Search Query**
   - Use the tool for capturing a page snapshot to identify the search bar.
   - Use the tool for typing text into an editable element to input the search query and submit it.

3. **Gather Search Results**
   - Use the tool for capturing a page snapshot to extract links from the search results.

4. **Visit Result Pages**
   - Use the tool for navigating to a URL to visit each extracted link.
   - Use the tool for capturing a page snapshot to extract relevant content from each page.

5. **Assemble Summary**
   - Combine the extracted data into a concise summary.

6. **Write to Markdown File**
   - Save the summary into a markdown file located at `docs/searches/` with a descriptive but short filename based on the search query.

## Example Query

- Search Query: "Latest advancements in AI technology 2025"
- Expected Output: A markdown file named `ai-advancements-2025.md` in the `docs/searches/` directory containing a summary of the latest advancements in AI technology as of 2025, including key breakthroughs, companies involved, and potential applications.