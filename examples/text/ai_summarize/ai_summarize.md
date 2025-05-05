# AI Summarize

## Overview

This function leverages an AI model to generate concise summaries of text content. It's particularly useful for distilling key information from large documents, meeting notes, reports, or any text that needs to be condensed while preserving the core meaning.

## Usage

Generates a summary of the provided text based on specified parameters like length and format.

```excel
=AI_SUMMARIZE(text, [max_length], [format], [temperature], [model], [max_tokens])
```

Arguments:

| Argument      | Type           | Description                                                                                              | Default         |
|---------------|----------------|----------------------------------------------------------------------------------------------------------|-----------------|
| `text`        | string/range   | The text or cell reference containing data to summarize.                                                 |                 |
| `max_length`  | int/string     | Optional: Target length for the summary (number of words, sentences, or "short", "medium", "long").  | `"medium"`     |
| `format`      | string         | Optional: Output format ("paragraph", "bullets", "key_points").                                     | `"paragraph"`  |
| `temperature` | float          | Optional: Controls the randomness/creativity of the response (0.0 to 2.0). Lower values are more deterministic. | `0.0`     |
| `model`       | string         | Optional: The specific AI model ID to use (must support JSON mode, e.g., 'mistral-small-latest').         | `mistral-small-latest` |
| `max_tokens`  | int            | Optional: Maximum number of tokens for the generated content.                                            | `1000`          |

Returns:

| Return Value | Type    | Description                                                                                                       |
|--------------|---------|-------------------------------------------------------------------------------------------------------------------|
| Summary      | 2D list | For paragraph format: a single-cell 2D list. For bullets/key_points format: a single-column 2D list with multiple rows. Returns `[["Error: ..."]]` on failure. |

## Examples

### 1. Summarizing a Business Report
Create a concise summary of a quarterly business report.
```excel
=AI_SUMMARIZE("Q1 2025 financial results showed a 12% increase in revenue, reaching $3.4M compared to $3.0M in Q1 2024. Operating expenses were reduced by 5% due to successful cost-cutting initiatives in our supply chain operations. Profit margins improved from 15% to 18%. The new product line launched in February exceeded expectations with 5,000 units sold, accounting for 15% of total sales. Customer acquisition cost decreased by 10% while customer retention improved by 7%. The expansion into European markets is progressing ahead of schedule with distribution agreements signed in Germany and France. Key challenges included component shortages affecting production timelines and increased competition in the Asian market. For Q2, we plan to focus on scaling production capacity, launching version 2.0 of our flagship product, and finalizing our entry strategy for the Spanish market.", "short", "paragraph")
```
**Sample Output:**

| |
|---------------------------|
| Q1 2025 showed 12% revenue growth to $3.4M with 5% reduced expenses and improved profit margins (15% to 18%). A new product line exceeded expectations, and European expansion is ahead of schedule. Challenges included component shortages and Asian market competition. Q2 plans focus on scaling production, launching a new product version, and entering the Spanish market. |

### 2. Extracting Key Points from Meeting Notes
Extract the main points from a meeting transcript.
```excel
=AI_SUMMARIZE("During today's product development meeting, we discussed several key items. Sarah reported that the user interface redesign is 85% complete and should be finalized by next Friday. Michael raised concerns about the database performance under high load conditions, estimating we need to optimize queries before proceeding to beta testing. Jennifer presented three alternative solutions for the payment processing integration, with the team agreeing to proceed with Option B (Stripe API) due to better documentation and support. The marketing team requested that we reconsider the color scheme to better align with the updated brand guidelines, but the team decided to postpone this discussion until the core functionality is complete. Everyone agreed that the current sprint is on track except for the analytics dashboard which is approximately two days behind schedule. We scheduled an additional technical review for Wednesday at 2 PM to address the outstanding API integration issues that David identified during testing. The release date remains set for June 15, with a contingency plan to delay non-critical features if necessary.", 150, "bullets")
```
**Sample Output:**

| |
|---------------------------|
| • UI redesign 85% complete, expected by next Friday |
| • Database performance concerns raised; query optimization needed before beta testing |
| • Team selected Stripe API for payment processing integration |
| • Color scheme discussion postponed until core functionality is complete |
| • Sprint on track except for analytics dashboard (2 days behind) |
| • Technical review scheduled for Wednesday at 2 PM to address API integration issues |
| • Release date remains June 15, with contingency plan for non-critical features |

