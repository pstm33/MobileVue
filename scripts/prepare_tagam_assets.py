import json
import os
import re
import shutil
import subprocess
from io import BytesIO
from pathlib import Path
from urllib.parse import urlparse

import requests
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public" / "tagam"
GENERATED_DIR = ROOT / "src" / "generated"
MANIFEST_FILE = GENERATED_DIR / "tagam-assets.json"

API_BASE = "https://tagam.delivery/interface"
DEFAULT_COORDINATES = {"lat": 39.992068, "lng": 52.977486}

TARGETS = {
    "logo": (512, 512),
    "banner": (900, 450),
    "item": (520, 520),
}


def load_env():
    env = {}
    env_file = ROOT / ".env.local"
    if not env_file.exists():
        return env

    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip().strip('"')
    return env


def api_post(path, payload, token):
    response = requests.post(
        f"{API_BASE}{path}",
        json=payload if isinstance(payload, dict) else None,
        data=payload if isinstance(payload, str) else None,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json" if isinstance(payload, dict) else "application/x-www-form-urlencoded",
        },
        timeout=30,
    )
    response.raise_for_status()
    data = response.json()
    if data.get("code") != 1:
        raise RuntimeError(data.get("msg") or f"API error on {path}")
    return data


def original_url(url):
    if not url:
        return ""
    return re.sub(r"@(1x|2x)(?=\.[a-zA-Z0-9]+$)", "", url)


def stable_name(url, kind):
    parsed = urlparse(url)
    stem = Path(parsed.path).stem
    stem = re.sub(r"[^a-zA-Z0-9_-]+", "-", stem).strip("-")
    return f"{kind}-{stem}.webp"


def cover_resize(image, target_size):
    image = image.convert("RGB")
    source_ratio = image.width / image.height
    target_ratio = target_size[0] / target_size[1]

    if source_ratio > target_ratio:
        new_height = image.height
        new_width = round(new_height * target_ratio)
        left = (image.width - new_width) // 2
        box = (left, 0, left + new_width, new_height)
    else:
        new_width = image.width
        new_height = round(new_width / target_ratio)
        top = (image.height - new_height) // 2
        box = (0, top, new_width, top + new_height)

    return image.crop(box).resize(target_size, Image.Resampling.LANCZOS)


def remove_item_edge_background(path):
    magick = shutil.which("magick")
    if not magick:
        return

    temp_path = path.with_suffix(".nobg.webp")
    subprocess.run(
        [
            magick,
            str(path),
            "-background",
            "white",
            "-alpha",
            "remove",
            "-alpha",
            "off",
            "-alpha",
            "set",
            "-bordercolor",
            "white",
            "-border",
            "1x1",
            "-fill",
            "none",
            "-fuzz",
            "22%",
            "-draw",
            "color 0,0 floodfill",
            "-shave",
            "1x1",
            str(temp_path),
        ],
        check=True,
    )
    temp_path.replace(path)


def collect_assets(token):
    feed = api_post(
        "/getMerchantFeed",
        {
            "language": "ru",
            "currency_code": "TMT",
            "page": 1,
            "place_id": "",
            "coordinates": DEFAULT_COORDINATES,
            "list_type": "all",
            "featured_id": "",
            "payload": ["cuisine", "reviews", "estimation", "services"],
            "sort_by": "",
            "q": "",
            "filters": {},
        },
        token,
    )

    restaurants = feed.get("details", {}).get("data") or []
    assets = []

    for restaurant in restaurants:
        slug = restaurant.get("restaurant_slug")
        for key, kind in (("url_logo", "logo"), ("url_banner", "banner")):
            url = restaurant.get(key)
            if url:
                assets.append({"kind": kind, "url": url})

        if not slug:
            continue

        menu = api_post("/geStoreMenu", f"slug={slug}&currency_code=TMT", token)
        for category in menu.get("details", {}).get("data", {}).get("category") or []:
            for item in category.get("item_list") or []:
                url = item.get("url_image")
                if url:
                    assets.append({"kind": "item", "url": url})

    return assets


def build_manifest(assets):
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)

    manifest = {}
    seen_originals = {}

    for asset in assets:
        kind = asset["kind"]
        derivative = asset["url"]
        source = original_url(derivative)
        if not source:
            continue

        filename = seen_originals.get(source) or stable_name(source, kind)
        seen_originals[source] = filename
        output_path = PUBLIC_DIR / filename

        if not output_path.exists():
            response = requests.get(source, timeout=30)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))
            processed = cover_resize(image, TARGETS[kind])
            processed.save(output_path, "WEBP", quality=82, method=6)
            if kind == "item":
                remove_item_edge_background(output_path)

        local = f"/tagam/{filename}"
        manifest[derivative] = local
        manifest[source] = local

    MANIFEST_FILE.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return manifest


def main():
    token = load_env().get("VITE_TAGAM_API_TOKEN") or os.environ.get("VITE_TAGAM_API_TOKEN")
    if not token:
        raise RuntimeError("VITE_TAGAM_API_TOKEN is required in .env.local")

    manifest = build_manifest(collect_assets(token))
    print(f"Prepared {len(set(manifest.values()))} optimized Tagam images")


if __name__ == "__main__":
    main()
