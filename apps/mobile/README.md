# BumpToBloom app

Expo + React Native + TypeScript. This is the product.

```bash
npm install
npx expo start        # scan the QR with Expo Go on your phone
```

You do not need Xcode or Android Studio to start. Install **Expo Go** from the
App Store or Play Store, scan the QR code, and the app opens on your device with
live reload.

## Layout

```
app/            screens and navigation (Expo Router — files become routes)
  (tabs)/       the six tabs: home, track, learn, ask, health, act
components/     shared UI
lib/
  api/          every Supabase query lives here. Screens never query directly.
  supabase.ts   the client
```

## Two rules

**No secrets in here, ever.** Anything in a mobile bundle can be extracted in
about five minutes. `EXPO_PUBLIC_*` variables are readable by anyone who
downloads the app — that is fine for the Supabase URL and anon key, because RLS
protects the data. It is not fine for anything else. The OpenAI key lives in
`supabase/functions/ask/`.

**Screens don't query Supabase.** They call `lib/api/`. That keeps the shapes in
`docs/API-CONTRACTS.md` true and means a query change touches one file.
