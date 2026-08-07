# Expo application instructions

- Follow the root `AGENTS.md`, `docs/PRODUCT.md`, and `docs/BRAND.md`.
- Keep route files under `src/app`; route files contain routing composition only. Put screens in `src/features`, reusable UI in `src/components`, data clients in `src/api`, providers in `src/providers`, and local persistence in `src/storage`.
- Use kebab-case filenames and the `@/*` alias. Share screens and feature logic across platforms; use `.web.tsx` or platform branches only for genuine navigation/interaction differences.
- Use Expo Router. Native primary navigation is Discover, Saved, Add; opportunity details push within Discover. Web exposes Home, Opportunities, Saved, Submit, About.
- Use `expo/fetch` plus TanStack Query for server data. Parse every response with `@offmap/contracts`. Throw typed errors so loading, empty, offline, and failure states stay distinct.
- Store saved opportunity IDs only in local device/browser storage. Never add student identity or sync.
- Install Expo-managed dependencies with `expo install`; begin in Expo Go and introduce a development client only when a native dependency requires it.
- Use `ScrollView`/`FlatList` with automatic content inset adjustment, `expo-image` for images, semantic accessible controls, visible web focus, responsive layout from `useWindowDimensions`, and reduced-motion checks.
- Do not use `SafeAreaView` from React Native, raw web DOM tags in native components, CSS-only interactions that have no native equivalent, or decorative elements in the accessibility tree.
- Focused gates: `pnpm --filter @offmap/app lint`, `typecheck`, `test`, `exec expo-doctor`, and `build:web`. Report iOS/Android simulator and physical-device evidence separately.
