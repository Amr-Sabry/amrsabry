import http.server,os,re,sys,socketserver
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s,*a,**k): super().__init__(*a,directory=sys.argv[2],**k)
    def log_message(s,*a): pass
    def do_GET(s):
        r=s.headers.get('Range'); p=s.translate_path(s.path)
        if not r or not os.path.isfile(p): return super().do_GET()
        m=re.match(r'bytes=(\d+)-(\d*)',r); n=os.path.getsize(p); a=int(m[1]); b=int(m[2]) if m[2] else n-1; b=min(b,n-1)
        s.send_response(206); s.send_header('Content-Type',s.guess_type(p)); s.send_header('Accept-Ranges','bytes'); s.send_header('Content-Range',f'bytes {a}-{b}/{n}'); s.send_header('Content-Length',str(b-a+1)); s.end_headers()
        with open(p,'rb') as f: f.seek(a); s.wfile.write(f.read(b-a+1))
    def end_headers(s): s.send_header('Accept-Ranges','bytes'); super().end_headers()
class T(socketserver.ThreadingMixIn,http.server.HTTPServer): daemon_threads=True
T(('127.0.0.1',int(sys.argv[1])),H).serve_forever()
