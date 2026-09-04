"""
Integrate hero emblem with page background (#080907).

- Exterior plate: flood-fill from edges → transparent
- Interior dark sky (inside medallion, lum < SKY_LUM): transparent → page shows through
- Metallic parts, banners, silhouettes, laurels: kept intact
- Soft feather on outer silhouette only (not filling interior holes)
"""
import os
from collections import deque

from PIL import Image, ImageFilter

SRC_FALLBACK = os.path.normpath(
    r"C:\Users\User\.cursor\projects\c-Users-User-Desktop-skz-monitor-user-data\assets\emblem-color.png"
)
OUT = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "public", "emblem-cut.png"))

BORDER_LUM = 18
SKY_LUM = 34
EDGE_FEATHER = 7
R_FRAC = 0.455


def resolve_src():
    candidates = [
        SRC_FALLBACK,
        os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "public", "emblem-color.png")),
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path
    raise FileNotFoundError("emblem-color.png not found")


def lum(rgb):
    return max(rgb[0], rgb[1], rgb[2])


def main():
    src = resolve_src()
    img = Image.open(src).convert("RGBA")
    w, h = img.size
    px = img.load()
    n = w * h
    cx, cy = w / 2.0, h / 2.0
    R2 = (R_FRAC * w) ** 2

    bg = bytearray(n)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            idx = y * w + x
            if lum(px[x, y][:3]) <= BORDER_LUM:
                bg[idx] = 1
                q.append(idx)
    for y in range(h):
        for x in (0, w - 1):
            idx = y * w + x
            if not bg[idx] and lum(px[x, y][:3]) <= BORDER_LUM:
                bg[idx] = 1
                q.append(idx)
    while q:
        idx = q.popleft()
        x = idx % w
        y = idx // w
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if not bg[nidx] and lum(px[nx, ny][:3]) <= BORDER_LUM:
                    bg[nidx] = 1
                    q.append(nidx)

    opaque = bytearray(n)
    for y in range(h):
        dy = y - cy
        for x in range(w):
            idx = y * w + x
            if bg[idx]:
                continue
            dx = x - cx
            inside = dx * dx + dy * dy <= R2
            if inside and lum(px[x, y][:3]) < SKY_LUM:
                continue
            opaque[idx] = 1

    alpha = Image.new("L", (w, h), 0)
    ap = alpha.load()
    for idx in range(n):
        if opaque[idx]:
            ap[idx % w, idx // w] = 255

    blurred = alpha.filter(ImageFilter.GaussianBlur(EDGE_FEATHER))
    bp = blurred.load()

    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if bg[idx] or (inside := ((x - cx) ** 2 + (y - cy) ** 2 <= R2) and lum(px[x, y][:3]) < SKY_LUM):
                px[x, y] = (px[x, y][0], px[x, y][1], px[x, y][2], 0)
            else:
                px[x, y] = (px[x, y][0], px[x, y][1], px[x, y][2], bp[x, y])

    bbox = img.getbbox()
    if bbox:
        m = 8
        l, t, r, b = bbox
        img = img.crop((max(0, l - m), max(0, t - m), min(w, r + m), min(h, b + m)))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img.save(OUT)
    print("SAVED", OUT, img.size, "from", src)


if __name__ == "__main__":
    main()