### 3. Summarizing Customer Feedback
Create a structured summary of aggregated customer feedback.
```excel
=AI_SUMMARIZE("We collected feedback from 120 customers who used our new software platform over the past month. Approximately 65% of users rated the experience as positive (4 or 5 stars), while 25% gave neutral ratings (3 stars) and 10% reported negative experiences (1 or 2 stars). The most commonly praised features were the intuitive dashboard (mentioned by 52 users), fast loading times (mentioned by 47 users), and the mobile compatibility (mentioned by 39 users). Areas of criticism included the complex export process (mentioned by 28 users), occasional sync issues (mentioned by 22 users), and limited customization options (mentioned by 18 users). Among enterprise customers, the batch processing capability received particularly high marks, while small business users appreciated the simplified reporting functions. Several users (approximately 15) specifically requested additional template options, and 12 users asked for better integration with third-party analytics tools. The Net Promoter Score calculated from the survey was 42, which represents a 15-point improvement from our previous platform version.", "medium", "key_points")
```
**Sample Output:**

| |
|---------------------------|
| CUSTOMER SATISFACTION: |
| • 65% positive ratings (4-5 stars) |
| • 25% neutral ratings (3 stars) |
| • 10% negative ratings (1-2 stars) |
| • Net Promoter Score: 42 (15-point improvement) |
| |
| STRENGTHS: |
| • Intuitive dashboard (52 mentions) |
| • Fast loading times (47 mentions) |
| • Mobile compatibility (39 mentions) |
| • Enterprise users valued batch processing |
| • Small businesses appreciated simplified reporting |
| |
| AREAS FOR IMPROVEMENT: |
| • Complex export process (28 mentions) |
| • Sync issues (22 mentions) |
| • Limited customization (18 mentions) |
| |
| REQUESTED FEATURES: |
| • Additional templates (15 mentions) |
| • Better third-party analytics integration (12 mentions) |

### 4. Condensing Contract Information
Summarize key terms from a legal agreement.
```excel
=AI_SUMMARIZE("This Service Level Agreement (SLA) is effective as of April 1, 2025, between XYZ Corporation ('Provider') and ABC Company ('Client') for the provision of cloud hosting services. The Provider guarantees a monthly uptime of 99.9%, calculated on a 24/7 basis, excluding scheduled maintenance windows. Scheduled maintenance will occur between 1:00 AM and 5:00 AM EST on the second Sunday of each month and will be communicated at least 72 hours in advance. In the event of downtime exceeding the guaranteed level, the Provider will issue service credits as follows: 5% of monthly fee for uptime between 99.0% and 99.8%, 10% for uptime between 98.0% and 98.9%, and 20% for uptime below 98.0%. The Provider will respond to Severity 1 (critical) issues within 15 minutes, Severity 2 (major) issues within 1 hour, and Severity 3 (minor) issues within 4 business hours. The Client must report all issues through the designated support portal or emergency phone line. This SLA has an initial term of 12 months and will automatically renew for successive 12-month periods unless either party provides written notice of non-renewal at least 30 days prior to the end of the current term. All fees are payable monthly in advance, with payment due within 15 days of invoice date. Late payments will incur a 1.5% monthly interest charge.", "medium", "key_points")
```
**Sample Output:**

| |
|---------------------------|
| KEY TERMS: |
| • Effective Date: April 1, 2025 |
| • Parties: XYZ Corporation (Provider) and ABC Company (Client) |
| • Service: Cloud hosting |
| |
| PERFORMANCE GUARANTEES: |
| • Uptime: 99.9% monthly guarantee |
| • Maintenance: Second Sunday monthly, 1-5 AM EST, 72h notice |
| • Service Credits: 5% (99.0-99.8% uptime), 10% (98.0-98.9%), 20% (<98.0%) |
| |
| RESPONSE TIMES: |
| • Severity 1 (critical): 15 minutes |
| • Severity 2 (major): 1 hour |
| • Severity 3 (minor): 4 business hours |
| |
| TERM AND PAYMENT: |
| • Initial Term: 12 months with auto-renewal |
| • Payment: Monthly in advance, due within 15 days |
| • Late Payment Interest: 1.5% monthly |