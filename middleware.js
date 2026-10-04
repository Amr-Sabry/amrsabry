// Serves the Aroma Hub landing page at the root of aromahub.studio.
// Every other host and path is untouched.
export const config = { matcher: '/' };

export default function middleware(request) {
  const host = (request.headers.get('host') || '').toLowerCase();
  if (host === 'aromahub.studio' || host === 'www.aromahub.studio') {
    const url = new URL('/aromahub', request.url);
    return new Response(null, { headers: { 'x-middleware-rewrite': url.toString() } });
  }
}
