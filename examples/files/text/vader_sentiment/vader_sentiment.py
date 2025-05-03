import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

# Ensure you have downloaded the necessary NLTK data
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except nltk.downloader.DownloadError:
    nltk.download('vader_lexicon')

def vader_sentiment(text):
    """Analyzes sentiment of text using VADER.
    Args:
        text (str): Text to analyze
    Returns:
        float: Compound sentiment score (-1 to 1)
    """
    if not isinstance(text, str):
        return 0.0 # Return neutral for non-string input
    sia = SentimentIntensityAnalyzer()
    sentiment = sia.polarity_scores(text)
    return round(sentiment['compound'], 4) # Round for consistency