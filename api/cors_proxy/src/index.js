const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
};

export default {
    async fetch(request, env, ctx) {
        try {
            const url = new URL(request.url);

            if (url.pathname === "/") {
                return Response.json({ usage: `${url.origin}/<url>` }, { headers });
            }

            if (request.method === "OPTIONS") {
                return new Response(null, { headers });
            }

            const targetUrl = request.url.slice(url.origin.length + 1);
            const response = await fetch(targetUrl, {
                method: request.method,
                headers: request.headers,
                redirect: "follow",
                body: request.body
            });

            const newResponse = new Response(response.body, response);
            Object.entries(headers).forEach(([key, value]) => {
                newResponse.headers.set(key, value);
            });

            return newResponse;
        } catch (error) {
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