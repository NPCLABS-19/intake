# INTAKE homepage / local interaction proof

Run `npm install` followed by `npm run dev`. Open [the local homepage](http://127.0.0.1:4173/).

- `/`: responsive homepage with interactive monogram.
- `/mobile.html`: a 390px mobile viewport inside a desktop browser.
- `/?wireframe=1`: original grey hero placeholder, with no 3D loaded.
- `/study.html`: white, moss and reveal treatments; transparent PNG export for Figma.

This is an extension of the established homepage. Desktop and mobile content comes from native Figma nodes 3:129 and 3:205 in file NxVIOo2rAL3TMkXfvOkoUK. The original editorial copy, distinct desktop/mobile hero headings, daily-sequence content and two usage steps are preserved. Approach and FAQ are untouched. Science imagery, FAQ answers, About and Bag remain wireframe placeholders. Product buttons link to their native Figma product frames; Approach links to the working Notion brief. This remains a local homepage proof, not a functioning ecommerce store.

## Hero monogram

The outline is extracted directly from MONOGRAM (1).pdf. SVG Y-axis reflection is followed by triangle-winding correction, restoring outward-facing caps and walls at the joined intersection. Extrusion depth118 source units, bevel .9 units preserve the thin arms and curved transitions. The monogram stays opaque and retains its exact outline at scale 1.25. A reference-derived native ImageGen photographic tile (`public/assets/materials/cast-concrete-photo.png`), based on the user’s `images (30).jpeg`, supplies grey cement and irregular air pockets. Triplanar color and photo-derived relief preserve the material across the form; mip filtering suppresses high-frequency grain. This replaces procedural speckles; hover moss remains.

The growth blends a native-generated macro moss carpet directly over the opaque mineral surface, with shallow raised cushions and twelve variants of scanned, alpha-cut moss shoots above it. Dense small shoots, restrained neutral tinting, fewer short fern sprigs and closer roots keep the planted layer attached to the concrete. Pointer movement activates local growth; keyboard Enter/Space toggles centre growth, mobile press-and-move reveals it. Reduced motion stops floating; hidden/offscreen rendering pauses. See public/assets/materials/SOURCES.md for provenance.

## Approach glass

The Magic Meal botanical video stays fixed in stage space with a cover crop. One video decoder supplies the background and the canvas frame masked to the exact monogram; compositing has no `backdrop-filter` dependency. The scene loops while visible, and reduced motion uses the poster.

Only the exact monogram silhouette projection and layered depth edges tilt. The 10 separated masked sheets, rims and 44px front/back separation remain, with reduced tilt and delta-time exponential easing at 7/s. Scene parallax and refraction warping are removed; video pixels remain fixed. Blur is reduced 20%: desktop 17px → 13.6px and mobile 12px → 9.6px. The production build passes; DOM checks show no transform on the video/lens while the glass matrix changes. Latest proof: [fixed video glass](proof/fixed-video-glass-desktop.png). Earlier [depth hover](proof/glass-depth-hover.png) and [compositing](proof/glass-lens-fixed.png) proofs remain as history.

## Current product scenes

Serum Shots and Magic Meal use integrated native image generations based on the supplied tube format and respective label treatments. Two replacement Higgsfield Seedance 2.5 clips now show flowers moving and opening, fern growth, and moss spreading over the rock. Each final export retains the entire six-second take: silent H.264, 1440 × 1080, 24 fps, fast start, explicit BT.709/full-range colour. These replace the earlier mirrored float loops. Growth restarts when the six-second loop repeats; fine label lettering remains generative and is not a packaging artwork master.

Native ImageGen extracted the first-frame alpha. Matte tracking and colour difference preserve moving petals and newly growing moss while replacing the generated studio tint with page paper (#f7f7f4). No pack overlays or composited labels are used. Still/poster PNGs have transparency; MP4s have the matching paper background. Native image processing incurred no further Higgsfield credits. The scene remains intact as one rendered composition.

Current page files are public/assets/products/serum-shots.png, magic-meal.png, serum-shots.mp4 and magic-meal.mp4. Master references, raw clips, final exports, generation parameters and delivery notes are in ../product-scenes/replacement/. The updated ../product-scenes/INTAKE-Product-Scenes-1080p.zip contains transparent approved stills, matching start-frame posters, both final videos and the handoff.

Videos play when visible. Hover/focus pauses each scene, leaving resumes, Space/Enter and touch taps toggle playback. Offscreen, hidden-tab and reduced-motion states pause playback. Original product copy remains; CTAs now use full-width black rectangles. Both replacements completed. Quoted Higgsfield total:197.5 prior +192 replacements =389.5 within the user-approved390 cap. Billing is not independently reconciled; see ../product-scenes/credit-ledger.json. No paid retries were made.

## Daily sequence

The routine preserves both usage steps over a noisy lime/green gradient that follows the cursor. Smooth finite requestAnimationFrame updates settle the motion; reduced motion keeps the gradient fixed. `gradient-grain.svg` supplies the grain. Two warm, semi-translucent matte paper ingredient labels with small dog-ears sit inside the bottom edge, with only their top 10% exposed at rest. Height is measured from each complete label rather than fixed globally: the recorded desktop check showed a 74px peek from a 738px full stage and a 421px collapsed routine.

Clicking an exposed label, or activating its button with Enter/Space, unfolds or collapses both labels together and extends the section to reveal them. `overflow: clip` prevents the internal hidden-scroll focus glitch. Escape, the exposed toggle or the full label's close control collapses it. Collapsed detail is hidden from assistive technology; button labels and `aria-expanded` follow the state. Reduced motion disables tilt and expansion transitions.

Both collapsed peeks remain side by side on mobile. An expanded label spans the full available width. Ingredients and known pack sizes are sourced from the supplied packaging: Serum Shots 30ml, Magic Meal 80g. Ingredient quantities remain `[TBC]`; application amount, applications per tube, usage copy and order still require approval. The labels describe skincare formulas, with no dietary values.

## Footer

White text and structured navigation sit on black. Formulas links reuse the existing product wireframe destinations; Discover links reuse Daily sequence, Our approach and Your questions. The footer includes copyright and Back to top.

The bottom INTAKE™ wordmark is live all-caps text in local Helvetica Neue/Helvetica with tight tracking, fitted to the footer width. It does not use a source-logo image. A separate top-right monogram rotates clockwise in 60 one-second steps over 60 seconds. Hover or keyboard focus pauses it; clicking pins or releases the pause. Offscreen, hidden-tab and reduced-motion states also pause it while retaining the tick position.

## Validation and handoff

The production build passed and the recorded browser checks had no console errors. Desktop and 390px mobile checks cover collapsed/expanded labels, footer layout, keyboard controls and pause behavior. The read-only finish review returned **SHIP**, with no material brief failures. Inter, original copy and established spacing remain the incumbent homepage direction; the latest finish uses the cursor-following noisy gradient and matte paper labels described below.

See [the frontend handoff](proof/FRONTEND-HANDOFF.md) for the implementation boundary, proof screenshots and pending work. No global design system was created for this scoped extension.

### October 19 typography and interaction refinement — prior iteration
Quieter heading/body scale; uppercase micrographics; full-width black rectangular CTAs. In this prior iteration, the daily sequence faded from muted green to paper, retaining click-only expansion and ten-percent tucked glass labels. Hero moss uses a small irregular cursor-local reveal with triplanar surface texture to prevent stretched side walls. A photographic butterfly had hinged wings and a depth-aware orbit around the opaque concrete monogram; motion respects reduced-motion and offscreen pausing. Copy remains unchanged.

### October 19 solid moss and glass finish — prior iteration

The butterfly has been removed from the hero. At this prior stage, the exact opaque beige concrete monogram retained small irregular cursor-local moss with triplanar texture. The nutrient section is fully solid moss green (`#879b70`), replacing the green-to-white gradient. Tucked, click-to-expand glass labels now use thin polished transparent edge highlights and subtle cursor light. Quiet typography, uppercase micrographics and full-width rectangular black CTAs remain. The production build passed; checked proofs: [desktop](proof/moss-glass-desktop.png) and [mobile](proof/moss-glass-mobile.png).

### October 19 paper and gradient finish — prior iteration

A noisy lime/green gradient follows the cursor with smooth finite requestAnimationFrame updates; reduced motion holds it fixed. `gradient-grain.svg` adds grain. Warm semi-translucent matte paper labels with a small dog-ear replace glass. Both labels unfold and collapse together; `overflow: clip` prevents the internal hidden-scroll focus glitch. The hero remains butterfly-free. Checked proofs: [desktop](proof/paper-gradient-desktop.png) and [mobile](proof/paper-gradient-mobile.png).

### October 19 enlarged concrete and spacing finish — prior iteration

Broad negative space now uses 100px desktop section padding and 88px beneath the expanded routine; mobile uses 64px section padding and 52px beneath the expanded routine. The exact monogram shape is enlarged to scale 1.25, with procedural cast concrete, irregular pores and a grey tone replacing the regular beige PBR maps. A hero-only grain green wash fades to paper before the formulas. The paper-label interaction remains as described above. The production build passed; checked proofs: [desktop](proof/enlarged-concrete-gradient-desktop.png) and [mobile](proof/enlarged-concrete-gradient-mobile.png).

### October 19 continuous navigation and aligned footer finish — prior iteration

The transparent navbar sits over the continuous hero grain gradient, with reserved space for navigation. The footer wordmark and ™ inset align with the divider endpoints through shared `--pad` and responsive `fitName`. Footer `overflow: clip` prevents internal focus scrolling. Current proofs: [continuous navigation and hero](proof/continuous-nav-hero.png), [mobile](proof/continuous-nav-mobile.png), and [aligned footer](proof/footer-aligned.png).

### Latest October 20 finish — photographic concrete

Procedural speckles are removed. Native ImageGen produced the photographic concrete tile at `public/assets/materials/cast-concrete-photo.png` from the user reference `images (30).jpeg`. Triplanar color and photo-derived relief show grey cement with irregular air pockets; mip filtering suppresses high-frequency grain. The exact monogram outline, scale 1.25 and moss behavior are preserved. The production build passes with no shader errors. Checked proofs: [desktop](proof/photo-concrete-desktop.png) and [mobile](proof/photo-concrete-mobile.png). Prompt/mode: [concrete material prompt](proof/concrete-material-prompt.txt); provenance: [material sources](public/assets/materials/SOURCES.md).

## GitHub deployment
Public repository: https://github.com/NPCLABS-19/intake
Live site: https://npclabs-19.github.io/intake/
Production build uses `PAGES_BASE=/intake/ npm run build`. GitHub Pages publishes the compiled `gh-pages` branch. The source branch is `main`; publishing uses a separate build branch because the authenticated token lacks workflow scope.

### Glass rendering compatibility fix
The approach scene blurs the source video directly and draws the same decoded frame into a monogram-masked canvas. This removes reliance on backdrop-filter sampling inside transformed/masked layers, which could leave the full scene sharp. One video decoder remains in use; reduced-motion/poster and offscreen playback behavior are preserved.

### Latest October 20 finish — fixed video glass and hero paper

The hero gradient is removed; the nutrient gradient remains. The glass lens now tilts only its exact silhouette projection and depth edges over fixed stage-space video pixels, with reduced tilt, 7/s delta-time exponential easing and 20% less blur. This supersedes earlier hero-gradient and glass parallax/refraction descriptions. The production build passes; [fixed video glass proof](proof/fixed-video-glass-desktop.png) records the latest finish.
