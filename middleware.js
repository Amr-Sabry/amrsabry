// aromahub.studio is a separate front door: on that host only the hub page exists.
// Every other host is left exactly as it was, except that the hub page is not served there.
const HUB_HOSTS = ['aromahub.studio', 'www.aromahub.studio'];
const notFound = () =>
  new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });

export default function middleware(request) {
  const url = new URL(request.url);
  const host = (request.headers.get('host') || '').toLowerCase().split(':')[0];
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (HUB_HOSTS.includes(host)) {
    if (path === '/') {
      return new Response(null, { headers: { 'x-middleware-rewrite': new URL('/aromahub', request.url).toString() } });
    }
    if (path === '/aromahub') return;
    return notFound();
  }
  if (path === '/aromahub' || path === '/aromahub.html') return notFound();
}
