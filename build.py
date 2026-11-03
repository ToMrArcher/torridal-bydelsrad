#!/usr/bin/env python3
"""Bygger nettsiden til Torridal bydelsråd.

Setter sammen hver side i src/pages/ med src/layout.html (topp og bunn)
og kopierer src/assets/ til site/. Bare standardbiblioteket, ingen pakker.

    python3 build.py              # vanlig bygg (Cloudflare)
    PREVIEW=1 python3 build.py    # forhåndsvisning: ber søkemotorer la være å indeksere
"""
import os
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
OUT = ROOT / "site"


def parse(page):
    """Leser innstillingene i <!-- nøkkel: verdi --> øverst på siden."""
    text = page.read_text(encoding="utf-8")
    meta = {}
    match = re.match(r"\s*<!--(.*?)-->", text, re.S)
    if match:
        for line in match.group(1).strip().splitlines():
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()
        text = text[match.end():].lstrip("\n")
    return meta, text


def fill(template, values):
    return re.sub(r"\{\{(\w+)\}\}", lambda m: values.get(m.group(1), ""), template)


def main():
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    hero = (SRC / "partials" / "page-hero.html").read_text(encoding="utf-8")
    hills = (SRC / "partials" / "hills.html").read_text(encoding="utf-8")
    hills_small = (SRC / "partials" / "hills-small.html").read_text(encoding="utf-8")
    preview = bool(os.environ.get("PREVIEW"))

    OUT.mkdir(exist_ok=True)
    shutil.copytree(SRC / "assets", OUT / "assets", dirs_exist_ok=True)

    for page in sorted((SRC / "pages").glob("*.html")):
        meta, content = parse(page)
        values = {**meta, "hills": hills, "hills_small": hills_small}
        values["robots"] = '<meta name="robots" content="noindex">\n' if preview else ""
        values["content"] = fill(content, values)
        values["page_hero"] = fill(hero, values) if meta.get("heading") else ""
        html = fill(layout, values)
        nav = meta.get("nav", "")
        html = re.sub(
            r"\{\{active:(\w+)\}\}",
            lambda m: ' aria-current="page"' if m.group(1) == nav else "",
            html,
        )
        (OUT / page.name).write_text(html, encoding="utf-8")
        print(f"  {page.name}")

    print(f"Ferdig → {OUT.relative_to(ROOT)}/" + (" (forhåndsvisning, noindex)" if preview else ""))


if __name__ == "__main__":
    main()
