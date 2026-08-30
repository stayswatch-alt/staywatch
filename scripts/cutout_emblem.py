"""
Keep the whole round medallion (rich, including its dark interior) but dissolve
ONLY the outer rim softly into the page so there is no hard "sticker" edge and
no square plate. Pixels inside the medallion radius are kept; bright emblem
parts sticking out (banner tips, star points, laurels) are kept; everything else
is dropped. A wide feather on the silhouette edge blends it organically.
"""
import os
from PIL import Image, ImageFilter

SRC = r"C:\Users\User\.cursor\projects\c-Users-User-Desktop-skz-monitor-user-data\assets\emblem-color.png"
OUT = r"C:\Users\User\Desktop\stay-watch\public\emblem-cut.png"

R_FRAC = 0.455       # medallion radius as fraction of width
BRIGHT_THR = 70      # keep bright emblem parts outside the medallion circle
EDGE_FEATHER = 9     # gaussian radius to melt the rim into the page

img = Image.open(SRC).convert("RGBA")
w, h = img.size
px = img.load()
n = w * h
cx, cy = w / 2.0, h / 2.0
R = R_FRAC * w


def lum(p):
    return max(p[0], p[1], p[2])


# 1) keep mask: inside circle, or bright pixels outside
keep = bytearray(n)
for y in range(h):
    dy = y - cy
    for x in range(w):
        idx = y * w + x
        dx = x - cx
        if dx * dx + dy * dy <= R * R:
            keep[idx] = 1
        elif lum(px[x, y]) >= BRIGHT_THR:
            keep[idx] = 1

# 2) keep only the largest connected component (drops floating specks)
visited = bytearray(n)
best = []
for s in range(n):
    if not keep[s] or visited[s]:
        continue
    comp = []
    stack = [s]
    visited[s] = 1
    while stack:
        idx = stack.pop()
        comp.append(idx)
        x = idx % w
        y = idx // w
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if keep[nidx] and not visited[nidx]:
                    visited[nidx] = 1
                    stack.append(nidx)
    if len(comp) > len(best):
        best = comp

final = bytearray(n)
for idx in best:
    final[idx] = 1

# 3) alpha, wide feather so the rim melts into the page
alpha = Image.new("L", (w, h), 0)
ap = alpha.load()
for idx in range(n):
    if final[idx]:
        ap[idx % w, idx // w] = 255
alpha = alpha.filter(ImageFilter.GaussianBlur(EDGE_FEATHER))
img.putalpha(alpha)

bbox = img.getbbox()
if bbox:
    m = 4
    l, t, r, b = bbox
    img = img.crop((max(0, l - m), max(0, t - m), min(w, r + m), min(h, b + m)))

os.makedirs(os.path.dirname(OUT), exist_ok=True)
img.save(OUT)
print("SAVED", OUT, img.size)
