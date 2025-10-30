// This file is deprecated and no longer used by the application.
// The application now exclusively uses a client-side API key stored
// in localStorage, managed via the Settings modal.
// This file can be safely deleted from the project.

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
    return new Response(
      JSON.stringify({ error: 'This API endpoint is deprecated and should not be used.' }),
      {
        status: 410, // Gone
        headers: { 'content-type': 'application/json' },
      }
    );
}
