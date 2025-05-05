# AI List

## Overview

This function leverages an AI model (compatible with OpenAI's API structure and supporting JSON output format) to generate a list of items based on a prompt. It's particularly useful for categorization, classification, and matching tasks where you need to assign items to predefined categories based on their content.

## Usage

Instructs an AI model to generate a list of items based on a `prompt`, returning the result as a single-column list.

```excel
=AI_LIST(prompt, [values], [temperature], [model], [max_tokens])
```

Arguments:

| Argument      | Type           | Description                                                                                              | Default         |
|---------------|----------------|----------------------------------------------------------------------------------------------------------|-----------------|
| `prompt`      | string         | The instruction describing the list the AI should create.                                                |                 |
| `values`      | 2D list        | Optional: Additional data to append to the prompt to provide context.                                    | `None`          |
| `temperature` | float          | Optional: Controls the randomness/creativity of the response (0.0 to 2.0). Lower values are more deterministic. | `0.0`     |
| `model`       | string         | Optional: The specific AI model ID to use (must support JSON mode, e.g., 'mistral-small-latest').         | `mistral-small-latest` |
| `max_tokens`  | int            | Optional: Maximum number of tokens for the generated list content.                                       | `1000`          |

Returns:

| Return Value | Type    | Description                                                                                                    |
|--------------|---------|----------------------------------------------------------------------------------------------------------------|
| List Data    | 2D list | A single-column list of items as requested in the prompt. Returns `[["Error: ..."]]` on failure.              |

## Examples

### 1. Generating a List of Key Performance Indicators (KPIs)
Generate a list of KPIs relevant to a marketing department.
```excel
=AI_LIST("List essential marketing KPIs for quarterly performance reviews")
```
**Sample Output:**

| |
|---------------------------|
| Customer Acquisition Cost |
| Conversion Rate |
| Return on Marketing Investment |
| Customer Lifetime Value |
| Website Traffic |
| Social Media Engagement |
| Email Open Rate |
| Marketing Qualified Leads |

### 2. Creating a List of Risk Mitigation Strategies
Generate a list of risk mitigation strategies for a business project.
```excel
=AI_LIST("List effective risk mitigation strategies for enterprise software implementation")
```
**Sample Output:**

| |
|---------------------------|
| Phased Implementation Approach |
| Comprehensive Testing Protocol |
| Stakeholder Engagement Plan |
| Clear Change Management Process |
| Dedicated Support Team |
| Regular Progress Reviews |
| Vendor SLA Enforcement |
| Data Backup and Recovery Plan |

### 3. Listing Compliance Requirements
Get a list of compliance requirements for a specific industry.
```excel
=AI_LIST("List key compliance requirements for healthcare organizations")
```
**Sample Output:**

| |
|---------------------------|
| HIPAA Privacy Rule |
| HIPAA Security Rule |
| HITECH Act Requirements |
| Medicare/Medicaid Compliance |
| Clinical Laboratory Improvement Amendments |
| Stark Law Compliance |
| Anti-Kickback Statute |
| Joint Commission Accreditation Standards |

### 4. Using Values Parameter
Generate a list of action items based on specific meeting notes provided as values.

**Sample Values Data (Range `A1:A3`):**

| |
|-------------|
| Q1 revenue fell 5% below target |
| Customer complaints increased by 12% |
| New product launch delayed by 3 weeks |

```excel
=AI_LIST("List priority action items based on these quarterly business review notes:", A1:A3)
```
**Sample Output:**

| |
|------------------------------|
| Perform revenue gap analysis |
| Implement customer feedback process improvements |
| Review and optimize product development workflow |
| Conduct sales team performance evaluation |
| Develop enhanced customer satisfaction strategy |
| Revise product launch timeline and accountability |

### 5. Creating a List of SMART Goals
Generate a list of SMART goals for a specific department.
```excel
=AI_LIST("List 5 SMART goals for an HR department focused on improving employee retention")
```
**Sample Output:**

| |
|-----------|
| Reduce employee turnover by 15% within the next 12 months through implementation of structured exit interviews and action plans |
| Increase employee engagement scores from 72% to 85% by Q4 through bi-monthly team building activities and feedback sessions |
| Implement a mentorship program matching 90% of new hires with senior employees within their first 30 days by end of Q2 |
| Conduct skills gap analysis for all departments and develop personalized training plans for 100% of employees by end of Q3 |
| Improve benefits utilization rate from 65% to 80% within 6 months through targeted education sessions and simplified access processes |