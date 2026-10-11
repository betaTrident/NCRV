"""Build the Phase 4 Voyix Workspace concept SVGs.

The symbols are original black-first geometry. The lockup wordmark is outlined
from the Manrope variable font already cached by the Next.js build, so the SVGs
contain paths rather than live text.
"""

from __future__ import annotations

from pathlib import Path
import re

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent / "concepts"
FONT_DIR = ROOT / "web" / ".next" / "static" / "media"
WORD = "voyixworkspace"
VERSION = "v2"


SYMBOLS = {
    "a-midnight-gate": """
  <g id="symbol" fill="#000000">
    <path d="M32 32H116V92L88 112V208H32Z"/>
    <path d="M140 48H224V224H140V164L168 144V48Z"/>
  </g>""",
    "b-cross-midnight-x": """
  <g id="symbol" fill="#000000">
    <path d="M48 40H80L124 116H92Z"/>
    <path d="M176 40H208L164 116H132Z"/>
    <path d="M48 216H80L124 140H92Z"/>
    <path d="M176 216H208L164 140H132Z"/>
  </g>""",
    "c-quiet-arc": """
  <g id="symbol" fill="#000000">
    <path fill-rule="evenodd" d="M184 48A96 96 0 1 0 184 208L160 180A60 60 0 1 1 160 76Z"/>
    <rect x="196" y="112" width="32" height="32"/>
  </g>""",
}


def round_path(path_data: str) -> str:
    def rounded(match: re.Match[str]) -> str:
        value = round(float(match.group()), 2)
        if value == int(value):
            return str(int(value))
        return f"{value:.2f}".rstrip("0").rstrip(".")

    return re.sub(r"-?\d+(?:\.\d+)?", rounded, path_data)


def find_manrope() -> Path:
    for path in FONT_DIR.glob("*.woff2"):
        font = TTFont(path)
        family = next(
            (name.toUnicode() for name in font["name"].names if name.nameID == 1),
            "",
        )
        cmap = font.getBestCmap() or {}
        if "Manrope" in family and all(ord(char) in cmap for char in WORD):
            return path
    raise FileNotFoundError("A complete Manrope subset was not found in web/.next/static/media")


def outlined_wordmark(custom_x: bool = False) -> tuple[str, float]:
    font = instantiateVariableFont(
        TTFont(find_manrope()), {"wght": 760}, inplace=False
    )
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    metrics = font["hmtx"].metrics
    scale = 0.055
    cursor = 0.0
    paths: list[str] = []

    for character in WORD:
        glyph_name = cmap[ord(character)]
        advance = metrics[glyph_name][0]
        if custom_x and character == "x":
            left = cursor * scale
            width = advance * scale
            right = left + width
            top = 100.0
            bottom = 158.0
            middle_x = (left + right) / 2
            paths.extend(
                [
                    f"M{left:.2f} {top:.2f}H{left + 14:.2f}L{middle_x - 4:.2f} 125L{middle_x - 12:.2f} 133Z",
                    f"M{right - 14:.2f} {top:.2f}H{right:.2f}L{middle_x + 12:.2f} 133L{middle_x + 4:.2f} 125Z",
                    f"M{left:.2f} {bottom:.2f}H{left + 14:.2f}L{middle_x - 4:.2f} 133L{middle_x - 12:.2f} 125Z",
                    f"M{right - 14:.2f} {bottom:.2f}H{right:.2f}L{middle_x + 12:.2f} 125L{middle_x + 4:.2f} 133Z",
                ]
            )
        else:
            pen = SVGPathPen(glyph_set)
            transformed = TransformPen(
                pen, (scale, 0, 0, -scale, cursor * scale, 158)
            )
            glyph_set[glyph_name].draw(transformed)
            paths.append(round_path(pen.getCommands()))
        cursor += advance - 20

    return " ".join(paths), cursor * scale


def symbol_svg(name: str, body: str) -> str:
    title = name.replace("-", " ").title()
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title">
  <title id="title">Voyix Workspace {title} concept symbol</title>{body}
</svg>
'''


def lockup_svg(name: str, body: str, custom_x: bool) -> str:
    title = name.replace("-", " ").title()
    wordmark, width = outlined_wordmark(custom_x=custom_x)
    view_width = max(1160, int(240 + width + 40))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_width} 256" width="{view_width}" height="256" role="img" aria-labelledby="title">
  <title id="title">Voyix Workspace {title} concept horizontal lockup</title>
  <g transform="translate(32 32) scale(0.75)">{body}</g>
  <path id="wordmark" fill="#000000" transform="translate(240 0)" d="{wordmark}"/>
</svg>
'''


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, body in SYMBOLS.items():
        (OUT / f"{name}-symbol-{VERSION}.svg").write_text(
            symbol_svg(name, body), encoding="utf-8"
        )
        (OUT / f"{name}-lockup-{VERSION}.svg").write_text(
            lockup_svg(name, body, custom_x=name.startswith("b-")), encoding="utf-8"
        )


if __name__ == "__main__":
    main()
