/**
 * This is Cloudflare worker.
 */

const headers = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': '*',
};

export default {
	async fetch(request, env, ctx) {
		if (request.method === 'OPTIONS') {
			return Response.json(null, { headers });
		}

		try {
			const genText = await request.json();
			console.log(genText);

			// Universal Provider refactor
			const universalPayload = [
				{
					provider: "mistral",
					endpoint: "v1/chat/completions",
					headers: {
						Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
						"Content-Type": "application/json"
					},
					query: {
						...genText,
						max_tokens: 1000,
						model: "mistral-medium-latest"
					}
				},
				{
					provider: "groq",
					endpoint: "https://api.groq.com/openai/v1/chat/completions",
					headers: {
						Authorization: `Bearer ${env.GROQ_API_KEY}`,
						"Content-Type": "application/json"
					},
					query: {
						...genText,
						max_tokens: 1000,
						model: "llama3-70b-8192"
					}
				},
				{
					provider: "mistral",
					endpoint: "v1/chat/completions",
					headers: {
						Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
						"Content-Type": "application/json"
					},
					query: {
						...genText,
						max_tokens: 1000,
						model: "mistral-small-latest"
					}
				},
				{
					provider: "google-ai-studio",
					endpoint: "v1beta/openai/chat/completions",
					headers: {
						Authorization: `Bearer ${env.GOOGLE_API_KEY}`,
						"Content-Type": "application/json"
					},
					query: {
						...genText,
						max_tokens: 1000,
						model: "gemma-3-27b-it"
					}
				}
			];

			// Hard code the account and gateway IDs as requested
			const accountId = "92d55664b831823cc914de02c9a0d0ae";
			const gatewayId = "llm_proxy";
			const universalUrl = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}`;

			const response = await fetch(universalUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(universalPayload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(JSON.stringify({
					status: response.status,
					statusText: response.statusText,
					body: errorText
				}));
			}

			const result = await response.json();
			return Response.json(result, { headers });

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
