# BLACK_SCHOLES

## Overview
The `black_scholes` function calculates the theoretical price of a European call or put option using the Black-Scholes formula. This function is designed for business users working in Excel, enabling them to quickly and accurately price options for financial analysis, risk management, or portfolio valuation. By integrating this function into Excel, users can automate option pricing for various scenarios, improving decision-making and financial modeling.

## Arguments Table
| Argument      | Type    | Description                                                                 |
|--------------|---------|-----------------------------------------------------------------------------|
| S            | float   | Current price of the underlying asset (e.g., stock price)                    |
| K            | float   | Strike price of the option                                                  |
| T            | float   | Time to expiration in years (e.g., 0.5 for 6 months)                        |
| r            | float   | Annual risk-free interest rate (as a decimal, e.g., 0.05 for 5%)             |
| sigma        | float   | Volatility of the underlying asset (annualized standard deviation, decimal)   |
| option_type  | string  | Type of option: 'call' for Call option, 'put' for Put option                 |

## Return Value Table
| Return Value | Type  | Description                                      |
|--------------|-------|--------------------------------------------------|
| price        | float | Theoretical price of the option (call or put)     |

## Detailed Examples

### Example 1: Pricing a European Call Option in Excel
**Business Context:**
A financial analyst wants to price a 6-month European call option on a stock currently trading at $100, with a strike price of $105, a risk-free rate of 3%, and an annual volatility of 20%.

**Excel Setup:**
- Cell A1: 100      (Stock price, S)
- Cell B1: 105      (Strike price, K)
- Cell C1: 0.5      (Time to expiration in years, T)
- Cell D1: 0.03     (Risk-free rate, r)
- Cell E1: 0.2      (Volatility, sigma)
- Cell F1: "call"   (Option type)

**Formula in Excel:**
`=black_scholes(A1, B1, C1, D1, E1, F1)`

**Expected Outcome:**
Returns the theoretical price of the call option, which the analyst can use for portfolio valuation or hedging decisions.

### Example 2: Pricing a European Put Option for Risk Management
**Business Context:**
A portfolio manager wants to evaluate the cost of buying a 1-year European put option to hedge against a potential decline in a stock currently priced at $50, with a strike price of $45, a risk-free rate of 2%, and a volatility of 25%.

**Excel Setup:**
- Cell A2: 50       (Stock price, S)
- Cell B2: 45       (Strike price, K)
- Cell C2: 1        (Time to expiration in years, T)
- Cell D2: 0.02     (Risk-free rate, r)
- Cell E2: 0.25     (Volatility, sigma)
- Cell F2: "put"    (Option type)

**Formula in Excel:**
`=black_scholes(A2, B2, C2, D2, E2, F2)`

**Expected Outcome:**
Returns the theoretical price of the put option, helping the manager assess the cost of hedging strategies.

## Parameter and Output Types
- **Inputs:** All arguments must be scalars (float or string). 2D lists are not supported for this function.
- **Outputs:** The return value is a scalar float (option price).
- **Supported Types:** float (for S, K, T, r, sigma), string (for option_type), float (for output).

## Edge Cases and Limitations
- Only European options are supported (no early exercise).
- The function does not handle negative or zero values for S, K, T, r, or sigma; these will result in errors or invalid results.
- The `option_type` argument must be either 'call' or 'put' (case-sensitive).
- The function assumes constant volatility and interest rate over the option's life.
- Not suitable for American options or options with dividends.
