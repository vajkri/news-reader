---
name: Use section-container for horizontal padding
description: Use the .section-container utility class for consistent content width — always inside a full-bleed background wrapper
type: feedback
---

Use a two-div pattern for all section-level elements: outer div owns the background (full-width), inner div uses `.section-container` to constrain and pad content.

**Why:** Putting `section-container` (which has `max-width` + `margin-inline: auto`) directly on the background element causes the background to shrink. Separating background from content constraint keeps backgrounds edge-to-edge while content stays consistently bounded.

**How to apply:**
```
<div>           <!-- outer: full-width, owns background color/border/shadow -->
  <div class="section-container">  <!-- inner: max-width + padding + content layout -->
    ...content...
  </div>
</div>
```
Apply this pattern to: headers, footers, card wrappers, any section with a full-bleed background. Never put `section-container` on the same element as the background. Tokens are in `globals.css :root` (`--container-width`, `--container-max-width`, `--container-padding`).
