# Excel Add-in Search Prompt

## Objective
Guide the model to search for Excel add-ins for a specified task, extract information from the top 100 search results directly from the search results pages, and compile a comprehensive markdown report. The report should include a table listing all found add-ins with domain information and classification of whether it's likely a product or informational website based on the search snippet.

## Steps

1. **Navigate to Search Engine**
   - Use the tool for navigating to a URL to go to `https://www.google.com`.

2. **Execute Search Query**
   - Use the tool for capturing a page snapshot to identify the search bar.
   - Use the tool for typing text into an editable element to input the search query "[USER_TASK] Excel add-in" (replace [USER_TASK] with the specific task requested) and submit it.

3. **Gather Search Results**
   - Use the tool for capturing a page snapshot to extract links, titles, and snippets from the search results.
   - Parse each search result to extract:
     - The URL
     - The title of the page
     - The snippet description
     - The domain name (extract from the URL)
   - After collecting data from the current page, click the "Next" button to navigate to the next page of results.
   - Continue this process until you have collected information for 100 links or reached the maximum available results.
   - Make sure to track the collected links to avoid duplicates.

4. **Analyze Search Results Information**
   - For each search result, determine:
     - The domain name (extract from the URL)
     - Whether it appears to be a product page (offering an Excel add-in) or an informational page based on the title and snippet
     - The name of the add-in if identifiable from the title or snippet
     - A brief description based on the snippet

5. **Create Markdown Table**
   - Organize the collected data into a markdown table with the following columns:
     - Link Number
     - Add-in Name (if identifiable, or "Unknown")
     - Domain
     - Type (Product/Informational)
     - Brief Description (from the search snippet)

6. **Assemble Summary**
   - After processing all search results, provide a summary of the findings, including:
     - Total number of product pages vs. informational pages
     - Most common domains or providers
     - Common features among the add-ins found (based on snippets)
     - Any notable trends in the search results

7. **Write to Markdown File**
   - Save the markdown file in `docs/searches/` with a descriptive filename based on the search query (e.g., `excel-[task]-addins.md`).

## Example Query

- Search Query: "data analysis Excel add-in"
- Expected Output: A markdown file named `excel-data-analysis-addins.md` in the `docs/searches/` directory, containing:
  
  1. A markdown table listing the 100 search results with columns for:
     - Link Number
     - Add-in Name (derived from title when possible)
     - Domain
     - Type (Product/Informational)
     - Brief Description (from search snippet)
  
  2. A summary section analyzing the collected data, such as:
     - "Found 65 product pages and 35 informational resources"
     - "Microsoft.com and XYZAnalytics.com were the most common providers"
     - "Common features mentioned included pivot table automation, statistical analysis, and data visualization"