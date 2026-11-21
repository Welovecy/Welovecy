import io, requests
SESSION = requests.Session()
class RangeFile(io.RawIOBase):
    """Seekable read-only HTTP file using Range requests (goes through the proxy like requests does)."""
    def __init__(self, url, size=None):
        self.url, self.pos = url, 0
        self.size = size or int(SESSION.head(url, timeout=30).headers["Content-Length"])
        self.nbytes = 0
    def readable(self): return True
    def seekable(self): return True
    def tell(self): return self.pos
    def seek(self, off, whence=0):
        self.pos = off if whence == 0 else self.pos + off if whence == 1 else self.size + off
        return self.pos
    def read(self, n=-1):
        if n is None or n < 0: n = self.size - self.pos
        if n == 0 or self.pos >= self.size: return b""
        end = min(self.pos + n, self.size) - 1
        for _ in range(4):
            try:
                r = SESSION.get(self.url, headers={"Range": f"bytes={self.pos}-{end}"}, timeout=120); r.raise_for_status(); break
            except requests.RequestException: continue
        b = r.content; self.pos += len(b); self.nbytes += len(b); return b
    def readinto(self, buf):
        b = self.read(len(buf)); buf[:len(b)] = b; return len(b)
