"""
analyze.py — Vortex project analyzer
Generates:
  - Total file count
  - Total lines
  - Total characters
  - folder_structure.txt with full wireframe tree
Excludes: node_modules, .git
"""

import os
import sys
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent.parent  # docs/ → vortex/
OUTPUT_FILE = ROOT.parent / "folder_structure.txt"  # workspace root

EXCLUDE_DIRS = {"node_modules", ".git", "__pycache__", ".cache", "dist", "build"}
INCLUDE_EXTS = {
    ".js", ".ts", ".jsx", ".tsx",
    ".html", ".css", ".json",
    ".py", ".md", ".txt", ".nsh",
    ".png", ".jpg", ".jpeg", ".svg", ".ico",
}

# ── Stats ─────────────────────────────────────────────────────────────────────

total_files = 0
total_lines = 0
total_chars = 0
ext_stats   = {}   # ext → {files, lines, chars}

def count_file(path: Path):
    global total_files, total_lines, total_chars
    ext = path.suffix.lower()
    if ext not in INCLUDE_EXTS:
        return

    total_files += 1
    lines = 0
    chars = 0

    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
        lines = text.count("\n") + (1 if text and not text.endswith("\n") else 0)
        chars = len(text)
    except Exception:
        pass

    total_lines += lines
    total_chars += chars

    if ext not in ext_stats:
        ext_stats[ext] = {"files": 0, "lines": 0, "chars": 0}
    ext_stats[ext]["files"] += 1
    ext_stats[ext]["lines"] += lines
    ext_stats[ext]["chars"] += chars

# ── Tree builder ──────────────────────────────────────────────────────────────

