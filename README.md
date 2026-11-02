# Vino

Personal wine log as a PWA. Scan a label, it reads the text on your phone, looks up the
wine in the X-Wines list (if loaded) and in the built-in region and grape dictionary, and
saves the bottle with your rating and notes. A map shows where your bottles come from (MapLibre with OpenFreeMap tiles, needs internet). Everything stays on the phone.

## Put it online (GitHub Pages)
1. Make a new repository (e.g. `vino`) or a folder in an existing Pages site.
2. Copy all files from this folder into it and push with GitHub Desktop.
3. Open `https://<your-name>.github.io/vino/` in Safari on the iPhone.
4. Share → Add to Home Screen.

Open it once while online and scan one bottle: after that the app and the label reader work offline.

## Wine list (X-Wines)
`wines.json` holds about 100,000 wines from the X-Wines dataset, trimmed to the fields Vino uses.
The app downloads it the first time you scan (about 2 MB), keeps it on the phone, and checks once a day
whether a newer `wines.json` was pushed.

X-Wines: de Azambuja, R. X., Morais, A. J., & Filipe, V. (2023). X-Wines: A Wine Dataset for Recommender
Systems and Machine Learning. Big Data and Cognitive Computing, 7(1), 20. https://www.mdpi.com/2504-2289/7/1/20

## Sync with GitHub (optional)
Keeps your bottles in a separate **private** repo, so they're backed up and the same on every device.
1. Create a private repo, e.g. `vino-data`, with a README.
2. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
   Repository access: only `vino-data`. Permissions: Contents → Read and write. Pick an expiry you're happy with.
3. In the app: More → Sync with GitHub → paste the repo's address (e.g. `https://github.com/you/vino-data`) and the token → Connect.
   Any private repo works. To switch repo or token: Disconnect, then connect again.

The token is stored on the phone only, never in this public code. Lost your phone? Revoke the token on GitHub.
In `vino-data` each bottle is `bottles/<id>.json`, each photo `photos/<id>.jpg`. Every change is a commit.
Changes made offline are sent the next time the app is online.

## Vivino history
`vino-vivino-import.json` holds your Vivino wine list converted for Vino. In the app: More → Import file → pick it.
Wines already in your cellar (same producer, wine and vintage) are skipped. Label photos stay linked to Vivino's servers.

## Files
- `index.html`: the app
- `wines.json`: wine list from X-Wines (see above)
- `dict.js`: region and grape dictionary with map coordinates, add your own entries here
- `sw.js`: offline support (bump `VERSION` when you change files)
- `manifest.json`, icons: home-screen app
