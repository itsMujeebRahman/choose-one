# Choose One design foundation

Reference: the supplied screenshot of [Mental Health Mobile App by Bogdan Nikitin / Nixtio](https://dribbble.com/shots/24175254-Mental-Health-Mobile-App).

## Palette

Colors were sampled from small patches and dominant flat fills in the supplied screenshot. Compression, gradients, and the screenshot color profile mean these are approximate screen colors, not the designer's original source values.

| Token       | Hex       | Use                               |
| ----------- | --------- | --------------------------------- |
| Background  | `#F5F4F9` | App canvas                        |
| Surface     | `#FFFFFF` | Fields and selected controls      |
| Ink         | `#131313` | Text and primary actions          |
| Peach       | `#EBDCD2` | Large welcoming panels            |
| Peach light | `#F0E6E0` | Reflection and welcome cards      |
| Lavender    | `#C0C8F5` | Playful illustrations and accents |
| Yellow      | `#EFDF95` | Optimistic accents                |
| Sage        | `#90986C` | Calm accents                      |
| Blue        | `#85A3D6` | Secondary illustration accents    |
| Coral       | `#D69683` | Warm accents                      |
| Mint        | `#CDDFDD` | Soft supporting accents           |

Muted text (`#686560`), borders (`#E5E2E3`), and error text (`#9C332B`) are functional additions chosen for readability. Use dark ink over the pastel fills.

## Typography

The Dribbble post does not name its font. A raster screenshot cannot establish the exact font reliably. **Outfit** is the chosen visual approximation: a rounded geometric sans with single-storey forms and a similar friendly rhythm. It is bundled locally through `@expo-google-fonts/outfit`, using Regular 400, Medium 500, and SemiBold 600. It requires no runtime font CDN requests.

Use regular weight for large, tightly spaced conversational headlines, semibold to emphasize a few words, and medium for labels and actions. Keep form copy at readable sizes. Rounded cards, pill actions, generous whitespace, and simple expressive shapes carry the reference's playful mood.

## Tokens

- `src/theme/tokens.ts` is the React Native theme used by the screens.
- `src/theme/tokens.css` provides matching CSS custom properties for future DOM-based surfaces. React Native screens use the TypeScript tokens directly; they do not import CSS.
- Keep both token files synchronized when changing the palette.

The signup and login screens share `src/components/auth-screen.tsx`. Layout adapts from a single mobile column to a two-panel desktop layout. Error, busy, password visibility, keyboard, safe area, and session states are implemented.

Authentication now uses one Google/Apple entry screen. New users enter only their username on a separate onboarding screen. Email/password forms and separate login/signup routes have been removed; `/auth` is the single entry route.
