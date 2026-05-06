# Tagam Next

Separate portable client app prototype for the next-generation delivery experience.

## Goals

- Keep the legacy client untouched.
- Build the new consumer PWA in its own folder.
- Stay portable across computers and operating systems.

## Run

1. Copy `.env.example` to `.env` if you want custom values.
2. Run `npm install`.
3. Run `npm run dev`.
4. Run `npm run build` for a production bundle.

## Portability Notes

- No absolute local paths are used.
- App settings come from `import.meta.env`.
- The project can be moved as a standalone folder and installed on another machine with the same commands.
