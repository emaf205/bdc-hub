# BDC HUB — Milano editoriale

## Reference → UI
A. Translate warm ivory, black ink, yellow, strong perspective and editorial hierarchy into tokens, navigation and artwork.
B. Engraving lines, skyline and clouds belong only in the single cropped artwork.
C. No engraved texture behind text, no tiny decorative controls, no image-based labels or fake charts.

## COLORS
Ink #171710 · Tram #FFD428 · Paper #FFFBEA · Surface #FFFEF8 · Muted #59594C · Border #D7D3BF · Focus #746100 · Error #9A220F.
Primary actions: ivory on ink; active navigation: ink on yellow. States include text, not color alone.

## TYPE
Arial/Helvetica system sans. Display 34px mobile / 44px desktop, 900 weight. Section 21–22px, 700. Body/input 16px, line-height 1.4–1.5. Metadata 12–14px. No network font dependency.

## UI
4px spacing rhythm; page gutter 16px mobile / 32px desktop; max content 1680px. Single-column mobile; two-column desktop blocks. Search before summaries. Compact analytics, one page scroll, 5-item previews with explicit expansion. Square components, 1px borders, no decorative shadows. Touch controls at least 44px. Visible focus, native forms and dialogs.
Cartelle is a separate section and navigation destination. Mixed-source references are stored locally, never move or change upstream resources. Source metadata refreshes when available. Folder names/membership are included in JSON backup. Removal has undo; imported data is validated before mutation. No automatic cross-device synchronization.
Drive links are immediately usable; optional OAuth metadata integration remains available through advanced options. Permissions and offline privacy explanations are retained.

## ICONS
brand-mark.png → canonical Milan mark, generated separately with alpha
favicon-16.png → favicon derived from canonical mark
favicon-32.png → favicon derived from canonical mark
apple-touch-icon-180.png → Apple touch icon, same identity
pwa-icon-192.png → install icon, same identity
pwa-icon-512.png → install icon, same identity
pwa-icon-maskable-512.png → maskable icon, artwork inside safe center
icon-folder.png → separate generated transparent folder icon
Existing separate monochrome SVG UI icons → retained for crisp navigation and controls, not regenerated or claimed as raster generation

## SURFACES
Flat paper and ivory surfaces in CSS. No separate texture/pattern assets: engraving behind real text would reduce legibility.

## ARTWORK
hero-primary.webp → one standalone Milan engraving, cropped in a compact dashboard band, decorative only

## MOTION
Brief opacity/press feedback; no autoplay, parallax or intrusive entrance animation. Reduced-motion disables animation, transitions and smooth scrolling.

## Generation and delivery
Three distinct built-in image generation calls: canonical mark, Milan illustration, folder icon. Reference used for illustration language; individual files are not cut from a sheet. PNG alpha checked programmatically. Sizes and web formats derived from generated originals. The live dashboard is the responsive UI demo, including the collection editor state.
Prompts are saved in ASSET_PROMPTS.md.

## Validation
Automated DOM tests: mixed folder creation/rename, selection retained during picker filtering, removal/undo, local persistence, export, import merge, invalid URL rejection; search reset, topic input, list expansion, title entity decoding. Existing box and simulated Drive regressions run separately. Cloudflare dry-run before commit. Real OAuth and physical phone installation are not covered by automated tests.
