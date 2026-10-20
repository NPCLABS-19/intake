# INTAKE frontend handoff

The frontend finish review returned **SHIP**. The latest production build passed, and the `photo-concrete-*` desktop/mobile proofs were checked with no shader errors.

## Approved visual finish

Quiet typography, uppercase micrographics and full-width rectangular black CTAs carry the approved direction. The nutrient section uses a noisy lime/green gradient that follows the cursor through smooth finite requestAnimationFrame updates; reduced motion keeps it fixed. `gradient-grain.svg` supplies grain. Warm semi-translucent matte paper labels with small dog-ears replace glass. They stay tucked into the section edge; both unfold or collapse together on click. `overflow: clip` prevents the internal hidden-scroll focus glitch. Mobile expansion uses the available width. Ingredient quantities and unapproved usage copy remain `[TBC]`.

The hero keeps the exact opaque monogram shape at scale 1.25. Procedural speckles are removed. The reference-derived native ImageGen photographic tile at `public/assets/materials/cast-concrete-photo.png`, based on the user’s `images (30).jpeg`, provides grey cement and irregular air pockets. Triplanar color and photo-derived relief cover the form; mip filtering suppresses high-frequency grain. Small, irregular moss growth follows the cursor locally, using triplanar mapping. The hero gradient is removed; the nutrient gradient remains. The butterfly remains removed.

Broad negative space uses 100px desktop section padding and 88px beneath the expanded routine; mobile uses 64px section padding and 52px beneath the expanded routine.

The transparent navbar retains reserved navigation space over the hero; its earlier continuous hero gradient is removed. The footer wordmark and ™ inset align to the divider endpoints through shared `--pad` and responsive `fitName`; footer `overflow: clip` prevents internal focus scrolling.

The established homepage content and product destinations are preserved. Product destinations use the existing Figma frames, Approach uses the existing Notion brief, and science imagery, FAQ answers, About and Bag retain their wireframe status. The footer remains white on black with the fitted live-text INTAKE™ wordmark and rotating, pauseable monogram.

## Approach glass depth and compositing

The source video/poster is blurred directly, and a canvas displays the same decoded frame masked to the exact monogram. One video decoder supplies both; there is no `backdrop-filter` dependency. The scene loops while visible, and reduced motion uses the poster.

Video pixels remain fixed in stage space with a cover crop. Only the exact monogram silhouette projection and depth edges tilt; the 10 separated masked glass sheets, rims and 44px front/back separation remain. Scene parallax and refraction warping are removed. Reduced tilt uses delta-time exponential easing at 7/s. Blur is reduced 20%: desktop 17px → 13.6px and mobile 12px → 9.6px.

The production build passes. DOM checks confirmed no transform on the video/lens while the glass matrix changes. Latest proof: [fixed video glass](fixed-video-glass-desktop.png). The earlier [depth hover](glass-depth-hover.png) and [fixed compositing](glass-lens-fixed.png) proofs remain as history; their parallax/refraction treatment is superseded.

## Media

Both replacement botanical videos were completed and integrated. Final exports retain all six seconds at 1440×1080 with the studio tint removed. The quoted total is 389.5/390 credits; billing has not been independently reconciled. See `../../product-scenes/replacement/DELIVERY.md` and `../../product-scenes/credit-ledger.json` for the media record.

## Latest checked proof

- [Photographic concrete — desktop](photo-concrete-desktop.png)
- [Photographic concrete — mobile](photo-concrete-mobile.png)

The production build passes with no shader errors. [Prompt and mode](concrete-material-prompt.txt) and [material provenance](../public/assets/materials/SOURCES.md) record the new tile.

## Prior iteration proof

The photographic tile supersedes procedural concrete speckles while preserving the exact monogram, scale 1.25 and moss. Continuous navigation and footer checks remain recorded in [desktop hero](continuous-nav-hero.png), [mobile](continuous-nav-mobile.png) and [aligned footer](footer-aligned.png) proofs.

The enlarged concrete and spacing pass remains recorded in [desktop](enlarged-concrete-gradient-desktop.png) and [mobile](enlarged-concrete-gradient-mobile.png) proofs. The current pass adds continuous navigation over the hero and corrects footer alignment and focus scrolling.

The earlier paper-label and gradient layout is recorded in [desktop](paper-gradient-desktop.png) and [mobile](paper-gradient-mobile.png) proofs; the latest pass enlarges the monogram, changes its concrete material, adds the hero wash and increases spacing.

The solid moss (`#879b70`) and polished glass iteration is superseded by the current noisy gradient and matte paper labels. Its checked proofs remain [desktop](moss-glass-desktop.png) and [mobile](moss-glass-mobile.png).

The earlier `refined-*` iteration used a green-to-white gradient and a photographic butterfly with hinged wings and a depth-aware orbit. The latest finish supersedes those treatments; the existing native ImageGen butterfly asset remains on disk.

- [Hero](refined-hero.png)
- [Daily sequence — desktop](refined-sequence-desktop.png)
- [Daily sequence — mobile](refined-sequence-mobile.png)
- [Expanded glass label](refined-glass-expanded.png)

Earlier interaction checks covered label expansion/collapse, keyboard operation, footer motion pauses and reduced motion. The latest visual pass and build passed; reviewer verdict: **SHIP**.
