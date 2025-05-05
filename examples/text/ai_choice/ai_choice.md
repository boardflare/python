# AI Choice

## Overview

This function uses AI to classify or select the most appropriate option from a list of choices based on provided text. It's ideal for categorization tasks, sentiment analysis, prioritization, and other decision-making processes where multiple options need to be evaluated against a text description.

## Usage

Analyzes a text description and selects the most suitable option from the provided choices.

```excel
=AI_CHOICE(text, choices, [temperature], [model])
```

Arguments:

| Argument      | Type                | Description                                                                                     | Default            |
|---------------|---------------------|-------------------------------------------------------------------------------------------------|--------------------|
| `text`        | string or range     | The text to classify or analyze                                                                 |                    |
| `choices`     | string or range     | The options to choose from (either a comma-separated string or a range with one option per cell)|                    |
| `temperature` | float               | Optional: Controls the randomness in selection (0.0-1.0). Lower values for more deterministic results | `0.2`         |
| `model`       | string              | Optional: The specific AI model to use for the classification                                   | `mistral-small-latest` |

Returns:

| Return Value | Type   | Description                                  |
|--------------|--------|----------------------------------------------|
| Result       | string | The selected choice from the provided options |

## Examples

### 1. Finance: Expense Categorization

Categorize an expense transaction based on its description.

**Input Text (Cell `A1`):**
```
Uber ride from airport to hotel, $45.50
```

**Choices (Range `B1:B4`):**
```
Travel
Food
Office
Software
```

```excel
=AI_CHOICE(A1, B1:B4)
```
**Sample Output:**
"Travel"

### 2. Customer Service: Email Sentiment Analysis

Classify the sentiment of a customer email to prioritize responses.

**Input Text (Cell `A1`):**
```
I've been waiting for a response about my refund for over two weeks now. This is completely unacceptable and I'm considering filing a complaint.
```

**Choices (Range `B1:B3`):**
```
Positive
Neutral
Negative
```

```excel
=AI_CHOICE(A1, B1:B3)
```
**Sample Output:**
"Negative"

### 3. Sales: Lead Qualification

Determine the qualification level of a sales lead based on interaction notes.

**Input Text (Cell `A1`):**
```
Company: Acme Corp (250+ employees). Contact expressed interest in enterprise plan, requested pricing information, and scheduled a demo next week. Budget confirmed. Decision timeline: end of quarter.
```

**Choices (Range `B1:B3`):**
```
Hot Lead
Warm Lead
Cold Lead
```

```excel
=AI_CHOICE(A1, B1:B3)
```
**Sample Output:**
"Hot Lead"

### 4. IT Support: Ticket Prioritization

Assign a priority level to a support ticket based on its description.

**Input Text (Cell `A1`):**
```
Unable to access CRM system. Getting error 500 when trying to load customer records. This is affecting sales team productivity but they can still use other systems in the meantime.
```

**Choices (Range `B1:B4`):**
```
Critical Priority
High Priority
Medium Priority
Low Priority
```

```excel
=AI_CHOICE(A1, B1:B4)
```
**Sample Output:**
"High Priority"

### 5. Product Management: Feedback Categorization

Categorize customer feedback into actionable feedback types.

**Input Text (Cell `A1`):**
```
I love the new dashboard layout, but it would be even better if I could customize which widgets appear and their positions on the screen.
```

**Choices (Range `B1:B5`):**
```
Bug Report
Feature Request
UI Feedback
Performance Issue
Compliment
```

```excel
=AI_CHOICE(A1, B1:B5)
```
**Sample Output:**
"Feature Request"

### 6. Legal: Document Classification

Classify a legal document based on its content.

**Input Text (Cell `A1`):**
```
This agreement outlines the terms under which Company A will provide consulting services to Company B, including scope of work, deliverables, timeline, and compensation structure.
```

**Choices (Single Cell with Commas, Cell `B1`):**
```
NDA, Service Agreement, Employment Contract, License Agreement
```

```excel
=AI_CHOICE(A1, B1)
```
**Sample Output:**
"Service Agreement"
