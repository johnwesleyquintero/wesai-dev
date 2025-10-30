export const config = {
  runtime: 'edge',
};

// This function handles requests to /api/get-key and returns the API key
// stored in Vercel's environment variables.
export default async function handler(request: Request) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API_KEY environment variable is not configured on the server.' }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({ apiKey: apiKey }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    }
  );
}
