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

            // Return simple usage info for root path
            if (url.pathname === "/") {
                return Response.json({
                    usage: `${url.origin}/proxy?url=<target_url>`,
                    description: "IP proxy service for making GET requests"
                }, { headers });
            }

            // Handle CORS preflight requests
            if (request.method === "OPTIONS") {
                return new Response(null, { headers });
            }

            // Only support the /proxy endpoint
            if (url.pathname !== "/proxy") {
                return Response.json({
                    success: false,
                    error: "Invalid endpoint. Use /proxy?url=<target_url>"
                }, { status: 404, headers });
            }

            // Get target URL from query parameters
            const targetUrl = url.searchParams.get("url");

            if (!targetUrl) {
                return Response.json({
                    success: false,
                    error: "Missing 'url' parameter"
                }, { status: 400, headers });
            }

            // Extract proxy information from environment variables
            const proxyUrl = env.PROXY_URL || "brd.superproxy.io:33335";
            const proxyUsername = env.PROXY_USERNAME || "";
            const proxyPassword = env.PROXY_PASSWORD || "";
            
            // The key part: Instead of trying to use a forward proxy directly,
            // construct the Bright Data super proxy URL with the target embedded
            // Bright Data uses a specific format where we encode the target in the path
            
            // Extract parts from the target URL
            const targetUrlObj = new URL(targetUrl);
            const protocol = targetUrlObj.protocol.replace(':', '');
            const hostAndPath = targetUrl.replace(`${targetUrlObj.protocol}//`, '');
            
            // Format: http(s)://{username}:{password}@{proxy-server}/{protocol}/{host}/{path}
            // We need to separate host and path, and URL encode them properly
            const [host, ...pathParts] = hostAndPath.split('/');
            const path = pathParts.join('/');
            
            // Construct the final proxy URL
            // This is specific to how Bright Data proxy works - it's not a standard HTTP forward proxy
            // Instead, it uses a REST API style format with the target embedded in the URL
            const proxyFullUrl = `http://${proxyUsername}:${proxyPassword}@${proxyUrl}/${protocol}/${host}/${path}`;
            
            // Set standard browsing headers
            const requestHeaders = new Headers({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            });
            
            // Forward the request through the Bright Data super proxy
            const proxyResponse = await fetch(proxyFullUrl, {
                method: 'GET',
                headers: requestHeaders,
                redirect: 'follow'
            });

            // Return the response with CORS headers
            const newResponse = new Response(proxyResponse.body, {
                status: proxyResponse.status,
                statusText: proxyResponse.statusText,
                headers: proxyResponse.headers
            });
            
            // Add CORS headers
            Object.entries(headers).forEach(([key, value]) => {
                newResponse.headers.set(key, value);
            });

            return newResponse;
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