def build_tree(path: Path, prefix: str = "", is_last: bool = True) -> list[str]:
    lines = []
    connector = "└── " if is_last else "├── "
    extension = "    " if is_last else "│   "

    if path.is_dir():
        lines.append(f"{prefix}{connector}{path.name}/")
        children = sorted(path.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        children = [c for c in children if c.name not in EXCLUDE_DIRS]
        for i, child in enumerate(children):
            is_child_last = (i == len(children) - 1)
            lines.extend(build_tree(child, prefix + extension, is_child_last))
            count_file(child)
    else:
        lines.append(f"{prefix}{connector}{path.name}")

    return lines

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not ROOT.exists():
        print(f"ERROR: '{ROOT}' directory not found. Run from project root.")
        sys.exit(1)

    print(f"Analyzing '{ROOT}' ...")

    # Build tree + count files
    tree_lines = [f"{ROOT.name}/"]
    children = sorted(ROOT.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
    children = [c for c in children if c.name not in EXCLUDE_DIRS]

    for i, child in enumerate(children):
        is_last = (i == len(children) - 1)
        tree_lines.extend(build_tree(child, "", is_last))
        if child.is_file():
            count_file(child)

    # ── Format output ─────────────────────────────────────────────────────────
    sep = "=" * 72
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    out = []
    out.append(sep)
    out.append("VORTEX PROJECT ANALYSIS")
    out.append(f"Generated : {now}")
    out.append(f"Root      : {ROOT.resolve()}")
    out.append(sep)
    out.append("")

    # Summary
    out.append("── SUMMARY ──────────────────────────────────────────────────────────")
    out.append(f"  Total Files      : {total_files:,}")
    out.append(f"  Total Lines      : {total_lines:,}")
    out.append(f"  Total Characters : {total_chars:,}")
    out.append(f"  Total Size       : {total_chars / 1024:.1f} KB  ({total_chars / 1024 / 1024:.2f} MB)")
    out.append("")

    # Per-extension breakdown
    out.append("── BY FILE TYPE ─────────────────────────────────────────────────────")
    header = f"  {'Ext':<10} {'Files':>6}  {'Lines':>8}  {'Chars':>10}"
    out.append(header)
    out.append("  " + "-" * 40)
    for ext, s in sorted(ext_stats.items(), key=lambda x: -x[1]["lines"]):
        out.append(f"  {ext:<10} {s['files']:>6}  {s['lines']:>8,}  {s['chars']:>10,}")
    out.append("")

    # Language % breakdown (HTML / CSS / JS / JSON / Other)
    lang_map = {
        "JavaScript": {".js", ".jsx", ".ts", ".tsx"},
        "HTML":       {".html", ".htm"},
        "CSS":        {".css"},
        "JSON":       {".json"},
        "Other":      set(),
    }

    lang_totals = {k: {"files": 0, "lines": 0, "chars": 0} for k in lang_map}

    for ext, s in ext_stats.items():
        matched = False
        for lang, exts in lang_map.items():
            if lang == "Other":
                continue
            if ext in exts:
                lang_totals[lang]["files"] += s["files"]
                lang_totals[lang]["lines"] += s["lines"]
                lang_totals[lang]["chars"] += s["chars"]
                matched = True
                break
        if not matched:
            lang_totals["Other"]["files"] += s["files"]
            lang_totals["Other"]["lines"] += s["lines"]
            lang_totals["Other"]["chars"] += s["chars"]

    code_langs  = ["JavaScript", "HTML", "CSS"]
    code_lines  = sum(lang_totals[l]["lines"] for l in code_langs)
    total_code  = max(code_lines, 1)

    out.append("── LANGUAGE BREAKDOWN (% of total code lines) ───────────────────────")
    out.append(f"  {'Language':<14} {'Files':>6}  {'Lines':>8}  {'% of Code':>10}  {'% of All':>9}")
    out.append("  " + "-" * 56)

    for lang in ["JavaScript", "HTML", "CSS", "JSON", "Other"]:
        s = lang_totals[lang]
        if s["lines"] == 0 and s["files"] == 0:
            continue
        pct_code = (s["lines"] / total_code * 100) if lang in code_langs else 0
        pct_all  = (s["lines"] / max(total_lines, 1) * 100)
        bar_len  = int(pct_all / 2)
        bar      = "█" * bar_len
        pct_code_str = f"{pct_code:>6.1f}%" if lang in code_langs else "      —"
        out.append(f"  {lang:<14} {s['files']:>6}  {s['lines']:>8,}  {pct_code_str}  {pct_all:>7.1f}%  {bar}")

    out.append("")
    out.append(f"  Code breakdown (JS + HTML + CSS = 100%):")
    for lang in code_langs:
        s = lang_totals[lang]
        pct = s["lines"] / total_code * 100
        bar = "█" * int(pct / 2)
        out.append(f"    {lang:<12} {pct:>5.1f}%  {bar}")
    out.append("")

    # Top 20 largest files by lines
    out.append("── TOP 20 LARGEST FILES (by lines) ──────────────────────────────────")
    file_sizes = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fname in filenames:
            fpath = Path(dirpath) / fname
            if fpath.suffix.lower() in INCLUDE_EXTS:
                try:
                    text = fpath.read_text(encoding="utf-8", errors="ignore")
                    lc = text.count("\n") + (1 if text and not text.endswith("\n") else 0)
                    rel = fpath.relative_to(ROOT)
                    file_sizes.append((lc, str(rel)))
                except Exception:
                    pass

    file_sizes.sort(reverse=True)
    for rank, (lc, rel) in enumerate(file_sizes[:20], 1):
        out.append(f"  {rank:>2}. {lc:>5} lines  {rel}")
    out.append("")

    # Folder structure
    out.append("── FOLDER STRUCTURE ─────────────────────────────────────────────────")
    out.append("")
    out.extend(tree_lines)
    out.append("")
    out.append(sep)
    out.append("END")
    out.append(sep)

    # Write file
    content = "\n".join(out)
    OUTPUT_FILE.write_text(content, encoding="utf-8")

    # Print summary to console
    print()
    print(f"  Total Files      : {total_files:,}")
    print(f"  Total Lines      : {total_lines:,}")
    print(f"  Total Characters : {total_chars:,}")
    print(f"  Total Size       : {total_chars / 1024:.1f} KB")
    print()
    print("  Language Breakdown (% of JS+HTML+CSS):")
    for lang in code_langs:
        s = lang_totals[lang]
        pct = s["lines"] / total_code * 100
        bar = "█" * int(pct / 2)
        print(f"    {lang:<12} {pct:>5.1f}%  {bar}")
    print()
    print(f"  Output saved to  : {OUTPUT_FILE.resolve()}")
    print()

if __name__ == "__main__":
    main()
