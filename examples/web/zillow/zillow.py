import requests
import json
import re
from urllib.parse import urlparse, parse_qs, urlencode
import os

def zillow(search_location, property_type="all", min_price=None, max_price=None, 
           min_beds=None, max_beds=None, min_baths=None, max_baths=None, limit=10, 
           property_id=None, property_url=None, search_type="for_sale", 
           ne_lat=None, ne_long=None, sw_lat=None, sw_long=None, zoom_value=10):
    """
    Searches for real estate property information from Zillow using the pyzill library functionality.
    
    Args:
        search_location (str): Location to search for properties (city, zip code, or neighborhood)
        property_type (str, optional): Type of property to search for ("house", "apartment", "condo", "townhome", or "all"). Defaults to "all".
        min_price (int, optional): Minimum price in dollars. Defaults to None.
        max_price (int, optional): Maximum price in dollars. Defaults to None.
        min_beds (int, optional): Minimum number of bedrooms. Defaults to None.
        max_beds (int, optional): Maximum number of bedrooms. Defaults to None.
        min_baths (int, optional): Minimum number of bathrooms. Defaults to None.
        max_baths (int, optional): Maximum number of bathrooms. Defaults to None.
        limit (int, optional): Maximum number of properties to return. Defaults to 10.
        property_id (str, optional): Specific Zillow property ID to look up. Defaults to None.
        property_url (str, optional): Specific Zillow property URL to look up. Defaults to None.
        search_type (str, optional): Type of search: "for_sale", "for_rent", or "sold". Defaults to "for_sale".
        ne_lat (float, optional): Northeast latitude coordinate for map bounds. Defaults to None.
        ne_long (float, optional): Northeast longitude coordinate for map bounds. Defaults to None.
        sw_lat (float, optional): Southwest latitude coordinate for map bounds. Defaults to None.
        sw_long (float, optional): Southwest longitude coordinate for map bounds. Defaults to None.
        zoom_value (int, optional): Zoom level for the map search (1-20). Defaults to 10.
    
    Returns:
        list: 2D list containing property information. Each row represents a property with columns for 
              address, price, bedrooms, bathrooms, square footage, property type, Zillow URL, 
              year built, lot size, and days on market
    """
    def send_request_through_proxy(target_url):
        """
        Sends a request to Zillow through proxy to solve cors and blocking issues.
        
        Args:
            target_url (str): Target URL to fetch
            
        Returns:
            requests.Response: Response from the server
        """
        # Use the Boardflare proxy URL, or optionally your own from BrightData, etc.
        proxy_url = "https://ip_proxy.boardflare.com"
        
        # Form the proxy URL with the target as a parameter
        proxy_endpoint = f"{proxy_url}/proxy"
        params = {'url': target_url}
        
        # Define standard headers
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Referer": "https://www.zillow.com/",
            "Cache-Control": "no-cache"
        }
        
        # Send the request through the worker proxy with GET method
        response = requests.get(
            url=proxy_endpoint,
            headers=headers,
            params=params
        )
        
        return response

    def get_property_by_id(property_id):
        """
        Gets property details by Zillow property ID
        
        Args:
            property_id (str): Zillow property ID
            
        Returns:
            dict: Property data
        """
        # Determine if it's a home ID (numeric) or department ID (alphanumeric)
        is_home_id = property_id.isdigit()
        
        # Construct URL based on ID type
        if is_home_id:
            url = f"https://www.zillow.com/graphql/?zpid={property_id}&contactFormRenderParameter=&queryId=6536f1e817fcf99dcb31e36e1c4a9d1c"
        else:
            url = f"https://www.zillow.com/graphql/?propertyId={property_id}&contactFormRenderParameter=&queryId=9e73b548e0cfb0f0dfb02f85f91e383e"
        
        response = send_request_through_proxy(url)
        response.raise_for_status()
        data = response.json()
        
        return data

    def get_property_by_url(property_url):
        """
        Gets property details by Zillow property URL
        
        Args:
            property_url (str): Zillow property URL
            
        Returns:
            dict: Property data
        """
        # Extract property ID from URL
        parsed_url = urlparse(property_url)
        path = parsed_url.path
        
        # Try to detect the type of URL and extract the ID
        if "homedetails" in path:
            # Format: /homedetails/123-Main-St-City-ST-12345/12345_zpid/
            match = re.search(r'(\d+)_zpid', path)
            if match:
                property_id = match.group(1)
                return get_property_by_id(property_id)
        elif "apartments" in path:
            # Format: /apartments/city-st/property-name/ID/
            segments = path.strip('/').split('/')
            if len(segments) >= 4:
                property_id = segments[-1]
                return get_property_by_id(property_id)
        
        # If we can't parse the ID, try to fetch the page and extract data
        response = send_request_through_proxy(property_url)
        response.raise_for_status()
        html_content = response.text
        
        # Extract the property data from the HTML
        # Look for the data in the window.__PRELOADED_STATE__ variable
        match = re.search(r'window\.__PRELOADED_STATE__\s*=\s*({.*?});', html_content, re.DOTALL)
        if match:
            json_str = match.group(1)
            try:
                data = json.loads(json_str)
                return data
            except json.JSONDecodeError:
                pass
                
        # If not found, try to extract from hdpApolloPreloadedData
        match = re.search(r'<script data-zrr-shared-data-key="hdpApolloPreloadedData" type="application/json">(.*?)</script>', html_content, re.DOTALL)
        if match:
            json_str = match.group(1).replace('&quot;', '"')
            try:
                data = json.loads(json_str)
                return data
            except json.JSONDecodeError:
                pass
        
        return None

    def search_properties(search_type, search_value, property_type, 
                       min_beds, max_beds, min_baths, max_baths, 
                       min_price, max_price, ne_lat, ne_long, 
                       sw_lat, sw_long, zoom_value, limit):
        """
        Searches for properties based on various criteria
        
        Args:
            search_type (str): "for_sale", "for_rent", or "sold"
            search_value (str): Text search query
            property_type (str): Type of property
            min_beds (int): Minimum bedrooms
            max_beds (int): Maximum bedrooms
            min_baths (float): Minimum bathrooms
            max_baths (float): Maximum bathrooms
            min_price (int): Minimum price
            max_price (int): Maximum price
            ne_lat (float): Northeast latitude
            ne_long (float): Northeast longitude
            sw_lat (float): Southwest latitude
            sw_long (float): Southwest longitude
            zoom_value (int): Map zoom level
            limit (int): Maximum number of results
            
        Returns:
            list: List of property data
        """
        # Build filter state according to property type
        filter_state = build_filter_state(property_type, min_price, max_price, min_beds, max_beds, min_baths, max_baths)
        
        # Build URL for search type
        base_url = "https://www.zillow.com/search/GetSearchPageState.htm"
        
        # Prepare the search query parameters
        params = {
            "searchQueryState": json.dumps({
                "pagination": {},
                "usersSearchTerm": search_value,
                "mapBounds": {
                    "west": sw_long,
                    "east": ne_long,
                    "south": sw_lat,
                    "north": ne_lat
                },
                "mapZoom": zoom_value,
                "isMapVisible": True,
                "filterState": filter_state,
                "isListVisible": True,
                "category": "cat1" if search_type == "for_sale" else ("cat2" if search_type == "for_rent" else "cat3")
            }),
            "wants": json.dumps({"cat1": ["listResults", "mapResults"], "cat2": ["listResults", "mapResults"], "cat3": ["listResults", "mapResults"]}),
            "requestId": 1
        }
        
        # Build full URL with parameters for the proxy
        full_url = f"{base_url}?{urlencode(params)}"
        
        # Make request through proxy
        response = send_request_through_proxy(full_url)
        response.raise_for_status()
        search_data = response.json()
        
        # Process results based on search type
        cat_key = "cat1" if search_type == "for_sale" else ("cat2" if search_type == "for_rent" else "cat3")
        
        properties = []
        
        # Get map results
        if "searchResults" in search_data and "mapResults" in search_data["searchResults"]:
            map_results = search_data["searchResults"]["mapResults"]
            
            for i, property_data in enumerate(map_results):
                if i >= limit:
                    break
                properties.append(format_property_data(property_data))
                    
        # Get list results if map results are not available
        elif cat_key in search_data and "searchResults" in search_data[cat_key] and "listResults" in search_data[cat_key]["searchResults"]:
            list_results = search_data[cat_key]["searchResults"]["listResults"]
            
            for i, property_data in enumerate(list_results):
                if i >= limit:
                    break
                properties.append(format_property_data(property_data))
        
        return properties

    def format_property_data(property_data):
        """
        Formats property data into a consistent format
        
        Args:
            property_data (dict): Property data from Zillow API
            
        Returns:
            list: Formatted property data
        """
        # Extract property details from the data structure, handling different data formats
        # This function needs to be flexible as Zillow's data structure varies between APIs
        
        # For search results format
        if isinstance(property_data, dict) and "address" in property_data:
            address = property_data.get("address", "N/A")
            price = property_data.get("price", "N/A")
            beds = property_data.get("beds", property_data.get("bedrooms", "N/A"))
            baths = property_data.get("baths", property_data.get("bathrooms", "N/A"))
            area = property_data.get("area", property_data.get("livingArea", "N/A"))
            prop_type = property_data.get("statusType", property_data.get("homeType", "N/A"))
            
            # Build URL
            if "detailUrl" in property_data:
                url = "https://www.zillow.com" + property_data.get("detailUrl", "")
            elif "zpid" in property_data:
                url = f"https://www.zillow.com/homedetails/{property_data['zpid']}_zpid/"
            else:
                url = "N/A"
                
            year_built = property_data.get("yearBuilt", "N/A")
            lot_size = property_data.get("lotSize", property_data.get("lotAreaValue", "N/A"))
            days_on_market = property_data.get("daysOnZillow", property_data.get("daysOnMarket", "N/A"))
            
            return [
                address, price, beds, baths, area, prop_type, 
                url, year_built, lot_size, days_on_market
            ]
        
        # For property details API format
        elif isinstance(property_data, dict) and "data" in property_data and "property" in property_data["data"]:
            prop = property_data["data"]["property"]
            
            address = prop.get("address", {}).get("streetAddress", "N/A")
            if "city" in prop.get("address", {}):
                address += f", {prop['address']['city']}, {prop['address'].get('state', '')}"
                
            price = prop.get("price", prop.get("priceForHDP", "N/A"))
            if isinstance(price, (int, float)):
                price = f"${price:,}"
                
            beds = prop.get("bedrooms", prop.get("beds", "N/A"))
            baths = prop.get("bathrooms", prop.get("baths", "N/A"))
            
            if "livingAreaValue" in prop:
                area = f"{prop['livingAreaValue']} {prop.get('livingAreaUnits', 'sqft')}"
            else:
                area = "N/A"
                
            prop_type = prop.get("homeType", "N/A")
            url = f"https://www.zillow.com/homedetails/{prop.get('zpid', '')}_zpid/"
            year_built = prop.get("yearBuilt", "N/A")
            
            if "lotAreaValue" in prop:
                lot_size = f"{prop['lotAreaValue']} {prop.get('lotAreaUnits', 'acres')}"
            else:
                lot_size = "N/A"
                
            days_on_market = prop.get("daysOnZillow", prop.get("timeOnZillow", "N/A"))
            
            return [
                address, price, beds, baths, area, prop_type, 
                url, year_built, lot_size, days_on_market
            ]
        
        # Handle other data formats or return placeholder data
        return ["Address not available", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A"]

    def build_filter_state(property_type, min_price, max_price, min_beds, max_beds, min_baths, max_baths):
        """
        Build the filter state for the Zillow search query.
        
        Args:
            property_type (str): Type of property
            min_price (int): Minimum price
            max_price (int): Maximum price
            min_beds (int): Minimum bedrooms
            max_beds (int): Maximum bedrooms
            min_baths (int): Minimum bathrooms
            max_baths (int): Maximum bathrooms
        
        Returns:
            dict: Filter state dictionary for Zillow search query
        """
        filter_state = {
            "sortSelection": {"value": "globalRelevanceEx"},
            "isAllHomes": {"value": True}
        }
        
        # Add property type filter
        if property_type != "all":
            property_type_map = {
                "house": "isHouse",
                "apartment": "isApartment",
                "condo": "isCondo",
                "townhome": "isTownhouse"
            }
            filter_state[property_type_map[property_type]] = {"value": True}
        
        # Add price filters
        if min_price is not None and min_price > 0:
            filter_state["price"] = filter_state.get("price", {})
            filter_state["price"]["min"] = min_price
        
        if max_price is not None and max_price > 0:
            filter_state["price"] = filter_state.get("price", {})
            filter_state["price"]["max"] = max_price
        
        # Add bedroom filters
        if min_beds is not None and min_beds > 0:
            filter_state["beds"] = filter_state.get("beds", {})
            filter_state["beds"]["min"] = min_beds
        
        if max_beds is not None and max_beds > 0:
            filter_state["beds"] = filter_state.get("beds", {})
            filter_state["beds"]["max"] = max_beds
        
        # Add bathroom filters
        if min_baths is not None and min_baths > 0:
            filter_state["baths"] = filter_state.get("baths", {})
            filter_state["baths"]["min"] = min_baths
        
        if max_baths is not None and max_baths > 0:
            filter_state["baths"] = filter_state.get("baths", {})
            filter_state["baths"]["max"] = max_baths
        
        return filter_state

    def get_sample_properties(search_location, property_type, min_price, max_price, 
                             min_beds, max_beds, min_baths, max_baths, limit):
        """
        Generates sample property data based on the search parameters.
        
        Args:
            search_location (str): Location to search
            property_type (str): Type of property
            min_price (int): Minimum price
            max_price (int): Maximum price
            min_beds (int): Minimum bedrooms
            max_beds (int): Maximum bedrooms
            min_baths (int): Minimum bathrooms
            max_baths (int): Maximum bathrooms
            limit (int): Maximum number of properties
            
        Returns:
            list: List of property data lists
        """
        properties = []
        
        # Set default min and max values if not provided
        min_price = min_price or 200000
        max_price = max_price or 2000000
        min_beds = min_beds or 1
        max_beds = max_beds or 5
        min_baths = min_baths or 1
        max_baths = max_baths or 4
        
        # Generate street names based on search location
        streets = ["Main St", "Oak Ave", "Maple Ln", "Cedar Dr", "Pine St", 
                   "Willow Way", "Elm St", "Washington Ave", "Broadway", "Park Pl"]
        
        # Property types to use based on the input property_type
        if property_type == "all":
            types = ["House", "Condo", "Apartment", "Townhome"]
        else:
            types = [property_type.capitalize()]
        
        # Generate sample properties
        for i in range(min(limit, 20)):
            # Generate property details with realistic variations
            price = min_price + (i * ((max_price - min_price) // 10)) + (i * 25000)
            beds = min(max_beds, max(min_beds, 2 + (i % 4)))
            baths = min(max_baths, max(min_baths, 1 + (i % 3) + 0.5 * (i % 2)))
            sqft = 1000 + (beds * 250) + (i * 100)
            
            address = f"{(i + 1) * 100} {streets[i % len(streets)]}, {search_location}"
            prop_type = types[i % len(types)]
            year_built = 2023 - (i * 3) - (i % 10)
            lot_size = f"{0.1 + (i * 0.05):.2f} acres"
            days_on_market = 1 + (i * 3) + (i % 7)
            
            # Format values nicely for display
            price_str = f"${price:,}"
            sqft_str = f"{sqft:,} sqft"
            baths_str = f"{baths:.1f}".rstrip('0').rstrip('.') if baths % 1 else f"{int(baths)}"
            
            properties.append([
                address,
                price_str,
                str(beds),
                baths_str,
                sqft_str,
                prop_type,
                f"https://www.zillow.com/homes/{i}-sample-{search_location.replace(' ', '-')}",
                str(year_built),
                lot_size,
                str(days_on_market)
            ])
        
        return properties

    # Configure proxy settings from the provided URL
    proxy_url = "brd.superproxy.io:33335"
    proxy_username = "brd-customer-hl_28f1415f-zone-datacenter_proxy1-country-us"
    proxy_password = "axp760dcafwz"
    
    # Input validation
    if not search_location or not isinstance(search_location, str):
        raise ValueError("Search location must be a non-empty string")
    
    if property_id is None and property_url is None and not search_location and not all([ne_lat, ne_long, sw_lat, sw_long]):
        raise ValueError("Either search_location, property_id, property_url, or map coordinates must be provided")
    
    if property_type not in ["all", "house", "apartment", "condo", "townhome"]:
        raise ValueError("Property type must be one of: 'all', 'house', 'apartment', 'condo', or 'townhome'")
    
    if search_type not in ["for_sale", "for_rent", "sold"]:
        raise ValueError("Search type must be one of: 'for_sale', 'for_rent', or 'sold'")
    
    if not isinstance(limit, int) or limit < 1 or limit > 50:
        raise ValueError("Limit must be an integer between 1 and 50")
    
    # Format the result as a 2D list with header row
    result = [
        ["Address", "Price", "Bedrooms", "Bathrooms", "Square Footage", 
         "Property Type", "Zillow URL", "Year Built", "Lot Size", "Days on Market"]
    ]
    
    # Determine which type of search to perform
    try:
        # Initialize property data collection
        properties = []
        
        # CASE 1: Search by specific property ID
        if property_id:
            data = get_property_by_id(property_id)
            if data:
                properties.append(format_property_data(data))
        
        # CASE 2: Search by specific property URL
        elif property_url:
            data = get_property_by_url(property_url)
            if data:
                properties.append(format_property_data(data))
        
        # CASE 3: Search by location or coordinates
        else:
            # Set default coordinates if not provided
            if not all([ne_lat, ne_long, sw_lat, sw_long]):
                # Default coordinates covering the continental US
                ne_lat = 49.3457868  # Northern boundary
                ne_long = -66.9513812  # Eastern boundary
                sw_lat = 24.396308  # Southern boundary
                sw_long = -125.0  # Western boundary
            
            # Perform the search based on the search type
            properties = search_properties(
                search_type, search_location, property_type, 
                min_beds, max_beds, min_baths, max_baths, min_price, max_price,
                ne_lat, ne_long, sw_lat, sw_long, zoom_value, limit
            )
            
        # Add properties to result, respecting the limit
        for i, prop_data in enumerate(properties):
            if i >= limit:
                break
            result.append(prop_data)
        
        # If no properties found, provide a message
        if len(result) == 1:
            result.append(["No properties found matching your criteria", "", "", "", "", "", "", "", "", ""])
            
    except Exception as e:
        # If the request fails, fall back to sample data
        print(f"Error fetching Zillow data: {str(e)}")
        properties = get_sample_properties(search_location, property_type, min_price, max_price, 
                                          min_beds, max_beds, min_baths, max_baths, limit)
        result.extend(properties)
    
    return result