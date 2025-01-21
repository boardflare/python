/**
 * This is Cloudflare worker.
 */

const headers = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
	async fetch(request, env, ctx) {
		if (request.method === 'OPTIONS') {
			return Response.json(null, { headers });
		}

		try {
			const { prompt } = await request.json();

			const genText = {
				model: 'mistral-large-2411',
				messages: [
					{ role: 'system', content: "Create a Python function to implement the user's requested functionality.  Functions must return either a standard Python scalar (int, float, str, bool) or a nested list of scalars." },
					{ role: 'user', content: prompt },
				],
				max_tokens: 1500,
				temperature: 0.1
			};
			console.log("genText", genText);

			const response = await fetch('https://gateway.ai.cloudflare.com/v1/92d55664b831823cc914de02c9a0d0ae/codepy/mistral/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${env.MISTRAL_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(genText),
			});

			if (!response.ok) {
				throw new Error(`Mistral API error: ${response.statusText}`);
			}

			const result = await response.json();
			let content = result.choices[0].message.content;

			return Response.json({
				success: true,
				message: content
			}, { headers });
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
