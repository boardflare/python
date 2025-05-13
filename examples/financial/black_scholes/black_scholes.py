import math
from scipy.stats import norm

def black_scholes(S, K, T, r, sigma, option_type):
    """
    Calculate the Black-Scholes price for a European call or put option.
    Args:
        S (float): Current price of the underlying asset
        K (float): Strike price
        T (float): Time to expiration in years
        r (float): Annual risk-free interest rate (decimal)
        sigma (float): Volatility of the underlying asset (decimal)
        option_type (str): 'call' or 'put'
    Returns:
        float: Theoretical price of the option
    """
    # Input validation
    if not (isinstance(S, (int, float)) and S > 0):
        raise ValueError("S must be a positive float")
    if not (isinstance(K, (int, float)) and K > 0):
        raise ValueError("K must be a positive float")
    if not (isinstance(T, (int, float)) and T > 0):
        raise ValueError("T must be a positive float")
    if not (isinstance(r, (int, float)) and r >= 0):
        raise ValueError("r must be a non-negative float")
    if not (isinstance(sigma, (int, float)) and sigma > 0):
        raise ValueError("sigma must be a positive float")
    if option_type not in ('call', 'put'):
        raise ValueError("option_type must be 'call' or 'put'")

    d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)

    if option_type == 'call':
        price = S * norm.cdf(d1) - K * math.exp(-r * T) * norm.cdf(d2)
    else:  # put
        price = K * math.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
    return float(price)
