#!/usr/bin/env python3
"""Parse the GRE 镇考 3000 词 (乱序版) PDF into structured JSON.

Uses PyMuPDF table detection. Watermarks (微信公众号：张巍GRE) and
line-wrap artifacts are cleaned aggressively.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pymupdf

STOPWORDS = {
    "a",
    "an",
    "the",
    "of",
    "to",
    "in",
    "on",
    "or",
    "be",
    "is",
    "as",
    "at",
    "by",
    "for",
    "and",
    "if",
    "it",
    "we",
    "he",
    "she",
    "my",
    "no",
    "so",
    "do",
    "up",
    "not",
}

WM_LINE = re.compile(
    r"^(微信公众号：张巍GRE|张巍GRE镇考3000词[-–—]?乱序版|list\s*\d+|"
    r"微|信|公|众|号|：|张|巍|GR|E|G|R|GRE)$"
)
WM_INLINE = re.compile(
    r"微信公众号：张巍(?:老师)?GRE|张巍GRE镇考3000词[-–—]?乱序版|"
    r"【微信公众号：张巍老师GRE】"
)
HEADER_ROW = re.compile(r"^(单词|音标|释义|等价词|例句)$")
PAGE_FOOTER = re.compile(r"第\s*\d+\s*页")
SECTION_TITLE = re.compile(r"\d{4}\s*年最新真题")
WORD_RE = re.compile(r"^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\-'/ ]{0,48}[A-Za-zÀ-ÿ]$|^[A-Za-zÀ-ÿ]{2,}$")
CJK_RE = re.compile(r"[\u4e00-\u9fff]")
POS_RE = re.compile(
    r"^\(?\d+\)?\s*((?:adj|adv|n|v|vt|vi|prep|conj|pron|num|int|aux|det)\.?)\s*",
    re.I,
)
POS_LEAD_RE = re.compile(
    r"^((?:adj|adv|n|v|vt|vi|prep|conj|pron|num|int|aux|det)\.)\s+",
    re.I,
)


def clean_line(line: str) -> str:
    line = line.replace("\u00a0", " ").replace("\ufeff", "")
    line = WM_INLINE.sub("", line)
    line = line.strip()
    if WM_LINE.match(line):
        return ""
    if HEADER_ROW.match(line) or PAGE_FOOTER.search(line):
        return ""
    if line.startswith("微 ") and len(line) > 2:
        line = line[2:].strip()
    if line.startswith("信") and (len(line) == 1 or not CJK_RE.search(line[1:2])):
        rest = line[1:].lstrip(" \n")
        if rest.startswith("[") or rest[:1].isalpha():
            line = rest
    # watermark letters often sit at the start/end of a wrapped English line
    line = re.sub(r"^[ERG]\s+", "", line)
    line = re.sub(r"\s+[ERG]$", "", line)
    return line.strip()


def clean_cell(raw: str | None) -> str:
    if not raw:
        return ""
    parts = []
    for line in str(raw).splitlines():
        t = clean_line(line)
        if t:
            parts.append(t)
    return "\n".join(parts).strip()


def should_merge_tokens(left: str, right: str) -> bool:
    if not left or not right:
        return False
    if not left[-1].isalpha() or not right[0].islower():
        return False
    last = re.findall(r"[A-Za-zÀ-ÿ]+$", left)
    first = re.findall(r"^[A-Za-zÀ-ÿ]+", right)
    if not last or not first:
        return False
    a, b = last[0], first[0]
    if a.lower() in STOPWORDS:
        return False
    if len(a) == 1:
        return True
    if len(a) <= 3 and not re.search(r"[aeiouAEIOU]", a):
        return True
    if len(a) == 2 and len(b) >= 4:
        return True
    return False


def strip_wm_letters(text: str) -> str:
    text = re.sub(r"(^|\s)[ERG](?=[A-Za-z]{3,})", r"\1", text)
    text = re.sub(r"\s+[ERG](?=\s|$)", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def join_english(text: str) -> str:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    if not lines:
        return ""
    out = lines[0]
    for line in lines[1:]:
        if should_merge_tokens(out, line):
            out += line
        else:
            out += " " + line
    out = strip_wm_letters(out)
    out = re.sub(r"\s+", " ", out)
    out = re.sub(r"\s+([,.;:!?])", r"\1", out)
    out = re.sub(r"[。．]\s*$", "", out)
    out = out.replace(" 。", "").strip()
    return out.strip()


def join_chinese(text: str) -> str:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    s = "".join(lines)
    s = re.sub(r"[ \t]+", "", s)
    return s.strip()


def split_en_zh_lines(text: str) -> tuple[str, str]:
    """Split mixed bilingual cell into English and Chinese blobs."""
    en_lines: list[str] = []
    zh_lines: list[str] = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        cjk = len(CJK_RE.findall(line))
        latin = len(re.findall(r"[A-Za-z]", line))
        if cjk and not latin:
            zh_lines.append(line)
        elif latin and not cjk:
            en_lines.append(line)
        else:
            # mixed: split at first CJK run
            m = CJK_RE.search(line)
            if m:
                en_part = line[: m.start()].strip()
                zh_part = line[m.start() :].strip()
                if en_part:
                    en_lines.append(en_part)
                if zh_part:
                    zh_lines.append(zh_part)
            else:
                en_lines.append(line)
    return join_english("\n".join(en_lines)), join_chinese("\n".join(zh_lines))


def normalize_phonetic(raw: str) -> str:
    s = clean_cell(raw)
    s = s.replace("\n", "").replace(" ", "")
    s = re.sub(r"[\[\]【】/]", "", s)
    # stray stress marks that wrapped onto their own line often end up at the end
    if s.endswith("ˌ") or s.endswith("ˈ"):
        mark = s[-1]
        s = mark + s[:-1]
    s = s.strip("[]【】/ ")
    if not s:
        return ""
    return f"/{s}/"


def parse_senses(meaning_raw: str) -> list[dict]:
    text = clean_cell(meaning_raw)
    if not text:
        return []

    # Split numbered senses: (1) ... (2) ...
    chunks = re.split(r"(?=\(\d+\))", text)
    chunks = [c.strip() for c in chunks if c.strip()]
    if not chunks:
        chunks = [text]

    senses = []
    for chunk in chunks:
        chunk = re.sub(r"^\(\d+\)\s*", "", chunk).strip()
        pos = ""
        m = POS_LEAD_RE.match(chunk)
        if m:
            pos = m.group(1).lower()
            if not pos.endswith("."):
                pos += "."
            chunk = chunk[m.end() :].strip()
        en, zh = split_en_zh_lines(chunk)
        en = re.sub(r"^\(\d+\)\s*", "", en).strip(" ;,")
        if not en and not zh:
            continue
        senses.append({"pos": pos, "en": en, "zh": zh})
    return senses


def chinese_summary(senses: list[dict]) -> str:
    parts = []
    for s in senses:
        zh = (s.get("zh") or "").strip()
        if zh:
            parts.append(zh)
    return "；".join(parts)


def english_summary(senses: list[dict]) -> str:
    parts = []
    for s in senses:
        en = s.get("en") or ""
        if not en:
            continue
        label = f"{s['pos']} {en}".strip() if s.get("pos") else en
        parts.append(label)
    return "; ".join(parts)


def parse_synonyms(raw: str) -> list[str]:
    s = clean_cell(raw)
    s = s.replace("\n", " ")
    s = re.sub(r"\s+", " ", s)
    if not s:
        return []
    parts = re.split(r"[,;/]|，", s)
    out = []
    for p in parts:
        p = p.strip().strip(".")
        if p and re.search(r"[A-Za-z]", p) and not WM_LINE.match(p):
            out.append(p)
    return out[:6]


def looks_like_word(w: str) -> bool:
    w = w.strip()
    if not w or len(w) > 46:
        return False
    if SECTION_TITLE.search(w) or "真题" in w or "微信" in w:
        return False
    if PAGE_FOOTER.search(w) or HEADER_ROW.match(w):
        return False
    return bool(WORD_RE.match(w))


def extract_from_pdf(pdf_path: Path) -> list[dict]:
    doc = pymupdf.open(pdf_path)
    seen: dict[str, dict] = {}
    order = 0

    for pi in range(doc.page_count):
        page = doc[pi]
        try:
            finder = page.find_tables()
        except Exception:
            continue
        if not finder.tables:
            continue
        for table in finder.tables:
            for row in table.extract() or []:
                if not row:
                    continue
                word = clean_cell(row[0] if len(row) > 0 else "")
                word = re.sub(r"\s+", " ", word).strip()
                if not looks_like_word(word):
                    continue
                key = word.lower()
                if key in seen:
                    continue

                phonetic = normalize_phonetic(row[1] if len(row) > 1 else "")
                senses = parse_senses(row[2] if len(row) > 2 else "")
                synonyms = parse_synonyms(row[3] if len(row) > 3 else "")
                example_raw = clean_cell(row[4] if len(row) > 4 else "")
                example_en, example_zh = split_en_zh_lines(example_raw)

                order += 1
                seen[key] = {
                    "id": key,
                    "word": word,
                    "phonetic": phonetic,
                    "meanings": senses,
                    "meaningZh": chinese_summary(senses),
                    "meaningEn": english_summary(senses),
                    "synonyms": synonyms,
                    "exampleEn": example_en,
                    "exampleZh": example_zh,
                    "order": order,
                }
    return [seen[k] for k in seen]


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: parse_gre_pdf.py <pdf> <out.json>", file=sys.stderr)
        return 2
    pdf_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    words = extract_from_pdf(pdf_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "source": "GRE 镇考 3000 词（乱序版）",
        "count": len(words),
        "words": words,
    }
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    with_zh = sum(1 for w in words if w["meaningZh"])
    with_ph = sum(1 for w in words if w["phonetic"])
    with_ex = sum(1 for w in words if w["exampleEn"])
    print(f"wrote {len(words)} words -> {out_path}")
    print(f"  with Chinese meaning: {with_zh}")
    print(f"  with phonetic: {with_ph}")
    print(f"  with English example: {with_ex}")
    if words:
        print("  sample:", words[0]["word"], words[0]["meaningZh"], words[0]["phonetic"])
        print("  last:", words[-1]["word"], words[-1]["meaningZh"])
    return 0 if len(words) >= 2500 else 1


if __name__ == "__main__":
    raise SystemExit(main())
