// aromahub.studio is a separate front door: on that host only the hub exists.
// Every other host is left exactly as it was, except that the hub's pages are not served there.
const HUB_HOSTS = ['aromahub.studio', 'www.aromahub.studio'];
// Friendly addresses for rooms that were published under a random slug.
const ALIAS = { yummis: '4spd88sciw6fss8jpdw3vx', egymap: 'tin5cbfttzvdu6uujdc6wb' };
const notFound = () =>
  new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
const rewrite = (request, to) =>
  new Response(null, { headers: { 'x-middleware-rewrite': new URL(to, request.url).toString() } });

export default function middleware(request) {
  const url = new URL(request.url);
  const host = (request.headers.get('host') || '').toLowerCase().split(':')[0];
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (HUB_HOSTS.includes(host)) {
    if (path === '/') return rewrite(request, '/aromahub');
    if (path === '/admin') return rewrite(request, '/aromahub-admin');
    if (path === '/aromahub' || path === '/aromahub-admin') return;
    if (path.startsWith('/r/')) return;                       // rooms and their assets
    const m = path.match(/^\/([a-z0-9][a-z0-9-]{1,40})$/);    // open project pages: /<project> is r/<project>.html
    if (m) return rewrite(request, '/r/' + (ALIAS[m[1]] || m[1]));
    return notFound();
  }
  if (path === '/aromahub' || path === '/aromahub.html' || path === '/aromahub-admin' || path === '/aromahub-admin.html' || path.startsWith('/r/')) return notFound();
}
