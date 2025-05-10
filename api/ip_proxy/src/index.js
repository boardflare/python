const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
};

export default {
    async fetch(request, env, ctx) {
        try {
            const url = new URL(request.url);

            // Return simple usage info for root path (GET only)
            if (url.pathname === "/" && request.method === "GET") {
                return Response.json({
                    usage: `${url.origin}/ (POST with Bright Data API body)`,
                    description: "IP proxy service for making POST requests to Bright Data API. Pass the Bright Data API body in the request body."
                }, { headers });
            }

            // Handle CORS preflight requests
            if (request.method === "OPTIONS") {
                return new Response(null, { headers });
            }

            // Only support the root endpoint for POST
            if (url.pathname !== "/" || request.method !== "POST") {
                return Response.json({
                    success: false,
                    error: "Invalid endpoint or method. Use POST / with Bright Data API body."
                }, { status: 404, headers });
            }

            // Extract Bright Data API token from environment variables
            const brightDataToken = env.BRIGHTDATA_TOKEN || "";
            if (!brightDataToken) {
                return Response.json({
                    success: false,
                    error: "Missing Bright Data API token in environment variables."
                }, { status: 500, headers });
            }

            // Prepare Bright Data REST API request
            const apiUrl = "https://api.brightdata.com/request";

            // Set up headers for the Bright Data API request
            const apiHeaders = {
                'Authorization': `Bearer ${brightDataToken}`,
                'Content-Type': 'application/json'
            };

            // Read and log the request body
            const body = await request.json();
            console.log("Request body:", body);
            const bodyString = JSON.stringify(body);
            console.log("Stringified body sent to Bright Data API:", bodyString);

            // POST to Bright Data REST API with the client's raw body
            const apiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: apiHeaders,
                body: bodyString
            });

            // Read the response as text (Bright Data returns raw HTML as string)
            const text = await apiResponse.text();
            console.log("Response from Bright Data API:", text);
            const responseHeaders = new Headers({ ...headers, 'Content-Type': 'text/html' });
            return new Response(text, {
                status: apiResponse.status,
                statusText: apiResponse.statusText,
                headers: responseHeaders
            });
        } catch (error) {
            console.error("Proxy error:", error);
            return Response.json({
                success: false,
                error: error.message
            }, {
                status: 500,
                headers
            });
        }
    }
};