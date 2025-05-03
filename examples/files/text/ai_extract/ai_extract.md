# AI Extract

## Overview

This function uses an AI model to extract specific types of information from text. It's particularly useful for pulling structured data (like dates, contacts, key points) from unstructured text content such as emails, reports, or meeting notes.

## Usage

Extracts specific types of information from a given text based on what you specify in the extract parameter.

```excel
=AI_EXTRACT(text, extract_type, [temperature], [model], [max_tokens])
```

Arguments:

| Argument      | Type           | Description                                                                                              | Default         |
|---------------|----------------|----------------------------------------------------------------------------------------------------------|-----------------|
| `text`        | string/range   | The text or cell reference containing the data to analyze.                                               |                 |
| `extract_type`| string         | The type of information to extract (e.g., "emails", "dates", "key points").                        |                 |
| `temperature` | float          | Optional: Controls the randomness/creativity of the response (0.0 to 2.0). Lower values are more deterministic. | `0.0`     |
| `model`       | string         | Optional: The specific AI model ID to use (must support JSON mode, e.g., 'mistral-small-latest').         | `mistral-small-latest` |
| `max_tokens`  | int            | Optional: Maximum number of tokens for the generated list content.                                       | `1000`          |

Returns:

| Return Value  | Type    | Description                                                                                                    |
|---------------|---------|----------------------------------------------------------------------------------------------------------------|
| Extracted Data| 2D list | A single-column list of extracted items as requested. Returns `[["Error: ..."]]` on failure.                 |

## Examples

### 1. Extracting Client Names from Meeting Notes
Extract all client names mentioned in a meeting summary.
```excel
=AI_EXTRACT("During today's annual review, we discussed progress with Acme Corporation, Global Enterprises, and TechSolutions Inc. All three clients reported satisfaction with our services.", "client names")
```
**Sample Output:**

| |
|---------------------------|
| Acme Corporation |
| Global Enterprises |
| TechSolutions Inc. |

### 2. Extracting Financial Metrics from a Report
Extract key financial metrics from a quarterly report.
```excel
=AI_EXTRACT("Q1 results exceeded expectations with revenue of $2.4M, an EBITDA margin of 18.5%, and customer acquisition costs decreasing by 12%. Cash reserves stand at $5.2M and our runway extends to 24 months.", "financial metrics")
```
**Sample Output:**

| |
|---------------------------|
| Revenue: $2.4M |
| EBITDA margin: 18.5% |
| Customer acquisition costs: -12% |
| Cash reserves: $5.2M |
| Runway: 24 months |

### 3. Extracting Action Items from Email
Extract action items assigned in an email.
```excel
=AI_EXTRACT("Hi team, Following our strategic planning session: 1) Mark needs to finalize the budget by Friday, 2) Sarah will contact vendors for new quotes, 3) Development team must provide timeline estimates by next Wednesday, and 4) Everyone should review the new marketing materials.", "action items")
```
**Sample Output:**

| |
|---------------------------|
| Mark needs to finalize the budget by Friday |
| Sarah will contact vendors for new quotes |
| Development team must provide timeline estimates by next Wednesday |
| Everyone should review the new marketing materials |

### 4. Extracting Contact Information from Business Cards
Extract contact details from scanned business card text.
```excel
=AI_EXTRACT("John Smith\nSenior Project Manager\nInnovative Solutions Inc.\njsmith@innovativesolutions.com\n+1 (555) 123-4567\n123 Business Avenue, Suite 400\nSan Francisco, CA 94107", "contact information")
```
**Sample Output:**

| |
|---------------------------|
| Name: John Smith |
| Title: Senior Project Manager |
| Company: Innovative Solutions Inc. |
| Email: jsmith@innovativesolutions.com |
| Phone: +1 (555) 123-4567 |
| Address: 123 Business Avenue, Suite 400, San Francisco, CA 94107 |

### 5. Extracting Dates and Deadlines
Extract important dates and deadlines from a project update.
```excel
=AI_EXTRACT("The initial design phase will be completed by May 15, 2025. The stakeholder review is scheduled for May 20-22, with development starting June 1. Testing will run through September 15, with final delivery expected by October 3, 2025.", "dates and deadlines")
```
**Sample Output:**

| |
|---------------------------|
| Design completion: May 15, 2025 |
| Stakeholder review: May 20-22, 2025 |
| Development start: June 1, 2025 |
| Testing completion: September 15, 2025 |
| Final delivery: October 3, 2025 |