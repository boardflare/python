# Internet Search Prompt

## Objective
Guide the model to search for information on the Internet, extract relevant data from the top 20 search results, and compile a comprehensive markdown report on the topic. The report should include detailed information from each source and a summary of the findings.

## Steps

1. **Navigate to Search Engine**
   - Use the tool for navigating to a URL to go to `https://www.google.com`.

2. **Execute Search Query**
   - Use the tool for capturing a page snapshot to identify the search bar.
   - Use the tool for typing text into an editable element to input the search query and submit it.

3. **Gather Search Results**
   - Use the tool for capturing a page snapshot to extract links from the search results.
   - Continue to the next pages of search results as needed until you have collected URLs for all 20 links.
   - Make sure to collect exactly 20 links before proceeding to the next step.

4. **Process Result Pages**
   - For each of the 20 links collected, use the fetch_webpage tool to retrieve and extract the main content.
   - The fetch_webpage tool allows you to extract content from a webpage without having to navigate to it directly.
   - IMPORTANT: Immediately after processing each link, record the important details from that page in a separate section of the markdown file, before moving to the next link.
   - Continue this process until ALL 20 links have been processed. Do not stop until you have processed all 20 links.

5. **Assemble Summary**
   - After all 20 links are processed, combine the extracted data into a concise summary and record it at the end of the markdown file.

6. **Write to Markdown File**
   - Save the markdown file in `docs/searches/` with a descriptive but short filename based on the search query.

## Example Query

- Search Query: "Latest advancements in AI technology 2025"
- Expected Output: A markdown file named `ai-advancements-2025.md` in the `docs/searches/` directory. Each link's details are in a separate section, followed by a summary section at the end, covering the latest advancements in AI technology as of 2025, including key breakthroughs, companies involved, and potential applications.