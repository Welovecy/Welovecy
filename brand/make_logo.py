import math
ORANGE = "#E8850C"   # bright sun orange, a touch lighter than the flag's copper (#D57800)
OLIVE  = "#4E5B31"   # the flag's olive green
OLIVE2 = "#6B7A3E"   # lighter leaf for depth

HEART = "M256 316 C 200 278, 136 236, 136 172 C 136 130, 168 100, 206 100 C 230 100, 248 114, 256 134 C 264 114, 282 100, 306 100 C 344 100, 376 130, 376 172 C 376 236, 312 278, 256 316 Z"

def leaf(x, y, ang, L, W, fill):
    return (f'<path d="M0 0 Q {L*0.5:.1f} {-W:.1f} {L:.1f} 0 Q {L*0.5:.1f} {W:.1f} 0 0 Z" '
            f'transform="translate({x:.1f} {y:.1f}) rotate({ang:.1f})" fill="{fill}"/>')

def wave(x0, x1, cy, A, periods):
    lam = (x1 - x0) / periods
    f = lambda x: cy + A * math.sin(2 * math.pi * (x - x0) / lam + math.pi)  # starts going up
    d = lambda x: A * 2 * math.pi / lam * math.cos(2 * math.pi * (x - x0) / lam + math.pi)
    return f, d

def branch(x0, x1, cy, A, periods, n, L=40, W=12.5, stroke=10, reverse=False):
    f, d = wave(x0, x1, cy, A, periods)
    pts = [(x0 + (x1 - x0) * i / 200, f(x0 + (x1 - x0) * i / 200)) for i in range(201)]
    path = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)
    out = [f'<path d="{path}" fill="none" stroke="{OLIVE}" stroke-width="{stroke}" stroke-linecap="round"/>']
    for i in range(1, n + 1):
        t = i / (n + 1)
        x = x0 + (x1 - x0) * t
        y = f(x)
        a = math.degrees(math.atan(d(x)))
        if reverse: a += 180
        # paired leaves at each node, swept forward like an olive sprig
        out.append(leaf(x, y, a - 34, L, W, OLIVE))
        out.append(leaf(x, y, a + 34, L * 0.92, W, OLIVE2))
    # tip leaf
    xe = x1 if not reverse else x0
    ae = math.degrees(math.atan(d(xe))) + (180 if reverse else 0)
    out.append(leaf(xe, f(xe), ae, L, W, OLIVE))
    return "\n".join(out)

def svg(body, bg="#FFFFFF", rounded=False, size=512):
    r = 112 if rounded else 0
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="{size}" height="{size}">'
            f'<rect width="512" height="512" rx="{r}" fill="{bg}"/>{body}</svg>')

def mark_a():  # one olive branch rolling like a wave
    return f'<path d="{HEART}" fill="{ORANGE}" transform="translate(0 -6)"/>' + branch(84, 404, 404, 28, 1.5, 9)

def mark_b():  # two branches meeting in the middle, like the flag, each a wave
    return (f'<path d="{HEART}" fill="{ORANGE}" transform="translate(0 -6)"/>' +
            branch(76, 250, 404, 24, 1.0, 5, L=38) + branch(262, 436, 404, 24, 1.0, 5, L=38, reverse=True))

for name, m in [("a", mark_a()), ("b", mark_b())]:
    open(f"mark-{name}.svg", "w").write(svg(m))
    open(f"mark-{name}-transparent.svg", "w").write(svg(m, bg="none"))
print("ok")
